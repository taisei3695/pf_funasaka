# ファーストビュー → About：夜のステージ案

final result: passed


## 対象と比較条件

- 対象：既存WordPressテーマのトップページ、ファーストビューからAboutまで。ローカルのみ。
- 実装URL：http://localhost:8888/
- 視覚的な参考：https://bumpofchicken-30th.com/ の球体とスクロール接近。THE FIRST TAKEの文字と余白、MWAMの黒白のコントラスト。
- source visual truth path：`C:/Users/oyaji/Desktop/pf_funasaka/work/design-references-20261017/bump-top.png`
- 接近後の参考：`C:/Users/oyaji/Desktop/pf_funasaka/work/design-references-20261017/bump-scroll-zoom.png`
- implementation screenshot path：`C:/Users/oyaji/Desktop/pf_funasaka/work/intro-design-20261017/hero-desktop.png`
- 実装の状態：ページ先頭。比較用の球体を一時停止して撮影し、その後再生を復帰。
- 全体比較：参考画像と実装画像を同じブラウザー出力に並べて目視比較。両方1280 × 720ピクセル、CSS viewport 1280 × 720、画像密度1倍。拡大縮小による正規化なし。
- 参考は模写対象ではなく構図・奥行き・動きの参考。アーティスト名・ジャケット画像・球体の意匠は流用しない。氏名、職種、青白い粒子、左右配置は合意済みのポートフォリオ向け変更。
- 実装にはログイン中のWordPress管理バーがある。参考にはないため、上端32pxは忠実度の判定対象外。
- 日本語本文と見出しはAboutの追加画面で可読性を確認。全体画面で読めるサイズなので別の切り抜き比較は不要。

## 画面の証拠

保存先：`C:/Users/oyaji/Desktop/pf_funasaka/work/intro-design-20261017/`

| ファイル | 状態 |
|---|---|
| hero-desktop.png | PC先頭、1280 × 720、球体と氏名を左右に配置 |
| scroll-zoom.png | PC、スクロール進捗0.48、球体に接近 |
| about-desktop.png | PC、About到達、球体が薄くなり本文を表示 |
| hero-mobile.png | スマートフォン幅375 × 812、球体を上部に配置 |
| about-mobile.png | スマートフォン幅375 × 812、経歴を縦に表示 |
| hero-tablet.png | タブレット幅768 × 1024、球体を右側に配置 |

別途320 × 740でも氏名とナビゲーションを目視確認し、DOMで横方向のはみ出しがないことを確認。

## 必須の比較項目

1. **書体・文字**：既存のJostとNoto Sans JPを使用。氏名を大きくし、職種と日本語説明を静止したHTMLで表示。スマートフォンの職種は11pxへ調整。Aboutの学校名、勤務期間、担当内容は維持。
2. **間隔・構成**：黒い空間に球体を一つ配置。PCは氏名を左、球体を右、スマートフォンは球体を上に配置。Aboutは直下に続き、PCはプロフィールと経歴の2列、スマートフォンは1列。320/375/768/1280px幅で横スクロールなし。
3. **色**：背景#050911、本文#eef4ff、補助文字#a5b3c9、アクセント#83b4ff。参考の黒白の関係を青白い光へ置き換え、Aboutでは光を減らして可読性を確保。
4. **描画品質**：ユーザーがWebGL表現を指定したため、球体はthree.jsと独自シェーダーによる実際の3D描画。画像やCSSの代替図形ではない。参考の写真素材は不使用。PCで32,000点、スマートフォン初回表示では18,000点。
5. **内容**：Aboutの既存の事実関係を維持。球体の説明や実装技術名をサイト本文に追加しない。音声は再生せず、実際の音声解析を行っているという表記もない。

## 修正と再確認の履歴

- 初回観察：粒子が暗く、形を読み取りにくかった。点のサイズ、色、明るさを修正。最終hero-desktop.pngで球体の輪郭と波状の模様を確認。
- 初回スマートフォン観察：球体が氏名の位置へ重なりすぎた。カメラを離し、球体の中心を上へ移動。hero-mobile.pngと320px幅の再確認で、氏名の可読性を確認。
- 初回About観察：接近後の球体が本文の背後で明るすぎた。減光を早め、about-desktop.pngとabout-mobile.pngで本文が主役になることを確認。
- 管理バーの高さと画面高さが一致せず、一部操作が下端へ押し出された。32/46pxの管理バー高さを反映し、初期画面内に停止ボタンを収めた。
- タブレット境界：スクロールバーを除くキャンバス幅とCSSのブレークポイントの判定差を修正。hero-tablet.pngでPC側の構図と球体位置を再確認。
- 上記の修正後、対応が必要なP0/P1/P2の問題は残っていない。

## 機能と実装確認

- PCで停止・再開ボタンを操作し、ラベル、aria-pressed、描画状態が切り替わることを確認。
- SCROLL TO ABOUTから遷移し、About見出しにフォーカスが移ることを確認。
- 自然なページスクロールを維持。キャンバスのレイヤーはpointer-events:noneで、ホイールを横取りしない。
- スクロール進捗0.00 → 0.48 → About到達0.91を観察。カメラの接近と減光を画面で確認。
- Worksまで移動した際に描画状態がoffscreenとなることを確認。
- 制作実績の詳細ページへ移動し、戻った際にキャンバスが1つだけ復帰することを確認。
- ブラウザーログでWebGL・JavaScriptのエラーなし。
- ESLint、Stylelint、Prettier、変更PHP3ファイルの構文検査、ViteのWordPress向けビルドが成功。
- three.js 0.186.1をYarnで追加。ホームページの描画モジュールは動的読み込み。初回案の描画モジュールは約521kB、gzip約131kB。追加コストを含む性能スコアの再測定は未実施。
- prefers-reduced-motionでは回転・ポインター反応・カメラ接近を止め、静止描画にする実装。非表示タブ・画面外で描画停止、ページ離脱時にGPUリソースを解放。

## 限界・次の確認

- 確認ブラウザーはCodexのChromium系ブラウザー。スマートフォンは幅のエミュレーションであり、実機の描画速度や電池消費は未測定。
- Safari/Firefox、OSの動きを減らす設定、強制カラー、WebGL非対応・コンテキスト喪失時は実ブラウザーでの切り替え試験をしていない。フォールバック処理はコードで確認。
- Lighthouse/PageSpeedの点数向上は保証・測定していない。今回の目的はローカルの動くデザイン案。
- 初回案ではWorks以降の白背景を維持していたが、以下の追加修正で全体を黒ベースに統一した。

## 追加修正：大きな実体のある球体・強い接近・全体の黒ベース化

final result: passed

### 比較と証拠

- 要求：球体を大きく、接近を分かりやすく、球体の立体感を強め、サイト全体を黒ベースにする。ローカルのみ。
- source visual truth path：`C:/Users/oyaji/Desktop/pf_funasaka/work/intro-refinement-20261017/before-hero.png`
- implementation screenshot path：`C:/Users/oyaji/Desktop/pf_funasaka/work/intro-refinement-20261017/hero-desktop.png`
- 両画面を同じブラウザー出力に並べ、1280 × 720px、CSS viewport 1280 × 720、1倍密度、スクロール先頭で比較した。画像の拡大縮小なし。どちらも32pxの管理バー付き。
- 拡大接近の証拠：`zoom-desktop.png`。スクロール進捗0.42で球体が大きく画面からはみ出す状態を目視確認。さらに0.77まで接近した後、Aboutで減光することを確認。
- 全体の黒ベースの証拠：同フォルダーの `works-black.png`、`cards-black.png`、`detail-black.png`、`contact-mobile.png`、`privacy-black.png`。
- スマートフォンの証拠：同フォルダーの `hero-mobile.png`、`about-mobile.png`。375 × 812 CSS px、1倍密度。氏名・職種・経歴を読めることと、横スクロールがないことを確認。

### 表現と配色

- 粒子の外形の揺れを抑えて真球に近づけ、黒い球面にMeshPhysicalMaterialを使用。白いキーライト、青い縁の光、薄い外周光、表面の粒子を重ねた。
- PCの初期カメラ距離を6.7から6.1へ、球体半径を約1.48から1.64へ変更。接近時はカメラ距離2.7まで移動する。
- 接近が十分見えるよう、減光開始を進捗0.18から0.52へ後ろにずらした。About到達時には薄くなり本文を維持。
- スマートフォンは接近中も球体の画面内の中心位置を維持するよう、縦位置を見える範囲に連動させた。
- 全体背景#030405、本文#edf2f7、補助文字#a3adb9、カード#0b0e12、タグ#121820、青白アクセント#9bc8ff。本文・タグ・担当情報は明るさを分けて維持。
- 書体、余白、投稿内容、掲載順、件数、画像そのものは維持。変更は球体の描画と色の統一に限定。

### 再確認

- 停止・再開、aria-pressed切り替え、About/Works/Contactへのリンクが動作。
- 制作実績詳細から戻った後も球体が復帰。追加した球面・外周光のGeometry/Materialもページ離脱時に解放する。
- Works/カード/詳細/固定ページの文字が黒背景で読めることを確認。サンプル色の計算上、本文約18.2:1、補助文字約8.5:1。サイト全体のアクセシビリティ適合判定ではない。
- 追加修正後のWebGL/JavaScriptエラーなし。ESLint、Stylelint、Prettier、WordPress向けViteビルド成功。
- 描画モジュールは約532kB、gzip約133kB。実機のGPU負荷と電池消費は引き続き未測定。
- 初回のスマートフォン接近では球体の中心が上に逃げるため、見える高さに応じた位置へ補正。最終コードで修正し、Aboutの可読性も再確認した。
- 対応が必要なP0/P1/P2の問題は残っていない。表面の光沢の強さは好みに応じたP3の調整候補。

## 最新の追加修正：中央寄せ・長い接近・大きな粒子・球体を維持

final result: passed

- 要求に合わせ、PCの横位置を画面の約74%から約64%へ移動。粒子の大きさを約1.6倍にし、均等に並んだ点が見える明るさへ調整。光沢の強い白いハイライトを抑えた。
- 粒子の重なりを抑えるためPC16,000点、スマートフォン初回9,000点へ変更。真球の表面に点を配置する方式と球面による奥側の遮蔽は維持。
- heroを260svhの区間内でstickyにし、約160svhをかけて接近する。1280 × 720の実測では区間1,872px、hero688px、接近距離1,184px。スクロール進捗0.37/0.79の両方でhero上端0pxを確認。従来の接近距離は約605pxで、約2倍の区間。
- 球体のフェードを削除し、Aboutでも描画を維持。本文には黒の半透明パネルを重ねる。スマートフォンはパネル内余白を16pxへ調整して文末だけの折り返しを避けた。
- Aboutへのリンクによる演出のスキップと見出しへのフォーカス、停止・再開を確認。WebGL失敗時やJavaScriptなし、reduced-motion/forced-colorsでは長い空白区間が残らないCSSを用意。
- スクロール区間はWebGL初期化成功後、最初のレイアウト測定前に成立させる。新しいjourneyも既存ResizeObserverで監視し、離脱時はdisconnectする。

### 視覚比較と画面の証拠

- source visual truth path：`C:/Users/oyaji/Desktop/pf_funasaka/work/intro-refinement-20261017/hero-desktop.png`
- implementation screenshot path：`C:/Users/oyaji/Desktop/pf_funasaka/work/sphere-journey-20261017/hero-desktop.png`
- 両画像を同じ比較出力に並べて確認。両方1280 × 720px、CSS viewport同寸、密度1倍、先頭状態。密度補正なし。
- 同フォルダーの `journey-middle.png`（進捗0.37）、`journey-near.png`（0.79）で、文字を留めたまま点が拡大していくことを確認。
- `about-sphere-desktop.png` と `about-sphere-mobile.png` で球体を残したAboutと本文の可読性を確認。`hero-mobile.png` は375 × 812pxの初回読み込み。
- 書体・文言・全体の黒い色は維持。中央寄せと接近範囲、点の表現、About本文パネルを今回の意図的な変更として比較した。全体画面で文字と粒子が確認できるため追加の切り抜き比較は不要。

### 確認結果

- PCおよび375px幅で横スクロールなし。Aboutまで進捗1.00、renderer=three、playingを維持。
- 本文パネルの幅によるスマートフォンの不自然な改行を修正し、再撮影して確認。
- WebGL/JavaScriptエラーなし。ESLint/Stylelint/Prettier、front-page.phpのPHP構文、WordPress向けビルドが成功。
- 実機負荷、Safari/Firefox、OSの動きを減らす設定とWebGL喪失の実操作試験は未実施。該当分岐はコードで確認。
- 対応が必要なP0/P1/P2の問題は残っていない。球体はintro区間（heroとAbout）の背景として維持し、Works以降へ進むと区間とともに画面外へ出る。

## 最新のUI整理：演出停止ボタンとスクロール案内を削除

- ユーザーの指定により「演出を一時停止」ボタンと「SCROLL TO ABOUT」リンクを削除。
- 手動停止用のイベント処理と未使用CSSも削除。OSの動きを減らす設定、画面外・非表示タブでの停止、スクロール接近は維持。
- ローカルのDOMで対象2要素が0件、threeによる描画がplayingで継続することを確認。
- ESLint、Stylelint、Prettier、WordPress向けビルドが成功。

final result: passed

## 最新の内容整理：実務優先の掲載順とカードの状況

- Aboutの趣味表記を `Music / Rock / Instruments / PC / Gadgets` に変更。
- トップ → About → 実務Works → Experience → Skills → 学習・自主制作 → Contactへ変更。学習・自主制作は独立したH2、カードはH3とした。
- 実務Works 4件、Experience 4件、学習・自主制作2件の計10件を維持。既存の並べ替え順を使う抽出処理・保存キーは変更していない。
- 共通カードに登録済みの `works_status` を「状況」として表示。空欄の場合は行を出さない。管理画面の項目説明と運用ガイドも更新。
- 実務Worksの状況は順に「納品完了」「納品完了・公開中」「納品完了・公開中」「継続中」。和菓子店の担当はアップデート・バックアップ・掲載情報の更新のまま、未確認のコーディング担当や成果は追加していない。
- Works・Experience・学習・自主制作の各末尾から制作実績一覧へ進める。
- localhost:8888のDOMでセクション順、件数、状況、空欄の非表示を確認。1280pxおよび375px幅で横スクロールなし。375pxで学習見出しは28px、状況の文字もカード幅内に収まる。
- PHP構文、Stylelint、Prettier、ACF JSON検証、WordPress向けViteビルドが成功。確認用ブラウザーでJavaScriptエラーなし。
- 画像の証拠：`work/content-order-20261017/works-maintenance-desktop.png`、`study-mobile.png`、`works-status-mobile.png`。
- 変更はローカルのテーマと説明文のみ。本番への接続・データ更新は行っていない。

final result: passed

## 最新の不具合修正：球体がWorksの文字より前に重なる

- 修正前はIntro下端が画面の64px位置まで移動しても、負の下マージンを持つsticky stageの描画が688pxまで続き、Worksの見出し・説明文を遮っていた。`isolation` は描画範囲を制限しない。
- Introに `overflow: clip` を追加し、球体の描画をトップ〜Aboutの境界内に制限した。スクロールコンテナーを作る `overflow: hidden` や、Worksだけのz-index引き上げは使用していない。
- 同じ1280 × 720px・scrollY 3139pxで修正前後を比較し、Worksの見出し・説明文・カードに球体が重ならなくなったことを確認。Introの残り部分だけは上端64pxまで表示される。
- Heroのsticky上端0px、スクロール進捗0.50、renderer=three / playback=playingを確認。About進入時にも球体を維持し、従来の文字・本文パネルを表示する。
- 375 × 812pxでもWorksの本文・カードを遮らず、横スクロールなし。確認タブのJavaScriptエラーなし。
- Stylelint、Prettier、WordPress向けViteビルド成功。変更はローカルのSCSSのみで、本番・DBへの変更なし。
- 証拠：`work/sphere-stacking-20261017/works-before.png`、`works-after-desktop.png`、`works-after-mobile.png`、`hero-sticky-after.png`、`about-after.png`。
- reduced-motion / forced-colorsの既存分岐は変更していない。各OS設定とSafari / Firefoxの実操作試験は今回未実施。

final result: passed

## 最新の指定変更：球体をページ全体の背景として維持

- 最新のユーザー指定に合わせ、球体をAboutで切らず、Works・Experience・Skills・学習・自主制作・Contactまで共通の背景として維持した。
- front-page.phpの球体ラッパーをContactの後まで延長。背景stageはz-index:0、journeyと各本文セクションはz-index:1に分けた。stageのpointer-events:noneを維持し、リンク操作を妨げない。
- About以降の各セクションに65%の黒を重ね、球体を見せながら補助文字も読めるようにした。実績カードの背景は不透明のままとし、球体が画像や本文の上に出ない。
- 従来のIntro内の見出し指定をAboutだけに限定し、Works以降の文字サイズ・余白が変わる副作用を避けた。セクション順と計10件のカードを維持。
- 接近処理・進捗計算・描画停止処理のJavaScriptは変更していない。拡張したラッパーを既存のIntersectionObserverで監視するため、Works・Contact到達時もrenderer=three / playback=playingを確認。
- 1280 × 720px、375 × 812pxで球体が背景に残り、文字とカードが前面にあることを確認。横スクロールなし。カードから詳細へ進み、戻った後も描画が復帰し、確認タブのJavaScriptエラーなし。
- Contactの既存照明も維持し、不透明背景は共通の半透明背景で上書き。球体と照明が同時に動く区間の実機GPU負荷は今回未測定。
- PHP構文、Stylelint、Prettier、WordPress向けViteビルド成功。本番・DBは変更していない。
- 証拠：`work/persistent-sphere-20261017/works-desktop.png`、`works-mobile.png`、`contact-desktop.png`。

final result: passed

## 最新の指定変更：Works以降のセクション背景を透明化

- Works・Experience・Skills・学習・自主制作・Contactの背景を65%の黒からtransparentに変更。文字とカードの前面配置は維持。
- localhostの各セクションの算出背景色がすべてrgba(0,0,0,0)、z-indexが1であることを確認。1280 × 720pxで球体が減光されず背景に見えることを確認した。
- Stylelint・Prettier・WordPress向けビルド成功。確認タブにJavaScriptエラーなし。ローカルのSCSSのみ変更し、本番・DBへの変更なし。
- 証拠：`work/transparent-sphere-20261017/works-desktop.png`。

final result: passed

## 最新の演出追加：トップ全体のスクロール表示

- 参照URL：`https://bumpofchicken-30th.com/history/`。実ブラウザーで、画面へ入る文字の下からの表示と画像の展開を確認し、`work/scroll-reveal-20261017/reference-history.png` に記録した。既存の黒い配色・球体・透明背景に合わせ、小さな上移動とフェードを採用。
- ホームのAbout 12、Works 39、Experience 42、Skills 19、学習・自主制作17、Contact 2、フッター1の計132ブロックを対象化。見出しとファーストビューの名前は既存演出を維持し、sticky親・section全体・球体を新しい変形対象にしていない。
- カードは画像・タイトル・概要・担当/期間/状況・技術・リンクを別々に表示。Skillsは従来の一覧全体の一括再生をやめ、各項目の画面位置に連動させた。ホームの従来js-fade-upと重複させず、詳細ページの既存画像演出は維持。
- 対応ブラウザーはnative view timeline、未対応は既存GSAP/ScrollTriggerのscrubを使用。新しい依存ライブラリーなし。JavaScriptなしでは通常表示し、reduced-motion / forced-colorsでは新しい表示演出を適用しない。
- 一度表示が完了した要素はWeakSetに記録して再非表示を避ける。逆スクロール境界のanimationendは進捗1を確認しない限り表示完了にしない。フォーカスしたリンクやその親ブロックは即時に表示する。
- 初期検証でカード/Contactのoverflow:hiddenがnative timelineの参照スクロール範囲を変えることを検出。ホームではoverflow:clipへ変更し、ページのスクロールに連動させた。画像枠と概要自身のクリッピングは維持。
- 1280 × 720px、初期scrollY=0では132ブロックすべて待機、画面外のカード画像opacity=0を確認。Worksのタイトルはスクロールでopacity 0 → 約0.69 → 1、shownへ変化した。
- 375 × 812pxでWordPressの項目がopacity 0 → 約0.52 → 1になり、逆に戻してもshown/opacity1を維持。下方のC#は到達前にopacity0で待機することを確認。
- キーボード操作で未表示リンクと次の一覧CTAが即表示されることを確認。最下部では132ブロックすべて表示完了し、Contactリンクとフッターはopacity1。横スクロールなし。
- 詳細ページへのリンクと戻る操作を確認。戻った後も球体はrenderer=three / playback=playing、カード計10件、画面内上部で完全に隠れたリンク0件。確認タブのJavaScriptエラーなし。
- ESLint・Stylelint・Prettier・WordPress向けViteビルド成功。native非対応ブラウザーとOSの動きを減らす設定の実操作は今回未実施で、分岐と後始末をコードで確認した。
- 証拠：`work/scroll-reveal-20261017/works-entering-desktop.png`、`works-revealed-desktop.png`、`skills-mobile.png`、`contact-footer-mobile.png`。
- ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の対象拡張：カードの枠と全テキストの個別表示（2026-10-17）

- 最新の「カードやテキスト全てに適用」の指定に合わせ、トップの対象を132ブロックから288要素へ拡張した。制作実績カード・Skills・Aboutパネル・経歴行・強みの枠を含む28要素は、内部テキストより短い範囲でopacityのみ変化させる。
- 見出し、経歴の期間と説明、カードの項目名と値、各技術タグ、Skillsの分類・技術名・経験年数・経験区分・説明文を個別の表示対象にした。ホームのH2は旧GSAP文字演出との重複を避け、同じスクロール表示へ統一。ファーストビューの名前の既存演出は維持する。
- stickyの親・背景stage・球体には表示用transformを追加しない。球体を背景に残す構造、透明なセクション背景、掲載順、カード計10件を維持した。親枠は移動させず、内部テキストの移動が二重にならない構成とした。
- 1280 × 720pxでカード枠がopacity 0から1へ変化し、画面外の内部見出しは待機することを確認。カード内の担当・制作期間・状況の各ラベルと値も個別に表示完了した。メイン本文のp/h2/h3/h4/dt/dd、技術タグと強みのliに対象漏れがないことをDOMで確認。
- 375 × 812pxでHTMLの枠とテキストは表示完了し、CSS内の各テキストは画面位置に応じて約0.30〜0.85のopacityで進行、次のJavaScriptはopacity0で待機することを確認。両幅で横スクロールなし。
- キーボードで下方のリンクへ進んだ際、親カードとリンクの双方がshown/opacity1となることを確認。最下部で全288要素のpendingが0、フッターopacity1、確認用タブのJavaScriptエラー0件。表示完了した要素を戻りスクロールで再非表示にしない既存仕様は維持。
- ESLint・Stylelint・Prettier・WordPress向けViteビルド成功。別エージェントの読取レビューでも、親子の二重移動、animation名の判定、focus時の復元、cleanupに阻害する問題なし。native非対応ブラウザーとOSの動きを減らす設定の実操作試験は未実施で、既存分岐をコードで確認した。
- 証拠：`work/all-elements-reveal-20261017/cards-desktop.png`、`work/all-elements-reveal-20261017/skills-mobile.png`。ブラウザーの一時表示幅を解除し、ユーザーのlocalhostタブを再読み込みして288対象・カード10件を確認した。
- ローカルのテーマとQA記録のみ変更。本番・DBには触れていない。

final result: passed

## 最新の演出強化：文字の立ち上がりと画像のカーテン表示（2026-10-17）

- ユーザー指定の https://bumpofchicken-30th.com/history/ を実ブラウザーで確認。文字をクリップした領域から下から表示する構成と、画像が現れる流れを参考にし、既存の黒い配色・球体へ合わせた。参考画面は `work/cinematic-scroll-20261017/reference-history.png` に保存。
- 一律の28pxフェードを、要素の役割に応じた6種類へ変更。英字H2は既存の文字分割処理を再利用し、文字ごとの上移動・小さな回転を時間差で表示する。日本語H2は分割せず、自然な折り返しを維持してマスクを開く。
- カード画像はクリップの幕開きと1.04倍からの縮小、本文は32pxの上移動、技術タグは16pxの上移動と4個単位の順次表示。本文のopacityは進捗45%で1とし、カード枠は短いopacityだけの表示を先行させる。画像の既存hover用img transformは上書きしない。
- native view timelineを優先し、H2の子文字にはH2を参照するnamed view timelineを使用。未対応環境では既存GSAPのscrubタイムラインで役割別に再現する。完了判定のanimation名を各種類へ同期し、focus時の親子表示とcleanupでの元DOM・aria-label復元を維持。
- 対象は引き続き288要素（枠28、英字見出し5、画像10、技術タグ46、本文198、日本語見出し1）。球体・sticky親・section自体への新しいtransformは0件。掲載順とカード10件、透明背景は維持し、DBは変更していない。
- 1280 × 720pxでWorksの文字ごとにopacity約0.99/0.91/0.55/0/0と変化し、表示完了後は全字transform:noneを確認。Experienceの10文字すべて表示完了、読み上げ用の見出し名も維持。画像は途中のclip inset約3.14%/2.51%/28.27%から、表示完了後clip:none・transform:noneへ戻る。
- 375 × 812pxでWorks、画像、本文の表示と横スクロールがないことを確認。日本語の学習見出しは分割0、幅320px、clip:noneで表示完了。画像リンクへのTab移動時も、画像のクリップと親カードの非表示が解除され、リンク操作できる。
- 最下部で288要素すべて表示完了、pending0、Contactの全文字transform:none、フッターopacity1。PC・モバイル確認タブのJavaScriptエラー0件。未対応ブラウザー・OSのreduced-motion/forced-colorsの実操作試験は未実施で、既存分岐をコードレビューした。
- ESLint、Stylelint、Prettier、WordPress向けViteビルド成功。別エージェントの統合レビューでも、演出名・親子の完了処理・focus・cleanupに阻害する問題なし。
- 証拠：同フォルダーの `heading-entering-desktop.png`、`image-curtain-desktop.png`、`cards-desktop.png`、`works-mobile.png`。変更はローカルのみ。本番へ接続・反映していない。

final result: passed

## 最新の演出調整：画面中央まで続く動きと球体のカーソル追従を削除（2026-10-17）

- 「もっと分かりやすく」という指定に合わせ、画面下端で早く完了していた範囲を延長。英字見出しの文字は145%の上移動と8度からの回転で表示し、cover12〜54%まで画面内で動きを継続する。日本語見出しは96px、本文は52px、技術タグは28pxの移動へ変更。
- 制作実績10件とSkills12件を新しいcard種別へ分け、108pxの上移動と0.94倍からの拡大を追加。枠は早めに不透明になり、画像・本文が続く。Aboutパネルや経歴行など6つのframeはopacityだけを維持し、sticky親やsection、球体には表示用transformを付けていない。
- 画像は中央の細い窓から全面へ開き、1.12倍・60px下から通常位置へ収まる。nativeとGSAPの演出プロフィール、開始・終了範囲を同期。完了後はtransform/clipが通常状態へ戻り、focus時は動く親カードも復元する。
- `_portfolio-intro-scene.js` のpointermove登録・解除、ポインター座標と補間値、回転へのカーソル反映を削除。球体の自動回転、スクロール接近、固定位置、描画停止・復帰は維持。intro関連および他のクライアントJSにpointermove/mousemove参照がないことを確認した。
- 1280 × 720pxでWorks見出しが上端500pxに入っても文字ごとの移動が約10〜54px残り、順次立ち上がることを確認。カードの初期値はmatrix(.94,0,0,.94,0,108)、進入時は約.992倍/14pxとなり、完了後はtransform:none。画像も表示完了後clip:noneとなる。
- 375 × 812pxでカードが約.984倍/29pxの移動途中、画像もクリップ途中となることを確認。PC・モバイルで横スクロールなし。球体はrenderer=three / playback=playing / progress=1を維持。
- 検証で最下部のContactだけ3要素が未完了になることを検出。Contact専用の短い範囲（本文cover4〜24%、見出し親4〜40%、文字は4〜24%に各文字の差を追加）へ調整した。再読み込み時に3要素すべてpendingである状態から下へ進み、最下部で288要素すべて表示完了、pending0、Contact本文・リンク・全文字transform:noneを確認。
- 画像リンクへのTab移動でも、親カードのtransformと画像のclipが解除されることを確認。確認用タブのJavaScriptエラー0件。OSのreduced-motion/forced-colorsとnative非対応環境の実操作試験は未実施で、既存の無効化分岐・GSAPフォールバックを維持した。
- ESLint、Stylelint、Prettier、WordPress向けViteビルド成功。証拠は `work/strong-scroll-20261017/heading-desktop.png`、`cards-entering-desktop.png`、`image-opening-desktop.png`、`works-mobile.png`、`contact-mobile.png`。
- ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新のヘッダー調整：coldrainを参考にしたグラデーション線のホバー（2026-10-17）

- https://coldrain.jp/ のヘッダーナビゲーションを実ブラウザーで確認。NEWSのhover時に文字色が白の60%となり、下部の2pxの青緑グラデーション線がopacity0から1へ変化することを算出スタイルと画面で確認した。フォーカスの枠はホバー効果と区別し、文字の入れ替えや移動は参考に含まれていない。
- 参考の線を球体の色に合わせた淡い青（#9bc8ff）へ変更し、ヘッダーのブランドとナビゲーションへ適用。opacity0から1、scaleX(.45)から1へ中央から広がり、文字はmuted色となる。光のdrop-shadowも薄く加えた。
- ヘッダーの従来のopacity.65と、共通の下線・ストロボの軌跡からヘッダーを除外し、二重の演出を防いだ。他の本文・カード・フッターの既存リンク表現は維持。変更はSCSSのみで、HTML・JavaScript・保存データ・URLの変更はない。
- キーボードのfocus-visibleではアクセント色・光の線・従来の2pxアウトラインを表示。reduced-motionは子の線もtransition:none、forced-colorsはCanvasText/LinkTextで静的に表示する。重複テキストを作成していないため読み上げ内容も変わらない。
- 1280 × 720pxで通常状態の線はopacity0/scaleX.45、Worksのhover時はhover=true・focus-visible=falseで線opacity1/scaleX1、文字# a3adb9、リンク自体のopacity1を確認。旧::beforeのcontentはnone、旧ストロボanimationもnone。ホバーを外すと線opacity0へ戻る。
- Tab操作でExperienceへ移動し、focus-visible=true・文字アクセント色・2pxアウトライン・線の表示を確認。375 × 812pxでナビ全項目の高さ44px、幅44px以上、横スクロールなし。スクロール表示の対象288要素も維持。
- Stylelint・Prettier・WordPress向けViteビルド成功。確認用タブのJavaScriptエラー0件。別エージェントのスタイルレビューで、セレクター優先度、既存演出との重複、フォーカス、静的表示への分岐に阻害する問題なし。OSのreduced-motion/forced-colorsの実操作試験は未実施。
- 証拠：`work/header-hover-20261017/reference-hover.png`、`hover-desktop.png`、`focus-mobile.png`。変更はローカルのみで、本番・DBには触れていない。

final result: passed

## 最新のリンク調整：ヘッダーと共通の光の線をサイト全体へ適用（2026-10-17）

- `_p-portfolio-links.scss` に公開側の共通ホバーを集約。ヘッダー・main・フッター内の `a[href]` を対象に、文字のmuted色への変化と、淡い青の線が中央から広がる演出を適用した。WordPress管理バーは対象外。
- カード画像・詳細リンク・一覧CTA・Contact・パンくず・戻るリンク・ページ送りを共通化。旧下線・ストロボ・画像拡大・矢印移動などの競合を整理し、ボタンの形状や静的な矢印は維持した。
- 本文・カードタイトルなどのインラインリンクは背景グラデーションと `box-decoration-break: clone` を使用し、自然な折り返しを維持。本文の通常下線はhover/focusで透明に切り替え、重複した線を出さない。画像リンクには下端の光を表示する。
- キーボードではアクセント色・光の線・既存の2pxアウトラインを表示。reduced-motionは即時切り替え、forced-colorsはシステム色による静的表示を維持した。OS設定を切り替えた実操作試験は未実施で、コードと別エージェントのレビューで分岐を確認した。
- 1280 × 720pxでカード画像・タイトル・詳細・一覧CTA・Contact、制作実績詳細のパンくず・戻るリンク、一覧のページ送りを実操作で確認。hover時の線opacity1・文字muted色・下線border0を確認し、画像の拡大と詳細矢印の移動は発生しない。プライバシーポリシーの「トップページへ戻る」も光の線1本で表示される。
- 375 × 812pxで横スクロールなし。カードの長いタイトルがinlineのまま2行に折り返され、Tab移動でfocus-visible・2pxアウトライン・光の線が表示される。スクロール表示と背景の球体は維持。ローカルデータには本文リンクとフッターのポリシーリンクがないため、その箇所は共通セレクターの適用範囲をコードで確認した。
- Stylelint・Prettier・WordPress向けViteビルド成功。ビルドには既存のThree.jsチャンクサイズ警告があるがエラーなし。確認用タブのJavaScriptエラー0件。
- 証拠：`work/unified-hover-20261017/works-hover-desktop.png`、`card-title-hover.png`、`privacy-back-hover.png`、`focus-mobile.png`。変更はローカルのみで、本番・DBには触れていない。

final result: passed

## 最新の調整：詳細リンクの線を文字幅へ・文字色を明るく統一（2026-10-17）

- 共通カードの「詳細を見る」を専用spanで囲み、光の線をそのspanへ移した。アンカー全幅の疑似要素は抑制し、矢印の下には線を出さない。クリック範囲の幅、44pxの高さ、右寄せ、カード下端への配置、読み上げ用ラベルは維持する。
- 公開側の本文・見出しを `#f5f7fb`、補足・概要・期間・項目名・フッターを `#cbd5e1` へ明るくした。淡い青のアクセント `#9bc8ff` は維持。Aboutの独立した色変数も共通変数へ統合し、Header・Hero・Contactの固定文字色を整理した。
- 共有テンプレートの半透明の補足・placeholderも補足色へ統一。フォームのhoverによる文字全体の減光を抑え、旧技術タグ・リストの白背景と明るい文字が重なる箇所は暗いsurfaceへ補正した。スクロール表示の透明度・球体・レイアウトは変更していない。
- 1280 × 720pxでリンク全幅478.5pxに対し、文字幅と線の幅がともに65px、親の線content:none、hover時の線opacity1を確認。375 × 812pxでも文字幅と線幅65px、クリック高さ44px、Tab時の2pxアウトラインを確認し、横スクロールなし。制作実績一覧でも文字幅の線になる。
- 算出スタイルで見出し・項目値・Contactは新しい本文色、概要・項目名・Skills説明・About本文・フッターは新しい補足色、タグは既存アクセント色を確認。既知の不透明な背景3色に対する補足色のコントラスト比は12.01〜13.82:1。球体や表示途中の透明度を含む全フレームの適合判定を意味しない。
- スクロール表示対象288要素、トップのカード10件を維持。Stylelint・Prettier・WordPress向けViteビルド成功。確認用タブのJavaScriptエラー0件。別エージェントのレビューで線を抑制するセレクターの詳細度を修正し、実ブラウザーでも重複しないことを確認した。
- 証拠：`work/text-contrast-20261017/works-hover-desktop.png`、`focus-mobile.png`。変更はローカルのみ。本番・DBは変更していない。

final result: passed

## 最新の演出調整：スクロールで球体の内部へ進む（2026-10-18）

- BUMP OF CHICKEN 30thサイトをブラウザーで確認し、球体へ接近した後に内側の面が画面を囲む構成を参考にした。既存の青い点の球体を維持し、スクロール区間を260svhから320svhへ延長した。
- カメラを球の手前で止めず、半径1.64の表面を越えて中心付近の距離0.24まで進める連続した経路へ変更。球体の中心も接近に合わせて視線の中央へ寄せ、内部では視野角を42度から58度へ広げる。カーソル追従やスクロール操作の横取りは追加していない。
- 点の法線判定を外向きから内向きへ滑らかに切り替え、内部でも点が消えないようにした。近接した点には深度フェードとサイズ上限を設定し、通過時の急な点滅を抑制。球面の不透明部分と大気光は侵入に合わせて弱め、内部では発光と点の大きさを抑える。
- 1280 × 720pxで外側（距離6.22／progress0）、表面（距離1.62／progress.58）、内部（距離.24／progress1）を確認。逆スクロールで外側の構図へ戻る。内部に入った後も背景の点が残る。
- 375 × 812pxで外側の距離9.10から進行し、progress.86で距離.50、progress1で距離.24となることを確認。横スクロールなし。背景のstageはz-index0、Worksのsectionは1を維持し、文字とカードが手前に表示される。トップのカード10件と既存の表示順は変更していない。
- reduced-motionでは従来どおり外側の静止構図、forced-colorsではcanvasを非表示にする分岐を維持。OS設定の切り替え試験とWebGLコンテキスト喪失の実操作試験は今回未実施で、コードと別エージェントのレビューで確認した。描画の解像度制限、PC最大60fps・モバイル最大30fps、停止・復帰・dispose処理は維持。
- ESLint・Stylelint・Prettier・WordPress向けViteビルド成功。既存のThree.jsチャンクサイズ警告以外にビルドの問題なし。確認用タブのJavaScriptエラー0件。
- 証拠：`work/sphere-entry-20261018/outside-desktop.png`、`surface-desktop.png`、`inside-desktop.png`、`inside-mobile.png`、`works-interior.png`。変更はローカルのみ。本番・DBには触れていない。

final result: passed

## 最新の演出強化：大きな光と内部の奥行き・スクロール表示・画像リンク（2026-10-18）

- 球面の点サイズを大きくし、内部のサイズ補正を0.55から0.95、サイズ上限を18pxから30pxへ変更。外側の初期構図でも点が大きくなる。内部は距離で明るさを変え、球面にわずかな深度差を加えた。球体の内側に疎な点の層（PC320点・モバイル180点）を追加し、球面とは異なる速度の回転・遠近感で奥行きを出した。内部の視野角は58度から68度へ変更。
- 新しい層は内部へ入る時だけ表示され、近接フェードでカメラ通過時のちらつきを抑える。追加したGeometry・Materialは既存の後始末で破棄する。カーソル追従、点の周期的な点滅、スクロールの横取りは追加していない。
- スクロール表示を本文72px、カード144px／0.9倍、画像88px／1.2倍、タグ36px／0.86倍、日本語見出し128px、英字見出し175%／10度へ強化。表示区間も延長した。GSAPフォールバックの位置計算をviewportと要素の未変形の高さから算出し、ネイティブCSSのcover範囲と同期。ContactとFooterの短い完了範囲、focus時の即表示、表示完了後の復元を維持。
- 画像リンクは6%の拡大、0.85秒で一度だけ斜めに通過する光、青い内枠を共通化。スクロール表示は親リンクのtransform、ホバーは画像の個別scaleを使い分けた。NDAの「イメージ画像」ラベルは装飾より上に表示。本文を含む旧カードは画像の枠だけを装飾し、ページ遷移時は拡大と光を解除する。
- 1280 × 720pxで大きな外側の点と内部の描画を確認。カード進入時にscale.940／Y86px、画像のclipが約26〜28%残り、続けてスクロールすると親transform:none・画像clip:noneとなる。ホームと制作実績一覧の画像hoverでscale1.06・内枠opacity1・光のanimationIterationCount1、ラベルz-index3を確認。詳細ページと一覧への戻り操作も正常。
- 「詳細を見る」の線は文字と同じ65px、アンカー全幅の線content:noneを維持。375 × 812pxでも内部の描画が継続し、カード進入中はscale.951／Y70px、画像のclipが残る。Tabで画像へ移動するとoutline2px・内枠・拡大が適用され、親カードと画像のclipは即表示へ復元する。横スクロールなし。
- 現在の掲載データに対する表示対象287要素は、スマートフォン幅の最下部で全件表示完了（pending0）。Contact本文・リンク・フッターはopacity1／transform:none。確認用タブのJavaScriptエラー0件。
- ESLint・Stylelint・Prettier・WordPress向けViteビルド成功。別エージェントのレビューでshaderの入出力・近接処理・破棄処理・ホバーとの分離を確認。実機モバイルのFPS計測、GSAP分岐を使う別ブラウザー、OSのreduced-motion／forced-colors切り替え試験は未実施。静的表示への分岐と既存の描画予算はコードで確認した。
- 証拠：`work/depth-motion-hover-20261018/sphere-outside.png`、`sphere-inside.png`、`cards-entering.png`、`image-hover.png`、`sphere-inside-mobile.png`、`image-focus-mobile.png`。ローカルのみ変更し、本番・DBには触れていない。

final result: passed

## 最新の調整：球体内部で続く前進・Personal Projects・Works表記の統一（2026-10-18）

- 球面を背景に維持し、内部の点をカメラと同じ方向を向く独立した層へ変更。点の奥行きを6単位の範囲で循環させ、スクロールに応じて手前へ流す。カメラが球体内に到達した後も移動量は増え続ける。逆スクロールでは戻り、停止時は前進量が変わらない。
- 移動量はホイールイベントの累積ではなく絶対スクロール位置から算出。途中の再読み込みでも同じ値へ復元する。近端と遠端で透明になってから点を循環させ、再出現のちらつきを抑える。球面の点径・外側の構図は維持し、内部の球面だけ明るさを抑えて前景の点を識別しやすくした。
- 点数はPC640点・モバイル360点の固定数。シェーダー内で位置を更新し、毎フレームの配列更新は行わない。変形後の座標に対する誤ったCPUカリングを無効化。既存の描画上限、停止・復帰、Geometry・Materialの破棄、reduced-motion時の静止構図、forced-colors時の非表示を維持した。
- 「自主制作」の見出し・管理画面選択肢・関連ガイドを「Personal Projects」へ統一し、重複する英語の小見出しを削除。英語用フォントへ変更。一覧見出しは「PROJECTS」から「WORKS」へ変更し、既存の `/works/` と保存済みstudy/personalキーを維持した。DB更新はしていない。
- 1280 × 720pxで内部の移動量が3.090→4.189→3.090と前進・逆行することを確認。進入progressは1のままで前進が続き、スクロール停止時の移動量は3.090で一定。途中再読み込みでも3.090へ戻る。375 × 812pxでは2.953→3.843→2.953となる。どちらもrenderer=three・phase=insideで描画が継続。
- PC・モバイルでPersonal Projects見出しを確認し、横スクロールなし。一覧へのリンクから `/works/` に遷移し、h1=WORKS・canonical=http://localhost:8888/works/を確認。確認用タブのJavaScriptエラー0件。
- ESLint・Stylelint・Prettier・ACF JSON検証・WordPress向けViteビルド成功。既存のThree.jsチャンクサイズ、Browserslistデータ更新の警告のみ。OSのreduced-motion／forced-colors切り替え、実機FPS計測は未実施。別エージェントがシェーダーと座標・循環処理をレビューした。
- 証拠：`work/interior-flow-20261018/interior-flow.png`、`interior-mobile.png`、`personal-projects.png`、`works-archive.png`。ローカルのみ変更。本番には触れていない。

final result: passed

## 最新の点径調整：球体の点をさらに1.5倍へ（2026-10-18）

- 球面と内部を流れる点のサイズをそれぞれ1.5倍へ変更。球面の上限を外側52→78px・内側30→45px、内部の流れる点も30→45pxへ拡大した。点数・透明度・カメラ・スクロール移動量は維持。
- ローカルの実ブラウザーで外側と内側の表示を確認。内部でrenderer=three・phase=inside・progress=1・travel=1.581、JavaScriptエラー0件。ESLint・Prettier・WordPress向けビルド成功。既存のビルド警告のみ。
- 証拠：`work/larger-points-20261018/outside.png`、`inside.png`。本番・DBは変更していない。

final result: passed

## 最新の詳細調整：画像・注記・本文の左端を統一（2026-10-18）

- 制作実績の本文だけが幅800pxで中央寄せとなり、PCで画像・注記から152.5px右へずれていた。制作実績専用のmodifierを追加し、本文の幅800pxを保ったまま左寄せへ変更。プライバシーポリシーなど他のページの本文幅・配置は変更していない。
- 画像下の注記を独立したimage-captionクラスへ変更し、画像との間隔16px・本文との間隔40pxを設定。注記がない場合は画像と本文の間隔40pxを確保。本文のul/olには通常の箇条書き・番号のマーカーを復元した。画像のIDと画面遷移用のdata属性は維持。
- 1280 × 720pxで画像・注記・本文・h2の左端が80pxで一致し、本文幅800px、各間隔16px/40px、list-style-type:discを確認。375 × 812pxでも左端20px・本文幅320pxで一致し、横スクロールなし。注記なしのNext Realty詳細でも画像と本文の間隔40px・左端一致を確認。
- Stylelint・Prettier・WordPress向けビルド成功。確認用タブのJavaScriptエラー0件。証拠：`work/detail-alignment-20261018/detail-desktop.png`、`detail-mobile.png`。ローカルのみ変更。本番・DBは変更していない。

final result: passed

## 最新の文字調整：サイト全体のフォント指定を統一（2026-10-18）

- 日本語主体のブロックに含まれる英数字だけ別の書体になる指定を整理。既存の共通スタック（Portfolio Jost / Jost / Local Noto Sans JP / Noto Sans JP / sans-serif）へ日本語用・基本本文用・共通見出し用の変数をそろえた。日本語はNoto Sans JPを優先し、未導入環境ではOSの日本語サンセリフにフォールバックする。追加のフォント配信・ダウンロードは行っていない。
- 公開側のヘッダー・main・フッター内のinput/button/select/textareaにも同じフォントを指定。既存の文字サイズ・ウェイト・行間は維持。管理バー・アイコン・コード表示の専用フォントは変更していない。
- トップのヘッダー、Hero、About、Works、Experience、Skills、Contact、フッター、および詳細のタイトル・メタ情報・注記・本文・見出し・リスト・ナビゲーションの算出font-familyが同一であることを確認。一覧のタイトル・紹介文・カードでも同一。375 × 812pxの詳細・一覧で横スクロールなし。フォームは現行ページに表示されていないため、公開側への適用範囲をソースで確認した。
- Stylelint・Prettier・WordPress向けビルド成功。確認用タブのJavaScriptエラー0件。証拠：`work/unified-font-20261018/detail-desktop.png`、`detail-mobile.png`。ローカルのみ変更し、本番・DBには触れていない。

final result: passed

## 最新の文字調整：見出し・ヘッダー・カードの太さと大きさを統一（2026-10-18）

- トップの6つのセクション見出しをfont-weight:400へ統一し、Aboutだけにあった重複ウェイト指定を削除。各見出しの既存のサイズ・スクロール演出は維持した。
- 公開側のヘッダーを専用の共通スタイルへ集約。トップ・一覧・詳細の黒背景、下線、幅、余白、文字サイズ・太さ・字間を統一。PCは高さ96px・ブランド13px/500・ナビ13px/400、モバイルは高さ100px・ブランド11px/500・ナビ12px/400。トップのHeroへの配置と管理バーのオフセットは維持した。
- 共通カードの本文ウェイト400を明示。タイトル500、本文14px、カテゴリー/タグ/項目名12px、担当内容/詳細リンク13pxを共通のコンポーネント指定で表示する。トップのカード本体とタイトルが表示完了した状態でも確認した。
- 詳細タイトルは32〜56px・500・行間1.4へ変更（従来36〜72px・300）。本文のh2/h3も500へ変更し、前回そろえた画像・注記・本文の左端と余白は維持。
- 1280 × 720pxおよび375 × 812pxで、トップ・一覧・詳細のヘッダーの高さ、背景、下線、幅、padding、ブランドとナビのサイズ/太さ/字間、ナビ間隔が完全一致。トップ・一覧のカード7項目もfont-family・size・weight・line-height・letter-spacingが完全一致。詳細タイトルはPC約52px、モバイル32pxで折り返し、横スクロールなし。
- Stylelint・Prettier・WordPress向けビルド・git diff --check成功。確認用タブのJavaScriptエラー0件。証拠：`work/type-system-20261018/top-header.png`、`archive-header.png`、`top-cards.png`、`detail-header-title.png`、`detail-headings.png`、`detail-mobile.png`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の見出し調整：トップ6見出しの大きさと大文字表記を統一（2026-10-18）

- Aboutの個別サイズ・行間・字間、Personal Projectsの個別サイズ・字間を削除し、共通のセクション見出し（32〜72px相当のremベース補間・太さ400・行間1.25）に統一。PERSONAL PROJECTSはテンプレート内の表記も大文字へ変更し、共通見出しへuppercase指定を追加した。
- ABOUT／WORKS／EXPERIENCE／SKILLS／PERSONAL PROJECTS／CONTACTの全6件で、PC実画面の算出サイズ約57.8px・行間約72.3px・太さ400・字間約9.25pxが一致。375 × 812pxでも全件32px・行間40px・太さ400・字間4.8pxで一致し、PERSONAL PROJECTSは単語間で2行に折り返す。横スクロールなし。既存の文字ごとのスクロール演出を維持した。
- Stylelint・Prettier・WordPress向けビルド成功。JavaScriptエラー0件。証拠：`work/equal-headings-20261018/personal-projects-desktop.png`、`personal-projects-mobile.png`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新のヘッダー調整：メニューを大文字へ統一（2026-10-18）

- 全ページ共通のヘッダーテンプレートの表示文字をABOUT／WORKS／EXPERIENCE／SKILLS／CONTACTへ変更。アンカーキー・リンクURLは維持した。
- 320px幅の検証で長い単語が途中で折り返すことを検出したため、メニューのnowrap・縮小禁止を追加。368px未満では項目間のgapを詰めた。再確認では全メニューが1行で収まり、タップ高さ44px、横スクロールなし。
- Prettier・Stylelint・WordPress向けビルド成功。証拠：`work/uppercase-header-20261018/header-desktop.png`、`header-mobile.png`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の球体演出：光の波とスクロール速度に反応する光跡（2026-10-18）

- 初回のトップ表示とセクション境界の通過時に、青白い光の帯が球体を3.4秒で一巡する。斜めの帯を半周側に絞り、開始・終了は滑らかにフェード。途中位置での再読み込みでは初期位置を基準にし、不要な波を発生させない。
- 球体内部の移動粒子を、スクロール速度に合わせて放射方向の光跡へ変化させた。逆スクロールで先端の向きを反転し、停止時は減衰して従来の丸い点へ戻す。中心付近は伸びを抑え、GPUのポイントサイズ上限とPC・モバイル別の上限を守る。
- 既存の点数・描画パス数・解像度上限を維持。セクション位置はレイアウト変更時にキャッシュし、毎フレームのレイアウト取得を追加しない。非表示・復帰・リサイズ時は速度サンプルをリセット。reduced-motionでは追加演出を停止する。
- 実ブラウザーで1077 × 616pxと375 × 812pxを確認。初回表示の光帯を目視確認し、下・上スクロールの速度符号と光跡の反応、停止後の強度0への復帰、途中位置再読み込み時の波・光跡0、モバイルの横スクロールなしを確認。光跡の記録ピークはPC0.765・モバイル1.000。JavaScriptエラー0件。端末ごとのFPSは未計測。
- Prettier・ESLint・WordPress向けビルド成功。追加ライブラリ・画像なし。証拠：`work/wave-trails-20261018/wave-outside.png`、`trail-mobile.png`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の球体演出：音源なしのロックリズム（2026-10-18）

- 音源を使わない108 BPM相当の4拍子を追加。1・3拍目は球体と外周が最大約2%膨らむキック、2・4拍目は斜めの軸に沿って球面を横切るスネアの光帯、8分音符は一部の点だけが淡くきらめくハイハットで表現した。開始時は1.5秒かけてリズムの強さを上げる。
- 球体の輪郭を保つ放射方向の変形とし、CPU側のカリング境界も拡張。表面・外周の拡縮を粒子に合わせた。球体内部では変形とアクセントを弱め、既存のセクション周回光はmax合成で明るさの重なりを抑えた。カメラ位置・スクロール移動量・速度による光跡は維持。
- 音源・マイク・音声再生・追加ライブラリ・追加ジオメトリ・描画パスの追加なし。既存の描画上限・非表示時の時計停止を維持。reduced-motionではキック・スネア・ハイハットの強度を0へ戻す。音源に同期するものではなく、負荷が高く20 FPSを下回る場合は既存の時間刻み制限によりリズムも遅くなる。
- PC1077 × 616pxとモバイル375 × 812pxで外側・内側を確認。連続フレームでキック・スネア・ハイハットの値の変化と球面の光帯を確認した。スクロールの光跡ピーク1.000、横スクロールなし、JavaScriptエラー0件。reduced-motionの強度リセットとカリング境界はコードレビューで確認。
- Prettier・ESLint・WordPress向けビルド成功。証拠：`work/music-sphere-20261018/frame-6.png`、`hero-mobile.png`、`inside-desktop.png`、`beat-samples.json`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の球体演出：動画を参考に輪郭と背景のリズムを強化（2026-10-18）

- 参考動画（https://www.youtube.com/watch?v=u6RJv7f__Mg）をブラウザーで再生し、円の輪郭が部分的に膨らみ、波打つ動きを確認。今の青い点の球体へ、面として連続するスペクトラム状の放射方向変形を追加した。キックの一様拡大は最大約2%から約7.8%へ変更し、回転も毎秒約3°から約10°へ強化。外周の光も同じ変形・回転に合わせる。
- 球体内部に見える球面の点にも同じ拍の変形を適用。追加の内部粒子はキックと通過するスネアの波で最大約8.1%拡縮し、回転速度も拍に反応する。光量を大幅に増やさず、位置と形の変化でリズムを見せる。
- スクロールと独立した自動前進・旋回を追加し、停止中も点が動く。自動前進は毎秒約0.42〜0.52ワールド単位、スクロール中は弱める。逆スクロール時は自動前進を逆方向速度の20%以下へ制限し、操作方向を維持する。深度6単位と角度2πで連続的に循環し、非表示時・reduced-motionでは追加移動を停止する。
- 変形後のGPU位置を考慮してCPUカリング境界を0.5拡張。点数・描画パス・解像度上限は維持。音源・マイク・動画素材・画像・追加ライブラリは導入していない。
- PC1077 × 616pxの連続フレームで輪郭のうねりと拡縮を確認。背景ではscrollY=2341・スクロール移動量3.650を固定し、スクロール速度0でも自動移動量0.215→0.500、角度0.100→0.231へ変化し、キック・スネアの値も変化することを確認。弱い逆スクロールでは速度-0.130に対して自動前進0.036で、スクロール移動量は3.650→3.280へ減少した。
- モバイル375 × 812pxで球体外側・内側を確認。横スクロールなし、JavaScriptエラー0件。Prettier・ESLint・WordPress向けビルド成功。証拠：`work/spectrum-sphere-20261018/hero-5.png`、`hero-18.png`、`inside-5.png`、`hero-mobile.png`、`inside-mobile.png`、`frame-samples.json`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の球体演出：丸い輪郭を維持してリズム移動を強化（2026-10-18）

- 輪郭を歪ませるスペクトラム変位・微小な放射方向の揺れ・粒ごとの半径差をすべて削除。緯度ごとにXZ方向を回す球面上の移動へ変更した。点の位置は常に正規化した方向×半径1.64×共通倍率となり、拡縮中も丸い輪郭を保つ。前後面判定も移動後の方向を使用する。
- 球面上のねじれをキック・スネアと連動させ、球体全体の脈動を最大約14.7%へ強化。内部でも同じ倍率の80%を適用。表面・外周・点群は共通の倍率で拡縮し、外周の局所変形は撤去した。
- 別の内部粒子の拡縮を最大約8.1%から約16.1%へ強化。自動前進・拍に反応する回転速度も増やした。逆スクロール時の自動前進20%制限、停止中の継続移動、reduced-motion時の停止、点数・描画回数・解像度上限は維持。
- PC1077 × 616pxの連続フレームで、共通倍率1.001〜1.132の大小どちらでも丸い輪郭を確認。スクロール位置2341固定の背景では倍率最大1.114を記録し、スクロール速度0でも移動が続く。逆スクロール速度-0.131に対して自動前進0.037、スクロール移動量は3.280へ減少した。
- 375 × 812pxで外側・内側を確認。横スクロールなし、JavaScriptエラー0件。Prettier・ESLint・WordPress向けビルド成功。証拠：`work/round-rhythm-20261018/hero-pulse.png`、`hero-rest.png`、`inside-pulse.png`、`hero-mobile.png`、`inside-mobile.png`、`frame-samples.json`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の球体調整：点を大きくし、密度を下げる（2026-10-18）

- 球面の点の基本サイズを1.6倍へ変更し、点数をPC16000→6000、モバイル9000→3600へ削減。一粒ずつが見えやすい密度にした。球面上の位置・丸い輪郭・リズムによる拡縮は維持。
- 内部を流れる点は基本サイズを1.5倍へ変更し、PC640→320、モバイル360→180へ半減。近距離のサイズ上限も調整し、光跡は実際のGPUポイントサイズ上限を守る。透明度・色・明るさは変更しない。
- PC1077 × 616pxと、375 × 812pxで再読み込みしたモバイル向け点数の両方で、球体外側・内側、文字の読みやすさを確認。横スクロールなし、JavaScriptエラー0件。Prettier・ESLint・WordPress向けビルド成功。証拠：`work/larger-points-20261018/hero-desktop.png`、`inside-desktop.png`、`hero-mobile.png`、`inside-mobile.png`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の球体調整：点をさらに大きくし、背景のリズム連動を停止（2026-10-18）

- 球面・内部粒子の基本サイズを前回からさらに1.25倍へ変更。球面はPC6000→4000、モバイル3600→2400、内部粒子はPC320→220、モバイル180→120へ削減。近距離の上限も調整し、GPU上限の小さい機器でもclampの上下限が逆転しないようにした。
- 外側の丸い球体は、従来の球面移動とリズムによる脈動を維持。球体内部へ進むにつれて音楽の反応を滑らかに弱め、内部では球面のねじれ・点サイズ・拍のアクセント・共通拡縮倍率を中立値へ戻す。
- 内部を流れる点のシェーダーから、キック・スネア・ハイハットの拡縮・光量・サイズ変化を削除。自動前進は毎秒0.48、旋回は毎秒0.18ラジアンの一定速度とし、拍による速度変化を撤去。スクロール速度に反応する光跡と、逆スクロール時の方向制御は維持した。
- PC1077 × 616pxの外側で脈動倍率最大1.109を記録。背景ではスクロール位置2341を固定し、音楽の値が変わっても拡縮倍率1.000・停止中の前進速度0.480で一定となることを連続フレームで確認した。
- 375 × 812pxで再読み込みし、モバイル向け点数で外側・内側を確認。横スクロールなし、JavaScriptエラー0件。Prettier・ESLint・WordPress向けビルド成功。証拠：`work/steady-background-20261018/hero-desktop.png`、`hero-pulse.png`、`inside-desktop.png`、`hero-mobile.png`、`inside-mobile.png`、`frame-samples.json`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の背景調整：光だけ復元し、Contact専用の光を削除（2026-10-18）

- 背景の点の光の波・きらめきを復元。球面では移動用と光量用の強度を分け、内部の光量だけを残した。内部粒子も色・透明度だけに音楽の値を適用し、位置・点サイズ・回転速度・前進速度はリズムに連動させない。丸い輪郭・外側の球体のリズム・前回の点サイズと点数は維持。
- Contactテンプレートの専用`portfolio-lights`呼び出しだけを削除。共通の点の背景・透明背景・見出し・本文・Gmailリンク・余白は維持。共通の背景を黒く隠す変更は行っていない。
- PC1077 × 616pxでContact専用の光ステージ0件・背景色transparent・共通WebGL背景の表示を確認。光の値が変化しても背景の拡縮倍率は1.000、停止中の前進速度は0.480のまま。375 × 812pxでもContactを画面内で確認し、専用の光0件、横スクロールなし、JavaScriptエラー0件。
- Prettier（JS・PHP）・ESLint・WordPress向けビルド成功。証拠：`work/background-glow-contact-20261018/contact-desktop.png`、`contact-mobile.png`、`frame-samples.json`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の照明演出：Memoriesの光の雰囲気を取り入れる（2026-10-18）

- MAN WITH A MISSION「Memories」（https://www.youtube.com/watch?v=P2T2BJwkjL8）の3分56秒以降をブラウザーで確認。青緑の霞・淡いピンクの斜め光・琥珀色のにじみを、現在の黒い背景と点の球体に合わせて取り入れた。動画・画像・音源は取り込んでいない。
- 球体と内部粒子へ同じ画面座標の照明を適用し、点に色が映り込むようにした。色の帯はゆっくり移動し、白い光の波・きらめきも維持。球体の丸い輪郭・点の数と大きさ・外側のリズム・背景の一定運動は変更しない。
- 薄い霞と光の帯は背面の全画面メッシュ1枚で描画。追加描画1回で、ポストプロセス用の別描画バッファは使用しない。深度判定・深度書き込み・カリングを無効化し、破棄処理も追加した。外側の霞の透明度上限0.100、内部0.045。非表示時は既存のループ停止に従い、reduced-motionでは静的な色と霞を表示する。実測FPSは未計測。
- PC1077 × 616pxで青緑・ピンク・暖色の重なり、丸い輪郭、本文とContactの読みやすさを確認。内部の拡縮倍率1.000・停止中の前進速度0.480を維持。Contact専用の光ステージは0件のまま。
- モバイル375 × 812pxで再読み込みし、外側・内側の照明と横スクロールなしを確認。JavaScriptエラー0件。Prettier・ESLint・WordPress向けビルド成功。証拠：`work/memories-lights-20261018/hero-desktop.png`、`inside-desktop.png`、`contact-desktop.png`、`hero-mobile.png`、`inside-mobile.png`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新の照明調整：球体を横切る光の帯を明確にする（2026-10-18）

- 斜めのピンク光を、狭い範囲で往復する動きから一方向に画面を横切る動きへ変更。アニメーション時計で7.2秒周期、約6秒の通過と約1.2秒の待機を設けた。帯の中心は幅0.085の白い光、周囲は幅0.22の淡いピンク。画面比率から移動範囲を算出し、端へ抜けて光量0になってから始点へ戻す。
- 球面の点の色と透明度だけへ明るい中心を追加。内部の球面では45%、前方を流れる粒子では30%の色反映へ弱め、既存の薄い霞を維持。点の位置・サイズ・数、丸い輪郭、外側のリズム、背景の移動・回転速度は変更していない。追加の描画パス・ライブラリはない。
- 非表示時は既存の時計停止に従う。reduced-motionでは位相0.5・光量0.65の静止表示とし、初回の描画から色を表示する。端の光量とリセット、シェーダーのuniform・varyingの対応、形状とサイズへの非干渉を読取りレビューで確認した。
- PC1077 × 616pxのスクロール位置0で、位相0.406→0.505→0.621の連続画像を保存し、明るい帯が左から右へ移ることを確認。内部では拡縮倍率1.000を維持し、本文を確認。375 × 812pxでも再読み込みして外側と内部を確認。両サイズで横スクロールなし、JavaScriptエラー0件。
- Prettier・ESLint・WordPress向けビルド成功。証拠：`work/clear-light-sweep-20261018/sweep-left.png`、`sweep-center.png`、`sweep-right.png`、`hero-mobile.png`、`inside-desktop.png`、`inside-mobile.png`、`sweep-samples.json`。ローカルのソースとビルド成果物のみ変更。本番環境・DBには触れていない。

final result: passed

## 最新の照明調整：通過後に淡い残光を残す（2026-10-18）

- 光の帯が各画面座標を通過した時刻から、時定数1.25秒の指数減衰で薄まるピンクの残光を追加。立ち上がりも0.1秒相当の緩やかな式でつなぎ、明るい中心の後ろだけへ余韻を残す。残光は帯の現在の強度から独立しており、待機時間に入っても減衰を続ける。
- 周期前後で通過からの経過時間を連続させ、ロード前の仮想的な残光を抑制。reduced-motionでは中央の帯と通過側の余韻を静止表示する。周期の切り替わり・初回・静止表示の式と、uniform・varyingの整合性を読取りレビューで確認。
- 残光は点の色と透明度、既存の薄い霞だけに反映。球体内部の反映を弱めた。丸い輪郭・黒い背景・点数・点サイズ・外側のリズム・内部の一定運動は維持。履歴バッファ・ライブラリ・ジオメトリ・描画パスの追加はない。
- PC1077 × 616pxで帯の通過、通過後、待機中の画像を保存し、淡い余韻と黒基調を確認。待機時は位相1.000・帯の強度0.000。内部では拡縮倍率1.000・停止中の前進速度0.480を維持。モバイル375 × 812pxでも再読み込みして外側・内部を確認。両サイズで横スクロールなし、JavaScriptエラー0件。
- Prettier・ESLint・WordPress向けビルド成功。証拠：`work/light-afterglow-20261018/pass-desktop.png`、`after-desktop.png`、`pause-desktop.png`、`inside-desktop.png`、`hero-mobile.png`、`inside-mobile.png`、`frame-samples.json`。ローカルのソースとビルド成果物のみ変更。本番環境・DBには触れていない。

final result: passed

## 最新のリンク調整：詳細リンクをテキストと矢印の幅にする（2026-10-18）

- 共通カードの`.p-portfolio-project__link`をstretchからflex-endへ変更し、fit-contentで文字・矢印・間隔に合う横幅へ縮めた。右寄せ、カード下端への配置、最小高さ44px、文字幅のホバー下線は維持。
- PCのTOPと制作実績一覧で全10件ずつ、リンクが右寄せで内容幅となることを確認。表示後の実測は文字65px＋間隔16px＋矢印13px＝リンク94px。TOPではelementFromPointで左側の空白がリンク外、文字と矢印がリンク内であることを確認した。
- 375 × 812pxの一覧も全10件で幅94px・高さ44px、横スクロールなし。TOP・一覧でキーボードフォーカスの枠が縮んだリンクのみに表示されることを確認。JavaScriptエラー0件。
- Prettier・WordPress向けビルド成功。証拠：`work/project-link-width-20261018/top-hit-area.json`、`top-focus.png`、`archive-mobile-focus.png`。ローカルのSCSSとビルド成果物のみ変更。本番・DBへの変更なし。

final result: passed

## 最新の球体照明：青白いリムライトを追加する（2026-10-18）

- 既存の球体外周メッシュに、青白い中心と柔らかい青い光を重ねた。縁の一部を選ぶ光が毎秒0.22ラジアン、約28.6秒で一周する。初期位置は右下とし、黒基調と丸い輪郭を保ちながら立体感を加える。
- 外周と球面の点でカメラ座標の法線と共通の角度を使用。球面側は色と透明度だけを変更し、位置・点サイズ・共通拡縮倍率・点数・背景の移動速度には接続しない。既存の光の帯・残光も維持した。
- 内部への移行量0.05〜0.65の間で追加光を弱め、内部では表示しない。既存の時計を使うため非表示時は停止し、reduced-motionでは静止する。新規の描画パス・ジオメトリ・ライブラリは追加していない。ゼロ除算、powの非負入力、uniform・varyingの整合性を読取りレビューで確認。実測FPSは未計測。
- PC1077 × 616pxで右下と左側へ光が移る画像を記録。モバイル375 × 812pxでも再読み込みして縁の光を確認した。両サイズで外側・内部、黒い背景、横スクロールなし、JavaScriptエラー0件を確認。内部の拡縮倍率1.000・停止中の前進速度0.480を維持。
- Prettier・ESLint・WordPress向けビルド成功。証拠：`work/rim-light-20261018/hero-desktop.png`、`hero-later.png`、`inside-desktop.png`、`hero-mobile.png`、`inside-mobile.png`、`frame-samples.json`。ローカルのソースとビルド成果物のみ変更。本番・DBへの変更なし。

final result: passed

## 最新の球体照明：リムを強め、帯の出口にフレアを追加する（2026-10-18）

- リムの白い中心と青い外光を強化。球面側の色反映と透明度も調整し、円周の一部へ光を絞った。移動速度を毎秒0.22から0.34ラジアン（約18.5秒で一周）へ変更。丸い輪郭・基本の黒い背景・点の大きさと数・球体のリズムは維持。
- 画面に投影した球体の輪郭から、帯が最後に抜ける位置を計算。帯の中心が出口を越えたときだけフレアを出し、約0.75秒で消す。白桃色の小さな中心、広がる薄い光、短い横方向の光条を合成。同じ周期の再発火と、初回・リサイズ・復帰時の偽の発火を防いだ。
- スマートフォンでは固定ヘッダー下の可視輪郭へ出口を調整。近距離・内部・画面外・reduced-motionではフレアを停止する。輪郭の投影計算と上端の交点を数値検証し、uniform・GLSL・周期制御・初回のInfinity・破棄処理を読取りレビューで確認した。
- フレアは既存の平面ジオメトリを共有する専用マテリアルで球体の前に描画。発光中のみ1描画追加し、通常時は非表示。履歴バッファ・ライブラリ・画像素材の追加なし。実測FPSは未計測。
- PC1077 × 616pxの連続フレームで位相0.725・フレア強度0.520、375 × 812pxで位相0.745・強度0.646の発光を記録。弱まって消えること、内部で強度0.000・拡縮倍率1.000となること、本文の表示を確認。両サイズで横スクロールなし、JavaScriptエラー0件。PC内部の停止中の前進速度も従来の0.480へ戻ることを確認。
- Prettier・ESLint・WordPress向けビルド成功。証拠：`work/rim-flare-20261018/flare-desktop.png`、`rim-desktop.png`、`flare-mobile.png`、`inside-desktop.png`、`inside-mobile.png`、`flare-samples.json`、`mobile-flare-samples.json`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## 最新のフレア調整：光を大きく明るく広げる（2026-10-18）

- フレア中心の半径を約1.4〜1.5倍へ、外光の最大半径を0.15から0.22へ拡大。外光・横の光条も明るくし、強度上限を0.65から0.82へ変更した。描画範囲も広げ、外光が途中で切れないようにした。
- 表示時間を0.75秒から0.95秒へ延長。最初の0.58秒で外光が滑らかに広がる式に変更し、光量が十分残っている間に拡大を見せる。球体の輪郭・点・リム・帯の周期・残光・背景の運動・黒基調は変更していない。内部・reduced-motion・画面外で停止する既存の制御と描画回数も維持。
- PC1077 × 616pxの連続フレームで、強度0.820／広がり0.079から、強度0.679／広がり0.733へ変わる様子を保存。モバイル375 × 812pxでも強度0.699／広がり0.694の外光を確認。両サイズで内部の強度0.000・拡縮倍率1.000、横スクロールなし、JavaScriptエラー0件を確認した。
- Prettier・ESLint・WordPress向けビルド成功。証拠：`work/flare-bloom-20261018/flare-peak-desktop.png`、`flare-expanded-desktop.png`、`flare-expanded-mobile.png`、`inside-desktop.png`、`inside-mobile.png`、`desktop-samples.json`、`mobile-samples.json`。ローカルのみ変更。本番・DBには触れていない。

final result: passed

## セクションごとの表示演出（2026-10-18）

- Aboutの縦線へスクロール進行に連動する青白い光を追加。現在の経歴項目の見出し・期間・点を明るくし、逆スクロールでも位置を戻す。対応ブラウザーではCSSのスクロールタイムライン、その他では既存のGSAPを使用。
- TOPと制作実績一覧の画像へ黒い幕の横方向の表示演出を追加。幕760msの完了後、カード情報を70ms間隔で順に表示する。既存の画像ホバー・リンクの下線・詳細リンクの幅は維持。
- TOPのセクション見出しへ、初回表示時だけ0.28秒の青・淡い赤のずれを追加。元の文字は表示を保ち、装飾の複製は読み上げ対象から除外。
- Skillsは画面内に入るカードをDOM順に表示。同じカテゴリーは100ms、カテゴリーの切り替わりは240msの間隔とし、スマートフォンで下方のカードが先に再生されないようにした。
- 非表示が残らないよう高速スクロール・逆スクロール・キーボードフォーカスで表示を確定。低モーション・強制カラー時は新しい非表示処理を適用しない。画面幅変更時の後始末と、球体領域の遅延拡張後の表示位置の再計算も確認。
- PC1077×616pxでタイムライン進行0.497（2項目目）→0.961（3項目目）→0.497、Worksの幕が移動している間の情報非表示、見出しの短いずれ、Skillsの連続表示を確認。390×844pxでもAbout・Works・Skillsを確認し、横方向のはみ出しなし。高速スクロール後の非表示取り残しなし。
- 制作実績一覧で詳細リンクのキーボードフォーカスと幅94px・高さ44pxを確認。JavaScriptエラー0件。対象ファイルのPrettier・ESLint・Stylelint、WordPress向けビルド成功。既存のThree.jsチャンク容量とBrowserslist更新の警告は継続。
- 証拠：`work/section-motion-20261018/about-desktop.png`、`about-mobile.png`、`works-curtain-desktop.png`、`skills-entry-desktop.png`、`skills-mobile.png`、`archive-focus-desktop.png`、`timeline-states.json`。ローカルのソースとビルド成果物のみ変更。本番・DBへの変更なし。

final result: passed

## Worksの幕開けをゆっくりにする（2026-10-18）

- 共通カードの幕を760msから1200msへ延長。幕が開いた後に160ms置き、テキストを650ms・100ms間隔で順に表示する。6項目のカードは全体約2.51秒。TOP・一覧で同じ設定を使用する。
- PC1077×616pxと390×844pxで幕の移動中にテキストが隠れ、完了後は全項目の透明度1・幕削除となることを確認。横方向のはみ出しなし。フォーカス・高速スクロール時の即時表示、低モーション時の静止表示は既存の制御を維持。
- Prettier・ESLint・WordPress向けビルド成功。証拠：`work/section-motion-20261018/works-curtain-slower-desktop.png`、`slower-curtain-state.json`。ローカルのJSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## Aboutのタイムラインの光を明るくする（2026-10-18）

- 進行線を2pxから3pxへ変更し、青白いグラデーションと二重の光を強化。先端を幅12pxから28pxへ広げ、白い芯・明るい青・淡い外光を重ねた。現在の経歴の点と通過済みの点も明るくした。
- 線と先端の中心位置、スクロール進行のJS、native CSS／GSAP fallback、低モーション・強制カラーの制御は維持。連続した点滅や自動往復は追加していない。
- PC1077×616pxでスクロール進行0.497→0.703→0.497と先端の移動・復帰を確認。390×844pxでも先端の光と本文に干渉がなく、横方向のはみ出しなし。JavaScriptエラー0件。
- Prettier・Stylelint・WordPress向けビルド成功。証拠：`work/section-motion-20261018/about-brighter-desktop.png`、`about-brighter-mobile.png`、`brighter-timeline-progress.json`。ローカルのSCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## 見出しのグリッチを強める（2026-10-18）

- 青・ピンクの装飾のずれ幅を最大0.045emから0.12emへ拡大。色の帯を少し広げ、0.28秒から0.6秒へ延長し、左右へ段階的にずれてから収まる演出にした。元の文字の位置・透明度・色は変更せず、装飾のみ単調に薄くする。
- PC1077×616pxのWORKSで再生中の両色の位置ずれ、0.6秒のアニメーション、元文字の透明度1・移動なしを確認。終了後はshown・装飾の透明度0。390×844pxのPERSONAL PROJECTSでも折り返しの一致と横方向のはみ出しなしを確認。JavaScriptエラー0件。
- 読み上げから除外するaria-hidden、初回表示のみの制御、低モーション・強制カラー時の静止表示、Skillsの表示演出は維持。対象SCSSのPrettier・StylelintとWordPress向けビルド成功。
- 証拠：`work/section-motion-20261018/heading-glitch-stronger-desktop.png`、`heading-glitch-stronger-mobile.png`、`heading-glitch-stronger-states.json`。ローカルのSCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## Skillsの間隔と見出しのずれを強める（2026-10-18）

- Skillsの同カテゴリー内の開始間隔を100msから180ms、カテゴリー変更の間隔を240msから520msへ延長。直前の行が表示し終わった後にスクロールしてもカテゴリーの間を置くよう、開始時刻の下限を調整。画面内だけを予約し、待機上限を1600msとした。
- カードの表示時間を660msから800ms、安全のための表示確定タイマーを1000msへ延長。高速スクロール・フォーカス・画面幅変更時の表示確定と後始末は維持。
- 見出しのグリッチを600msから780ms、最大ずれを0.12emから0.16emへ変更。青・ピンクの装飾だけを動かし、元の文字の位置・透明度は維持。
- PC1077×616pxでHTML→CSS→JavaScriptの異なる再生段階、CMS／Backendの予約待機と表示完了を確認。高速スクロール後の非表示取り残しなし。390×844pxでもカテゴリー待機→表示完了、PERSONAL PROJECTSの折り返し、元文字の透明度1・移動なし、横方向のはみ出しなしを確認。JavaScriptエラー0件。
- Prettier・ESLint・Stylelint・WordPress向けビルド成功。証拠：`work/section-motion-20261018/skills-longer-stagger-desktop.png`、`skills-longer-mobile.png`、`skills-longer-states.json`、`heading-glitch-final-mobile.png`。ローカルのJS・SCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## CONTACT見出し下の装飾を統一する（2026-10-18）

- CONTACT見出し直後に共通のportfolio-light-cueを追加。専用の見出し下余白28pxを削除し、他の見出しと同じ装飾・余白を使用。
- PC1077×616pxでWORKSとCONTACTの見出し下余白が同じ14.5803px、装飾の点が7個であることを確認。390×844pxでは余白12px、横方向のはみ出しなし。JavaScriptエラー0件。Prettier・WordPress向けビルド成功。
- 証拠：`work/section-motion-20261018/contact-heading-line-desktop.png`。ローカルのPHP・SCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## 見出し下の装飾線を明るく統一する（2026-10-18）

- 共通c-light-cueの親透明度を1へ、初期の各点を0.72・表示後を0.86へ調整。白い3pxの芯と淡い青の光をCSSで描画し、7点を細い青白い線でつないだ。線と光は既存の高さ14〜18px内へ収め、点の表示時アニメーションを維持。
- ABOUTにも共通パーツを追加。専用の見出し下余白とコンテナ下余白を整理し、6見出しすべてで同じ装飾・余白を使用。イコライザーの色調整と見出しのグリッチは維持。低モーション時の静的な透明度も0.86へそろえ、強制カラー時は既存どおり装飾を非表示にする。
- PC1077×616pxで6見出しの装飾7点・親透明度1・同一グラデーション・見出し下余白14.5803pxを確認。390×844pxでもABOUTの表示と6見出しの余白12px、横方向のはみ出しなしを確認。JavaScriptエラー0件。
- Prettier・ESLint・Stylelint・WordPress向けビルド成功。証拠：`work/section-motion-20261018/heading-divider-brighter-contact.png`、`heading-divider-brighter-about-mobile.png`、`heading-divider-brighter-states.json`。ローカルのPHP・JS・SCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## 見出し下の線に左から右の光を流す（2026-10-18）

- 共通パーツへ絶対配置の光を追加。幅25%の白い芯と青い光が1.25秒で左から右へ通過し、7点も左から順に一度明るくなる。完了後は通常の透明度0.86に戻り、装飾線を残す。装飾線のランダム方向・ripple・sparkleを撤去し、全6見出しで同じ演出に統一。
- 既存のIntersectionObserver・GSAPコンテキストを利用。画面外・非表示時は一時停止、低モーションでは動く光を非表示にして静的な線を表示。強制カラー時の装飾非表示と後始末は維持。背景の光のパターンは変更しない。
- PC1077×616pxの連続画像で光の位置が8.07→14.19→19.69pxと右へ進むこと、全6見出しがsweep・光1個・点7個であることを確認。完了時は光の透明度0・点0.86、見出しへ戻ってもcompleteのまま。390×844pxのABOUTでも再生と横方向のはみ出しなしを確認。JavaScriptエラー0件。
- Prettier・ESLint・Stylelint・WordPress向けビルド成功。証拠：`work/section-motion-20261018/divider-sweep-desktop-0.png`、`divider-sweep-desktop-1.png`、`divider-sweep-desktop-2.png`、`divider-sweep-mobile.png`、`divider-sweep-frames.json`。ローカルのPHP・JS・SCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## 光の通過に合わせて見出し下の線をつなぐ（2026-10-18）

- 光の通過を1.25秒から2秒へ延長し、白い芯を半径3pxから4px、青い外光を広げた。固定の疑似要素を共通パーツ内の線用spanへ置き換え、表示前はscaleX0、通過した部分だけを左から右へ伸ばす。7点は光の到達時刻に合わせて発光する。
- 幅25%の光の75%位置にある芯に合わせ、線は0.1秒から1.7秒で完成する。以後は一本の線を残し、光は右端へ消える。無JavaScript・低モーション時は静的な完成線を表示し、強制カラー時の非表示と既存の停止・後始末を維持。
- PC1077×616pxで全6見出しの初期線幅0を確認。連続画像で線の先端12.610→15.827→18.726pxと光の芯12.613→15.824→18.729pxが一致。完了時の線幅122.3125pxが全幅と一致し、光の透明度0となることを確認。390×844pxでも先端16.240pxと芯16.240pxが一致し、横方向のはみ出しなし。JavaScriptエラー0件。
- Prettier・ESLint・Stylelint・WordPress向けビルド成功。証拠：`work/section-motion-20261018/divider-draw-desktop-0.png`、`divider-draw-desktop-1.png`、`divider-draw-desktop-2.png`、`divider-draw-mobile.png`、`divider-draw-frames.json`。ローカルのPHP・JS・SCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## 点も光の通過後に表示し、線を両端点内に収める（2026-10-18）

- 各点のJS初期透明度を0・倍率0.65へ変更。光が到達する時刻から順に表示し、通過後は透明度0.86・倍率1を維持。線の開始・完了時刻も最初と最後の点への到達時刻へそろえた。
- 接続線の左右を7等分グリッドの半セル（全幅の1/14）内側へ配置。横方向の光彩もクリップし、最初と最後の点の中心間に収めた。動きを減らす設定・JavaScript無効時は完成状態の線と点を表示する。
- PC1077×616pxで全6見出しの初期点透明度0・線幅0を確認。連続画像で先頭の点だけが0.714→0.993→0.999へ現れ、未通過の6点は0を維持。完了後は7点とも0.86。線の端と点中心は描画丸め誤差0.008px以内で一致。390×844pxでは線の両端28px・124pxが点中心と完全一致し、横方向のはみ出しなし。JavaScriptエラー0件。
- Prettier・ESLint・Stylelint・WordPress向けビルド成功。証拠：`work/section-motion-20261018/divider-points-desktop-0.png`、`divider-points-desktop-1.png`、`divider-points-desktop-2.png`、`divider-points-complete-desktop.png`、`divider-points-mobile.png`、`divider-points-frames.json`、`divider-points-endpoints.json`。ローカルのJS・SCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## ABOUTの縦線を最初の点から始める（2026-10-18）

- 通常の縦線はborder-imageで最初の点より上を透明化。光る線・進む光も同じ点中心から開始するよう位置と高さを変更。CSSの既定値は点のtopと半径の合計、JS動作時は各点の算出座標を用いる。
- nativeのanimation-rangeとGSAP fallbackの開始位置を13.1px下げ、点の中心位置を基準に経歴の強調を正規化。画面幅・レイアウト更新時も再計算し、終了時は追加CSS変数を復元する。
- PC1077×616pxで縦線開始と点中心が72.865625pxで一致。線先端357.256638pxと光中心357.256625pxも一致。スクロール進行0.487→0.698→0.487を確認。390×844pxでも開始点・点中心193.06875pxが一致し、横方向のはみ出しなし。JavaScriptエラー0件。
- Prettier・ESLint・Stylelint・WordPress向けビルド成功。証拠：`work/section-motion-20261018/about-rail-start-desktop.png`、`about-rail-start-mobile.png`、`about-rail-start-states.json`。ローカルのJS・SCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## リンク横のイコライザーとスクロール波形（2026-10-18）

- ヘッダー・詳細を見る・一覧へのリンク・詳細ページの移動リンク・Contactに、4本の小さなバーを追加。ホバーまたはキーボードフォーカス時だけ上下し、既存の下線・矢印・クリック範囲は維持する。画像リンクには追加しない。
- 右端に25本の細いバーによる波形を追加。スクロール速度に応じて振幅が変わり、停止後は徐々に静まる。静止中は描画更新を停止し、画面非表示・ページ離脱時も停止する。動きを減らす設定・強制カラー時は両装飾を表示しない。
- PC1077×616pxでホバー時の4本の異なる伸縮、低速・高速・逆方向スクロール時の波形レベル0.077・0.396・0.440と停止後の0を確認。「詳細を見る」は94×44pxを維持し、装飾部分がクリック範囲に入らないことを確認。一覧・詳細への移動後も波形は1個、JavaScriptエラー0件。
- 320×812pxでヘッダーのバーが各44px高リンク内に収まり、波形も右端3pxの余白を保つことを確認。本文・リンクとの重なりや横方向のはみ出しなし。Prettier・ESLint・Stylelint・WordPress向けビルド成功。
- 証拠：`work/music-interactions-20261018/header-equalizer-desktop.png`、`waveform-active-desktop.png`、`header-equalizer-mobile.png`、`waveform-active-mobile.png`、`cta-equalizer-archive.png`、`detail-equalizer-desktop.png`、`waveform-samples.json`、`cta-geometry.json`、`mobile-samples.json`。ローカルのJS・SCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## イコライザー・波形を拡大し、一覧リンクとGmailの崩れを直す（2026-10-18）

- ミニイコライザーを14×12pxから20×18px、バー幅2pxから3.5pxへ拡大。青白い芯と発光を明るくし、最小倍率を0.24から0.16へ下げて上下差を拡大。スマートフォンのヘッダーは20×10pxでリンク内に配置する。
- 制作実績の一覧へ・Gmailにある矢印用のspanセレクターが装飾にも適用され、flexが上書きされて4段になることを確認。矢印の直接のspanだけに絞り、イコライザーとその子要素を除外した。4本が横並びで異なる高さに動くことを確認。
- 画面端の波形をPC26×122pxから36×147px、スマートフォン12×98pxから16×122pxへ拡大。白い芯と微光を追加し、スクロール感度・振幅・応答を調整。停止後の減衰・idle時の描画停止・低モーション時の非表示は維持する。
- PC1077×616pxで一覧リンク209.1875×48pxと詳細リンク94×44pxを維持。カード内のバー右端514pxはカード右端515px内に収まる。低速・高速スクロールで波形レベル0.145・0.474、停止後idle・0.000を確認。
- 320×812pxでヘッダー装飾が各44px高のリンク内に収まり、一覧リンク・Gmailも横並びで表示。波形はx286〜302px、本文右端285pxより外側で、右余白3pxを維持する。スクロール時レベル0.426、横方向のはみ出しなし。JavaScriptエラー0件。
- Prettier・ESLint・Stylelint・WordPress向けビルド成功。証拠：`work/music-interactions-stronger-20261018/gmail-equalizer-desktop.png`、`list-link-desktop.png`、`cta-equalizer-desktop.png`、`waveform-desktop.png`、`header-mobile.png`、`list-link-mobile.png`、`gmail-mobile.png`、`waveform-mobile.png`、`measurements.json`。ローカルのJS・SCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## スクロール波形に余韻を残し、ヘッダー越しに球体を表示する（2026-10-18）

- 波形は停止直後110msの応答後、最後のスクロールから440msまで振幅を保持。その後2400msのsmoothstepで滑らかに減衰させる。余韻中もバーの位相は進み、最終的にidleへ戻ってRAFを停止する。再スクロールへの追従、非表示時のリセット、cleanupは維持。
- 実モジュールの時間経過確認では、停止120・300・440msでlevel0.572を維持し、800msで0.538、1400msで0.371、2200msで0.100、3000msでidle・0・予約RAF0となる。余韻中の再スクロールと非表示時リセット、後始末も確認。
- トップページのヘッダー背景を透明化。z-index20とメニューの配置は保ち、前面の文字と操作範囲を維持する。PC1077×616px、320×812pxでヘッダーの背後に球体が続く表示を確認。各メニューは高さ44px、横方向のはみ出しなし。
- ブラウザーでも波形のsettling・level0.583からidle・0への収束を確認。JavaScriptエラー0件。Prettier・ESLint・Stylelint・WordPress向けビルド成功。
- 証拠：`work/waveform-tail-header-20261018/header-before.png`、`header-desktop.png`、`header-mobile.png`、`waveform-tail-desktop.png`、`waveform-tail-check.json`、`browser-check.json`。ローカルのJS・SCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## 波形の余韻を約1秒へ短縮する（2026-10-18）

- 停止後の保持を440msから160ms、減衰を2400msから840msへ短縮。合計約2.84秒から約1秒で静まるようにした。速度への反応・smoothstep・再スクロールへの追従・idle時のRAF停止は維持。
- Prettier・ESLint・WordPress向けビルド成功。ローカルブラウザーでスクロール後のsettling・level0.524と波形1個、横方向のはみ出しなしを確認。
- 証拠：`work/waveform-short-tail-20261018/short-tail-desktop.png`。ローカルのJS定数とビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## 制作実績一覧のページネーションをイコライザー対象から外す（2026-10-18）

- ページ移動リンクの対象をnavigation内の直接のa要素へ限定。入れ子のページネーションにある番号・Nextを対象から外し、Back to Home・詳細ページの戻る・Contactは維持する。
- ローカルの一覧でページネーションの装飾0個、番号2のホバー時も0個を確認。ヘッダー5個・カード10個・Back to Home1個は維持。横方向のはみ出しとJavaScriptエラーなし。Prettier・ESLint・WordPress向けビルド成功。
- 証拠：`work/pagination-no-equalizer-20261018/pagination-desktop.png`、`browser-check.json`。ローカルのJSセレクターとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## 制作実績一覧のページネーションの余白と操作範囲を整える（2026-10-18）

- 制作実績アーカイブだけに適用するSCSSを追加。数字間はPC12px・スマートフォン8px、前後リンクとの間は20px・16pxへ拡大。各項目を最小44×44pxとし、現在ページは青い背景と濃い文字で区別する。前後リンクの英語表記・生成URL・aria-currentは維持。
- nav-linksを折り返せるflexにし、スマートフォンではBack to Homeを別段に配置。キーボードフォーカスは2pxの枠と3pxの間隔を設け、既存のイコライザー除外を維持する。
- PC1077×616pxで数字44×44px・Next74.53125×44px・Previous98.453125×44pxを確認。Nextで2ページ目へ、320×812pxのPreviousで1ページ目へ正常に移動し、両方で現在ページが切り替わることを確認。数字間・前後リンクの余白は指定値と一致し、横方向のはみ出しなし。ページネーション内のイコライザー0個、JavaScriptエラー0件。
- Prettier・Stylelint・WordPress向けビルド成功。証拠：`work/pagination-spacing-20261018/desktop-page-1.png`、`desktop-page-2-focus.png`、`mobile-page-1.png`、`mobile-page-2.png`、`measurements.json`。ローカルのSCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

## ページネーションの外枠を外す（2026-10-18）

- 数字・前後リンクの枠とボタン状の背景を削除。現在ページは青い文字で区別し、数字間のPC12px・スマートフォン8px、最小44×44pxの操作範囲とキーボード時のフォーカス枠は維持する。
- PC1077×616px・320×812pxで全項目のborder0px・背景透明、数字44×44px・Next72.53125×44px、指定の間隔と横方向のはみ出しなしを確認。Prettier・Stylelint・WordPress向けビルド成功。
- 証拠：`work/pagination-no-frame-20261018/desktop.png`、`mobile.png`、`measurements.json`。ローカルのSCSSとビルド成果物のみ変更。本番・DBには触れていない。

final result: passed

### 2026-10-18 About sticky / card border hover / C++
- Local only. Existing About profile sticky retained; top offset now includes the WP admin bar. Desktop measured profile top 80px while timeline body moved to -230.6px. Mobile 390px: static profile, one column, no horizontal overflow.
- Portfolio cards on home and archive draw blue-white horizontal/vertical perimeter strokes over 700ms on hover/focus-within. Decorations ignore pointer input; reduced motion disables transitions; forced colors hides decoration. Existing image effects and CTA 94x44px preserved.
- Added C++ (2 years, academic learning/development, rally-machine implementation/integration) to Skills; About mentions C/C++/C#. Updated seed and local works ID 40 technology/task fields only, preserving other fields. Pre-update meta saved in work/about-card-cpp-20261018/rally-meta-before.txt. Temporary CLI script removed.
- Browser verified C++ skill, home rally tags and two detail-page occurrences. Archive keyboard outline remains visible; no browser errors.
- Vite WP build, targeted Stylelint and diff whitespace checks pass. Existing Browserslist/Three chunk size build notices remain.
- Screenshots: work/about-card-cpp-20261018/about-sticky.png and card-hover.png.

### 2026-10-18 Card border hover brightness / timing adjustment
- Local only: perimeter stroke 1px -> 2px, pale white-blue #e0f3ff with static 4px glow. Draw duration 700ms -> 1600ms; vertical strokes delayed 180ms. Slower acceleration makes line growth visible. Reduced-motion/forced-colors behavior retained.
- Browser archive hover measured intermediate scaleX .444 / scaleY .184, then complete; CTA still 94px wide, no horizontal overflow. Screenshot: work/about-card-cpp-20261018/card-hover-brighter-slow.png.
- Targeted Stylelint fix and WP Vite build pass; existing unrelated build notices retained.

### 2026-10-18 Card border hover exit fade
- Local only: exit opacity now fades over 1200ms ease-out while strokes retract over 1600ms. Hover/focus entry retains 180ms brightness response and the existing slow draw. Reduced-motion and keyboard behavior retained.
- Browser checked hover/focus false on exit: opacity .685 and scaleX .913 mid-transition, then opacity 0 / scaleX 0 at rest. Targeted Stylelint and WP build pass.
- Proof: work/about-card-cpp-20261018/card-hover-exit-fade.png.

### 2026-10-18 Production settings / local integration
- Production read-only GET/admin viewing. Local DB backed up before selective settings merge; no full DB import. Full record: doc/production-local-integration.md.
- Published local privacy policy using existing Gutenberg source verified against current production rendered text. General/SEO/OGP/permalink matched selectively; local URLs, development noindex, no GA tracking maintained.
- Verified all 15 works post rows/meta/term relationships unchanged, active plugins retained, home 10 cards and C++ intact. Privacy PC/mobile displays without horizontal overflow. Temporary CLI/payload files removed.

### 2026-10-18 Record reflection / section stage lighting
- Local CSS only: src/assets/styles/projects/_p-portfolio-music-accents.scss. Portfolio card images use a masked concentric arc reflection on hover/focus-within over 1.8s. Existing card perimeter draw/fade, image scale, entrance curtain and image badges remain independent.
- Home section headings trigger two diagonal blue-white stage beams over 3.2s (right beam delayed 220ms). Both heading playing/shown states share the animation declaration so the 0.78s glitch completion does not cancel the light. Beams fade at the lower edge; inner content stays on z-index 1, decorations on 0 with pointer events none. Contact remains excluded.
- Decorations enabled only with no reduced-motion preference and outside forced colors. No extra JS listeners, assets or runtime dependencies.
- Browser: observed record-reflection animation on home/archive; opacity 1 during sweep. Stage peak opacity .999907, final opacity 0; no Contact decoration. Archive CTA remains 94px wide; 390px viewport has no horizontal overflow. No browser errors.
- Targeted Stylelint, WP Vite build and diff whitespace checks pass. Existing unrelated build notices remain. Screens: work/music-accents-20261018/record-reflection.png and stage-light.png.

### 2026-10-18 Brighter / slower music light accents
- Local only: record sweep duration 1.8 -> 2.8 seconds, ease-in-out; wider mask/highlight, brighter blue grooves and +/-16 degree arc rotation. Stage duration 3.2 -> 4.8 seconds, second beam delay 320ms, peak held from 24-44%, stronger light gradients and a wider scale range .66 -> 1.
- Browser verified durations 2.8/4.8 seconds, stage peak opacity 1, no Contact decoration or horizontal overflow; CTA stays 94px wide. Text remains on the upper layer. Reduced-motion / forced-colors behavior unchanged.
- Targeted Stylelint, WP Vite build and whitespace checks passed. Proof: work/music-accents-20261018/stage-light-brighter-slower.png.

### 2026-10-18 Unified section heading spacing
- Local only: removed About desktop/mobile padding overrides and Works top-padding override. About, Works and Experience now all inherit shared responsive section padding; heading/cue spacing already shared and retained.
- Browser: desktop all three padding 128px, title-to-cue 16px, cue-to-content 32px. At 390px: section top 80px, title-to-cue 12px, cue-to-content 16px for all three. No horizontal overflow; About profile remains static on mobile.
- Targeted Stylelint, WP build and whitespace checks pass. Proof: work/music-accents-20261018/about-spacing-unified.png.

### 2026-10-18 All six heading areas share spacing
- Removed Contact's special block padding. Skills and Personal Projects already inherited the shared section/title/cue spacing and remain on that rule.
- Verified About/Works/Experience/Skills/Personal Projects/Contact: desktop block padding 128px, heading gap 16px, cue gap 32px; 390px mobile block padding 80px, heading gap 12px, cue gap 16px. No mobile horizontal overflow.
- Local only, targeted Stylelint and WP build pass. Proof: work/music-accents-20261018/all-heading-spacing-unified.png.

### 2026-10-18 Archive / work-detail heading spacing
- Local only: centralized shared section spacing, heading/cue gap, cue size and cue/content gap as portfolio CSS variables. Home retains previous measured spacing. No new heading decorations or font-size changes.
- Archive headings without a cue now reserve the same total heading-to-content distance as the home cue group (66px desktop / 42px mobile). Work details share section padding, subtitle gap, breadcrumb gap and body h2 content gap; privacy-page-specific layout is unchanged.
- Browser verified archive/detail desktop section padding 128px and heading-to-content/meta 66px; mobile 390px both padding 80px, gap 42px, detail body heading gap 16px, no horizontal overflow. Desktop detail title remains 56px.
- Targeted Stylelint, WP Vite build and whitespace checks pass. Proofs: work/music-accents-20261018/archive-heading-spacing.png and detail-heading-spacing.png.

### 2026-10-18 Privacy heading spacing
- Local only: shared detail padding, breadcrumb/subtitle gaps and body-heading gaps now use the same portfolio CSS variables for both works and privacy pages. Removed redundant work-only overrides; policy gets an explicit modifier and a title-group-to-intro gap matching the home total heading gap.
- Policy browser checks: desktop padding 128px, breadcrumb/body-heading gaps 32px, subtitle gap 16px, intro gap 66px; at 390px padding 80px, gaps 16px/12px/42px. Title stays 56px on desktop; no horizontal overflow. Policy content and DB unchanged.
- Stylelint, PHP Prettier, WP build and whitespace checks pass. Screenshot: work/music-accents-20261018/privacy-heading-spacing.png.

### 2026-10-18 Shared heading light cues on archive / detail / privacy
- Local only: reused the home seven-dot light cue below archive, work-detail and privacy main headings. CMS body h2 headings receive the same pristine cue markup before motion initialization, without modifying saved content.
- Existing viewport playback draws the line and reveals dots from left to right; reduced-motion static fallback stays intact. Shared title/cue/content gaps prevent doubled margins.
- Browser verified archive 1 cue, detail 4 cues (3 body headings), privacy 6 cues (5 body headings), seven dots per cue, playing-to-complete states and body viewport entry playback. At 390px detail/privacy have 12px heading gaps, no horizontal overflow and no duplicate cues after resizing. No browser console errors.
- Targeted Stylelint, ESLint, PHP/JS Prettier, WP Vite build and whitespace checks pass. Proofs: work/music-accents-20261018/archive-heading-cue.png, detail-heading-cue.png and privacy-heading-cue.png.

### 2026-10-18 Shared heading glitch on archive / detail / privacy
- Enabled the existing section accent initializer on all portfolio pages and included detail titles / CMS body h2 headings. The same 0.78s blue-and-rose clipped layers run once on viewport entry; initial visible non-home titles animate as well.
- Kept original Japanese text nodes and wrapping, aria-hidden decorative layers, existing cleanup, and reduced-motion / forced-colors fallback. Home initial-position behavior is unchanged.
- Browser verified archive title playing, all six privacy headings decorated with two layers, offscreen headings pending then playing on scroll and settling to shown. Detail title / three body headings work at 390px without horizontal overflow; no console errors.
- ESLint, Stylelint, Prettier and WP build pass. Local only. Proof: work/music-accents-20261018/privacy-heading-glitch.png.

### 2026-10-18 Slower shared heading glitch
- Increased both shared blue/rose glitch durations from 0.78s to 1.2s across home, archive, detail and privacy. Kept offsets, opacity, original text, once-only playback and reduced-motion behavior unchanged.
- Local detail browser confirmed both layers use 1.2s, title remains opacity 1, and playback runs. Shared selector and keyframes serve all four page types. Stylelint, Prettier, WP build and diff checks pass. Local only.
- Proof: work/music-accents-20261018/heading-glitch-slower.png.

### 2026-10-18 Work detail curtain navigation
- Reused the existing early native cross-document View Transition entry. Recognizes current project image anchors alongside older work image contracts, including detail CTA destinations and return links.
- Shared-image morph is replaced on eligible work navigation by a black root backdrop: old snapshot wipes away in 0.55s, then incoming snapshot reveals left-to-right over 0.7s. Image stays in the root snapshot; finished / aborted transitions and BFCache clear the temporary class.
- Standard anchor navigation remains intact; reduced motion and unsupported browsers retain ordinary navigation. No click interception, navigation delay or persistent overlay.
- Browser observed cover/reveal keyframes and temporary curtain class, image-link navigation to detail, keyboard CTA navigation at 390px, completed detail with loaded image, class cleanup, no mobile horizontal overflow and no console errors. Captured transition and completed detail in work/music-accents-20261018/curtain-transition.png and curtain-detail-complete.png.
- Stylelint, ESLint, Prettier and WP build pass. Local only; no production changes.

### 2026-10-18 Slower curtain across all frontend pages
- Removed work-image eligibility as the gate for same-origin frontend cross-document transitions. TOP, archive / pagination, detail and policy navigation now use the same curtain, retaining optional work-image stabilization, native links and cleanup.
- Cover 0.9s, fully covered pause 0.15s, reveal 1s: total 2.05s. Reduced motion, unsupported browsers and same-document anchors keep their existing behavior.
- Browser verified detail-to-policy and policy-to-TOP with active curtain, computed 0.9s / 1s / 1.05s timings, full-cover state and final class removal. No console errors. Stylelint, ESLint, Prettier, WP build and whitespace checks pass. Local only.
- Proof: work/music-accents-20261018/curtain-all-pages.png.

### 2026-10-18 Curtain completion before heading / light-cue entry
- Early head entry marks entrance playback pending until pagereveal determines whether a native transition exists. Incoming transition.finished releases the shared motion initializer; skipped / aborted transitions also release it. Direct loads start normally after pagereveal. Cues reserve their space but stay hidden during the curtain.
- All page heading glitches / light cues now initialize after the curtain, using one common event gate rather than guessed timers. Other content stays readable; existing reduced-motion behavior remains.
- Reduced curtain cover to 0.55s, pause 0.05s, reveal 0.65s (total 1.25s, previously 2.05s). This reduces animation-imposed wait by 0.8s; server response improvement is not claimed.
- Browser verified pending=true / no heading initialization during TOP curtain, then six initialized headings after completion. Policy navigation showed pending=true and hidden cue during curtain, then pending removed / heading shown / cue complete. At 390px six headings and cues, no duplicates or horizontal overflow. No console errors.
- ESLint, Stylelint, Prettier and WP build pass. Local only. Proof: work/music-accents-20261018/curtain-then-heading.png.

### 2026-10-18 Actual navigation loading performance
- Diagnosed HTML TTFB as the dominant cost (3.8–4.0s samples), with Windows/Docker bind-mounted PHP bootstrap overhead. Fixed archive render-blocking expectation pointing at a missing image ID; detail now waits for its title instead of a lower image.
- Enabled native WordPress moderate HTML prefetch, preserving logged-in disabling and core exclusions, additionally excluding private-works. Browser confirmed navigational-prefetch delivery with 0ms HTML TTFB, DOMContentLoaded 1066ms and load 1095ms for a new detail navigation.
- Local-only PHP metadata / realpath cache tuning applied and persisted in wp-env mapping; timestamp validation retained. Warm samples improved but cold / spaced requests remain variable (details in doc/local-navigation-performance.md); no universal speedup ratio claimed.
- Kept curtain / heading sequencing unchanged. Removed temporary theme and MU profiler. PHP lint, Prettier, whitespace checks, public/admin prefetch behavior, 13 published works (no DB changes), valid expectation targets, mobile layout and browser console verified.
- Proof: work/music-accents-20261018/navigation-performance-detail.png and navigation-prefetch-measurement.json.

### 2026-10-18 Faster first access with Docker-native core storage
- Moved only the installed WordPress 7.1.3 core from Windows bind storage to a project-scoped external Docker volume. Theme / plugins / uploads and MySQL mounts remain unchanged; no database import or reset. Original core and pre-migration SQL backup retained.
- Cold restart first-request comparison for /works/: before server 7383ms / TTFB 7386ms / load 8442ms; after server 1469ms / TTFB 1472ms / load 1657ms. Restore then reapply first-request retest TTFB 1720ms / load 1848ms. About 77–80% less HTML response wait in these local samples, not a general SLA.
- Added safe one-time core seeding, readiness marker, validated Compose merge, failure rollback, optimize/restore scripts and normal wp-start integration. Repeated execution and actual restore/reapply tested. Corrected the previous PHP ini persistence: wp-env mappings are document-root relative, so Compose now mounts it at the real PHP configuration path.
- Verified original 13 published work IDs/statuses, localhost URL, timestamp validation, private auth reconfiguration, ten archive cards, curtain pending state followed by completed headings/cues, mobile no overflow and no console errors. Removed temporary measurement markup; targeted ESLint/Prettier and whitespace checks pass.
- Evidence: work/music-accents-20261018/core-storage-before.json, core-storage-after.json, core-storage-restart-retest.json and core-storage-final.png. Operational notes / reversal: doc/local-navigation-performance.md.

### 2026-10-18 TOP startup / mobile rendering and Git skill
- Preload the scene module only on TOP, reserve the JS-enabled scroll journey before import, and give server-rendered title text a paint opportunity before constructing WebGL. Import/initialization failure keeps the fallback; pagehide cancels pending startup frames.
- Mobile surface/atmosphere geometry: 12096 to 2976 triangles (~75% fewer). Preserve particle counts, round shape, rhythm, bands/rim/flare. Mobile DPR cap 1 instead of 1.25 gives up to 36% fewer pixels on high-DPR devices; existing mobile30 / desktop60 frame caps and pause behavior retained.
- Added conservative adaptive framebuffer scaling based on measured scene submission cost (not occlusion-driven rAF gaps). It does not remove effects or change CSS size / rhythm.
- 390px sample: scene discovery after TTFB 273ms to 17ms, first frame after TTFB 446ms to 310ms, FCP after TTFB 311ms to 194ms. PC FCP delta 195ms to 158ms; PC sphere first-frame delta increased 253ms to 294ms due to text-first scheduling. No universal timing / FPS guarantee. Browser frame delivery varied; physical phone GPU/CPU was not emulated. See doc/top-performance-20261018.md and before/after JSON evidence.
- Added Git card with user-confirmed 3 years / professional experience. Verified card content, TOP modulepreload, mobile 2976 triangles / ratio1, approach-to-inside scrolling, rock / cyan-rose-amber effects, no overflow or console errors. Diagnostics removed, viewport reset. ESLint / Stylelint / Prettier / PHP lint / WP build pass; existing large Three chunk warning remains.
- Proofs: work/music-accents-20261018/top-performance-desktop.png and skills-git.png. Local only; production untouched.

## 2026-10-18 一覧・詳細・プライバシーポリシーの背景
- ローカルのみ更新。本番への接続・更新、DB変更なし。
- 一覧: CSSの粒子12個。スクロール時のみ再生速度を緩やかに上げ、停止後1.00倍に戻ることをブラウザーで確認。
- 詳細: 両端の青い光がゆっくり移動。プライバシーポリシー: ごく淡い光の明滅。中央の本文を明るくしない配置。
- 390px幅: 一覧は6粒子・30秒周期、詳細は光1つ・32秒、ポリシーは40秒。3ページとも横はみ出しなし。実機性能ベンチマークは未実施。
- WebGL/画像/外部通信の追加なし。非表示タブは停止。動きを減らす設定ではCSSアニメーションを無効化し、強制カラーでは背景を非表示（コード確認）。
- TOPには背景要素を出さず、既存の球体を維持。操作を妨げないpointer-events:none。ブラウザーのエラーログなし。
- ESLint、Stylelint、Prettier、PHP構文検査4ファイル、Viteビルド、diff --checkを通過。既存Three.jsのチャンクサイズ警告は継続。
- 証跡: work/music-accents-20261018/subpage-backdrop-{list,detail,privacy}.png

### 背景の視認性を調整
- 光のグラデーションを広げ、中心の青の濃度を18%から52%へ変更。本文中央は暗く、画面端で光の移動が分かる配置を維持。
- 一覧粒子はPC28px・スマホ20pxへ拡大。個数12/6は据え置き。CSSの移動幅と明度変化を強め、詳細16秒・ポリシー20秒（スマホ22/26秒）へ調整。
- 装飾要素・JS・外部リソース追加なし。PC表示と390px幅で背景反映、横はみ出しなし、コンソールエラーなしを確認。
- Stylelint、Prettier、Viteビルド通過。証跡: work/music-accents-20261018/subpage-backdrop-brighter.png。本番変更なし。
