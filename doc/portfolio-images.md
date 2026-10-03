# ポートフォリオ画像の出典

Works の画像は、本人から提供された以下のデモサイトをブラウザで撮影したスクリーンショットです。撮影日：2026年10月3日。

| 作品 | 元サイト | 保存ファイル |
| --- | --- | --- |
| Next Realty | https://schiff.wpx.jp/nextrealty/?utm_source=mail&utm_medium=email&utm_campaign=pf001 | `src/assets/images/portfolio-next-realty.webp` |
| Kidsland | https://schiff.wpx.jp/kidsland/?utm_source=mail&utm_medium=email&utm_campaign=pf001 | `src/assets/images/portfolio-kidsland.webp` |
| Valentine Rose | https://schiff.wpx.jp/valentine_rose/?utm_source=mail&utm_medium=email&utm_campaign=pf001 | `src/assets/images/portfolio-valentine-rose.webp` |

Basic認証を含む実サイトを閲覧するため、読み取り専用のローカルプロキシを経由して撮影しました。接続先のオリジンだけを置き換え、元サイトのレイアウトや表示内容は変更していません。撮影後は画像の寸法を保ったまま、WebP形式へ変換しています。

撮影元のJPEGは `work/portfolio-original-sites/` に保存しています。これらの画像は制作初期の仮デザイン画像を置き換えたものです。

Aboutの `src/assets/images/portfolio-about.webp` は、デザイン用に生成した作業机とギターのイメージ写真です。本人の実際の作業環境を撮影した写真ではありません。

光点の `src/assets/images/light_strobe.webp` はbuilt-in ImageGenで生成した透明背景の単一ストロボ素材です。256×256px、13,346 bytes。既存サイトの画像を切り抜いたものではなく、白いコアと冷白色の短いハローを生成し、Sharpで縮小・WebP化しました。生成プロンプト・原本・alpha検査は `work/light-motion/` に保存し、用途と調整方法は [light-motion.md](light-motion.md) に記録しています。
