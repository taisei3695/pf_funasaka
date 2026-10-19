# LCPとスコアの安定化：2026-10-19

本番とローカルへ同じテーマ変更を反映した。DBの移行・設定変更は行っていない。

## 実装

- 球体のThree.js描画を、対応ブラウザーではOffscreenCanvasとDedicated Workerで実行する。メインスレッドにはレイアウトの採寸・スクロール情報・表示状態の通知だけを残した。
- 描画本体は`_portfolio-intro-renderer.js`へ分離し、通常のCanvasによるフォールバックとWorkerで共有する。点数、点の位置・サイズ、色、回転、光のリボン、残光、フレア、内側への移動、振動なしを維持。
- Worker未対応、読み込み失敗、転送失敗、初期化失敗時には通常のCanvasへ戻る。転送済みCanvasは差し替える。pagehideではWorkerを終了し、BFCacheから戻った際もCanvasを作り直せるようにした。
- 非表示・画面外・強制配色の際は描画を停止し、動きを減らす設定も描画本体へ伝える。
- 名前のフォント準備と最初の描画を先に済ませる。スクロール演出・イコライザーなどによるDOM変更・位置取得はFCP後へ移し、初期レイアウトの強制再計算を避ける。
- TOPの全体CSSは並行して取得し、実際のFCP通知後に適用する。既存の初期画面用インラインCSS、JavaScript無効時の通常CSS、Paint Observer非対応時の通常適用を保持した。
- シェーダーを非同期で準備する。光のメッシュを96×64から64×40へ、暗い補助球面の分割数を半分へ変更。使われていなかった輪郭メッシュと、独自シェーダー・MeshBasicMaterialが参照しないライトを削除した。
- PCの900点・スマホの540点は変更していない。スマホの背景描画上限は280,000ピクセル、PCは従来の600,000ピクセル。30fps上限と負荷に応じた解像度調整を保持。

## 経験年数

`functions-lib/func-portfolio-experience.php`の5項目だけを更新した。

| 技術 | 更新前 | 更新後 |
| --- | --- | --- |
| HTML | 5年 | 6年 |
| CSS | 5年 | 6年 |
| JavaScript | 4年 | 5年 |
| WordPress | 1年 | 2年 |
| PHP | 1年 | 2年 |

## 測定

変更前はLCP3.6〜3.7秒、70〜82点、TBT180〜560msだった。遅い測定では球体の処理が50ms以上の長時間タスクとして繰り返し記録されていた。

最終版のモバイル測定：

| レポート | スコア | FCP | LCP | TBT | CLS | SI |
| --- | --- | --- | --- | --- | --- | --- |
| [1回目](https://pagespeed.web.dev/analysis/https-schiff-web-com/ig2bpzc12w?form_factor=mobile) | 85 | 2.768秒 | 3.505秒 | 20ms | 0 | 4.194秒 |
| [時間を空けた再測定](https://pagespeed.web.dev/analysis/https-schiff-web-com/ilzeycbv1i?form_factor=mobile) | 84 | 2.773秒 | 3.476秒 | 13ms | 0 | 4.423秒 |

直後の別レポート`14ggr1bniz`は全指標が1回目と完全一致していたため、独立した再測定の根拠には数えない。

PCは[最終版の測定](https://pagespeed.web.dev/analysis/https-schiff-web-com/ig2bpzc12w?form_factor=desktop)で98点、FCP0.373秒、LCP1.032秒、TBT78ms、CLS0。

総合スコアとTBTの変動幅は今回の測定では小さくなった。LCPの短縮は約0.1〜0.2秒で、2.5秒以内には未達。モバイルFCPの推定値は以前の約1.3〜1.4秒から約2.8秒へ悪化しており、全指標が改善したとは扱わない。今後も最初の文字表示の改善余地がある。実機による性能測定ではなく、PageSpeedのラボ測定である。

## 確認・配布

- ESLint、Prettier、本番ビルド成功。
- ローカルのCSPでWorkerを禁止する検証用ページを使い、通常Canvasへフォールバックして900点の球体が動くことを確認。検証ファイルは配布に含めず、ローカルテーマからも削除した。
- 本番のTOP→詳細→戻る操作で、暗幕の完了と球体のWorker描画復帰を確認。
- 本番・ローカルで経験年数5項目の表示を確認。
- 本番390px幅で540点・振動なし・Worker描画・横はみ出しなしを確認。球体内部への移動も確認した。
- 本番のGA4 `G-FG9SXY9398`、canonical、検索公開設定、OGP画像を確認。SEO・SiteGuard・投稿データは更新していない。
- 一時的なローカル計測用PHPは撤去し、functions.phpが作業前のSHA256と一致することを確認。
- 最終反映はWordPress標準テーマアップロードのpackage 120。成功メッセージを確認した。
- ZIP：`work/deployment/20261019-lcp-css-paint/wp-template-lcp-css-paint-20261019.zip`。
- 作業前テーマの戻し先：`work/deployment/20261019-lcp-final/wp-template-lcp-final-20261019.zip`。このZIPのSKILLSは更新前の年数なので、年数を残す場合は該当PHPを別途保持する。
- WorkerのビルドファイルはViteの通常manifestに載らないため、`assets/_portfolio-intro-worker-*.js`も配布対象へ明示的に含めた。参照先の存在を検証済み。
- 証跡：`work/performance-lcp-20261019/`の`mobile-css-paint-*.txt`、`desktop-css-paint-1.txt`、`lcp-stability-result.png`、`production-worker-mobile.png`、`production-skills-updated.png`。
