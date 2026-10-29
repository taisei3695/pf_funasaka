# 文字の読みやすさ改善の本番反映

2026年10月25日、ユーザーの依頼により、ローカルで確認した文字の読みやすさの改善を本番に反映した。

- 変更前にWPvividでDB＋ファイルの全体バックアップを作成。管理画面表示は2026年10月25日14:28、Manual、44.62 MB。手動削除のみの保護を指定。本番サーバーの`wp-content/wpvividbackups`に保存。
- WordPressテーマアップロードからpackage151で更新成功。
- 配布ZIP：`work/deployment/20261025-readability/wp-template-readability-20261025.zip`
- SHA256：`4d24991b7f5b35cd576c8dc6ad847a60b1f89edc017e67bc767a3e19becb6dc4`
- 変更はビルド済みCSS6ファイルと`.vite/manifest.json`。本番package150を基に作成し、PHP・JavaScript・既存アセットは同一のまま保持した。
- 投稿、URL、SEO、GA4、Clarity、SiteGuardなどの設定保存やDBインポートは行っていない。
- 本番で本文ウェイト400、EXPERIENCE本文15px、新しいハッシュ付きCSSの読み込みを確認。球体描画用canvasの描画サイズと粒子・光の表示、GA4・Clarityスクリプトの読み込みを確認。
- TOP・一覧・代表詳細・プライバシーポリシーを320・375・768・1280pxで確認し、横はみ出しなし。本番PCと375pxのSKILLSを目視確認。

バックアップ画面、更新成功画面、本番PC・スマホ画像、幅別の検証JSONとパッケージ差分は上記配布フォルダーに保存。実機の追加確認や再度のPageSpeed測定は行っていない。

切り戻しは`work/deployment/20261022-skills-soft-background/wp-template-skills-soft-background-20261022.zip`（package150）でテーマを戻す。今回の表示調整だけを戻す場合、DB復元は不要。
