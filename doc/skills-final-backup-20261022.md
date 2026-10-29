# SKILLS調整後の本番・ローカルバックアップ

2026年10月22日、自然になじむSKILLS背景を反映した本番package150と、同じ調整を含むローカルを保存した。

保存先：`C:/Users/oyaji/Desktop/pf_funasaka/work/backups/20261022-skills-final/`

本番はWPvividの全体バックアップ`7ca127480e8f9`（管理画面表示13:24、44.63 MB）。手動削除のみのロックを指定し、サーバーとPCの両方に保存。PCのファイル名は`schiff-web.com_wpvivid-7ca127480e8f9_2026-10-22-13-24_backup_all.zip`。

ローカルはDB、実コンテナのWordPress一式、制作ソース258ファイル、非公開実績用の認証設定、プラグイン一覧、本番へ適用したテーマZIPを保存した。過去のバックアップは上書きしていない。

全ZIPと本番内部ZIPのCRC、ローカルtar全6705エントリーの読み出し、現在のmanifest・SKILLSテンプレート・本番CSSとローカルの一致、英数字URLと旧URL情報を確認。記録と復元方法は保存先の`verification.json`と`README.md`を参照。

検証完了後にローカルを`yarn wp-stop`で停止済み。停止結果は同フォルダーの`local/stop.log`と`local/stopped-containers.txt`に保存する。本番は稼働を維持し、投稿・設定は変更していない。
