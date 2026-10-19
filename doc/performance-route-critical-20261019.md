# ページ別CSSと画像優先度の改善（2026-10-19）

## 対象と維持事項

ユーザー提供のモバイル4レポート（TOP `0nnvoioyzd`、一覧 `jr09q5rjmb`、ポリシー `gcc6m1qjrg`、詳細 `ki7ldq3740`）を確認し、本番とローカルへ反映した。

球体・光・暗幕・見出しの演出、デザイン、投稿、並び順、SEO・OGP・GA4・SiteGuardの保存設定を維持。DB操作や新たな本番診断コードの追加は行わない。

## 調査結果

- TOPのLCP対象はFUNASAKA。画像を小さくするだけでは改善できない。原稿はサーバー出力済みで、名前を隠して待つCSSや2秒の待機タイマーはない。
- 一覧画像は取得遅延100ms＋転送50msに対して、レンダリングの遅延が2,190ms。ポリシー本文にも2,320msの遅延がある。
- TOPの長いタスクはGA4外部スクリプトが135ms＋113ms、HTML側が172ms。GA4は主要な処理負荷の一つだが、この数字だけで全描画遅延の原因とは断定できない。
- 既存のSearch Consoleの所有権確認はGAによるもの。本番HTMLにはgoogle-site-verification metaがなく、DNS・ファイルによる確認の有無は未確認。GoogleはGA確認に、head内に変更のない標準コードを置くことを要求している。そのため、srcをdata-srcへ変更する遅延方式や計測方法の変更は採用しない。[Googleの要件](https://support.google.com/webmasters/answer/9008080?hl=ja)

## 変更内容

1. 下層ページ共通の初期CSSを、一覧・詳細・ポリシーに分割した。既存SCSSをそのまま再利用し、各ページで使わない他ページのルールだけを外す。読み込み順や宣言値は変更しない。
2. 古いmanifestや新CSSが使えない場合は、従来の共通初期CSSへ戻る。TOPの初期CSSは変更しない。
3. 遅延読み込みのカード画像にだけfetchpriority=lowを付ける。先頭画像のeager/high、詳細の主要画像、既に明示された優先度は維持する。

ビルド済みCSSのサイズ（圧縮前）：

| 初期CSS | バイト数 | 従来比 |
| --- | ---: | ---: |
| 従来の共通CSS | 60,508 | — |
| 一覧 | 58,252 | 約3.7％削減 |
| 詳細 | 49,594 | 約18.0％削減 |
| ポリシー | 48,158 | 約20.4％削減 |

これはCSSの解析量の削減であり、圧縮転送量が同じ比率で減るという意味ではない。本番で新しいCSSのインライン配信と、一覧のeager/high→lazy/lowの画像順を確認した。

## 表示とコードの検証

- 4ページで、ヘッダー・見出し・カード・本文・画像・装飾線・フッターの計算済みスタイルを変更前後で照合。TOP60、一覧50、ポリシー27、詳細20要素の文字・色・余白・幅・高さ・配置が一致した（1265px幅）。
- 実際の375px幅で4ページを確認し、横はみ出しなし。下層のグリッチ2層、背景再生を確認。
- 本番で全4ページのcanonical・OGP・GA4のasync/srcを確認。GA4は従来どおりG-FG9SXY9398、1件のみ。
- 本番の主要JS `script.0bqfIuNH.js`、暗幕JS、全体CSS、TOPの初期CSS・名前フォントCSSは作業前と同じファイルハッシュ。
- PHP構文、SCSSのStylelint、Vite設定のESLint、Prettier、本番ビルド成功。

## PageSpeedの結果と限界

本番パッケージ141の単回結果：

| ページ | 点数 前→後 | FCP 前→後 | LCP 前→後 | TBT 前→後 |
| --- | ---: | ---: | ---: | ---: |
| TOP | 85→88 | 1.120→2.854秒 | 3.577→2.854秒 | 148→0ms |
| 一覧 | 87→82 | 0.964→2.601秒 | 3.778→3.832秒 | 54→76ms |
| ポリシー | 89→87 | 0.967→0.991秒 | 3.477→3.576秒 | 53→146ms |
| 詳細 | 90→95 | 0.946→0.977秒 | 3.652→2.843秒 | 50→89ms |

詳細のLCP対象は引き続き主要画像。計測時の画像転送は40ms、レンダリングの遅延は100msだった。

TOP・詳細のLCPが短くなった一方、一覧・ポリシーは改善を確認できていない。特にTOPはFCPが悪化しているため、「初回表示全体が速くなった」「全ページ改善」「安定して95点」とは報告しない。TOPの初期CSS/JS自体は同一なので、今回のLCP差をすべて修正の効果に帰属しない。良好基準のLCP2.5秒も未達。

直後の再分析は別URLを返したが、4ページとも全指標が最初の結果と完全一致した。キャッシュされた測定値の可能性があるため、独立した反復測定として数えない。前回までの記録でもFCP約1秒／2.6～2.9秒の変動があり、残る遅延の原因は完全には特定できていない。

GA4の読み込みを強く遅延させる案を進める場合は、Search Consoleの別の所有権確認方法を先に確認・追加し、短時間離脱や自動イベントへの影響も検証する。今回、その設定変更は行っていない。

## 配布物・記録

- 最終ZIP：`work/deployment/20261019-route-critical-css/wp-template-route-critical-css-20261019.zip`
- SHA256：`f3ec2da410c2708a0d19bf1a5c28e545489c19031c51fe00523ec176c0cf8cf1`
- 本番パッケージ141、「テーマの更新に成功しました。」を確認。
- 切り戻し先：`work/deployment/20261019-unused-block-css/wp-template-unused-block-css-20261019.zip`（作業前140）。
- 古いハッシュ付きアセットをZIPに維持し、キャッシュされた旧HTMLも参照可能。球体Workerも維持。
- rootのfunctions.phpは作業前と同一。SHA256 `49F791BCEF5ACB0092890B7D586551CC9484A7685A5FE8F25F0DB5E1310D0A4D`。
- 証跡：`work/performance-thirdparty-20261019/` のbefore/after/repeat-reports.json、desktop-style-comparison.json、mobile-route-checks.json、production-route-checks.json。

本番反映後のレポート：

- [TOP](https://pagespeed.web.dev/analysis/https-schiff-web-com/8y6oq8vmrm?form_factor=mobile)
- [一覧](https://pagespeed.web.dev/analysis/https-schiff-web-com-works/m0lyscnlrg?form_factor=mobile)
- [プライバシーポリシー](https://pagespeed.web.dev/analysis/https-schiff-web-com-privacy-policy/w99zxct1u1?form_factor=mobile)
- [詳細](https://pagespeed.web.dev/analysis/https-schiff-web-com-works-%e5%bb%ba%e8%a8%ad%e3%83%bb%e5%bb%ba%e7%af%89%e4%bc%9a%e7%a4%be-web%e3%82%b5%e3%82%a4%e3%83%88%e5%88%b6%e4%bd%9c/dgfpyfxams?form_factor=mobile)
