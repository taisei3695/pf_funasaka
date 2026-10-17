<?php
if (!defined("ABSPATH")) {
  exit();
}

/** All sections use the shared 制作実績 fields; drafts never fall back to seed data. */
function portfolio_list_professional_projects()
{
  return portfolio_list_project_summaries("professional", 4);
}

function portfolio_list_system_projects()
{
  return portfolio_list_project_summaries("system", 2);
}

function portfolio_list_academic_projects()
{
  return portfolio_list_project_summaries("academic", 2);
}

/** Years are the supplied total experience, not years of paid work. */
function portfolio_list_skill_experience()
{
  return [
    ["name" => "HTML", "years" => "5年", "context" => "実務経験あり", "category" => "Frontend", "description" => "業務システムの画面実装・デザインカンプからのコーディング"],
    ["name" => "CSS", "years" => "5年", "context" => "実務経験あり", "category" => "Frontend", "description" => "Webサイトのスタイリング・レスポンシブ対応"],
    ["name" => "JavaScript", "years" => "4年", "context" => "実務経験あり", "category" => "Frontend", "description" => "画面処理・カート・アコーディオン・フォーム確認画面の実装"],
    ["name" => "WordPress", "years" => "1年", "context" => "実務経験あり", "category" => "CMS", "description" => "オリジナルテーマ・カスタム投稿・ブロックパターン・保守運用"],
    ["name" => "PHP", "years" => "1年", "context" => "実務経験あり", "category" => "Backend", "description" => "WordPressテーマと投稿機能の実装"],
    ["name" => "Java", "years" => "4年", "context" => "実務・大学校での開発", "category" => "Backend", "description" => "業務システムの開発・改修、天体アプリの開発"],
    ["name" => "JSP", "years" => "1年", "context" => "実務経験あり", "category" => "Backend", "description" => "業務システムのサーバーサイド処理・画面実装"],
    ["name" => "SQL", "years" => "5年", "context" => "実務経験あり", "category" => "Database", "description" => "SQLの作成・修正、データベース操作"],
    ["name" => "Oracle", "years" => "1年", "context" => "実務経験あり", "category" => "Database", "description" => "農業向け業務管理システムでのデータベース操作"],
    ["name" => "PL/pgSQL", "years" => "1年", "context" => "実務経験あり", "category" => "Database", "description" => "製造業向け業務管理システムのデータベース処理の実装・修正"],
    ["name" => "C", "years" => "4年", "context" => "大学校での学習・開発", "category" => "Embedded", "description" => "卓球練習用ラリーマシンのプログラム実装・統合"],
    ["name" => "C#", "years" => "2年", "context" => "大学校での学習・開発", "category" => "Application", "description" => "卓球練習用ラリーマシンのプログラム実装・統合"],
  ];
}
