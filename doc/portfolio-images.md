# ポートフォリオ画像の出典

Works の画像は、本人から提供された以下のデモサイトをブラウザで撮影したスクリーンショットです。2x画像の撮り直し：2026年10月4日。

| 作品 | 元サイト | 保存ファイル（`src/assets/images/`） |
| --- | --- | --- |
| Next Realty | https://schiff.wpx.jp/nextrealty/?utm_source=mail&utm_medium=email&utm_campaign=pf001 | `portfolio-next-realty.webp` / `portfolio-next-realty-2x.webp` |
| Kidsland | https://schiff.wpx.jp/kidsland/?utm_source=mail&utm_medium=email&utm_campaign=pf001 | `portfolio-kidsland.webp` / `portfolio-kidsland-2x.webp` |
| Valentine Rose | https://schiff.wpx.jp/valentine_rose/?utm_source=mail&utm_medium=email&utm_campaign=pf001 | `portfolio-valentine-rose.webp` / `portfolio-valentine-rose-2x.webp` |

Basic認証を含む実サイトを閲覧するため、読み取り専用のローカルプロキシを経由して撮影しました。接続先のオリジンだけを置き換えています。元サイトを1440×900 CSS pxのiframeに表示し、撮影用ページで2倍に描画して2880×1800pxで保存しました。元サイトのレイアウト・メディアクエリ・表示内容は維持しています。

右側のスクロールバーを除いて既存画像とほぼ同じ範囲に切り出し、1280×800px（1x）と2560×1600px（2x）のWebPに縮小しました。Sharpの品質は88です。以前の1425×891pxのJPEGを拡大したものではありません。撮影元のJPEGと変換記録は `work/retina-images/`、以前の撮影元は `work/portfolio-original-sites/` に保存しています。これらの画像は制作初期の仮デザイン画像を置き換えたものです。

Works詳細の最大表示幅1280pxに対して2倍の画像幅を確保しています。WordPressメディアの元画像も2560×1600pxへ更新し、既存の画像ID・投稿との関連を保って派生画像を再生成しました。メディアの`srcset`と、テーマの静的画像fallbackの`srcset`・`sizes`で、表示幅に応じた候補を選びます。元画像・メタデータの更新前バックアップは `work/retina-images/before-update/` にあります。

Aboutは2026年10月4日に画像を外し、名前・肩書き・経歴・関心分野を文章で表示する構成に変更しました。画面幅にかかわらず1列で、名前・肩書きの下に本文を配置します。見出し・光点・名前・本文は他のセクションと同じ左端へそろえ、名前・肩書き・本文の幅を45rem（標準フォント設定で720px）以内に抑えます。文章は左揃えです。生成した作業机とギターの画像は配信用のソース・テーマから除去し、原本は `work/portfolio-imagegen/about.png`、WebPは `work/about-text-only/retired-images/` に保全しています。

取り下げた画像はデザイン用のAI生成イメージで、本人の実際の作業環境を撮影した写真ではありません。WebPの1xは728×546px、2xは1456×1092pxでした。元PNGは1448×1086pxのため、2x作成時のみ約0.55%拡大しています。

光点の `src/assets/images/light_strobe.webp` はbuilt-in ImageGenで生成した透明背景の単一ストロボ素材です。256×256px、13,346 bytes。最大描画幅64.8pxの2倍を上回るため、画像サイズを維持しています。既存サイトの画像を切り抜いたものではなく、白いコアと冷白色の短いハローを生成し、Sharpで縮小・WebP化しました。About右側のイコライザーにも同じビットマップを使い、モノトーンの光点として表示します。Aboutの写真を戻したものではありません。生成プロンプト・原本・alpha検査は `work/light-motion/` に保存し、用途と調整方法は [light-motion.md](light-motion.md) に記録しています。
