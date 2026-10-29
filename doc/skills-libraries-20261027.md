# SKILLSにGSAP・Three.js・jQueryを追加

2026年10月27日。ユーザー依頼と経験内容の回答に基づき、本番・ローカルへ追加。

- jQuery：1年・使用経験あり。実務経験の有無は未確認なので断定しない。説明はJavaScriptライブラリとした。
- GSAP：年数非表示、自主制作で使用（実務経験なし）。本サイトのスクロール表示・見出し・画像のアニメーション。
- Three.js：年数非表示、自主制作で使用（実務経験なし）。本サイトのWebGLによる球体・光の演出。
- 年数が空の場合は年数のp要素を出力しない。既存の年数付きカードは維持。

変更：functions-lib/func-portfolio-experience.php、template-parts/portfolio-skills.phpのみ。
Prettier・両PHPの構文チェック成功。ローカルで320 / 375 / 768 / 1280pxを確認し、ページと追加カードの横はみ出しなし。本番でも3項目・経験区分・年数の有無を確認。
本番更新前のWPvivid全体バックアップ：2026年10月27日17:56、Manual、47.73 MB、手動削除のみ指定。
本番テーマ更新package179成功。直前package178と比較し、上記PHP2ファイル以外は同一。CSS・JavaScript・画像・DB・本番設定を変更していない。
配布：work/deployment/20261027-skills-libraries/wp-template-skills-libraries-20261027.zip
SHA256：bf58ced3fb0d388f3f68edd6796cb30c199f6751047b2cc4fcbb5b4cd2def2ab
本番画像・検証JSON・パッケージ差分は同フォルダー。ローカル確認画像・幅別JSON・変更前ファイル・起動停止記録はwork/20261027-skills-libraries/。
