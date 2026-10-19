# 4ページのパフォーマンス改善（2026-10-19）

## 対象と計測前の値

ユーザー提供の PageSpeed Insights 8レポートを確認した。PCは全ページ98点のため、主にスマートフォンの初期描画とLCP画像の取得を改善する。

| ページ | モバイル点数 | FCP | LCP | TBT | PC点数 |
| --- | ---: | ---: | ---: | ---: | ---: |
| TOP | 83 | 2.848秒 | 3.515秒 | 50ms | 98 |
| 制作実績一覧 | 81 | 2.650秒 | 3.842秒 | 88ms | 98 |
| プライバシーポリシー | 81 | 2.691秒 | 3.429秒 | 204ms | 98 |
| 建設・建築会社の詳細 | 84 | 2.616秒 | 3.507秒 | 78ms | 98 |

生データは `work/performance-lcp-20261019/multipage-before.json` に保存。

## 確認した原因

- 一覧・詳細・プライバシーポリシーでは全体CSSとライブラリCSSが描画をブロックしていた。PSIの推定削減時間は約300ms。
- 一覧のLCP画像が `loading="lazy"` のため、取得開始まで約1.27秒待っていた。
- 共通フォントがCSS解析後に発見され、取得の依存関係が長くなっていた。
- 詳細では画像取得そのものより表示待ち時間が大きい。初期CSSの改善後に再測定し、残る描画遅延を判断する必要がある。

## 本番・ローカルに実装済みの変更

1. 一覧・詳細・ポリシー用の初期表示CSSを追加。既存のSCSSを再利用してインライン化する。全体CSSは並行取得しておき、スクロール・フォーカス・リンクへのホバー・印刷開始時に適用する。JavaScript無効時には通常のスタイルシートとして読み込む。
2. 全体CSSの並行取得は維持しつつ、取得優先度を低くする。
3. 一覧の先頭画像だけ即時・高優先度で取得。残りの画像は遅延読み込みを維持する。
4. カード画像の `sizes` を実際の表示幅に合わせる。
5. 詳細のメイン画像を高優先度に指定する。
6. 共通フォントをTOP以外でも先読みする。
7. 初期表示済みのカード・画像・本文を遅れて隠し直さない。スクロール先の幕開け・画像ズーム・残光は維持する。
8. 下層ページの最初の見出しグリッチと装飾線を、ブラウザー標準のCSS/WAAPIで開始する。GSAPはスクロールなどの操作開始時に読み込み、後続の演出を引き継ぐ。
9. ローカルの日本語フォントにも `font-display: swap` を指定し、フォント確認中は代替書体で表示できるようにする。
10. ホバーのイコライザー・スクロール波形・進捗表示は、操作を開始した時点で初期化する。操作前のDOM追加と画面全体の計測を省く。

球体・光・暗幕・見出しの演出は維持。初期表示の見出しと光の線だけ実行方法を軽量化した。設定・投稿データ・SEO・OGP・GA4には変更を加えていない。

## 検証

- Viteビルド、変更ファイルの整形チェック、追加SCSSのStylelintに成功。
- 1280×844、390×844で一覧・詳細・ポリシーの計6ケースを確認。
- 検証時だけ全体CSSを除外して、初期表示CSS単独の見出し・本文・画像・ヘッダーの寸法、書体、余白を従来表示と比較。差分なし。比較用コードは撤去した。
- 通常表示でインラインCSS、フォント先読み、一覧先頭画像の `eager/high`、後続画像の `lazy`、全体CSS適用後の状態、横はみ出しなしを確認。
- ローカル画面: `work/performance-lcp-20261019/multipage-local-proof.png`

## 本番反映

最初は公開TOP・管理画面とも接続タイムアウトしたが、ユーザーから手元では開けるとの返答後、再接続できた。WordPressの通常のテーマ更新で反映済み。最終更新はパッケージ126、管理画面で「テーマの更新に成功しました。」を確認した。最終ZIPに含まれる `functions.php` は従来と同じSHA256 `49F791BCEF5ACB0092890B7D586551CC9484A7685A5FE8F25F0DB5E1310D0A4D` で、検証用コードを含まない。

- 最終更新ZIP: `work/deployment/20261019-multipage-complete/wp-template-multipage-complete-20261019.zip`
- 直前の本番相当ZIP: `work/deployment/20261019-lcp-css-paint/wp-template-lcp-css-paint-20261019.zip`

投稿・設定のDB移行は行っていない。TOPのcanonical、OGP画像、GA4 IDが従来のままであることと、球体canvasがWorkerに転送されて動作することを確認した。一覧の先頭画像はeager/high、後続はlazy。詳細の主画像もeager/high。390pxの本番表示に横はみ出しなし。

## 計測の経過と注意点

CSS改善のみの段階では、モバイルの一覧FCPが2.650秒から1.022秒、詳細は84点から94点、プライバシーポリシーは81点から90点になった。しかし、一覧のLCPは4.121秒で改善しなかった。

表示済み画像を隠し直す処理を調整した後の計測で、GA4とGSAPの処理に大きな変動が発生した。プライバシーポリシーではGA4の2タスクが合計676ms、テーマの長い処理が合計614msと報告された。設定を維持するためGA4は削除・遅延していない。GSAP側は初回の読み込みを操作開始時に移した。

途中の結果も保存している。最良値だけを改善後として扱わない。

- CSS段階: `work/performance-lcp-20261019/multipage-after-css.json`
- 表示待ち調整段階: `work/performance-lcp-20261019/multipage-after-visible-guard.json`
- 初期演出軽量化段階: `work/performance-lcp-20261019/multipage-native-results.json`
- フォント確認段階: `work/performance-lcp-20261019/multipage-font-results.json`
- CSS適用タイミング調整段階: `work/performance-lcp-20261019/multipage-demand-results.json`

CSS適用タイミングの調整後、モバイル4ページのFCPは0.971〜1.038秒となった。最終コードの再計測結果は後述する。

PSIはラボ測定。実ユーザーのデータは対象ページにない。初回描画・LCP・TBTのばらつきがあり、単回の点数だけで恒久的な改善量を保証しない。

## 最終計測結果（本番・パッケージ126）

| ページ | モバイル点数 前→後 | FCP 前→後 | LCP 前→後 | TBT 前→後 | PC点数 前→後 |
| --- | ---: | ---: | ---: | ---: | ---: |
| TOP | 83→89 | 2.848→1.001秒 | 3.515→3.525秒 | 50→72ms | 98→98 |
| 一覧 | 81→84 | 2.650→1.032秒 | 3.842→4.162秒 | 88→105ms | 98→97 |
| プライバシーポリシー | 81→87 | 2.691→1.028秒 | 3.429→3.632秒 | 204→169ms | 98→98 |
| 詳細 | 84→85 | 2.616→1.009秒 | 3.507→3.913秒 | 78→157ms | 98→99 |

初回描画とモバイルの総合点数は改善。LCPの短縮は確認できず、下層ページでは計測上悪化した。TBTも全ページ改善ではない。LCPとスコアの変動を解消したとは報告しない。

最終状態のモバイルCLSは4ページとも0。PCはFCP 0.318〜0.380秒、LCP 0.963〜1.099秒、CLSは0。

最終コードの4ページ×2デバイスを保存: `work/performance-lcp-20261019/multipage-complete-results.json`

- [TOPの最終レポート](https://pagespeed.web.dev/analysis/https-schiff-web-com/u34mbr0otj?form_factor=mobile)
- [一覧の最終レポート](https://pagespeed.web.dev/analysis/https-schiff-web-com-works/7y896b5k0e?form_factor=mobile)
- [ポリシーの最終レポート](https://pagespeed.web.dev/analysis/https-schiff-web-com-privacy-policy/444gi8t0ez?form_factor=mobile)
- [詳細の最終レポート](https://pagespeed.web.dev/analysis/https-schiff-web-com-works-%e5%bb%ba%e8%a8%ad%e3%83%bb%e5%bb%ba%e7%af%89%e4%bc%9a%e7%a4%be-web%e3%82%b5%e3%82%a4%e3%83%88%e5%88%b6%e4%bd%9c/4ey8dqfzcp?form_factor=mobile)

## 最終表示確認

- ローカル初期表示で全体CSSがpreloadのままでも球体がWorkerで動作し、初期見出し・光の線が表示される。
- 操作前はイコライザーの追加DOMが0。キーボード操作後にイコライザーが追加され、全体CSSがstylesheetに切り替わることを確認。
- 本番390pxの一覧で、初期表示用CSS、先頭画像のeager/high、見出しの初期演出、横はみ出しなしを確認。
- 本番のキー操作後に全体CSSとイコライザーが有効になることを確認。
- 本番の最終画面: `work/performance-lcp-20261019/multipage-production-final.png`
- 変更JSのESLint、変更ファイルのPrettier、SCSSのStylelint、Viteビルドに成功。

残る主な検討事項はLCPの表示待ちと、GA4を含む長いタスクの変動。今回GA4の読み込み方式・計測設定は変更していない。
