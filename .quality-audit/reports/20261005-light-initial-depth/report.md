# 初期ライト配置の検証結果

2026年10月5日。対象は https://schiff-web.com/ のFVとContactの装飾ライトです。保存した公開HTMLと本番独自CSSを使うローカルプレビューで検証し、本番反映と配信ファイル・公開画面の確認まで完了しました。

添付録画では、[3秒時点](../../../work/light-initial-depth-20261005/recording-3s.png)の広いDOMグリッドから、[4秒時点](../../../work/light-initial-depth-20261005/recording-4s.png)の奥に縮めたWebGL配置へ切り替わっていました。今回、初期表示とDOM fallbackにもWebGLと同じ壁面の縮尺を適用しました。

## 変更したソース

| ファイル | 変更 |
|---|---|
| [portfolio-light-depth.css](../../../src/assets/styles/portfolio-light-depth.css) | グリッドを上へ4%移動し、横0.9・縦0.76倍へ縮小。子の独立した`scale`で点を基準0.82倍の円形に補正 |
| [script.js](../../../src/assets/js/script.js) | 追加CSSを読み込み |
| [_portfolio-webgl.js](../../../src/assets/js/_portfolio-webgl.js) | `offsetParent`をstageまでたどり、変形前の中心位置を取得。GPUでの二重縮小を回避 |

子の補正はGSAPの`transform: scale(...)`と合成されるため、既存の点滅・拡大を維持します。ソースレビューでは、reduced motionとcontext loss時のDOM fallbackにも配置補正が残ることを確認しました。

## 確認結果

| 確認範囲 | 判定 | 証跡 |
|---|---|---|
| ESLint・Stylelint・Prettier、既存ライト動作とGL状態の回帰モデル | pass | [実行記録](../../../work/light-initial-depth-20261005/verification.txt) |
| 7列・14列、375×812・1350×940・900×540の座標計算、入れ子のoffset、円形を保つpulse | pass | [検証コード](../../../work/light-initial-depth-20261005/check-light-depth.mjs)・[数式モデルの結果](../../../work/light-initial-depth-20261005/geometry-comparison.json) |
| PCの初期DOM→WebGL、context loss→DOM復帰→restore、Contactの描画開始 | pass | [実ブラウザ計測](../../../work/light-initial-depth-20261005/desktop-depth.json)・[初期DOM](../../../work/light-initial-depth-20261005/desktop-initial-dom.png)・[FV](../../../work/light-initial-depth-20261005/desktop-webgl.png)・[context loss](../../../work/light-initial-depth-20261005/desktop-context-loss.png)・[Contact](../../../work/light-initial-depth-20261005/desktop-contact.png) |
| 375px幅の初期DOM→WebGL、Contactの描画開始 | pass | [実ブラウザ計測](../../../work/light-initial-depth-20261005/mobile-375-depth.json)・[FV](../../../work/light-initial-depth-20261005/mobile-375-webgl.png)・[Contact](../../../work/light-initial-depth-20261005/mobile-375-contact.png) |

実ブラウザでは、DOMの中心とWebGL用の座標計算との差を[計測スクリプト](../../../work/light-initial-depth-20261005/depth-metrics.js)で確認しました。PCの最大差は0.464px、375px幅では0.394pxで、点の縦横寸法の差は両方とも0.0003px未満でした。数式モデルの一致と、ブラウザの端数処理を含む実測値は区別しています。

初期DOMの画像は、同じCSSを読み込み、メインJSを読み込まないローカル画面で撮影しました。375px幅はPCブラウザ内の同一オリジンiframeによる確認で、実機スマートフォンではありません。スクロールバーを除くFVのstage幅は360px、PCのstage幅は1265pxです。reduced motionの切替はソースと回帰モデルで確認しており、今回の実ブラウザ証跡には含めていません。性能・FPSの改善量、全画面幅・他ブラウザの検証は今回の対象外です。Dockerは起動していません。

## 本番反映

本番ビルド後、`script.BNe43V8w.js`、`_portfolio-webgl.Bmy_vLsW.js`、`script.PZRyNMM4.css`を配備し、manifestの該当エントリを更新しました。本番から取得した3ファイルのSHA256はビルド済みファイルと一致しています。[検証コード](../../../work/light-initial-depth-20261005/verify-production.py)の[11項目の結果](../../../work/light-initial-depth-20261005/production-checks.json)はすべて`true`です。

[実際の本番manifest](../../../work/light-initial-depth-20261005/manifest.production-deployed.json)は[配備予定のmanifest](../../../work/light-initial-depth-20261005/manifest.production-after.json)と内容が一致し、ファイルの差はCRLF/LFの改行形式だけでした。[未ログインで取得した公開HTML](../../../work/light-initial-depth-20261005/public-after.html)に新しいJS・CSSの参照があり、`style.privacy-link-20261005.css`、Jostのpreload、GA4、その他のmanifestエントリを保持しています。

本番ブラウザでは、[再読み込み後のFV](../../../work/light-initial-depth-20261005/production-reload.json)でWebGLと補正後グリッド、横方向のはみ出しがないことを確認しました。[Contactへの移動後](../../../work/light-initial-depth-20261005/production-contact.json)はContactが描画・再生中、FVが停止状態で、URLにハッシュは付きません。[本番FV](../../../work/light-initial-depth-20261005/production-home.png)と[本番Contact](../../../work/light-initial-depth-20261005/production-contact.png)を保存しています。このブラウザ確認はWordPressへログインした状態です。

変更前の[manifest](../../../work/light-initial-depth-20261005/manifest.production-before.json)と[ソース](../../../work/light-initial-depth-20261005/source-before/_portfolio-webgl.js)を保存しています。
