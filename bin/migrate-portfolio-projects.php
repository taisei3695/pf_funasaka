<?php
/** Explicit, repeatable local-only migration. Never run during a page request. */
if (!defined("WP_CLI") || !WP_CLI) {
  exit();
}
if (!in_array(wp_parse_url(home_url(), PHP_URL_HOST), ["localhost", "127.0.0.1", "::1"], true)) {
  WP_CLI::error("This migration is restricted to localhost.");
}
if (!current_user_can("manage_options") || !function_exists("update_field")) {
  WP_CLI::error("Run as a local administrator with ACF active.");
}
$source_path = $args[0] ?? "";
if (!is_file($source_path)) {
  WP_CLI::error("Pass the local portfolio-projects.json file path.");
}
$source = json_decode(file_get_contents($source_path), true);
if (!is_array($source) || !$source || json_last_error() !== JSON_ERROR_NONE) {
  WP_CLI::error("The source JSON is invalid.");
}
$sections = portfolio_list_project_sections();
$seen = [];
foreach ($source as $record) {
  $source_id = $record["source_id"] ?? "";
  if (!is_string($source_id) || !preg_match('/^[a-z0-9_-]+$/', $source_id) || isset($seen[$source_id]) || !isset($sections[$record["section"] ?? ""])) {
    WP_CLI::error("The source contains an invalid section or duplicate source ID.");
  }
  $seen[$source_id] = true;
  $project = $record["project"] ?? [];
  foreach (["title", "category", "period_label", "period", "role", "summary", "implementation_title"] as $name) {
    if (!isset($project[$name]) || !is_string($project[$name]) || trim($project[$name]) === "") {
      WP_CLI::error("A required source text field is missing: " . $source_id . "/" . $name);
    }
  }
  foreach (["technologies", "tasks", "implementation"] as $name) {
    if (empty($project[$name]) || !is_array($project[$name])) {
      WP_CLI::error("A required source list is missing: " . $source_id . "/" . $name);
    }
    foreach ($project[$name] as $item) {
      if (!is_string($item) || trim($item) === "") {
        WP_CLI::error("The source contains an invalid list value.");
      }
    }
  }
}
$created = 0;
$skipped = 0;
foreach ($source as $record) {
  // Explicit local migration must find completed drafts/trash too, regardless of front-end visibility filters.
  global $wpdb;
  $existing_ids = $wpdb->get_col(
    $wpdb->prepare(
      "SELECT DISTINCT p.ID FROM {$wpdb->posts} p INNER JOIN {$wpdb->postmeta} m ON m.post_id = p.ID WHERE p.post_type IN ('works', 'portfolio_project') AND m.meta_key = '_portfolio_project_source' AND m.meta_value = %s LIMIT 2",
      $record["source_id"],
    ),
  );
  $existing = array_map("get_post", $existing_ids);
  if (count($existing) > 1) {
    WP_CLI::error("Duplicate records exist for " . $record["source_id"]);
  }
  if ($existing && get_post_meta($existing[0]->ID, "_portfolio_project_seed_complete", true) === "1") {
    // Never recreate trashed records or overwrite the administrator's later edits.
    $skipped++;
    continue;
  }
  $project = $record["project"];
  $post_id = $existing
    ? $existing[0]->ID
    : wp_insert_post(
      [
        "post_type" => "works",
        "post_status" => "draft",
        "post_title" => $project["title"],
        "post_author" => get_current_user_id(),
        "menu_order" => (int) $record["order"],
        "meta_input" => ["_portfolio_project_source" => $record["source_id"]],
      ],
      true,
    );
  if (is_wp_error($post_id)) {
    WP_CLI::error($post_id);
  }
  update_field("field_portfolio_visibility", "public", $post_id);
  update_field("field_portfolio_work_section", $record["section"], $post_id);
  $field_map = [
    "category" => ["field_portfolio_project_type", "works_project_type"],
    "period_label" => ["field_portfolio_period_label", "works_period_label"],
    "period" => ["field_ea7c9e720f0cf", "works_period"],
    "role" => ["field_portfolio_role", "works_role"],
    "summary" => ["field_portfolio_overview", "works_overview"],
    "implementation_title" => ["field_portfolio_implementation_title", "works_implementation_title"],
    "status" => ["field_portfolio_work_status", "works_status"],
    "award" => ["field_portfolio_work_award", "works_award"],
    "technologies" => ["field_portfolio_technology_labels", "works_technology_labels"],
    "tasks" => ["field_portfolio_work_tasks", "works_tasks"],
    "implementation" => ["field_portfolio_implementation", "works_implementation"],
  ];
  foreach ($field_map as $name => [$key, $meta_name]) {
    $value = $project[$name] ?? "";
    if (is_array($value)) {
      $value = implode($name === "implementation" ? "\n\n" : "\n", $value);
    }
    update_field($key, $value, $post_id);
    if (get_post_meta($post_id, $meta_name, true) !== $value) {
      WP_CLI::error("The migrated field does not match its source: " . $record["source_id"] . "/" . $name);
    }
  }
  $result = wp_update_post(["ID" => $post_id, "post_status" => "publish"], true);
  if (is_wp_error($result)) {
    WP_CLI::error($result);
  }
  update_post_meta($post_id, "_portfolio_project_seed_complete", "1");
  update_post_meta($post_id, "_portfolio_work_unified_v1", "1");
  WP_CLI::log("Created " . $record["source_id"] . " (ID " . $post_id . ")");
  $created++;
}
WP_CLI::success("Created " . $created . "; kept existing " . $skipped . ".");
