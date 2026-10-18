<?php
if (!defined("ABSPATH")) {
  exit();
}

/**
 * Vite対応のスクリプトとスタイル読み込み処理
 * 環境変数（WP_DEBUG）とmanifestファイルを活用した環境判定
 */
function enqueue_vite_assets()
{
  $environment = get_asset_environment();

  switch ($environment) {
    case "dev":
      enqueue_dev_assets();
      return;

    case "manifest":
      enqueue_production_assets_from_manifest();
      break;

    case "fallback":
      enqueue_production_assets_fallback();
      break;
  }

  // Portfolio typography is served locally through the Vite stylesheet.
}

/**
 * 開発環境のアセットを読み込み
 */
function enqueue_dev_assets()
{
  $dev_manifest = read_vite_manifest();
  if ($dev_manifest === false || !isset($dev_manifest["url"])) {
    return;
  }

  $baseUrl = $dev_manifest["url"];
  wp_enqueue_script("vite-client", $baseUrl . "@vite/client", [], null, true);

  if (isset($dev_manifest["inputs"]["script"])) {
    wp_enqueue_script("theme-scripts", $baseUrl . $dev_manifest["inputs"]["script"], [], null, true);
  }
}

/**
 * manifest.jsonを使用した本番環境のアセットを読み込み
 */
function enqueue_production_assets_from_manifest()
{
  $root = get_template_directory_uri();
  $build_manifest = read_build_manifest();

  if ($build_manifest === false) {
    return;
  }

  // ライブラリCSS（JS関連CSS）を先に読み込み
  $library_css_handles = [];
  $script_entry = $build_manifest["assets/js/script.js"] ?? null;

  if ($script_entry && isset($script_entry["file"])) {
    // JS関連CSS（ライブラリCSS、例：Splide）を先に読み込み
    if (isset($script_entry["css"]) && is_array($script_entry["css"])) {
      foreach ($script_entry["css"] as $index => $css_file) {
        $handle = "theme-script-css-" . $index;
        $library_css_handles[] = $handle;
        wp_enqueue_style($handle, $root . "/" . $css_file, [], null, false);
      }
    }
    // メインJSを読み込み
    wp_enqueue_script("theme-scripts", $root . "/" . $script_entry["file"], [], null, true);
  }

  // メインCSSを最後に読み込み（ライブラリCSSの後に確実に読み込まれるように依存関係を指定）
  $style_entry = $build_manifest["assets/styles/style.scss"] ?? null;
  if ($style_entry && isset($style_entry["file"])) {
    wp_enqueue_style("theme-styles", $root . "/" . $style_entry["file"], $library_css_handles, null, false);
  }
}

/**
 * フォールバック方式で本番環境のアセットを読み込み
 * manifest.jsonが存在しない場合の安全策
 */
function enqueue_production_assets_fallback()
{
  $root = get_template_directory_uri();
  $assets_dir = get_template_directory() . "/assets";

  // ライブラリCSS（style.css 以外）を先に読み込む
  $library_css_handles = [];
  $css_files = glob($assets_dir . "/styles/*.css");

  if (is_array($css_files)) {
    foreach ($css_files as $css_file) {
      if (!is_file($css_file) || !is_readable($css_file)) {
        continue;
      }

      $filename = basename($css_file, ".css");
      if ($filename === "style") {
        continue;
      }

      $version = find_file_version($css_file);
      if ($version !== null) {
        $handle = "theme-" . $filename;
        $library_css_handles[] = $handle;
        wp_enqueue_style($handle, $root . "/assets/styles/" . basename($css_file), [], $version, false);
      }
    }
  }

  // メインJSを読み込み
  $script_file = $assets_dir . "/js/script.js";
  $version = find_file_version($script_file);
  if ($version !== null) {
    wp_enqueue_script("theme-scripts", $root . "/assets/js/script.js", [], $version, true);
  }

  // メインCSSを最後に読み込み（ライブラリCSSの後に確実に読み込まれるように依存関係を指定）
  $style_file = $assets_dir . "/styles/style.css";
  $version = find_file_version($style_file);
  if ($version !== null) {
    wp_enqueue_style("theme-styles", $root . "/assets/styles/style.css", $library_css_handles, $version, false);
  }
}

add_action("wp_enqueue_scripts", "enqueue_vite_assets", 10);

/**
 * global-styles-inline-cssを無効化
 */
function remove_global_styles()
{
  wp_dequeue_style("global-styles");
  wp_deregister_style("global-styles");
  remove_action("wp_enqueue_scripts", "wp_enqueue_global_styles");
  remove_action("wp_footer", "wp_enqueue_global_styles", 1);
}
add_action("wp_enqueue_scripts", "remove_global_styles", 100);

/**
 * after_setup_themeでglobal-stylesを無効化
 */
function remove_global_style_hooks_on_setup()
{
  remove_action("wp_enqueue_scripts", "wp_enqueue_global_styles");
  remove_action("wp_footer", "wp_enqueue_global_styles", 1);
}
add_action("after_setup_theme", "remove_global_style_hooks_on_setup", 100);

/**
 * ES Modules対応（type="module"属性を追加）
 */
function apply_vite_module_attribute($tag, $handle, $src)
{
  if (in_array($handle, ["theme-scripts", "vite-client"])) {
    $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
  }
  return $tag;
}
add_filter("script_loader_tag", "apply_vite_module_attribute", 10, 3);

/** Register the small navigation entry in the head before the first rendered frame. */
function portfolio_enqueue_transition_assets()
{
  $source = null;
  $version = null;
  $environment = get_asset_environment();
  if ($environment === "dev") {
    $manifest = read_vite_manifest();
    if ($manifest && isset($manifest["url"], $manifest["inputs"]["portfolio-transition"])) {
      $source = $manifest["url"] . $manifest["inputs"]["portfolio-transition"];
    }
  } elseif ($environment === "manifest") {
    $manifest = read_build_manifest();
    if ($manifest && isset($manifest["assets/js/portfolio-transition.js"]["file"])) {
      $source = get_template_directory_uri() . "/" . $manifest["assets/js/portfolio-transition.js"]["file"];
    }
  } else {
    $file = get_template_directory() . "/assets/js/portfolio-transition.js";
    $version = find_file_version($file);
    if ($version !== null) {
      $source = get_template_directory_uri() . "/assets/js/portfolio-transition.js";
    }
  }
  if ($source) {
    wp_enqueue_script("portfolio-transition", $source, [], $version, false);
  }
}
add_action("wp_enqueue_scripts", "portfolio_enqueue_transition_assets", 11);

/** Inline the dependency-free production entry so pagereveal registration needs no network round trip. */
function portfolio_apply_transition_script_attributes($tag, $handle, $source)
{
  if ($handle === "portfolio-transition") {
    if (get_asset_environment() === "manifest" && function_exists("wp_get_inline_script_tag")) {
      $manifest = read_build_manifest();
      $entry = $manifest["assets/js/portfolio-transition.js"] ?? null;
      $file = is_array($entry) ? $entry["file"] ?? null : null;
      if (is_string($file) && preg_match("~^assets/js/portfolio-transition(?:[.][a-zA-Z0-9_-]+)?[.]js$~", $file) && empty($entry["imports"]) && empty($entry["dynamicImports"]) && empty($entry["css"]) && empty($entry["assets"])) {
        $path = get_template_directory() . "/" . $file;
        if (is_file($path) && is_readable($path) && filesize($path) <= 16384) {
          $script = file_get_contents($path);
          // Module syntax, asset references, and HTML script delimiters must keep their external module context.
          if (is_string($script) && trim($script) !== "" && !preg_match("~\\b(?:import|export|await)\\b|</?script|<!--~i", $script)) {
            $inline_tag = wp_get_inline_script_tag("(function () {\n\"use strict\";\n" . $script . "\n})();", ["id" => "portfolio-transition-js", "type" => "text/javascript"]);
            if ($inline_tag !== "") {
              return $inline_tag;
            }
          }
        }
      }
    }
    // Preserve early module execution in development, fallback, or a future build with dependencies.
    return '<script type="module" async blocking="render" src="' . esc_url($source) . '"></script>';
  }
  return $tag;
}
add_filter("script_loader_tag", "portfolio_apply_transition_script_attributes", 11, 3);

/** Preload the hero font using the same hashed URL as the production stylesheet. */
function portfolio_print_hero_font_preload()
{
  if (!is_front_page() || get_asset_environment() !== "manifest") {
    return;
  }

  $manifest = read_build_manifest();
  $file = $manifest["assets/fonts/jost-latin-wght-normal.woff2"]["file"] ?? null;
  if (!is_string($file) || !preg_match("~^assets/jost-latin-wght-normal[.][a-zA-Z0-9_-]+[.]woff2$~", $file) || !is_file(get_template_directory() . "/" . $file)) {
    return;
  }

  $url = get_template_directory_uri() . "/" . $file;
  echo '<link rel="preload" href="' . esc_url($url) . '" as="font" type="font/woff2" crossorigin>' . "\n";
}
add_action("wp_head", "portfolio_print_hero_font_preload", 2);

/** Discover the first-view scene before the footer entry's dynamic import. */
function portfolio_print_intro_preload()
{
  if (!is_front_page()) {
    return;
  }
  wp_print_inline_script_tag('document.documentElement.classList.add("has-portfolio-intro");', ["id" => "portfolio-intro-layout"]);
  $manifest = read_build_manifest();
  $file = $manifest["assets/js/_portfolio-intro-scene.js"]["file"] ?? null;
  if (get_asset_environment() === "manifest" && is_string($file) && preg_match("~^assets/js/_portfolio-intro-scene[.][a-zA-Z0-9_-]+[.]js$~", $file)) {
    echo '<link rel="modulepreload" href="' . esc_url(get_template_directory_uri() . "/" . $file) . '" crossorigin>' . "\n";
  }
}
add_action("wp_head", "portfolio_print_intro_preload", 2);

/** Reuse the rendered main image's source contract so responsive preload never requests a second candidate. */
function portfolio_build_transition_image_preload($post_id)
{
  if (!class_exists("WP_HTML_Tag_Processor")) {
    return "";
  }
  $image = portfolio_build_work_image($post_id, "full", [
    "loading" => "eager",
    "sizes" => "(min-width: 1440px) 1280px, (min-width: 1024px) calc(100vw - 160px), (min-width: 768px) calc(100vw - 96px), calc(100vw - 40px)",
  ]);
  $processor = new WP_HTML_Tag_Processor($image);
  if (!$processor->next_tag("IMG")) {
    return "";
  }
  $source = $processor->get_attribute("src");
  if (!is_string($source) || !$source) {
    return "";
  }
  $markup = '<link rel="preload" as="image" fetchpriority="high" href="' . esc_url($source) . '"';
  foreach (["srcset" => "imagesrcset", "sizes" => "imagesizes"] as $image_attribute => $link_attribute) {
    $value = $processor->get_attribute($image_attribute);
    if (is_string($value) && $value) {
      $markup .= " " . $link_attribute . '="' . esc_attr($value) . '"';
    }
  }
  return $markup . ' media="(prefers-reduced-motion: no-preference)">' . "\n";
}

/** Expect only the first visible scene's markup; images and below-fold content are not awaited. */
function portfolio_print_transition_render_expectation()
{
  $target = null;
  if (is_front_page()) {
    $target = "portfolio-hero";
  } elseif (is_singular("works") && portfolio_find_work_data(get_queried_object_id())) {
    $target = "portfolio-work-title";
    echo portfolio_build_transition_image_preload(get_queried_object_id());
  } elseif (is_post_type_archive("works")) {
    $target = "works-title";
  }
  if ($target) {
    echo '<link rel="expect" blocking="render" href="#' . esc_attr($target) . '" media="(prefers-reduced-motion: no-preference)">' . "\n";
  }
}
add_action("wp_head", "portfolio_print_transition_render_expectation", 2);

/** Begin WordPress's HTML-only prefetch on hover intent, before the click. */
function portfolio_update_navigation_prefetch_configuration($config)
{
  if ($config === null || portfolio_is_private_request()) {
    return null;
  }
  return ["mode" => "prefetch", "eagerness" => "moderate"];
}
add_filter("wp_speculation_rules_configuration", "portfolio_update_navigation_prefetch_configuration");

/** Preserve core exclusions and keep authenticated portfolio routes out of speculation. */
function portfolio_list_prefetch_excluded_paths($paths)
{
  return array_merge($paths, ["/private-works", "/private-works/*"]);
}
add_filter("wp_speculation_rules_href_exclude_paths", "portfolio_list_prefetch_excluded_paths");

/**
 * Google Fonts最適化（プリコネクト）
 */
function apply_font_preconnect_markup($html, $handle)
{
  if ("google-fonts" === $handle) {
    $html = <<<EOT
    <link rel='preconnect' href='https://fonts.googleapis.com'>
    <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>
    $html
    EOT;
  }
  return $html;
}
add_filter("style_loader_tag", "apply_font_preconnect_markup", 10, 2);
