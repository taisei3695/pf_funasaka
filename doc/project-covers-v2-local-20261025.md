# 案件用イメージ画像v2（ローカルのみ）

2026年10月25日。既存画像の構図調整に続き、画像自体を変更してよいという依頼を受け、組み込みImageGenで10案件分を新規生成した。本番には反映していない。

## 方向性

淡いベージュのミニチュア表現から、黒い空間・大きな被写体・強い方向光へ変更。案件ごとに色の軸と被写体を変え、サイト全体の黒基調と調和させた。AIイメージであり、実際の制作画面・製品写真ではないというカード表示と詳細の注意書きは維持。

| 案件 | 被写体・色 | 保存画像（src/assets/images/） |
| --- | --- | --- |
| 建築 | 大きな建物、木の格子、琥珀色の照明 | project-construction-concept-v2.webp |
| 商品販売 | 銅色の壺と青い器、カタログ写真の照明 | project-auction-concept-v2.webp |
| 学習塾 | 学習カードを映すノートPC、シアン・ライム | project-shopify-concept-v2.webp |
| 和菓子店 | 花形の和菓子、漆黒の盆、梅色 | project-wagashi-concept-v2.webp |
| 害虫駆除 | 住宅と保護を表すガラス、エメラルド | project-pest-concept-v2.webp |
| イラスト | ペンタブレットと抽象画、コーラル・マゼンタ | project-studio-concept-v2.webp |
| 農業システム | 作物と管理を表す端末、緑 | project-agriculture-concept-v2.webp |
| 製造業システム | 生産ラインと管理を表す画面、シアン | project-manufacturing-concept-v2.webp |
| ラリーマシン | 発射装置・ボール・カメラ、コバルト | project-rally-concept-v2.webp |
| 天体アプリ | 星空を映すタブレットと方位磁石、群青・紫 | project-astronomy-concept-v2.webp |

画面内のグラフ・配置は説明用の創作であり、実際に実装したUIを示さない。自主制作3件の実際のサイト画面は差し替えていない。

## 画像と実装

- 生成原本1586×992pxを保存し、配信用は幅1440pxのWebPへ縮小。1枚75,038〜144,812 bytes。WordPressで300・768・1024px等の派生画像も生成し、従来のsrcset・遅延読み込みを継続。
- ファイル名をv2として別保存。旧メディアID52〜61と元画像は削除していない。
- ローカルの投稿ID32〜41の`works_gallery`だけを、新メディアID65〜74へ変更。各案件の画像はWordPressの制作実績編集画面から変更できる。
- 新画像は16:10の枠に合わせて生成したため、直前に追加した旧画像用のコントラストフィルターはv2には適用しない。元の色と照明をそのまま表示する。
- 球体・光・暗幕等のJavaScript、投稿本文・表示順・URL・SEO設定は変更していない。本番も変更していない。

## 確認・保存先

- Stylelint・Prettier・テーマビルド成功。
- TOP・一覧1ページ目・2ページ目・代表詳細を320・375・768・1280pxで確認。横はみ出しなし。
- 一覧の10枚すべてがv2の画像URLとsrcsetを持つこと、代表詳細の画像とAI注意書きを確認。PCの建築・商品販売・業務システム・大学校開発、375pxの建築カードを目視確認。
- `work/20261025-project-covers-v2/generation-manifest.json`：全10枚の最終プロンプトと生成原本のパス。組み込みImageGenを使用。
- 同フォルダーの`originals/`：生成PNG原本。`optimized/`：配信用WebP控え。
- `database-before.sql`：差し替え前のローカルDB。非公開情報を含むため公開・Git追加しない。
- `applied.json`：案件ごとの変更前後の画像ID。`optimization.json`：画像容量・品質。
- `responsive-checks.json`、PNG、`build.log`：確認記録。

画像だけを戻す場合は`applied.json`の`before`を対象投稿の`works_gallery`へ再設定すればよく、DB全体の復元は不要。
