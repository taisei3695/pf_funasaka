# ポートフォリオのデザイン比較

確認日: 2026年10月3日。実装URL: http://localhost:8888/

final result: passed

選定画像とブラウザ表示を同じ幅へ正規化し、1枚の比較画像に並べて確認しました。現在、修正が必要なP0・P1・P2の差異はありません。

## 比較対象と状態

- Source visual truth: `C:/Users/oyaji/.codex/generated_images/01a10132-d4d3-7dd1-8a10-77b09fa48ac6/exec-a28b6a1f-957c-4b60-b7c2-56ef6378559a.png`
- 選定内容: 案3のFVと案1のWorksを組み合わせた画像。作品番号なし、Worksの英字はFVと同じフォント。
- 実装証跡: `work/portfolio-qa/desktop-page-final.jpg`、`desktop-hero-final.jpg`、`desktop-works-final.jpg`。
- 全体比較: `work/portfolio-qa/comparison-full-target.png`。左が選定画像、右が実装。FVとWorksを対象とし、Skills以降は別の画面証跡と依頼仕様で確認。
- 拡大比較: `comparison-hero.png`、`comparison-works.png`。文字・光・画像と情報の配置を判別できる大きさで確認。
- 状態: 公開TOP、ログアウト状態、実績3件の実画像、ローカルフォント読み込み後、通常のアニメーション設定。画像と文字のRevealが終わってから撮影。

## 寸法と正規化

選定画像は887 × 1774px。FVは先頭487px、Worksは残りの領域です。ブラウザのCSS viewportは1440 × 900px、devicePixelRatioは1でした。CUAのスクリーンショットは1425 × 891pxに縮小されるため、比較では画像を幅887pxへ比例縮小しています。引き伸ばしや文字の縦横比変更はしていません。

全体比較の実装側は、全ページの先頭からSkills開始直前までを切り出しています。Skillsのdocument上の開始位置は3137.64 CSS px、スクリーンショットの換算位置は約3105pxです。比較用の幅887pxでは実装側の高さが1933pxになり、選定画像の下には比較用の余白を加えています。

FV比較は選定画像の887 × 487pxと、実装の1425 × 891pxをそれぞれ幅887pxで表示しています。実装のFVは依頼仕様に従う100svhで900 CSS pxです。この高さの違いを画像の変形で消してはいません。Works比較は双方の見出しと最初の実績が見える領域を使用し、アンカー位置の32pxの余白とFV末尾の細い帯を識別しています。

| CSS viewport | スクリーンショット | 確認内容 |
|---|---|---|
| 375 × 812px | mobile-hero.jpg: 360 × 780px | FV高812px、光5個、Works1列、Skills2列 |
| 768 × 1024px | tablet-hero.jpg: 753 × 1004px | FV高1024px、Works1列、Skills3列 |
| 1440 × 900px | desktop-hero-final.jpg: 1425 × 891px | FV高900px、光10個、Works左右交互 |

いずれの幅でもdocumentのscrollWidthとclientWidthが一致し、横はみ出しはありません。画面幅の確認はブラウザviewportによるもので、実機のSafariや端末の操作確認ではありません。

## 必須5項目の評価

| 項目 | 評価と根拠 |
|---|---|
| フォント・文字組み | ローカル配信のJost、weight 300をFVとWorksで共用。`document.fonts.check`でも読み込みを確認。FVは細い英字と広めの字間、Worksは同じ書体で読みやすい字間。PCの作品名は48.45px、3件とも高さ62.98pxで1行。役割・種類・リンクの文字を比較後に拡大。日本語本文は日本語用のフォールバックとweight 400を使用し、改行・欠けなし。 |
| 余白・レイアウト | チャコールFV、明るいWorks、画像を大きくした交互配置を維持。画像は5:3、カードや影を追加せず、余白で区切る。最初の実績説明を画像上部寄りへ調整。100svhとAll Works導線による全体高の差は仕様に基づく。375pxでは左右20px、768pxでは48px、1440pxでは80pxの基準余白。 |
| 色・視覚トークン | 背景は#222324と#fafaf8、文字は#242424と明るい白系。光が薄すぎた初回状態を修正し、柔らかい灰色の光として判別可能にした。光はゆっくり明滅するため撮影時の強さは変化する。ContactはFVより弱い光。CSSのradial-gradientとblurは依頼仕様に明記された手法。 |
| 画像品質・アセット | Works3件は本人提供のサイトを認証して撮影した実画面に差し替え、WebP化とWordPressのresponsive画像を使用。引き伸ばし、仮の図形、画像の代用描画なし。Aboutは生成した机とギターの写真を1枚使用し、本人の実写真であるとは表示していない。出典はdoc/portfolio-images.md。 |
| 文言・内容 | TAISEI / FUNASAKA / PORTFOLIO、Works3件の作品名・種別・担当、指定のAbout本文、相談文、Gmailを確認。作品番号なし、新しい順。URLのUTMパラメータを保持し、許可されたdemo/demoを公開詳細に表示。未入力のImplementationは表示せず、実績内容や成果を推測で補っていない。 |

## 修正履歴

### 1. [P2・修正済み] FVの光が薄すぎる

初回の `desktop-hero.jpg` は選定画像と比べ、光の面が判別しにくく、FVがほぼ単色に見えました。光の中央の強さ、下部の楕円形の広がり、左右の位置とサイズを調整し、GSAPのopacity係数を0.75へ変更しました。文字のline-heightも1.05へそろえています。

修正後の `desktop-hero-revised.jpg`、最終の `desktop-hero-final.jpg` と `comparison-hero.png` で、左・右・上部・下部に柔らかい光を確認しました。ゆっくりした明滅の位相による差は動作仕様です。明滅の強さは瞬間的な発光やフラッシュにはなっていません。

### 2. [P2・修正済み] PCのWorksの文字と最初の説明位置

幅887pxへ正規化した初回比較で、Works見出し・作品名・種類・役割・リンクが選定画像に比べ小さく、最初の説明も画像中央へ寄っていました。修正前の証跡は `desktop-works-before-type.jpg` と `desktop-works.jpg` です。

1024px以上の見出しを72px、種類を24px、役割を21px、View Projectを24px、ヘッダーを18pxへ調整しました。作品名は途中の54.15pxでValentine Roseが2行になったため、`clamp(40px, 3.4vw, 50px)`へ調整しました。最終1440pxの実DOMで3件の高さが62.98pxにそろい、1行を維持することを確認しています。最初の説明には上側36pxの余白を設定しました。

修正後の同じ1440 × 900px・Worksアンカー位置の `desktop-works-final.jpg` と `comparison-works.png` で、文字の階層、同一フォント、最初の説明位置、画像とのバランスを再比較しました。全体の交互配置は `comparison-full-target.png` でも確認しました。モバイル・タブレットの値は変更していません。

## 意図された差と残る確認範囲

- FVは選定画像の比率ではなく、依頼仕様の100svhを優先しています。
- Worksの画像は選定画像の架空の住宅・子ども・花のイメージから、提供サイトの実画面へ差し替えました。これに伴う被写体・色の違いは情報の正確さのための変更です。
- All Works、詳細ページ、Skills、About、Contactは依頼仕様から実装しています。モックに描かれていない部分を、モックの不足として扱っていません。
- 作品名ごとに画像生成モックの字間を再現せず、Jostの共通設定へ統一しています。細部の字幅・光の位相には差がありますが、修正を要するP2ではありません。
- About写真を本人の実写真へ差し替えること、各実績のOverview / Implementationを具体化することは内容の次の編集項目です。
- `prefers-reduced-motion` とJavaScript無効時の可視性はCSS・JS分岐をコードで確認。OS設定変更やJavaScript無効化を伴うブラウザ試験、実機Safari、実端末、本番サーバーは未確認です。

## 操作・アクセシビリティ確認

- Works / Skills / About / Contactのアンカー移動、公開一覧、Next Realty詳細、Back to Worksをブラウザで操作。
- Visit Websiteの提供URL、公開demo案内、Gmailのmailtoを実DOMで確認。メール送信は行っていません。
- Tabキーでナビへ移動し、2pxのfocus-visibleを確認。スキップリンク、見出し、画像のalt、semanticなリンクを確認。
- 375pxのナビは44px以上、Gmailの高さは50.59px。詳細のメタ情報の折り返しと画像読み込みを確認。
- 全4画像の読み込み成功。ブラウザconsole error / warningは0件。
- 公開・非公開のHTTP、REST、検索、RSS、Sitemapと専用画像の保護は別途 `doc/portfolio-privacy-qa.md` に記録。

## 実装確認

- [x] 初回P2を記録し、実装へ反映。
- [x] 修正後に同じviewportで再撮影し、ソースと同じ比較画像へ配置。
- [x] 必須5項目、全体構成、拡大領域を確認。
- [x] 375 / 768 / 1440pxで表示を確認。
- [x] 主要な導線、キーボードfocus、consoleを確認。
- [x] WordPressビルド、対象のlint・PHP構文・ACF JSON・Git差分の検証を実施。

## 追加確認: fluid関数による文字サイズ・余白の調整

2026年10月3日の追加依頼により、375px／1440px、root 16pxを基準とする `fluid($min-px, $max-px)` を共通SCSSへ追加しました。新しい関数は `src/assets/styles/global/_functions.scss`、使用箇所は `projects/_p-portfolio.scss` です。文字サイズと主な余白を連続的に補間し、レイアウトの切り替えは既存のmedia queryを使います。

この追加確認の基準は、直前の確認済みデザインと、利用者が指定したfluid関数です。比較は1440 × 900pxの同じ状態で撮影した `work/portfolio-qa/fluid-comparison-hero.png` と `fluid-comparison-works.png` で実施しました。左が変更前、右が変更後です。双方1425 × 891pxの撮影を幅720pxへ比例縮小して並べています。FVの先頭位置とWorksアンカー位置を一致させた撮影を使用しました。

375pxと1440pxの基準の見え方を保ちながら、768pxの文字と余白が連続して変化することを確認しました。書体・字間・色・画像・文言・グリッド・アニメーションは維持しています。上限の変更と、本文・補足・リンクの一部のサイズ調整は追加依頼に基づく変更です。P0・P1・P2の新しい問題はありません。

| ブラウザの幅 | CSS計算幅 | FVの名前 | セクション見出し | Worksの作品名 | About本文 |
|---|---:|---:|---:|---:|---:|
| 375px | 360px | 40px | 32px | 28px | 14px |
| 768px | 753px | 70.52px | 46.20px | 35.10px | 14.35px |
| 1440px | 1425px | 124.79px | 71.44px | 47.72px | 14.99px |

スクロールバーがあるため、実際のvw計算幅はブラウザの外側の幅より15px小さい状態です。rootは16px。実DOMの計測値を `work/portfolio-qa/fluid-measurements.json` に保存しました。すべての幅でscrollWidthとclientWidthが一致し、ナビの高さは44px以上でした。768pxではSkillsの9項目が1行、1440pxではWorksの3作品名が1行です。

追加証跡は `fluid-hero-375.jpg`、`fluid-hero-1440.jpg`、`fluid-works-375.jpg`、`fluid-works-1440.jpg`、`fluid-skills-768.jpg`、`fluid-about-768.jpg`。Stylelint、Prettier、WordPress用ビルド、Git差分検証を通過し、ブラウザconsole error / warningは0件でした。既存の実機・動作軽減設定・本番環境に関する未確認範囲は引き続き同じです。

final result: passed
