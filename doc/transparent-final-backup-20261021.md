# ヘッダー・フッター透明化とTOP背景修正後のバックアップ

2026年10月21日、本番パッケージ148と現在のローカル環境を新しい完成版として保存した。以前のバックアップは削除・上書きしていない。

保存先：`C:/Users/oyaji/Desktop/pf_funasaka/work/backups/20261021-transparent-final/`

## 本番

- WPvivid全体バックアップ：`699fb11f8c8f0`
- 管理画面表示：2026年10月21日18:06、44.59 MB、自動削除防止ロック付き。
- 対象：DB、テーマ、プラグイン、アップロード、その他wp-content、WordPressコア。
- サーバー保存先：`/home/schiff/schiff-web.com/public_html/wp-content/wpvividbackups`
- PC控え：`production/schiff-web.com_wpvivid-699fb11f8c8f0_2026-10-21-18-06_backup_all.zip`

復元はWPvividの該当バックアップを使用する。サーバーにない場合はPC控えのall.zipをWPvividへアップロードする。復元はその時点のデータを置き換える操作のため、別途実施を判断する。

## ローカル

- `local/database.sql`：未加工のDB。投稿・ユーザー・設定を含む。
- `local/wordpress-files.tar.gz`：実コンテナのWordPress一式。wp-config.php、テーマ、実プラグイン、画像等を含む。過去のwpvividbackupsとdebug.logは除外。
- `local/project-source.zip`：制作ソース・設定・スクリプト・依存ロック・原稿・ドキュメント等256ファイル。WordPressの実ファイルは上記tarへ保存。node_modules、.git、work、一般キャッシュ、過去の監査バックアップは除外。
- `local/private-runtime.zip`：ローカルの非公開実績用Basic認証設定・認証ファイル。復元先は.cache/private-auth。
- `local/plugins.json`：保存時のプラグイン一覧。
- `local/deployed-theme.zip`：今回本番へ適用した最終テーマZIP。

ローカル復元は、ソースを戻し、Yarnで依存を取得してwp-envを起動し、実ファイルを対応するコンテナ・マウント先へ配置したうえでローカルDBをインポートする。現在のデータは先に退避する。本番DBをローカルへそのまま上書きする用途とは区別する。

## 含まれる変更と検証

FVの文章・余白・グラデーション、Clarityを追記したプライバシーポリシー、ページ送りの見出し非表示、全ページのヘッダー・フッター透明化、TOPフッターの背景接続・管理バー高さへの対応を含む。

全ZIPと本番内部ZIPのCRC、ローカルtarの全ファイル読み出し、DBのテーブル定義・データを確認する。front-page.php・footer.php・manifestの一致を検証し、結果はverification.jsonに保存。SHA256SUMS.txtに保存物のハッシュを記録する。実環境を上書きする復元テストは行わない。

DBと認証情報を含む非公開バックアップ。公開サイトへの配置やGit追加はしない。
ローカルはDBエクスポートのため一時起動し、完了後に停止状態へ戻す。
