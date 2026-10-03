# 光の演出のデザイン比較

最新の改修（2026-10-04）の確認結果は、[複数パターンと光量のQA](doc/light-random-qa.md)に記録しています。以下は、光点を導入した初回の比較記録です。光量・周期・試験結果は当時のものです。

確認日：2026-10-03。実装URL：http://localhost:8888/

final result: passed

今回の比較対象は、androp「Bright Siren」の光点の配置・発光・点灯の流れを、既存のポートフォリオへ取り入れた表現。既存のFV文字、Worksの交互配置、画像と文章、字体とfluid()の寸法を維持するという承認内容に照らして確認した。

## 比較対象と証跡

- Source visual truth：`work/light-motion/reference-party.jpg`。PARTYの制作紹介 https://prty.jp/projects-detail/androp-bright-siren をブラウザーで撮影。1265×712px。
- 参考MV：https://www.youtube.com/watch?v=hYgw7XRf5nc 。前ターンに点光源が列・面として点灯する場面をブラウザーで確認済み。
- 実装：`work/light-motion/desktop-hero.jpg`、`desktop-works.jpg`、`desktop-skills.jpg`、`desktop-about.jpg`、`desktop-contact.jpg`、`mobile-hero.jpg`、`mobile-works.jpg`、`mobile-contact.jpg`、`tablet-hero.jpg`。
- 全体比較：`work/light-motion/comparison-light-wall.png`。左にMVの光の壁、右にFVを同じ入力画像として並べた。
- 拡大比較：`work/light-motion/comparison-light-detail.png`。光のコア・ハロー・規則的な配置を比較。
- 素材：`src/assets/images/light_strobe.webp`。透明な単一光源の生成ビットマップを使用。CSSのradial-gradient・blurによる面状光を置き換えた。
- 初期のFV・Works選定画像との確認は、`doc/portfolio-design-qa-initial.md`に履歴として保存。

## 状態と正規化

公開TOP、ログアウト状態、通常のmotion設定で確認。元映像は演奏者とストロボ機材を含む場面、実装は同じモチーフを名前の背景へ配置したFVで、点灯の位相も異なる。映像全体のページ構成・人物・機材の再現は比較項目に含めない。

元画像の(350,29)から900×507pxの光の壁を切り出し、720×406pxへ比例縮小。実装の1425×891pxを720×450pxへ比例縮小し、1440×450pxの比較画像に並べた。元画像側の下端には背景色の余白を追加し、縦横比を変形していない。

拡大比較では、元画像の270×180pxと実装の300×230pxをそれぞれ幅540pxへ比例拡大。現物の点光源の形と、実装のスプライト画像による中心・余韻を確認した。

| CSS viewport | スクリーンショット寸法 | 確認内容 |
| --- | --- | --- |
| 1440×900 | FV 1425×891 | 98点、中央の輝度抑制、文字とナビ、Works交互配置、Skills3列 |
| 通常表示1221×616 | About/Contact 1206×608 | アンカー位置を安定させて撮影。本文・Contact・Gmailの視認性 |
| 375×812 | FV/Contact 360×780 | 49点、名前2行、メニューの収まり、Works1列、Skills2列 |
| 768×1024 | FV 753×1004 | 98点、Works1列、Skills3列、動的な点数切替 |

各幅でdocumentのscrollWidthとclientWidthの差は0。375pxのWorksは、ブラウザーの全ページ画像360×4651pxからY=812の領域を切り出した。全ページ出力は通常のviewport撮影と高さの変換が異なるため、CSS scrollHeightと実際の出力寸法を使い、画像の変形をしていない。Contactは実際に末尾までスクロールし、見出しと本文のReveal後に別途撮影した。

## 必須5項目の評価

| 項目 | 結果 |
| --- | --- |
| 字体と文字 | 既存Jostと日本語フォントを維持。FVの名前、ナビ、Works、Skills、About本文、Contactが読める。光点は文字の背後の最高光量を抑制 |
| 余白・配置 | FVの100svh、Worksの左右交互/1列、見出し→本文の合計40〜64pxを維持。cueは既存の間隔へ収めた |
| 色とトークン | FVを#111315へ深めた。白地セクションのpaper/inkは維持。Contactの親opacity0.42で光量を減らした |
| 画像と素材 | 生成された透明ビットマップを反復。中心の白コアと冷白色ハローが参照と同じ方向。実績画像4枚は読み込み成功し、光のレイヤーを重ねていない |
| 内容 | TAISEI FUNASAKA、実績3件、Skills8件、About、Gmailを維持。番号・jQueryの再追加なし。サイトへ音楽や映像を埋め込んでいない |

## 動き・操作・技術確認

- 光の列が順に明るくなって消え、別の位相で中央から外側へ広がる。コアの位置は固定し、急速なストロボ点滅を使わない。
- FVを離れた実画面でheroのplaybackがpaused、Contactの画面でcontactがplayingになることを確認。光点のopacityが時間とともに変化することを読み取った。
- 見出しのcueは表示後にcompleteとなり、再入場でも再開しない。
- 通常の表示幅でWorks・Skills・About・Contactのアンカーナビを操作。公開詳細へのhrefとGmailのmailtoを確認。メールアプリの起動は実行していない。
- 375→768pxで可視点が49→98へ切り替わり、GSAPの再構築後もconsole error/warningは0件。
- reduced-motion、IO不在、タブ非表示、描画省略、完了cue、cleanup、SP可視点数は実コードを使うNode VMの制御試験9件が成功。GSAP/DOM/IOのstubを使うため、OSの実設定切替やエンジン描画の実ブラウザー試験と区別する。
- JS無効時は静止光と本文を表示する既定CSS、reduce時はtimelineを生成しない分岐をコード確認。強制カラーでは装飾を隠す。aria-hidden/pointer-events:noneにより操作と読み上げを妨げない。
- `build:wp`、JS ESLint、SCSS Stylelint、PHP5ファイルの構文検査、Prettierが成功。

## Findings・比較履歴

今回の比較で、修正が必要なP0・P1・P2の視覚差異はなかった。MVより少ない98/49点、中央の低い輝度、約18秒のゆっくりした周期は、ポートフォリオの文字・作品を読めるようにする意図的な調整。

初回の撮影ではviewport変更直後とアンカー操作に伴う再計算中にスクロール位置が先頭へ戻る状態を観測した。撮影・viewport操作との関係は原因未特定。通常幅へ戻して位置が安定したAbout/Contactを撮影し、スマホは全ページのWorks領域と末尾へスクロールしたContactを採用した。先頭が写っていた試行画像は証跡として採用していない。実機のスクロール・OSのmotion設定切替は今回の確認範囲外。

初期実装の修正履歴は`doc/portfolio-design-qa-initial.md`を参照。この改修はレイアウトの変更ではなく、承認された光のモチーフの置換。

## 実装チェックリスト

- [x] 実ビットマップの光源・PC/SP配置・控えめな本文cue
- [x] 画面外停止・タブ非表示停止・cleanup・静止fallback
- [x] source/実装の同一比較入力と拡大比較
- [x] 375/768/1440pxの収まり・画像読み込み・通常幅の導線
- [x] ビルド・構文・静的検査・制御試験・console確認

## 検証上の制約・次の調整

実機Safari、実端末、OSのreduced-motion/JavaScript無効/強制カラーの切替試験は未実施。制御試験とCSS/分岐の確認をその代わりと称していない。光量と周期はユーザーがプレビューを見て好みに合わせて調整できる。今回のP3修正要求はなし。
