# 全ページ共通フッターの透明化（2026年10月21日）

共通SCSSの`.portfolio-site .p-portfolio-footer`の背景色をtransparentへ変更した。既存の共通テンプレート、著作権表記、プライバシーポリシーリンク、余白、文字色を維持。

- 本番テーマ更新package=146で成功。ローカルのSCSSとビルド済みテーマにも反映。
- 配布ZIP：`work/deployment/20261021-transparent-footer/wp-template-transparent-footer-20261021.zip`
- SHA256：`48b12cd6dd09b9a7f6faec39e93b45d86a55ee995ff7d7a68b6f64567fee063a`
- 切り戻し先：`work/deployment/20261021-transparent-header/wp-template-transparent-header-20261021.zip`
- CSSとmanifestのみ変更。PHP・JS・投稿DB・プラグイン・本番設定は変更なし。
- TOP・一覧・詳細・ポリシー・お問い合わせの背景色rgba(0,0,0,0)、共通の文言・リンク・上下余白28pxを確認。ヘッダーも透明を維持。
- 375px幅でも横はみ出しなし。検証JSON・スクリーンショット・更新成功画面を配布フォルダーへ保存。
- ローカルサーバーは起動せず、停止状態を維持した。
