<?php
/** Explicit local-only migration. Existing source meta stays intact for recovery. */
if (!defined("WP_CLI") || !WP_CLI) {
  exit();
}
if (!in_array(wp_parse_url(home_url(), PHP_URL_HOST), ["localhost", "127.0.0.1", "::1"], true) || !current_user_can("manage_options") || !function_exists("update_field")) {
  WP_CLI::error("Run only as a local administrator with ACF active.");
}
global $wpdb;
$ids = $wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_type = 'works' AND post_status <> 'auto-draft'");
$fields = [
  "category" => ["field_portfolio_project_type", "works_project_type"],
  "role" => ["field_portfolio_role", "works_role"],
  "summary" => ["field_portfolio_overview", "works_overview"],
  "technologies" => ["field_portfolio_technology_labels", "works_technology_labels"],
  "period_label" => ["field_portfolio_period_label", "works_period_label"],
  "period" => ["field_ea7c9e720f0cf", "works_period"],
  "status" => ["field_portfolio_work_status", "works_status"],
  "tasks" => ["field_portfolio_work_tasks", "works_tasks"],
  "implementation_title" => ["field_portfolio_implementation_title", "works_implementation_title"],
  "implementation" => ["field_portfolio_implementation", "works_implementation"],
  "award" => ["field_portfolio_work_award", "works_award"],
];
$migrated = 0;
foreach ($ids as $id) {
  if (get_post_meta($id, "_portfolio_work_unified_v1", true)) {
    continue;
  }
  $legacy_section = portfolio_get_project_text($id, "section");
  if ($legacy_section !== "") {
    if (!isset(portfolio_list_project_sections()[$legacy_section])) {
      WP_CLI::error("Invalid section on " . $id);
    }
    foreach ($fields as $source => [$key, $name]) {
      $value = portfolio_get_project_text($id, $source);
      update_field($key, $value, $id);
      if (get_post_meta($id, $name, true) !== $value) {
        WP_CLI::error("Field migration failed on " . $id . "/" . $name);
      }
    }
    update_field("field_portfolio_work_section", $legacy_section, $id);
    // Only the already-public anonymous summaries gain a detail page; private works stay private.
    if (portfolio_get_work_visibility($id) === "summary") {
      $status = get_post_status($id);
      update_field("field_portfolio_visibility", "public", $id);
      if (get_post_status($id) !== $status) {
        wp_update_post(["ID" => $id, "post_status" => $status]);
      }
    }
  } else {
    $data = portfolio_find_work_data($id);
    update_field("field_portfolio_work_section", portfolio_get_work_section($id), $id);
    if ($data && !metadata_exists("post", $id, "works_technology_labels")) {
      update_field("field_portfolio_technology_labels", implode("\n", $data["technologies"]), $id);
    }
  }
  update_post_meta($id, "_portfolio_work_unified_v1", "1");
  $migrated++;
}
WP_CLI::success("Unified " . $migrated . " works; original source meta retained.");
