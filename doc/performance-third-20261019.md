# 表示速度・スマホのスポットライト調整（2026-10-19）

## 変更
- 球体の確認用data属性の更新を30fpsから最大4回/秒にまとめ、変化した値だけDOMへ反映。シェーダー・回転・光跡・残光の計算と描画は従来の30fpsを維持。
- 名前の表示アニメーションを完全に隠れた開始位置（105%）から、文字が見える22%の開始位置へ変更。時間・段差は維持。
- スマホのセクション照明を1本のまま明るく変更。中心の不透明度26%→35%、両側6%→9%・8%→12%。高さ・マスク・4.8秒の動きは維持。

## 測定
同じURLのPageSpeed Insightsによる単回比較。値は測定環境で変動する。

| 指標 | モバイル変更前 | モバイル変更後 | PC変更前 | PC変更後 |
| --- | ---: | ---: | ---: | ---: |
| パフォーマンス | 74 | 79 | 61 | 98 |
| FCP | 2.2秒 | 2.1秒 | 0.4秒 | 0.4秒 |
| LCP | 4.3秒 | 4.2秒 | 0.5秒 | 0.5秒 |
| TBT | 250ms | 100ms | 3,340ms | 130ms |
| Speed Index | 5.7秒 | 5.6秒 | 3.8秒 | 1.1秒 |
| CLS | 0 | 0 | 0 | 0 |

- 変更前: https://pagespeed.web.dev/analysis/https-schiff-web-com/n1241zo4l1?form_factor=mobile
- 変更後: https://pagespeed.web.dev/analysis/https-schiff-web-com/jh1lp6gxlr?form_factor=mobile
- モバイルのLCPには引き続き改善余地がある。表示アニメーション変更単独の効果は、この比較だけでは断定しない。

## 検証・反映
- ESLint、Stylelint、Prettier、Vite本番ビルド成功。
- ローカルで球体と文字の表示を確認後、本番テーマを管理画面から更新（package 111、更新成功表示確認）。
- 本番390pxで横はみ出しなし、二重スポットライトの::afterはnone。
- 本番TOPのタイトル・description・canonical・robots・OGP画像・GA4 IDの出力を確認。DBやプラグイン設定の変更なし。
- 本番点数900個（PC）を維持。
- 証跡: work/performance-third-20261019/
- 配布ZIP: work/deployment/20261019-performance-third/wp-template-performance-third-20261019.zip
- 戻し先: work/deployment/20261019-mobile-spotlight/wp-template-mobile-spotlight-20261019.zip
