# 制作実績一覧のページ送り見出し（2026年10月21日）

本番でWordPressの`the_posts_pagination()`が出力する`h2.screen-reader-text`「投稿のページ送り」が画面上に見えていた。
制作実績一覧のページネーション直下の見出しに限定し、1px・絶対配置・clip-pathによる視覚的非表示を追加した。見出しとナビゲーションの読み上げ名は保持し、display:noneやaria-hiddenは使っていない。ページ番号・Previous・Next・余白・リンク先は変更していない。

- ローカルのSCSSとビルド済みテーマを更新。本番へテーマ更新package=144で反映し、更新成功を確認。
- 配布ZIP：`work/deployment/20261021-pagination-label/wp-template-pagination-label-20261021.zip`
- SHA256：`5dcafb29de4f03475bb4ed51df61afd056fd09bf1e01cd26b376b7b7e7485f62`
- 変更はCSS3ファイルとmanifestのみ。PHP・JS・投稿DB・プラグイン設定は変更していない。20日のプライバシーポリシー更新も保持。
- 更新前の本番全体バックアップ：WPvivid `b1fe09db313b7`（2026年10月21日17:01、ロック付き）。
- 切り戻し用テーマ：`work/deployment/20261019-fv-copy/wp-template-fv-copy-20261019.zip`。
- 本番の1・2ページ目と375px幅で視覚的非表示を確認。見出しの計算済みサイズ1×1px、clip-path=inset(50%)。Previousリンクから1ページ目へ移動する動作も確認。
- 証跡・パッケージ検証は上記配布フォルダーに保存。

ローカルサーバーは起動せず、停止状態を維持した。
