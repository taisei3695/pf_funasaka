<?php
/** Explicit local-only slug migration. Dry run unless the second argument is apply. */
if (!defined("WP_CLI") || !WP_CLI) {
  exit();
}
if (!in_array(wp_parse_url(home_url(), PHP_URL_HOST), ["localhost", "127.0.0.1", "::1"], true)) {
  WP_CLI::error("This migration is restricted to localhost.");
}
if (!current_user_can("manage_options")) {
  WP_CLI::error("Run as a local administrator.");
}
$source_path = $args[0] ?? "";
if (!is_file($source_path)) {
  WP_CLI::error("Pass works-permalink-slugs.json as the first argument.");
}
$mapping = json_decode(file_get_contents($source_path), true);
if (!is_array($mapping) || !$mapping || json_last_error() !== JSON_ERROR_NONE) {
  WP_CLI::error("Invalid slug mapping.");
}
$apply = ($args[1] ?? "") === "apply";
$plan = [];
$targets = [];
global $wpdb;
foreach ($mapping as $source => $slug) {
  if (!is_string($slug) || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug) || isset($targets[$slug])) {
    WP_CLI::error("Invalid or duplicate slug.");
  }
  $targets[$slug] = true;
  $ids = $wpdb->get_col(
    $wpdb->prepare(
      "SELECT DISTINCT p.ID FROM {$wpdb->posts} p INNER JOIN {$wpdb->postmeta} m ON m.post_id = p.ID WHERE p.post_type = 'works' AND p.post_status NOT IN ('trash', 'auto-draft') AND m.meta_key = '_portfolio_project_source' AND m.meta_value = %s",
      $source,
    ),
  );
  if (count($ids) !== 1) {
    WP_CLI::error("Expected exactly one work for " . $source);
  }
  $post = get_post((int) $ids[0]);
  $collision = $wpdb->get_var($wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE post_type = 'works' AND post_name = %s AND ID <> %d LIMIT 1", $slug, $post->ID));
  if ($collision) {
    WP_CLI::error("Slug already used: " . $slug);
  }
  // An explicit canonical override would need an individual review, not a blanket replacement.
  foreach (get_post_meta($post->ID) as $key => $values) {
    if (stripos($key, "canonical") !== false && array_filter($values)) {
      WP_CLI::error("Review explicit canonical metadata before migrating work " . $post->ID);
    }
  }
  $plan[] = ["id" => $post->ID, "title" => $post->post_title, "old_slug" => $post->post_name, "new_slug" => $slug, "old_url" => get_permalink($post), "changed" => $post->post_name !== $slug];
}
foreach ($plan as &$item) {
  if ($apply && $item["changed"]) {
    $result = wp_update_post(["ID" => $item["id"], "post_name" => $item["new_slug"]], true);
    if (is_wp_error($result) || get_post_field("post_name", $item["id"]) !== $item["new_slug"]) {
      WP_CLI::error("Failed to update work " . $item["id"]);
    }
    if (get_post_status($item["id"]) === "publish" && !in_array($item["old_slug"], get_post_meta($item["id"], "_wp_old_slug"), true)) {
      WP_CLI::error("WordPress did not preserve the old slug for work " . $item["id"]);
    }
  }
  $item["url"] = $apply ? get_permalink($item["id"]) : home_url("/works/" . $item["new_slug"] . "/");
}
unset($item);
WP_CLI::line(wp_json_encode(["applied" => $apply, "works" => $plan], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
