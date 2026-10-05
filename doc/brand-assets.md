# OGP 画像生成仕様

使用方式: built-in `image_gen`（CLI/API フォールバック不使用）

```
Use case: ads-marketing
Asset type: Open Graph social share image for the original portfolio website of TAISEI FUNASAKA.
Primary request: Create one polished, original landscape portfolio title card with a 1200:630 aspect ratio (approximately 1.905:1), ideally 2400 by 1260 pixels, suitable for clean downscaling to 1200 by 630.
Scene/backdrop: A near-black charcoal space. A wall of small, softly glowing white lights arranged in perfectly horizontal, evenly spaced rows and vertical columns. The light grid gently fades into depth. At the lower edge, subtle blurred reflections on a dark floor suggest three-dimensional space. Keep the wall upright and horizontal; no tilted, sloping or skewed rows.
Subject: Exact name typography is the primary focus, centered with spacious margins. Render TAISEI on the first line and FUNASAKA on the second line. Below it, a smaller widely letter-spaced PORTFOLIO label, followed by a restrained but clearly readable professional descriptor.
Style/medium: Refined minimalist digital brand artwork. Jost-like geometric light-weight sans-serif typography, crisp white letters with generous letter spacing. Premium editorial precision; flat front-facing text over the subtle light environment. No photographic props.
Composition/framing: Wide landscape title card. All text and important artwork must remain within the central safe area, at least 14 percent away from the left and right edges and 17 percent away from the top and bottom edges. The name is large and readable on social-media thumbnail previews. Name lines centered, PORTFOLIO centered underneath, professional descriptor centered underneath that. The floor reflection is restricted to the bottom 15 percent and does not interfere with typography.
Lighting/mood: Calm and confident, white light points with controlled soft bloom, readable bright white typography against charcoal. Light points behind the name should remain subtly visible without obscuring letter shapes. No motion streaks.
Color palette: Strictly neutral near-black charcoal and white, with soft grayscale lighting. No saturated color.
Text (verbatim, in this order, each on its own line): "TAISEI" / "FUNASAKA" / "PORTFOLIO" / "Web Coder / WordPress Developer".
Constraints: Spell every word exactly. Keep the typographic letterforms clean, straight and complete. Use only those four text lines. Create original artwork rather than copying a music-video frame. Opaque dark background. No border.
Avoid: Diagonal light rows, colored lights, wave patterns, lens flares crossing text, stars, particles in random arrangements, logos of other brands, photographs of desks or people, mockup devices, extra copy, watermarks, visible texture noise.
```

納品: `src/assets/images/ogp_portfolio.jpg`（1200 × 630）。原本は `work/brand-assets/ogp-original.png` へ保持し、Sharp はリサイズ・形式変換のみに使用。
## ファビコン

黒地に白いTFモノグラム。元データは `src/assets/images/icon_favicon.svg`。文字はフォントに依存しないパスで定義し、画像生成AIは使用していません。

`yarn node bin/create-brand-icons.js` で PNG（32 / 180 / 192 / 512px）と ICO（16 / 32 / 48px）を再生成できます。続けて `yarn build:wp` を実行するとテーマへコピーされます。

## WordPressへの設定

`functions-lib/func-brand-assets.php` は、未設定のサイトアイコンを同梱PNGで補完します。OGPはSEO Simple Packの `ssp_output_og_image` フィルタで未設定時の画像を補完し、トップページのXカードを `summary_large_image` にします。管理画面で設定した画像と実績ごとの画像が優先されます。

favicon PNGとOGP JPEGは配信先の互換性を保つため、Viteの `preserveOriginal` 対象です。その他のサイト画像は既存のWebP変換を継続します。

