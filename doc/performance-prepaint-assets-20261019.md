# 初期配信の削減と再計測（2026-10-19）

対象はTOP・制作実績一覧・詳細・プライバシーポリシー。本番とローカルに反映。球体・光・暗幕・見出し演出の内容、投稿データ、SEO・OGP・GA4・SiteGuardの保存設定は変更しない。

## 修正

1. 非表示の進捗ライトの背景画像を、既存の `is-portfolio-progress-ready` が付いたときだけ取得する。従来は親のopacityが0でも約13.3KiBの画像を初期取得していた。操作後の画像・寸法・色・動作は維持。未キャッシュの初回操作時には画像の取得時間が必要になる。
2. 名前専用のフォントとhero表示CSSを独立したViteエントリーにし、TOPだけインライン出力する。下層ページのHTMLから約2KBを削減。TOPの書体とCSSの順序は維持。開発サーバーではTOPのみCSSを動的importする。
3. TOPとworks一覧はカスタムテンプレートだけで構成され、本文ブロックを描画しないため、`wp-block-library`・`classic-theme-styles` をこの2種類のページだけdequeueする。登録は解除せず、詳細・プライバシーポリシーでは維持する。

## 配信量と表示の検証

- ローカルでは標準CSS約8.7KBを削減。本番の標準CSSは元の出力量が異なり、削減量は4,726バイトだった。圧縮前のHTMLで比較しており、通信量そのものの削減と同一ではない。
- 本番TOPのHTMLは96,999→92,467バイト。heroを別styleに分けるタグの増分を含む。
- 本番一覧はhero分離後112,428→最終107,702バイト。ローカル一覧のhero分離だけの比較は115,519→113,475バイト。
- 修正後のPSIのキャッシュ対象リソース一覧に `light_strobe.webp` がないこと、通常ブラウザーで操作前はbackground-image:none・操作後は従来の画像URLになることを確認。
- 一覧のヘッダー・見出し・カード32要素について、書体、サイズ、太さ、行高、色、余白、display、gapの計算値が削減前と一致。
- ローカル4ページを実際の375px幅で確認し横はみ出しなし。本番375px幅のTOP・一覧も横はみ出しなし。詳細では暗幕終了後にグリッチ2層と背景再生を確認し、ブロック用CSSも残っている。
- PHP構文、変更JSのESLint、SCSSのStylelint、Prettierを確認。Viteビルドは画像書き込みの一時失敗後、再実行で成功。無関係のソース変更は行っていない。

## PageSpeedの結果

比較元はユーザー提供の `w150r616mr` / `fe7fej3rlc` / `igustdnh4h` / `qsya9aka21`。下記はそれぞれ単回計測であり、統計的な改善の証明ではない。

| ページ | モバイル点数 前→後 | FCP 前→後 | LCP 前→後 | TBT 前→後 | PC点数 前→後 |
| --- | ---: | ---: | ---: | ---: | ---: |
| TOP | 86→84 | 1.173→1.141秒 | 3.598→3.601秒 | 167→169ms | 95→98 |
| 一覧 | 88→82 | 0.968→1.078秒 | 3.861→3.971秒 | 61→208ms | 98→97 |
| ポリシー | 89→91 | 0.986→0.951秒 | 3.509→3.488秒 | 84→48ms | 98→98 |
| 詳細 | 85→85 | 1.018→2.610秒 | 3.885→3.696秒 | 154→88ms | 98→99 |

ポリシー・詳細の測定はパッケージ139。140はTOP・一覧のPHP条件付きCSS解除だけを追加し、下層2ページに配信するHTML/CSS/JSは139と同じ。

パッケージ139時点ではTOP83点・LCP3.487秒、一覧87点・LCP3.470秒だった。最終140で上記の値へ変動したため、最良値だけを成果として使わない。不要な初期取得・配信サイズの削減は確認できたが、TOP・一覧のモバイルLCPや総合スコアの安定した改善は確認できていない。良好なLCP基準2.5秒にも届いていない。

最終PCのLCPはTOP1.028秒、一覧1.090秒、ポリシー1.022秒、詳細0.973秒。

### 変動について

今回と同じHeadlessChromium 153.0.8010.36 / Lighthouse 13.5で、初期フレームが約1～2秒遅れる事例が [Lighthouse #17148](https://github.com/GoogleChrome/lighthouse/issues/17148) に報告されている。[#16539](https://github.com/GoogleChrome/lighthouse/issues/16539) には実描画の依存でないプリロード等が推定LCPへ影響する議論もある。これらは未解決の報告であり、本サイトのトレースで同じ原因を証明したものではない。

同一コードでもFCPが約1秒と2.7秒前後に振れる傾向とは似ているが、測定側だけが原因と断定しない。通常のGA4を抑止したり、監査時だけ演出を変えたり、指標のために本文の見た目を変えることはしていない。

## 配布・証跡

- 最終ZIP：`work/deployment/20261019-unused-block-css/wp-template-unused-block-css-20261019.zip`
- SHA256：`05a4ad0b5d1acf1db2bda1f5d0c517394d8216d2b0d615de816ee1cc71eb71d9`
- 本番更新パッケージ140、「テーマの更新に成功しました。」確認。
- 切り戻し先：`work/deployment/20261019-lcp-final/wp-template-lcp-final-20261019.zip`（作業前138相当）。
- 古いハッシュ付きアセットと球体Workerを配布ZIPに残し、旧HTMLのキャッシュも参照切れを起こさない。
- 診断コードの追加やDB操作なし。rootのfunctions.phpは作業前と同一。
- 記録：`work/performance-20261019-next/before-reports.json` / `after-reports.json` / `final-reports.json`。
- 画面：`final-production-top.png` / `final-mobile-top.png` / `final-mobile-detail.png`。

最終レポート：

- [TOP](https://pagespeed.web.dev/analysis/https-schiff-web-com/y5o3v4lcb2?form_factor=mobile)
- [一覧](https://pagespeed.web.dev/analysis/https-schiff-web-com-works/emqzoxfpuo?form_factor=mobile)
- [プライバシーポリシー](https://pagespeed.web.dev/analysis/https-schiff-web-com-privacy-policy/tavkcfau0r?form_factor=mobile)
- [詳細](https://pagespeed.web.dev/analysis/https-schiff-web-com-works-%e5%bb%ba%e8%a8%ad%e3%83%bb%e5%bb%ba%e7%af%89%e4%bc%9a%e7%a4%be-web%e3%82%b5%e3%82%a4%e3%83%88%e5%88%b6%e4%bd%9c/lzyqradw8j?form_factor=mobile)
