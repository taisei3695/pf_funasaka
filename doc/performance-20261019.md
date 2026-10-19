# パフォーマンス改善（2026年10月19日）

当初の検証対象はローカル `http://localhost:8888/`。後のユーザー指示により同日、本番にも反映した。配布内容・確認記録は `doc/production-performance-20261019.md` を参照。以下の計測値はローカルで取得した値であり、公開後のPageSpeed測定値ではない。

## 元のPageSpeed測定

ユーザー指定の公式Lighthouse 13.5.0レポート（2026年10月19日 0:05）をブラウザーで確認した。

| 指標 | モバイル | PC |
| --- | ---: | ---: |
| Performance | 42 | 60 |
| FCP | 2.3秒 | 0.6秒 |
| LCP | 4.5秒 | 0.6秒 |
| TBT | 22,540ms | 19,630ms |
| CLS | 0 | 0 |
| Speed Index | 15.6秒 | 4.5秒 |

メインスレッド内訳はモバイル40.0秒、PC34.6秒で、Otherが大半。OtherだけでGPUが原因と断定はできないため、GLSLと初期レイアウトの双方を調査した。未使用JS約153KiB、レンダリング阻害CSS約25KiBも指摘されていた。

## 変更

1. 球体の点・内部粒子の色、前後の明度、リボン、残光、リムライト等、点全体で共通となる計算をフラグメントシェーダーから頂点シェーダーへ移した。フラグメント側には点の円形判定・光の濃淡等を残した。同一の点ごとに同じ値になる計算を各ピクセルで繰り返さない構成。半径の二乗にしか使わない平方根も除いた。
2. スクロール表示・カード・見出し・スキルの初期化で、要素位置をまとめて読み取り、その後にDOM属性・見出しレイヤーを変更する形へ整理した。
3. 画面外の見出し装飾のGSAPシーケンスは、その装飾が画面内へ入った時点で生成するようにした。元からある画面外停止とクリーンアップは維持。
4. TOPだけ、自己完結した小さなエントリーCSS（リセット・ヒーロー等、約4.8KB）をWordPressのインラインCSSとして出力した。外部CSS通信が2本から1本になった。カスケード順は従来どおりメインCSSより前。8KB超、相対アセット、@import、危険なパス等は元の外部CSSへフォールバックする。

点数（PC900・モバイル540）、点の大きさ、丸い形、輪郭線なし、振動なし、白〜金色の点によるリボン、内部へのスクロール、暗幕、見出し・装飾線・カードの演出は維持した。描画解像度やフレームレートを一律に下げる変更はしていない。

## ローカル計測

同じブラウザーの1280px・390px幅で、ページ初期の10秒間を一時的なPerformanceObserverで観測した。計測用コードは検証後に削除した。

| 項目 | PC変更前 | PC変更後 | モバイル変更前 | モバイル変更後 |
| --- | ---: | ---: | ---: | ---: |
| 観測された最長Long Task | 487ms | 53ms | 130ms | 85ms |
| Long Taskの50ms超過分合計 | 437ms | 3ms | 80ms | 35ms |
| FCP−HTML応答開始 | 599.6ms | 134.4ms | 186.0ms | 195.4ms |

単発のサンプルであり、キャッシュ・環境による変動を含む。50ms超過分合計はLighthouseのTBTと同じ測定区間ではない。モバイルのFCP改善はこのサンプルでは確認できていない。実GPU処理時間や実機スマートフォン性能を直接測定したものでもない。本番の20秒前後のTBTが何秒になるか、および新しいスコアは公開後の再測定が必要。

## 検証・制限

- ESLint、Prettier、PHP構文確認、WordPress向けビルドに成功。
- TOP・一覧・既存詳細・プライバシーポリシーを320/390/768/1440pxで確認し、横はみ出しなし。
- 実際のシェーダーコンパイルとThree.js描画成功、ブラウザーerrorなし。Worksへ移動するとinsideになり、カードの幕・テキストと見出し装飾の完了を確認。
- 小さなCSSのインライン出力、サブページで従来の2本のCSS読込を維持すること、サイズ・パスのガードを確認。
- SEO説明文・OGP・ローカルnoindexは維持。DB・本番・GA4設定は変更していない。
- Three.jsを含む約557KBのチャンク警告は残る。未使用JavaScriptを完全に削除した変更ではない。
- 全体静的監査は既存テンプレート等を含め2,119件の指摘があり、前後で件数増加なし。サイト全体の監査合格を意味しない。今回の範囲は性能改善と関連する表示確認。
- 実機・Firefox・Safariおよび低速4G/CPUスロットリングでの変更後測定は未実施。

証跡は `work/performance-20261019/`、監査記録は `.quality-audit/reports/20261019-performance/`。テーマの事前バックアップは `.quality-audit/backups/project-20261019-000835.zip`、変更前のJSは作業用証跡フォルダーへ個別保存した。

参考：[元のモバイルレポート](https://pagespeed.web.dev/analysis/https-schiff-web-com/1tlrnjz2gl?form_factor=mobile)、[PCレポート](https://pagespeed.web.dev/analysis/https-schiff-web-com/1tlrnjz2gl?form_factor=desktop)、[WordPress wp_add_inline_style](https://developer.wordpress.org/reference/functions/wp_add_inline_style/)、[wp_register_style](https://developer.wordpress.org/reference/functions/wp_register_style/)。
