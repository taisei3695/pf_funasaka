<?php
if (!defined("ABSPATH")) {
  exit();
}

/** The portfolio uses Works and pages; keep ordinary post data without exposing news. */
function portfolio_disable_news_post_type($args, $post_type)
{
  if ($post_type !== "post") {
    return $args;
  }
  return array_merge($args, [
    "public" => false,
    "publicly_queryable" => false,
    "exclude_from_search" => true,
    "show_ui" => false,
    "show_in_menu" => false,
    "show_in_admin_bar" => false,
    "show_in_nav_menus" => false,
    "show_in_rest" => false,
    "has_archive" => false,
    "rewrite" => false,
    "query_var" => false,
  ]);
}
add_filter("register_post_type_args", "portfolio_disable_news_post_type", 10, 2);

function portfolio_remove_news_dashboard_widgets()
{
  remove_meta_box("dashboard_quick_press", "dashboard", "side");
  remove_meta_box("dashboard_activity", "dashboard", "normal");
  remove_meta_box("dashboard_primary", "dashboard", "side");
}
add_action("wp_dashboard_setup", "portfolio_remove_news_dashboard_widgets");
