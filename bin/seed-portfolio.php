<?php
/**
 * Run with WP-CLI eval-file after activating the portfolio theme.
 * Creates only missing, specifically named sample works and a private index page.
 * It does not overwrite existing projects, images, URLs, users, or site settings.
 */
if (!defined("WP_CLI") || !WP_CLI || !defined("ABSPATH")) {
  exit("WP-CLI only.\n");
}
if (!post_type_exists("works") || !function_exists("portfolio_get_work_visibility")) {
  WP_CLI::error("Activate the portfolio theme before running this seed.");
}

$samples = [
  [
    "slug" => "valentine-rose",
    "title" => "Valentine Rose",
    "type" => "Beauty Salon Website",
    "overview" => "美容サロンのWebサイト。スクール卒業制作。",
    "role" => "Coding / WordPress / JavaScript",
    "technologies" => ["html", "css", "wordpress", "javascript"],
    "asset" => "portfolio-valentine-rose.webp",
    "url" => "https://schiff.wpx.jp/valentine_rose/?utm_source=mail&utm_medium=email&utm_campaign=pf001",
  ],
  [
    "slug" => "kidsland",
    "title" => "Kidsland",
    "type" => "Kindergarten / Nursery Website",
    "overview" => "幼稚園・保育園のWebサイト。スクール卒業制作。",
    "role" => "Coding / WordPress / JavaScript",
    "technologies" => ["html", "css", "wordpress", "javascript"],
    "asset" => "portfolio-kidsland.webp",
    "url" => "https://schiff.wpx.jp/kidsland/?utm_source=mail&utm_medium=email&utm_campaign=pf001",
  ],
  [
    "slug" => "next-realty",
    "title" => "Next Realty",
    "type" => "Corporate Website",
    "role" => "Coding / WordPress / JavaScript",
    "technologies" => ["html", "css", "wordpress", "javascript"],
    "asset" => "portfolio-next-realty.webp",
    "url" => "https://schiff.wpx.jp/nextrealty/?utm_source=mail&utm_medium=email&utm_campaign=pf001",
  ],
];
$field_keys = [
  "works_visibility" => "field_portfolio_visibility",
  "works_subtitle" => "field_portfolio_subtitle",
  "works_project_type" => "field_portfolio_project_type",
  "works_role" => "field_portfolio_role",
  "works_technologies" => "field_2ccef63afe357",
  "works_origin" => "field_portfolio_origin",
  "works_overview" => "field_portfolio_overview",
  "works_implementation" => "field_portfolio_implementation",
  "works_url" => "field_6ca866c6fca79",
  "works_demo_access_note" => "field_portfolio_demo_access_note",
];

foreach ($samples as $sample) {
  $existing = get_page_by_path($sample["slug"], OBJECT, "works");
  if ($existing) {
    WP_CLI::log("Existing work preserved: " . $sample["title"] . " (" . $existing->ID . ")");
    continue;
  }
  $post_id = wp_insert_post(
    [
      "post_type" => "works",
      "post_status" => "draft",
      "post_name" => $sample["slug"],
      "post_title" => $sample["title"],
      "post_content" => "",
      "post_excerpt" => "",
    ],
    true,
  );
  if (is_wp_error($post_id)) {
    WP_CLI::warning($post_id->get_error_message());
    continue;
  }
  $fields = [
    "works_visibility" => "public",
    "works_subtitle" => "",
    "works_project_type" => $sample["type"],
    "works_role" => $sample["role"],
    "works_technologies" => $sample["technologies"],
    "works_origin" => "school_graduation",
    "works_overview" => $sample["overview"] ?? "スクール卒業制作。",
    "works_implementation" => "",
    "works_url" => $sample["url"],
    // These are explicitly approved public demo access details, not Private Works credentials.
    "works_demo_access_note" => "閲覧用ID: demo / Password: demo",
  ];
  foreach ($fields as $name => $value) {
    if (function_exists("update_field")) {
      update_field($field_keys[$name], $value, $post_id);
    } else {
      update_post_meta($post_id, $name, $value);
      update_post_meta($post_id, "_" . $name, $field_keys[$name]);
    }
  }
  update_post_meta($post_id, "portfolio_demo_image", 0);
  update_post_meta($post_id, "portfolio_demo_asset", $sample["asset"]);
  $published = wp_update_post(["ID" => $post_id, "post_status" => "publish"], true);
  if (is_wp_error($published)) {
    WP_CLI::warning($published->get_error_message());
  } else {
    WP_CLI::log("Created school graduation project: " . $sample["title"] . " (" . $post_id . ")");
  }
}

$private_page = get_page_by_path("private-works", OBJECT, "page");
if (!$private_page) {
  $private_page = wp_insert_post(
    [
      "post_type" => "page",
      "post_status" => "publish",
      "post_name" => "private-works",
      "post_title" => "Private Works",
      "post_content" => "",
    ],
    true,
  );
  if (is_wp_error($private_page)) {
    WP_CLI::warning($private_page->get_error_message());
  } else {
    WP_CLI::log("Created private index page (" . $private_page . ").");
  }
} else {
  WP_CLI::log("Existing private index page preserved (" . $private_page->ID . ").");
}
// Do not write wp-env .htaccess from CLI: its RewriteBase can be incorrect.
flush_rewrite_rules(false);
WP_CLI::success("Portfolio seed complete. Initial thumbnails use the supplied public project screenshots.");
