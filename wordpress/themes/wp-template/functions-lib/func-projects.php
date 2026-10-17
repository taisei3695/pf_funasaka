<?php
if (!defined("ABSPATH")) {
  exit();
}

function portfolio_list_project_sections()
{
  return [
    "professional" => "Works：Web制作・保守（実務）",
    "system" => "Experience：SE・PGの実務",
    "academic" => "Experience：大学校での開発",
    "study" => "Works：学習・自主制作",
  ];
}

/** Legacy source values remain available to explicit local migration scripts. */
function portfolio_get_project_text($post_id, $name)
{
  $value = get_post_meta($post_id, "portfolio_project_" . $name, true);
  return is_string($value) ? trim($value) : "";
}

function portfolio_parse_project_lines($value)
{
  return array_values(array_filter(array_map("trim", preg_split('/\r\n|\r|\n/', $value)), fn($line) => $line !== ""));
}

function portfolio_parse_project_paragraphs($value)
{
  $value = str_replace(["\r\n", "\r"], "\n", $value);
  return array_values(array_filter(array_map("trim", preg_split('/\n[\t ]*\n+/', $value)), fn($paragraph) => $paragraph !== ""));
}

function portfolio_build_project_summary($post)
{
  return portfolio_find_work_data($post->ID);
}

function portfolio_list_project_summaries($section, $limit = 0)
{
  if (!array_key_exists($section, portfolio_list_project_sections())) {
    return [];
  }
  $query = new WP_Query([
    "post_type" => "works",
    "post_status" => "publish",
    "has_password" => false,
    "posts_per_page" => $limit > 0 ? (int) $limit : -1,
    "orderby" => ["menu_order" => "ASC", "title" => "ASC", "ID" => "ASC"],
    "meta_query" => [["key" => "works_visibility", "value" => "public"], ["key" => "works_section", "value" => $section]],
    "no_found_rows" => true,
    "ignore_sticky_posts" => true,
  ]);
  return array_values(array_filter(array_map("portfolio_build_project_summary", $query->posts)));
}

function portfolio_add_project_admin_columns($columns)
{
  $columns["portfolio_project_section"] = "掲載先";
  $columns["portfolio_project_order"] = "表示順";
  return $columns;
}
add_filter("manage_works_posts_columns", "portfolio_add_project_admin_columns");

function portfolio_print_project_admin_column($column, $post_id)
{
  if ($column === "portfolio_project_section") {
    $sections = portfolio_list_project_sections();
    echo esc_html(portfolio_get_work_visibility($post_id) === "private" ? "非公開実績" : $sections[portfolio_get_work_section($post_id)]);
  } elseif ($column === "portfolio_project_order") {
    echo esc_html((string) get_post_field("menu_order", $post_id));
  }
}
add_action("manage_works_posts_custom_column", "portfolio_print_project_admin_column", 10, 2);

function portfolio_add_project_sortable_columns($columns)
{
  $columns["portfolio_project_order"] = "menu_order";
  return $columns;
}
add_filter("manage_edit-works_sortable_columns", "portfolio_add_project_sortable_columns");
