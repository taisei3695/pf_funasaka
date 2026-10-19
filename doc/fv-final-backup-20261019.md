# FV修正反映後のバックアップ（2026年10月19日）

FV文章追加・余白・グラデーション・文字の影・短いスマホ画面の調整・スクロール時の文章表示維持を含む、本番パッケージ142とローカルを保存した。

保存先：`C:/Users/oyaji/Desktop/pf_funasaka/work/backups/20261019-fv-final/`

## 本番

- WPvivid全体バックアップ：`918c37a8b832e`
- 管理画面表示：2026年10月19日21:17、44.35 MB
- DB・テーマ・プラグイン・アップロード・その他wp-content・コアを含む。
- 自動削除防止ロック付き。既存スケジュールは変更していない。
- サーバー保存先：`/home/schiff/schiff-web.com/public_html/wp-content/wpvividbackups`
- PC控え：`production/schiff-web.com_wpvivid-918c37a8b832e_2026-10-19-21-17_backup_all.zip`

復元時はWPvividでこの日時・IDのバックアップを選ぶ。サーバーから失われた場合はPC控えのZIPをアップロードして使用する。復元は既存データを置き換えるため、別途実施を判断する。

## ローカル

- `local/database.sql`：現在のDB。未加工の投稿・ユーザー・設定を保持。
- `local/wordpress-files.tar.gz`：実コンテナのWordPress一式。wp-config.php、実プラグイン、テーマ、画像等を含む。過去のwpvividbackupsとdebug.logは除外。
- `local/project-source.zip`：制作ソース・設定・スクリプト・依存ロック等249ファイル。wordpressは上記の実ファイルアーカイブに含む。node_modules、.git、work、一般キャッシュ、過去の監査バックアップは除外。
- `local/private-runtime.zip`：ローカル非公開実績用のBasic認証設定・認証ファイル。復元時は.cache/private-authへ戻す。
- `local/plugins.json`：保存時のプラグイン一覧。
- `local/deployed-theme.zip`：今回本番に適用した配布用テーマZIP。

ローカル復元はソースの展開、Yarnでの依存取得、wp-env起動、実ファイルの対応するコンテナ・マウント先への配置、ローカルDBのインポートを行う。現在のデータを先に退避する。本番DBをローカルへそのまま上書きする用途とは区別する。

## 確認結果

- 全ZIPと本番の内部6分類ZIPのCRC検査成功。
- ローカルWordPressアーカイブの全ファイル読み出し成功、DBのテーブル定義・データの存在を確認。
- 本番バックアップ内のFVテンプレート・manifestが現在のローカルとバイト一致。
- ローカルバックアップ内のFVテンプレートも現在のファイルと一致。
- `verification.json`、`SHA256SUMS.txt`、`production-backup.png`を同梱。
- 実際の環境を置き換える復元テストは実施していない。

認証情報とDBを含む非公開のバックアップ。公開アップロード・Gitへの追加はしない。既存の13:46完成版および21:11更新前バックアップは残している。
