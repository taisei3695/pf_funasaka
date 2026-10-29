# 全ページのヘッダー背景透明化（2026年10月21日）

共通SCSSの`.portfolio-site .p-portfolio-header`の背景色をtransparentに変更。TOPは既に透明で、一覧・詳細・固定ページも同じ指定にそろえた。配置・文字色・ホバー演出・JS・PHP・DB・解析設定は変更していない。

- 本番テーマ更新package=145、成功を確認。
- ZIP：`work/deployment/20261021-transparent-header/wp-template-transparent-header-20261021.zip`
- SHA256：`a4caeb544666f54ca23a9ed840d94c090c85a41b2e51ed63268888c0b32fb9f3`
- 切り戻し用ZIP：`work/deployment/20261021-pagination-label/wp-template-pagination-label-20261021.zip`
- TOP、制作実績一覧、建設会社の詳細、プライバシーポリシー、お問い合わせで背景色rgba(0,0,0,0)を確認。
- 一覧375px幅とスクロール後も透明、横はみ出しなし。ヘッダーテキストは従来の明るい色を維持。
- 検証結果とスクリーンショットは上記配布フォルダーに保存。
- ローカルもSCSSとビルドに反映。ローカルサーバーは停止状態を維持した。
