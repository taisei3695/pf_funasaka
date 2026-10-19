# スマホのセクション・スポットライト修正（2026-10-19）

ユーザーが指摘したのは、TOPの見出し・セクション境目に出るスポットライト。左右2本のPC用conic-gradientが狭い画面でも交差する配置だった。

767px以下だけ、左上寄りから下に落ちる柔らかい1本へ変更した。2本目の疑似要素は生成しない。ピークのグラデーション透明度を48%から26%へ下げ、高さを最大26remから20remへ短縮し、下方向へフェードさせた。4.8秒のopacity/transformアニメーション、PCの左右2本、CONTACTの専用光なし、reduced-motion/forced-colors制御を維持。

- 変更ファイル: `src/assets/styles/projects/_p-portfolio-music-accents.scss`
- Stylelint・ビルド成功。
- ローカル320/390/414/767/768/1440pxで横はみ出しなし。767px以下は右の疑似要素content:none、768px以上は従来どおり生成。
- 本番390pxで新しいCSS・右の疑似要素なし・新グラデーションの出力を確認。1280pxでは従来の左右2本。errorなし。
- 本番の性能改善済みJSは `script.D-rwxDQC.js` のまま。PHP・JS・テンプレートは変更せず、CSS追加とmanifest参照の更新のみ。
- SEO/OGP/GA4や投稿データの編集は行っていない。OGP・GA4出力を確認。

本番CSS: `assets/styles/style.DIGgyxG8.css`

配布ZIP: `work/deployment/20261019-mobile-spotlight/wp-template-mobile-spotlight-20261019.zip`

復元用の更新前テーマ: `work/deployment/20261019-performance-budget/wp-template-performance-budget-20261019.zip`

証跡: `work/spotlight-20261019/`。PageSpeedの再測定は実施していない。
