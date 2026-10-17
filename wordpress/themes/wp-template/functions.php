<?php
if (!defined("ABSPATH")) {
  exit();
}

/**
 * Functions
 */
// 共通ヘルパー関数
get_template_part("functions-lib/func-helpers");

// スクリプトとスタイルの読み込み
get_template_part("functions-lib/func-enqueue");

// プラグイン管理（TGMPA）
get_template_part("functions-lib/func-plugins");

// ACF設定
get_template_part("functions-lib/func-acf");

// 基本設定
get_template_part("functions-lib/func-base");

// セキュリティー対応
get_template_part("functions-lib/func-security");

// コメント機能の無効化
get_template_part("functions-lib/func-comments");

// URLのショートカット設定
get_template_part("functions-lib/func-url");

// ニュース（通常投稿）の公開・管理UIを無効化
get_template_part("functions-lib/func-add-posttype-post");

// Portfolio content and access boundaries are owned by this theme.
get_template_part("functions-lib/func-works");
get_template_part("functions-lib/func-private-works");
get_template_part("functions-lib/func-portfolio");
get_template_part("functions-lib/func-projects");
get_template_part("functions-lib/func-portfolio-experience");
get_template_part("functions-lib/func-brand-assets");

// 構造化データの設定（汎用化済み）
get_template_part("functions-lib/func-structured-data");
