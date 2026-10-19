# 初期読み込み分離（2026-10-19）

## 対象
- ユーザー測定: https://pagespeed.web.dev/analysis/https-schiff-web-com/59o4scl4i0?form_factor=mobile
- 本番・ローカル双方に反映。DB、SEO設定、GA4設定、プラグイン設定の変更なし。

## 変更
- GSAPとスクロール表示演出を動的importへ分離。初期JSを153,149バイトから12,783バイトに縮小（未圧縮サイズ）。分離した演出JSは140,668バイトで、総転送量を大幅削減したという意味ではない。
- 初期描画の機会を確保してから演出モジュールを読み込む。読み込み失敗時も本文は表示される。
- TOPの名前には隠れてから出るアニメーションを適用せず、すぐ読める表示に変更。PORTFOLIO表示・球体・光・暗幕・スクロール見出し演出は継続。
- 球体のmodulepreloadにfetchpriority=lowを追加し、本文のCSS・フォントとの競合を緩和。非対応ブラウザーでは従来のプリロードとして動作。

## モバイル測定（単回、変動あり）
| 指標 | 変更前 | 変更後 |
| --- | ---: | ---: |
| パフォーマンス | 71 | 80 |
| FCP | 2.1秒 | 1.1秒 |
| LCP | 4.2秒 | 4.2秒 |
| TBT | 320ms | 130ms |
| Speed Index | 5.9秒 | 5.4秒 |
| CLS | 0 | 0 |

- 変更後: https://pagespeed.web.dev/analysis/https-schiff-web-com/d2saq0tiy7?form_factor=mobile
- LCPは改善していないため、初期JS分離だけで解消したとは扱わない。

## 検証
- ESLint、Stylelint、Prettier、Vite本番ビルド成功。
- ローカルTOPで球体three、見出しpending、リンクイコライザー19個を確認。詳細へEnterで遷移し、見出しshown・装飾線4個・横はみ出しなしを確認。
- 本番テーマ更新成功（package 112）。新JS、新CSS、球体preload優先度の反映をDOMで確認。
- 本番canonical・OGP画像・GA4出力を確認。
- 証跡: work/performance-fourth-20261019/
- 配布: work/deployment/20261019-performance-fourth/wp-template-performance-fourth-20261019.zip
- 戻し先: work/deployment/20261019-performance-third/wp-template-performance-third-20261019.zip
