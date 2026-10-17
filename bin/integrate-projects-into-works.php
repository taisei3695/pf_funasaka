<?php
/** Explicit local migration: retain IDs, content, metadata, statuses and order. */
if (!defined("WP_CLI") || !WP_CLI) {
  exit();
}
if (!in_array(wp_parse_url(home_url(), PHP_URL_HOST), ["localhost", "127.0.0.1", "::1"], true) || !current_user_can("manage_options") || !function_exists("update_field")) {
  WP_CLI::error("Run only as a local administrator with ACF active.");
}
$projects = get_posts([
  "post_type" => "portfolio_project",
  "post_status" => array_keys(get_post_stati()),
  "posts_per_page" => -1,
]);
foreach ($projects as $post) {
  if (!array_key_exists(portfolio_get_project_text($post->ID, "section"), portfolio_list_project_sections())) {
    WP_CLI::error("Invalid placement on post " . $post->ID . "; no records were moved.");
  }
}
foreach ($projects as $post) {
  $summary = portfolio_build_project_summary($post);
  update_field("field_portfolio_visibility", "summary", $post->ID);
  $result = wp_update_post(["ID" => $post->ID, "post_type" => "works"], true);
  if (is_wp_error($result)) {
    WP_CLI::error($result);
  }
  $updated = get_post($post->ID);
  if ($updated->post_type !== "works" || $updated->post_status !== $post->post_status || $updated->menu_order !== $post->menu_order || portfolio_build_project_summary($updated) !== $summary) {
    WP_CLI::error("Migration verification failed on post " . $post->ID);
  }
  WP_CLI::log("Moved ID " . $post->ID . " to works.");
}
WP_CLI::success("Moved " . count($projects) . " records; no records recreated.");
require __DIR__ . "/unify-portfolio-works.php";
