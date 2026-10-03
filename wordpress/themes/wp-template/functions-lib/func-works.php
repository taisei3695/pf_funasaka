<?php
if (!defined("ABSPATH")) {
  exit();
}

/**
 * Portfolio data. Explicit public visibility is required for every public query.
 * Register after CPT UI so the versioned theme owns the works definition.
 */
function portfolio_register_works()
{
  if (post_type_exists("works")) {
    unregister_post_type("works");
  }
  register_post_type("works", [
    "labels" => [
      "name" => "制作実績",
      "singular_name" => "制作実績",
      "add_new_item" => "制作実績を追加",
      "edit_item" => "制作実績を編集",
      "all_items" => "制作実績一覧",
    ],
    "public" => true,
    "has_archive" => "works",
    "rewrite" => ["slug" => "works", "with_front" => false],
    "supports" => ["title", "editor", "thumbnail", "excerpt", "revisions"],
    "show_in_rest" => true,
    "menu_icon" => "dashicons-portfolio",
    "menu_position" => 5,
  ]);
  if (taxonomy_exists("works_category")) {
    unregister_taxonomy("works_category");
  }
  register_taxonomy(
    "works_category",
    ["works"],
    [
      "labels" => ["name" => "実績カテゴリー", "singular_name" => "実績カテゴリー"],
      "hierarchical" => true,
      "public" => false,
      "show_ui" => true,
      "show_admin_column" => true,
      "show_in_rest" => false,
      "rewrite" => false,
    ],
  );
}
add_action("init", "portfolio_register_works", 30);

function portfolio_get_work_visibility($post_id)
{
  $visibility = get_post_meta((int) $post_id, "works_visibility", true);
  return in_array($visibility, ["public", "private"], true) ? $visibility : "unassigned";
}

function portfolio_is_public_work($post_id)
{
  return get_post_type($post_id) === "works" && get_post_status($post_id) === "publish" && portfolio_get_work_visibility($post_id) === "public";
}

function portfolio_can_view_work($post_id)
{
  if (portfolio_is_public_work($post_id)) {
    return true;
  }
  return get_post_type($post_id) === "works" && get_post_status($post_id) === "private" && portfolio_get_work_visibility($post_id) === "private" && function_exists("portfolio_is_private_request_authenticated") && portfolio_is_private_request_authenticated();
}

/** Public helpers return WP_Post objects, ordered by publication, newest first. */
function portfolio_list_public_works($limit = 3)
{
  $query = new WP_Query([
    "post_type" => "works",
    "post_status" => "publish",
    "posts_per_page" => max(1, (int) $limit),
    "orderby" => ["date" => "DESC", "ID" => "DESC"],
    "meta_query" => [["key" => "works_visibility", "value" => "public", "compare" => "="]],
    "no_found_rows" => true,
    "ignore_sticky_posts" => true,
    "suppress_filters" => false,
  ]);
  return $query->posts;
}

function portfolio_find_work_data($post_id = 0)
{
  $post_id = $post_id ? (int) $post_id : get_the_ID();
  if (!portfolio_can_view_work($post_id)) {
    return [];
  }
  $technology_labels = [
    "html" => "HTML",
    "css" => "CSS / Sass",
    "javascript" => "JavaScript",
    "jquery" => "jQuery",
    "php" => "PHP",
    "wordpress" => "WordPress",
    "git" => "Git",
    "figma" => "Figma",
    "adobe_xd" => "Adobe XD",
    "react" => "React",
    "vue" => "Vue.js",
    "node" => "Node.js",
    "python" => "Python",
    "ruby" => "Ruby",
    "java" => "Java",
    "design" => "Design",
  ];
  $technologies = get_post_meta($post_id, "works_technologies", true);
  $technologies = is_array($technologies) ? $technologies : [];
  $technologies = array_values(
    array_filter(
      array_map(function ($technology) use ($technology_labels) {
        return is_string($technology) ? $technology_labels[$technology] ?? sanitize_text_field($technology) : "";
      }, $technologies),
    ),
  );
  $origin = (string) get_post_meta($post_id, "works_origin", true);
  return [
    "id" => $post_id,
    "title" => get_post_field("post_title", $post_id),
    "subtitle" => (string) get_post_meta($post_id, "works_subtitle", true),
    "project_type" => (string) get_post_meta($post_id, "works_project_type", true),
    "role" => (string) get_post_meta($post_id, "works_role", true),
    "technologies" => $technologies,
    "overview" => (string) get_post_meta($post_id, "works_overview", true),
    "implementation" => (string) get_post_meta($post_id, "works_implementation", true),
    "url" => (string) get_post_meta($post_id, "works_url", true),
    "demo_access_note" => portfolio_get_work_visibility($post_id) === "public" ? (string) get_post_meta($post_id, "works_demo_access_note", true) : "",
    "visibility" => portfolio_get_work_visibility($post_id),
    "origin" => $origin,
    "graduation" => $origin === "school_graduation",
    "permalink" => get_permalink($post_id),
    "demo_image" => portfolio_get_work_visibility($post_id) === "public" && (bool) get_post_meta($post_id, "portfolio_demo_image", true) && !(int) get_post_meta($post_id, "works_gallery", true) && !has_post_thumbnail($post_id),
  ];
}

/** Main-image markup. Confidential works never fall back to a public upload. */
function portfolio_build_work_image($post_id = 0, $size = "large", $attr = [])
{
  $post_id = $post_id ? (int) $post_id : get_the_ID();
  if (!portfolio_can_view_work($post_id)) {
    return "";
  }
  if (portfolio_get_work_visibility($post_id) === "private") {
    return function_exists("portfolio_build_private_image") ? portfolio_build_private_image($post_id, $attr) : "";
  }
  $attr = wp_parse_args($attr, ["loading" => "lazy", "decoding" => "async", "alt" => get_the_title($post_id)]);
  $image_id = (int) get_post_meta($post_id, "works_gallery", true);
  if (!$image_id) {
    $image_id = (int) get_post_thumbnail_id($post_id);
  }
  if ($image_id) {
    return wp_get_attachment_image($image_id, $size, false, $attr);
  }
  $filename = (string) get_post_meta($post_id, "portfolio_demo_asset", true);
  $allowed = ["portfolio-next-realty.webp", "portfolio-kidsland.webp", "portfolio-valentine-rose.webp"];
  if (!in_array($filename, $allowed, true)) {
    return "";
  }
  $path = get_theme_file_path("/assets/images/" . $filename);
  $dimensions = is_file($path) ? wp_getimagesize($path) : false;
  if (!$dimensions) {
    return "";
  }
  $attributes = array_merge($attr, [
    "src" => get_theme_file_uri("/assets/images/" . $filename),
    "width" => (int) $dimensions[0],
    "height" => (int) $dimensions[1],
  ]);
  $html = "<img";
  foreach ($attributes as $name => $value) {
    if (preg_match("/^(?:src|alt|width|height|loading|decoding|class|sizes|fetchpriority)$/", $name)) {
      $html .= " " . $name . '="' . esc_attr($value) . '"';
    }
  }
  return $html . " />";
}

function portfolio_apply_work_permalink($url, $post)
{
  if ($post->post_type === "works" && portfolio_get_work_visibility($post->ID) === "private") {
    return home_url("/private-works/" . $post->post_name . "/");
  }
  return $url;
}
add_filter("post_type_link", "portfolio_apply_work_permalink", 10, 2);

/** Keep WP's native private status as an additional barrier to public APIs. */
function portfolio_apply_work_insert_status($data, $postarr)
{
  if (($data["post_type"] ?? "") !== "works" || !in_array($data["post_status"] ?? "", ["publish", "private"], true)) {
    return $data;
  }
  $post_id = (int) ($postarr["ID"] ?? 0);
  $visibility = isset($_POST["acf"]["field_portfolio_visibility"]) ? sanitize_key(wp_unslash($_POST["acf"]["field_portfolio_visibility"])) : portfolio_get_work_visibility($post_id);
  $data["post_status"] = $visibility === "public" ? "publish" : "private";
  return $data;
}
add_filter("wp_insert_post_data", "portfolio_apply_work_insert_status", 10, 2);

function portfolio_sync_work_status($post_id)
{
  static $syncing = false;
  $post_id = (int) $post_id;
  $post = get_post($post_id);
  if ($syncing || !$post || $post->post_type !== "works" || wp_is_post_revision($post_id) || !in_array($post->post_status, ["publish", "private"], true)) {
    return;
  }
  $target = portfolio_get_work_visibility($post_id) === "public" ? "publish" : "private";
  if ($post->post_status !== $target) {
    $syncing = true;
    wp_update_post(["ID" => $post_id, "post_status" => $target]);
    $syncing = false;
  }
}
add_action("acf/save_post", "portfolio_sync_work_status", 20);
function portfolio_handle_work_visibility_meta_change($meta_id, $post_id, $meta_key)
{
  if ($meta_key === "works_visibility") {
    portfolio_sync_work_status($post_id);
  }
}
add_action("added_post_meta", "portfolio_handle_work_visibility_meta_change", 10, 3);
add_action("updated_post_meta", "portfolio_handle_work_visibility_meta_change", 10, 3);
add_action("deleted_post_meta", "portfolio_handle_work_visibility_meta_change", 10, 3);
