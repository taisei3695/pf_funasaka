<?php
if (!defined("ABSPATH")) {
  exit();
}

/**
 * func-url
 * パス・URL 用ヘルパー
 *
 * 画像:
 *   print_image_url('/common/logo.svg') →https://xxx.com/.../assets/images/common/logo.svg
 *
 * 固定ページ・表示設定のURL出力（print_page_url）:
 *   print_page_url()           → https://xxx.com/
 *   print_page_url('news')     → https://xxx.com/news/  （表示設定の「投稿ページ」など）
 *   print_page_url('contact') → https://xxx.com/contact/
 *   print_page_url('#section') → https://xxx.com/#section
 *   print_page_url('doc.pdf')  → https://xxx.com/doc.pdf
 *
 * 制作実績アーカイブ（他リンクと同様にスラッグで指定）:
 *   print_page_url('works') / build_page_url('works') → https://xxx.com/works/
 *
 * 通常投稿カテゴリー:
 *   find_category_url($slug) で return されるので echo で出力する
 *
 * @package WordPress
 */

// WordPress定数の定義チェック（リンターエラー回避のため）
if (!defined("WP_DEBUG")) {
  define("WP_DEBUG", false);
}

/* テーマ内ファイルのURLを出力する（echo） */
function print_theme_url($file = "")
{
  echo esc_url(get_theme_file_uri($file));
}
/* assets配下のURLを出力する（echo） */
function print_assets_url($file = "")
{
  echo esc_url(get_theme_file_uri("/assets" . $file));
}
/* 画像ファイルのURLを出力する（echo） */
function print_image_url($file = "")
{
  echo esc_url(get_theme_file_uri("/assets/images" . $file));
}
/* メディアアップロードのベースURLを出力する（echo） */
function print_uploads_url()
{
  // アップロードディレクトリ情報を取得し、異常があれば空文字を出力して中断。
  $upload_dir = wp_upload_dir();

  if (!empty($upload_dir["error"])) {
    if (defined("WP_DEBUG") && WP_DEBUG) {
      error_log("[print_uploads_url] " . $upload_dir["error"]);
    }
    echo "";
    return;
  }

  // 正常時はメディアのベースURLをエスケープして出力。
  echo esc_url($upload_dir["baseurl"]);
}

/* 指定ページのURLを組み立てて返す（return） */
function build_page_url($page = "")
{
  if (strpos($page, "#") === false && strpos($page, "?") === false && !preg_match('/\.[a-zA-Z0-9]+$/', $page)) {
    $page .= "/";
  }
  return esc_url(home_url($page));
}

/* 指定ページのURLを出力する（echo） */
function print_page_url($page = "")
{
  echo build_page_url($page);
}

/* カテゴリーURLを検索して返す（return）。見つからない場合は #。 */
function find_category_url($category_slug = "")
{
  if (empty($category_slug)) {
    return "#"; // 空なら # を返すようにして安全対策
  }

  // get_cat_ID() は非推奨のため、get_category_by_slug() を使用
  $category = get_category_by_slug($category_slug);
  if (!$category) {
    return "#";
  }

  $link = get_category_link($category->term_id);

  // リンク取得時にWP_Errorが返るケースをログに残し、利用者にはダミーを返す。
  if ($link instanceof WP_Error) {
    if (defined("WP_DEBUG") && WP_DEBUG) {
      error_log("[find_category_url] " . $link->get_error_message());
    }
    return "#";
  }

  // 正常時はエスケープ済みURLを返却。
  return esc_url($link);
}
