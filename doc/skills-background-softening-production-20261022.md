# 自然になじむSKILLS背景の本番反映

2026年10月22日、ユーザーの依頼により、ローカルで確認した背景調整を本番へ反映した。

- 変更前のWPvivid全体バックアップ：`a7e0b5dd942b6`、2026年10月22日13:16、44.62 MB。本番サーバーのwp-content/wpvividbackupsに保存。
- テーマ更新package=150で成功。
- ZIP：`work/deployment/20261022-skills-soft-background/wp-template-skills-soft-background-20261022.zip`
- SHA256：`9324af574e57dbe2c8c1af74497bbe52a826b12d8aa718e2133ed2b2c393183e`
- 以前のpackage149との変更はビルド済みCSS3ファイルと`.vite/manifest.json`のみ。PHPとJavaScriptは同一。旧アセットも保持した。
- カードと補足欄の黒い背景面を外し、SKILLS全体の88%の暗い下地を上下128pxで透明へなじませる。
- 本番のPC（1280px）とスマホ（375px）で読みやすさ、透明になったカード、横はみ出しがないことを確認。
- Three.jsの描画、GA4の測定IDとテーマJS URLの一致、Clarityの読み込みを確認。
- 投稿・スラッグ・旧URL転送・本番の各種設定には変更を加えていない。

更新成功画面、PC・スマホ画像、パッケージの差分と検証JSONは上記配布フォルダーに保存。

切り戻しは`work/deployment/20261022-skills-permalinks/wp-template-skills-20261022.zip`（package149）で背景を直前の状態へ戻せる。今回DBは変更していないため、背景だけを戻す場合にDB復元は不要。
