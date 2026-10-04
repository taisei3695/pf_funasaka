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

/** Render-blocking module execution ensures the pagereveal listener is already registered. */
function portfolio_apply_transition_script_attributes($tag, $handle, $source)
{
  if ($handle === "portfolio-transition") {
    return '<script type="module" async blocking="render" src="' . esc_url($source) . '"></script>';
  }
  return $tag;
}
add_filter("script_loader_tag", "portfolio_apply_transition_script_attributes", 11, 3);

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
    $target = "portfolio-work-image-" . get_queried_object_id();
    echo portfolio_build_transition_image_preload(get_queried_object_id());
  } elseif (is_post_type_archive("works")) {
    global $wp_query;
    $first_post = $wp_query->posts[0] ?? null;
    if ($first_post && portfolio_find_work_data($first_post->ID)) {
      $target = "portfolio-work-image-" . $first_post->ID;
    }
  }
  if ($target) {
    echo '<link rel="expect" blocking="render" href="#' . esc_attr($target) . '" media="(prefers-reduced-motion: no-preference)">' . "\n";
  }
}
add_action("wp_head", "portfolio_print_transition_render_expectation", 2);

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
