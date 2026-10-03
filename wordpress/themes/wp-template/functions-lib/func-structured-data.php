<?php
if (!defined("ABSPATH")) {
  exit();
}

/** Public-only metadata; confidential projects never reach the document head. */
function get_simple_structured_data_config()
{
  return apply_filters("simple_structured_data_config", [
    "organization_name" => "TAISEI FUNASAKA",
    "organization_url" => home_url("/"),
    "organization_logo" => "",
    "enable_breadcrumbs" => false,
  ]);
}

function add_simple_structured_data()
{
  if ((function_exists("portfolio_private_is_request") && portfolio_private_is_request()) || is_page("private-works")) {
    return;
  }
  if (is_singular("works") && (!function_exists("portfolio_work_is_public") || !portfolio_work_is_public(get_queried_object_id()))) {
    return;
  }
  $config = get_simple_structured_data_config();
  $person = [
    "@context" => "https://schema.org",
    "@type" => "Person",
    "@id" => home_url("/#person"),
    "name" => "舩坂 太成",
    "alternateName" => $config["organization_name"],
    "url" => $config["organization_url"],
    "jobTitle" => "Web Coder / WordPress Developer",
  ];
  $data = [$person];
  if (is_front_page()) {
    $data[] = [
      "@context" => "https://schema.org",
      "@type" => "WebSite",
      "name" => "TAISEI FUNASAKA — Portfolio",
      "url" => home_url("/"),
      "description" => get_bloginfo("description"),
      "author" => ["@id" => home_url("/#person")],
    ];
  } elseif (is_singular()) {
    $page = add_page_structured_data($config);
    if ($page) {
      $data[] = $page;
    }
  }
  echo '<script type="application/ld+json">' . wp_json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_HEX_APOS) . "</script>" . PHP_EOL;
}
add_action("wp_head", "add_simple_structured_data", 20);

function add_page_structured_data($config)
{
  $post = get_post();
  if (!$post || $post->post_name === "private-works") {
    return null;
  }
  $is_work = $post->post_type === "works";
  if ($is_work && !portfolio_work_is_public($post->ID)) {
    return null;
  }
  $page = [
    "@context" => "https://schema.org",
    "@type" => $is_work ? "CreativeWork" : "WebPage",
    "name" => get_the_title($post),
    "url" => get_permalink($post),
    "datePublished" => get_the_date("c", $post),
    "dateModified" => get_the_modified_date("c", $post),
    "creator" => ["@id" => home_url("/#person")],
  ];
  $description = $is_work ? get_post_meta($post->ID, "works_overview", true) : get_the_excerpt($post);
  if ($description) {
    $page["description"] = wp_strip_all_tags($description);
  }
  if ($is_work && get_post_meta($post->ID, "works_origin", true) === "school_graduation") {
    $page["educationalUse"] = "School Graduation Project";
  }
  $image_id = $is_work ? (int) get_post_meta($post->ID, "works_gallery", true) : get_post_thumbnail_id($post);
  if ($image_id) {
    $image = wp_get_attachment_image_url($image_id, "full");
    if ($image) {
      $page["image"] = $image;
    }
  }
  return $page;
}
