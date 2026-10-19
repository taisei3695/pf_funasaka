# LCP改善：2026-10-19

## 反映内容
- 本番・ローカルの両方へ反映。球体900点/540点、光・残光・暗幕の演出内容、SEO・OGP・GA4・プラグイン設定は維持。
- 初期画面のCSSを共有SCSSから生成し、TOPだけHTML内へ先行出力。全体CSSは並行して読み込み、JavaScriptなしでは通常のstylesheetへフォールバック。
- 名前のJost 400を使用文字だけの1,040バイトへサブセット化して初期CSSに埋め込み。字形・字幅は元フォントの400と一致することをFontToolsで比較済み。書体変更ではない。
- 球体モジュールの先行パースをやめ、実際のFCP通知後に読み込みを開始。非対応ブラウザーはrAFで従来相当へフォールバック。
- TOPのスクロール演出は最初の操作またはAboutへの接近時に読み込み。詳細など他のページは従来どおり。先頭画面に必要な球体・リンク・波形の処理は独立して継続。
- 遅延初期化がメニューの滑らかな移動を中断しないよう、ScrollTrigger.refresh(true)を使用。

## 原因の切り分け
- 名前の登場アニメーションの短縮・停止だけでは、LCP約4.2秒は解消しなかった。
- フォントのサブセット化だけでもLCP改善は確認できなかった。単独原因とは扱わない。
- ローカルのPerformanceObserverでは、旧実装でThree.jsが初回描画前に読み込まれていた。修正後はFCP後にリソース読み込みが始まることを確認。
- PageSpeedでは、初期画面に不要な約55KiBのスクロール演出と球体モジュールの処理が競合していた。初期CSSの待ちと演出の初期化を分離。

## 計測
- 比較元（変更前）: https://pagespeed.web.dev/analysis/https-schiff-web-com/d2saq0tiy7?form_factor=mobile
- 修正後: https://pagespeed.web.dev/analysis/https-schiff-web-com/u14xo4l3fa?form_factor=mobile
- モバイル：LCP 4.2秒→3.7秒、パフォーマンス80→82、FCP 1.3秒、TBT180ms、CLS0。
- PC：98点、LCP1.0秒、TBT70ms、CLS0。
- 単回値は変動するため、因果の説明にスコアだけを使わない。モバイルLCPの良好基準2.5秒にはまだ届いていない。

## 検証・配布
- ESLint、Stylelint、Prettier、本番ビルド成功。
- 全体CSSを除いたローカル検証で、PCのヘッダー・名前・球体領域の寸法/書体/色が一致。スマホも名前の位置と寸法が一致。
- 本番スマホのABOUTメニューが最終位置まで移動し、見出し演出が開始することを確認。横はみ出しなし。
- 一時的な計測コードはローカルから削除。functions.phpのハッシュが作業前と一致。
- 本番テーマ更新成功：package 116。
- 配布ZIP：work/deployment/20261019-lcp-final/wp-template-lcp-final-20261019.zip
- 戻し先：work/deployment/20261019-performance-fourth/wp-template-performance-fourth-20261019.zip
- 証跡：work/performance-lcp-20261019/

## 名前フォントの再生成
既存のsrc/assets/fonts/Jost-OFL.txtを保持する。FontToolsとBrotliを使用し、元フォントをwght=400へ固定した後、TAISEIFUNASAKAをWOFF2へサブセット化する。ヒンティングは削除しない。

### 同一コードでの再測定
- https://pagespeed.web.dev/analysis/https-schiff-web-com/h9xnn28gyt?form_factor=mobile
- LCP3.6秒、FCP1.4秒、TBT560ms、CLS0、70点。
- 2回のLCPは3.6〜3.7秒。総合スコア70〜82点・TBT180〜560msと変動があるため、安定して82点を維持すると断定しない。
