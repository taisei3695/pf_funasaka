# PageSpeed追加改善（2026-10-19）

ユーザー指定のレポート `ftmzn5fs79` を確認し、追加改善をローカル・本番へ反映した。

## 変更前の本番測定

| 指標 | モバイル | PC |
| --- | ---: | ---: |
| Performance | 44 | 61 |
| FCP | 2.0秒 | 0.4秒 |
| LCP | 4.4秒 | 0.5秒 |
| TBT | 7,460ms | 5,260ms |
| Speed Index | 13.9秒 | 4.1秒 |
| CLS | 0 | 0 |

モバイルのメインスレッド41.4秒のうちOtherが38,569ms、Script Evaluationが1,784ms。強制リフローは複数箇所あるが、画面全体の薄い光の描画計算を優先した。

## 変更

`_portfolio-intro-scene.js` の薄いステージ光に使用する三角関数・指数関数の計算を、全画面の各ピクセルから96×64分割の格子の頂点へ移した。色と透明度を頂点間で補間する。柔らかい光の近似であり、画面解像度や球体の点数・大きさ・速度を落としていない。

フレアは独立した従来どおりの2三角形とピクセル計算を維持。球体の丸い形、PC900点・スマホ540点、振動なし、光リボン・残光・内部への進行を維持。毎フレームのrenderer属性の同値書込も抑制した。

## 検証・配布

- ESLint・Prettier・WordPress向けビルド成功。
- ローカル・本番でシェーダー描画成功、errorログなし。
- 390px幅で540点、振動なし、スクロールでinside、横はみ出しなし。
- SEO/OGP/GA4の出力を確認。データベースや本番設定は編集していない。
- 配布は前回性能改善テーマを土台に新JS2本とmanifestだけを更新。CSS・PHP・テンプレートを維持。
- ZIP: `work/deployment/20261019-performance-second/wp-template-performance-second-20261019.zip`
- 戻す場合は `work/deployment/20261019-performance-live/wp-template-performance-20261019.zip` を使用。追加CSSやDBの復元は不要。

## 本番再測定

新しいレポート: `https://pagespeed.web.dev/analysis/https-schiff-web-com/g4jthiqs02?form_factor=mobile`

モバイル: 72点、FCP2.1秒、LCP4.2秒、TBT300ms、Speed Index6.1秒、CLS0。ユーザー補助・おすすめの方法・SEOは100。

同レポートのPCは61点、TBT7,930ms、Other33,370msで改善しなかったため、追加修正を実施した。

### 評価後に取り消した変更

球体と内部粒子の放射状グローを256×256 RGBAのDataTextureで参照する版も評価したが、`nc9g7l2faa` のモバイルが43点・TBT6,330msだったため採用を取り消した。DataTexture生成と参照コードは現在のソース・本番から削除済み。

- 上記評価用ZIP: `work/deployment/20261019-performance-texture/wp-template-performance-texture-20261019.zip`（最終版ではない）

### 評価後に取り消した自動画質調整

フレーム間隔による自動画質調整も評価したが、レポート `0pmckpha9v` のモバイルが40点・TBT11,760msとなり安定した改善を確認できなかったため、取り消した。現行ソースにこの追加判定は含まれない。

- 上記評価用ZIP: `work/deployment/20261019-performance-adaptive/wp-template-performance-adaptive-20261019.zip`（最終版ではない）

### 薄い補助面の材質軽量化

球体の点の背後にある最大不透明度0.07の暗い補助面を、MeshPhysicalMaterialからMeshBasicMaterialへ変更した。点のシェーダーが照明と丸い形を表現しており、補助面には物理照明・クリアコートの細部がほぼ見えないため、その計算を省いた。点の光・サイズ・数・リボン・残光・速度・従来の解像度設定を維持。ステージ光の格子補間も維持。

- 最終配布ZIP: `work/deployment/20261019-performance-surface/wp-template-performance-surface-20261019.zip`
- 本番JS: `script.BZ7DUpUO.js` / `_portfolio-intro-scene.CPHBLRN1.js`
- ローカルで外側・insideの見た目、本番でエラーなしを確認。

### 補助面軽量化版の本番再測定

レポート: `https://pagespeed.web.dev/analysis/https-schiff-web-com/adygvtod55?form_factor=mobile`

モバイル74点、FCP2.1秒、LCP4.3秒、TBT230ms（計算値233ms）、Speed Index5.9秒、CLS0。ユーザー補助・おすすめの方法・SEOは100。変更前44点・TBT7,460msから改善した。

最終本番でも390px幅、540点、振動なし、点のリボン、スクロールでinside、横はみ出しなし、errorなし。TOP公開設定の比較値は初回性能改善前の記録と一致している。

同レポートのPCは60点、TBT15,370ms、Speed Index5.1秒で改善を確認できなかった。

### 現行版：背景の描画量を制限

PCの球体の描画を60fps上限から30fps上限へ変更し、背景キャンバスを最大60万画素・DPR上限1へ変更した。モバイルは従来も30fps。回転・光の速度は時刻ベースのため維持し、点数・CSS上のサイズも同じ。文字・カード・スクロール演出は別系統のため、この描画上限の影響を受けない。ローカル1280px幅では点数900、画素比0.81で外側の見た目とerrorなしを確認した。

- 最終配布ZIP: `work/deployment/20261019-performance-budget/wp-template-performance-budget-20261019.zip`
- 本番JS: `script.D-rwxDQC.js` / `_portfolio-intro-scene.wSw5zVjA.js`
- ステージ光の格子補間・暗い補助面の材質軽量化も含む。

現行版の測定URL: `https://pagespeed.web.dev/analysis/https-schiff-web-com/ltgtsonb5v?form_factor=mobile`

モバイル74点、FCP2.1秒、LCP4.3秒、TBT240ms（計算値243ms）、Speed Index5.8秒、CLS0。ユーザー補助・おすすめの方法・SEOは100。

PC90点、FCP0.4秒、LCP0.8秒、TBT220ms（計算値223ms）、Speed Index1.5秒、CLS0。ユーザー補助・おすすめの方法・SEOは100。

| 本番比較 | 変更前 | 現行版 |
| --- | ---: | ---: |
| モバイル Performance | 44 | 74 |
| モバイル TBT | 7,460ms | 240ms |
| PC Performance | 61 | 90 |
| PC TBT | 5,260ms | 220ms |

最終結果の証跡: `psi-final-mobile.txt/.png` と `psi-final-desktop.txt/.png`。単発ラボ測定の変動を含み、モバイルLCP4.3秒には引き続き改善余地がある。

計測はLighthouseの単発ラボ値。実機スマートフォンや実ユーザーの統計値ではなく、結果には変動がある。残るモバイルのLCP・Speed Indexは今後の改善余地。

証跡: `work/performance-second-20261019/`。
