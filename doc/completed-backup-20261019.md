# 完成版バックアップ（2026年10月19日）

現時点のサイトを、ひとまず完成版として保存した。追加の性能・演出変更は行っていない。
対象は本番に反映済みのパッケージ141と現在のローカル環境。球体・光・暗幕、投稿内容、SEO・OGP、解析・セキュリティの既存設定を維持している。

## 保存場所

`C:/Users/oyaji/Desktop/pf_funasaka/work/backups/20261019-completed/`

このフォルダーはGit対象外。DBや認証情報を含むため、公開用ファイルとしてアップロードしない。

## 本番

- WPvivid手動バックアップ：2026年10月19日13:46（管理画面表示）
- ID：`a247f2f911c08`
- 対象：データベース、テーマ、プラグイン、アップロード、その他wp-content、WordPressコア
- サーバー保存先：`/home/schiff/schiff-web.com/public_html/wp-content/wpvividbackups`
- 自動削除を防ぐロックを有効化。既存スケジュールは変更していない。
- PC控え：`production/schiff-web.com_wpvivid-a247f2f911c08_2026-10-19-13-46_backup_all.zip`（約44.38 MB）
- 外側ZIPと内部の6分類のZIPすべてCRC検査成功。
- 証跡：`production-backup.png`、`production/nested-verification.json`

本番の復元にはWPvividのこのバックアップを使用する。サーバー内に残っていなければPC控えのall.zipをWPvividへアップロードし、認識されたバックアップから復元する。復元は本番データを置き換える操作のため、別途実施を判断する。この作業では復元していない。

## ローカル

- `local/database.sql`：未加工のDBエクスポート。投稿・ユーザー・設定を保持。
- `local/wordpress-files.tar.gz`：稼働中コンテナの`/var/www/html`一式。WordPress 7.1.3、wp-config.php、実際のテーマ・プラグイン・画像を含む。
- `local/project-source.zip`：src、bin、config、doc、post-data、package.json、yarn.lock、wp-env設定など247ファイル。
- `local/plugins.json`：保存時のプラグイン一覧。
- DBのテーブル定義・データの存在、ファイルアーカイブの全件読み出し、ソースZIPのCRCを確認。

制作ソースZIPはnode_modules、.git、work、キャッシュ、過去の監査バックアップを除外。wordpressディレクトリは稼働コンテナのファイルアーカイブで保存している。WordPressファイルのアーカイブからは再帰的なバックアップ増大を避けるためwp-content/wpvividbackupsとdebug.logを除外した。

ローカルの復元はソースZIPからプロジェクトを戻し、Yarnで依存関係を再取得し、wp-envを起動する。そのうえでWordPressファイルを対応するコンテナ・マウント先へ戻し、local/database.sqlをローカルDBへインポートする。現在のデータを退避してから実施する。本番DBをローカルへそのまま上書きする手順とは区別する。

## 確認の範囲

`SHA256SUMS.txt`に保存物のSHA-256、`verification.json`に検査結果を記録。復元テストによる実環境の置換は行っていない。
性能測定結果と既知のばらつきは`doc/performance-route-critical-20261019.md`を参照する。今回のバックアップではサイト内容や配信設定を変更していない。
