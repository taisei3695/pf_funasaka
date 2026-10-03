<?php
if (!defined("ABSPATH")) {
  exit();
}

/** Server configuration only: never accept similarly named HTTP_* headers. */
function portfolio_get_private_server_setting($name)
{
  if (defined($name)) {
    return constant($name);
  }
  foreach ([$name, "REDIRECT_" . $name, "REDIRECT_REDIRECT_" . $name] as $key) {
    if (isset($_SERVER[$key])) {
      return $_SERVER[$key];
    }
    $value = getenv($key);
    if ($value !== false) {
      return $value;
    }
  }
  return "";
}

function portfolio_is_private_request()
{
  $path = rawurldecode((string) wp_parse_url($_SERVER["REQUEST_URI"] ?? "", PHP_URL_PATH));
  $home_path = (string) wp_parse_url(home_url("/"), PHP_URL_PATH);
  $prefix = rtrim($home_path, "/") . "/private-works";
  return $path === $prefix || strpos($path, $prefix . "/") === 0;
}

/** AUTH_TYPE and REMOTE_USER must be supplied by an authenticated web server. */
function portfolio_is_private_request_authenticated()
{
  $user = $_SERVER["REMOTE_USER"] ?? ($_SERVER["REDIRECT_REMOTE_USER"] ?? "");
  $type = $_SERVER["AUTH_TYPE"] ?? ($_SERVER["REDIRECT_AUTH_TYPE"] ?? "");
  return portfolio_is_private_request() && (string) portfolio_get_private_server_setting("PORTFOLIO_PRIVATE_AUTH_ENABLED") === "1" && strcasecmp((string) $type, "Basic") === 0 && is_string($user) && trim($user) !== "";
}

function portfolio_register_private_routes()
{
  add_rewrite_rule("^private-works/media/([0-9]+)/?$", 'index.php?portfolio_private_media=$matches[1]', "top");
  add_rewrite_rule("^private-works/([^/]+)/?$", 'index.php?post_type=works&name=$matches[1]&portfolio_private_route=1', "top");
}
add_action("init", "portfolio_register_private_routes", 40);
add_filter("query_vars", function ($vars) {
  $vars[] = "portfolio_private_route";
  $vars[] = "portfolio_private_media";
  return $vars;
});

function portfolio_list_private_works($limit = 12)
{
  if (!portfolio_is_private_request_authenticated()) {
    return [];
  }
  $query = new WP_Query([
    "post_type" => "works",
    "post_status" => "private",
    "posts_per_page" => max(1, (int) $limit),
    "orderby" => ["date" => "DESC", "ID" => "DESC"],
    "meta_query" => [["key" => "works_visibility", "value" => "private", "compare" => "="]],
    "portfolio_private_query" => true,
    "suppress_filters" => false,
    "no_found_rows" => true,
  ]);
  return $query->posts;
}

function portfolio_is_editor_request()
{
  return current_user_can("edit_posts") && (is_admin() || (defined("REST_REQUEST") && REST_REQUEST));
}

/** Apply to custom queries too, including get_posts() with its default suppression. */
function portfolio_apply_work_query_visibility($query)
{
  if (portfolio_is_editor_request()) {
    return;
  }
  $query->set("suppress_filters", false);
  if ($query->is_main_query() && $query->get("portfolio_private_route") && portfolio_is_private_request_authenticated()) {
    $query->set("post_status", "private");
    $query->set("portfolio_private_query", true);
  }
  if ($query->get("portfolio_private_query") && !portfolio_is_private_request_authenticated()) {
    $query->set("portfolio_private_query", false);
  }
}
add_action("pre_get_posts", "portfolio_apply_work_query_visibility", 99);

function portfolio_build_work_visibility_clause($table_alias, $visibility)
{
  global $wpdb;
  $status = $visibility === "private" ? "private" : "publish";
  return $wpdb->prepare(
    " AND ({$table_alias}.post_type <> 'works' OR ({$table_alias}.post_status = %s AND EXISTS (SELECT 1 FROM {$wpdb->postmeta} AS portfolio_visibility WHERE portfolio_visibility.post_id = {$table_alias}.ID AND portfolio_visibility.meta_key = 'works_visibility' AND portfolio_visibility.meta_value = %s)))",
    $status,
    $visibility,
  );
}

function portfolio_apply_works_sql_visibility($where, $query)
{
  global $wpdb;
  if (portfolio_is_editor_request()) {
    return $where;
  }
  $visibility = $query->get("portfolio_private_query") && portfolio_is_private_request_authenticated() ? "private" : "public";
  $where .= portfolio_build_work_visibility_clause($wpdb->posts, $visibility);
  if (!portfolio_is_private_request_authenticated()) {
    $where .= " AND NOT ({$wpdb->posts}.post_type = 'page' AND {$wpdb->posts}.post_name = 'private-works')";
  }
  return $where;
}
add_filter("posts_where", "portfolio_apply_works_sql_visibility", 20, 2);
function portfolio_apply_adjacent_work_visibility($where)
{
  return $where . portfolio_build_work_visibility_clause("p", portfolio_is_private_request_authenticated() ? "private" : "public");
}
add_filter("get_previous_post_where", "portfolio_apply_adjacent_work_visibility");
add_filter("get_next_post_where", "portfolio_apply_adjacent_work_visibility");

/** A query variable never grants access. Guard before templates/SEO execute. */
function portfolio_handle_private_request()
{
  if (is_admin()) {
    return;
  }
  $private = portfolio_is_private_request() || get_query_var("portfolio_private_route") || get_query_var("portfolio_private_media") || is_page("private-works");
  if (!$private) {
    if (is_singular("works") && !portfolio_is_public_work(get_queried_object_id())) {
      status_header(404);
      nocache_headers();
      wp_die("ページが見つかりません。", "Not Found", ["response" => 404]);
    }
    return;
  }
  nocache_headers();
  header("Cache-Control: private, no-store, max-age=0", true);
  header("X-Robots-Tag: noindex, nofollow, noarchive", true);
  if (!portfolio_is_private_request_authenticated()) {
    // The server must perform Basic authentication. PHP never verifies passwords.
    wp_die("この領域はサーバーのBasic認証設定が確認できるまで表示できません。", "Private Works", ["response" => 503]);
  }
  $media_id = (int) get_query_var("portfolio_private_media");
  if ($media_id) {
    portfolio_serve_private_image($media_id);
  }
}
add_action("template_redirect", "portfolio_handle_private_request", 0);
add_filter("redirect_canonical", function ($url) {
  return portfolio_is_private_request() ? false : $url;
});
add_filter("wp_robots", function ($robots) {
  if (portfolio_is_private_request() || is_page("private-works")) {
    unset($robots["index"], $robots["follow"]);
    $robots["noindex"] = true;
    $robots["nofollow"] = true;
  }
  return $robots;
});

add_filter(
  "wp_sitemaps_posts_query_args",
  function ($args, $post_type) {
    if ($post_type === "works") {
      $args["meta_query"] = array_merge($args["meta_query"] ?? [], [["key" => "works_visibility", "value" => "public"]]);
    }
    if ($post_type === "page") {
      $page = get_page_by_path("private-works");
      if ($page) {
        $args["post__not_in"] = array_unique(array_merge($args["post__not_in"] ?? [], [$page->ID]));
      }
    }
    return $args;
  },
  10,
  2,
);

/** Core protects native private posts; also reject legacy/incorrect publish rows. */
add_filter(
  "rest_pre_dispatch",
  function ($result, $server, $request) {
    if (!portfolio_is_editor_request() && preg_match("#^/wp/v2/works/(\d+)(?:/|$)#", $request->get_route(), $match) && !portfolio_is_public_work((int) $match[1])) {
      return new WP_Error("rest_no_route", "作品が見つかりません。", ["status" => 404]);
    }
    if (!portfolio_is_editor_request() && preg_match("#^/wp/v2/pages/(\d+)(?:/|$)#", $request->get_route(), $match)) {
      $post = get_post((int) $match[1]);
      if ($post && $post->post_name === "private-works") {
        return new WP_Error("rest_no_route", "ページが見つかりません。", ["status" => 404]);
      }
    }
    return $result;
  },
  10,
  3,
);
add_filter(
  "rest_prepare_works",
  function ($response, $post) {
    if (!portfolio_is_editor_request() && !portfolio_is_public_work($post->ID)) {
      return new WP_Error("rest_no_route", "作品が見つかりません。", ["status" => 404]);
    }
    return $response;
  },
  10,
  2,
);

/** Resolve only allowed raster files inside a directory outside the web root. */
function portfolio_find_private_image_path($post_id)
{
  if (!portfolio_can_view_work($post_id) || portfolio_get_work_visibility($post_id) !== "private") {
    return false;
  }
  $configured_root = (string) portfolio_get_private_server_setting("PORTFOLIO_PRIVATE_MEDIA_DIR");
  if (trim($configured_root) === "") {
    return false;
  }
  $root = realpath($configured_root);
  $public_root = realpath(ABSPATH);
  if (!$root || !$public_root || strpos(wp_normalize_path($root) . "/", trailingslashit(wp_normalize_path($public_root))) === 0) {
    return false;
  }
  $key = (string) get_post_meta($post_id, "works_private_image_key", true);
  if ($key === "" || !preg_match("#^[a-zA-Z0-9][a-zA-Z0-9._/-]*\.(?:png|jpe?g|webp|avif)$#i", $key) || strpos($key, "..") !== false) {
    return false;
  }
  $path = realpath($root . DIRECTORY_SEPARATOR . $key);
  if (!$path || strpos(wp_normalize_path($path), trailingslashit(wp_normalize_path($root))) !== 0 || !is_file($path) || !is_readable($path)) {
    return false;
  }
  $dimensions = wp_getimagesize($path);
  if (!$dimensions || !in_array($dimensions["mime"] ?? "", ["image/jpeg", "image/png", "image/webp", "image/avif"], true)) {
    return false;
  }
  return $path;
}

function portfolio_build_private_image($post_id, $attr = [])
{
  $path = portfolio_find_private_image_path($post_id);
  if (!$path) {
    return "";
  }
  $dimensions = wp_getimagesize($path);
  $attr = wp_parse_args($attr, ["alt" => get_the_title($post_id), "loading" => "lazy", "decoding" => "async"]);
  $html = '<img src="' . esc_url(home_url("/private-works/media/" . (int) $post_id . "/")) . '" width="' . (int) $dimensions[0] . '" height="' . (int) $dimensions[1] . '"';
  foreach ($attr as $name => $value) {
    if (in_array($name, ["alt", "loading", "decoding", "class", "fetchpriority"], true)) {
      $html .= " " . $name . '="' . esc_attr($value) . '"';
    }
  }
  return $html . " />";
}

function portfolio_serve_private_image($post_id)
{
  $path = portfolio_find_private_image_path($post_id);
  if (!$path) {
    wp_die("画像が見つかりません。", "Not Found", ["response" => 404]);
  }
  $dimensions = wp_getimagesize($path);
  header("Content-Type: " . $dimensions["mime"]);
  header("X-Content-Type-Options: nosniff");
  header("Content-Length: " . filesize($path));
  header("Content-Disposition: inline");
  if (($_SERVER["REQUEST_METHOD"] ?? "GET") !== "HEAD") {
    readfile($path);
  }
  exit();
}

add_action("admin_notices", function () {
  $screen = get_current_screen();
  if ($screen && $screen->post_type === "works" && $screen->base === "post") {
    echo '<div class="notice notice-info"><p>非公開実績の画像はメディアライブラリに置かず、サーバーの専用保管領域へ配置してください。通常の画像・本文に公開URLを残すと、Basic認証では保護されません。詳しい手順は doc/private-works.md を参照してください。</p></div>';
  }
});
