# 光のアニメーション

androp「Bright Siren」の[MV](https://www.youtube.com/watch?v=hYgw7XRf5nc)と[PARTYの制作紹介](https://prty.jp/projects-detail/androp-bright-siren)を参考に、点光源の規則的な配置と順次点灯、発光の余韻をポートフォリオへ取り入れた。音源や映像はサイトへ組み込んでいない。

## 奥に固定した光の壁・Bloom

2026年10月4日、FVとContactの波打つ座標移動を削除し、奥に固定した光の壁へ変更した。参考MVの1:27・2:25付近で、規則的な光の壁と手前の暗い空間、床に残る反射を確認した。[制作担当者の説明](https://whatever.co/work/andropbright-siren/)でも、250台のカメラを壁状に並べてストロボを制御したと記されている。近景のぼけ光は、サイトで前後の距離を分かりやすくするための追加表現である。

`_portfolio-webgl.js`の`createWebglLightStage()`が既存の98／49点と生成WebPを描画する。GSAPの5種類の点灯は引き続きDOMのopacityへ書き込み、WebGLはその値だけを読み取る。元のopacity・transformは書き換えない。セクション内のcanvasなので、FVのスクロール移動とContactの親opacity 0.70を一度だけ継承する。

光の壁は元の格子から幅90%・高さ76%へ投影する。PC・スマートフォンとも透視係数0で、行を水平・列を垂直にそろえた正面の平面として扱う。灯のshader・器具のCPU投影・床の始点は同じ係数を使い、画面幅の変更時に再計算する。点灯だけを変え、時刻による位置のうねりは行わない。画面周辺の7点の大きなぼけ光と床反射で距離の差を作る。光点の位置・光量はマウスへ追従しない。

床反射は壁の下端を基準に、画面高さの75〜80%から手前へ広げる。元の各灯へ1対1で対応し、入力gainは0.95。増量調整では反射サイズを前版から約39〜58%拡大し、縦方向の厚みを42〜84%へ増やした。手前ほど横位置を広げ、最前列でも光量を40%残す。最前列の中心は画面高さ97%へ置き、下端での欠けを減らす。床の点描画には距離による減衰後の20%を使い、Bloomの柔らかな反射も重ねる。Bloomには全体の0.18／0.14の合成強度を掛ける。SCSSの静的な床の周辺光も維持する。

光の背後には小さな暗い器具面と0.8pxの横桟を固定して描く。灯と同じ投影で位置と大きさを決めるが、点灯入力には依存せず、消灯時も薄く残る。器具のalphaは文字の位置で変更しない。壁の大きさ・配置を変更する案は今回採用していない。

文字背後の減光は、ユーザーの指定により点灯設定とWebGLの両方から削除した。壁・床反射・前景ぼけ・器具・Bloomで文字位置による光量の差を付けない。壁・反射・前景は元の点灯入力を共有し、元灯をすべて消すと発光する層は消灯する。暗い器具・横桟は残る。器具の1passを含めて合計6 drawcalls、光の描画点数はPC203／スマートフォン幅105。器具98／49個と横桟91／42区間は1134／546頂点の静的triangle bufferで描く。

Bloomは明るい光だけをcanvasの縦横1/4のFramebufferへ描き、水平・垂直の2方向でぼかして合成する。強度は768px以上で0.18、狭い画面では0.14。文字領域の減光マスクは使わない。点灯入力は全灯同じ上限1.25まで読み取り、spriteのalphaを最大1へ制限してから同じ値でRGBをpremultiplyする。既に白い芯には表示上限があるため、25%は点灯ピーク値の増加を指し、全ピクセルの測定輝度の増加率ではない。

描画DPRはPCで最大1.5、スマートフォン幅で最大1。canvasの画素数は約180万までに抑え、GPUのtexture／viewport上限も確認する。ResizeObserverで配置と描画サイズを更新し、同じサイズではBloom用の資源を再利用する。追加の3Dライブラリ・画像・音源は使用していない。

初回の正常描画後にだけ`is-webgl-light`を付け、元の格子の見た目を隠す。DOMは計測と点灯入力のため保持する。WebGL非対応・生成失敗は元の光点へ戻し、永久的な描画失敗ではcanvas・GPU資源・監視を解放する。Context lossは復旧イベントを保持して元の光へ戻り、復旧後にGPU資源を再生成する。画面外・非表示タブ・描画省略・pagehideではRAFを止める。pageshowは座標を計測し直し、可視条件を満たす場合のみ再開する。動きを減らす設定では元の静止光、強制カラーでは装飾非表示を使う。

PCを含む全幅の整列修正後、最終rendererの制御26件が成功し、PCのFV・Contactを実WordPressで確認した。証跡は`work/webgl-light/all-width-alignment-*`。先に行ったスマートフォン幅の整列修正は`mobile-alignment-*`へ保全した。点灯25%増と文字位置による減光の削除後にはrendererの制御24件とGSAP・統合50件が成功し、`uniform-light-*`に保存した。今回animationとinteractionは変更していない。スクロール進捗・無追従の制御6件は以前に成功した。器具追加時には独立したローカル画面で実GPUによる描画・全灯消灯時の器具・Context喪失と復旧・destroy後canvas0枚を確認した。床増量時は`stronger-floor-*`、器具追加時は`floor-fixtures-*`に保存した。制御試験のGPU・DOM・Observerはfixtureであり、実GPUと画像の描画とは区別する。最新の確認結果と範囲は[design-qa.md](../design-qa.md)を参照。

## 表現

- FV：14列×7行の光点。767px以下では7列×7行に減らす。sweep・ripple・cascade・diagonal・sparkleの5種類から、再生ごとに直前の種類を除いてランダムに選ぶ。
- 文字の背後：周辺と同じbase・peak・scaleを使う。DOMの光点の座標は固定し、opacityとscaleを変える。WebGLではこの格子を基準に奥の固定平面を描く。各点の元サイズはfluid(40px, 54px)、DOMのscaleは全灯で最大1.2。
- Works・Skills・About：見出し下の7点はsweep・ripple・sparkleから1種類をランダムに選び、表示時に一度だけ再生する。余韻を残して静止し、画像や本文へ光を重ねない。
- Contact：FVと同じ5種類を再利用する。親opacityは0.70、各点のpeakにはさらに0.9を掛ける。本文・Gmailの背後も他の位置と同じ光量を使う。

FVは`timeScale(1 / 0.64)`、Contactは`timeScale(1 / 0.7)`で再生する。点灯の間隔・上昇・減衰の時間は、初期実装の`timeScale(1)`を基準にFVで36%、Contactで30%短くなる。直前版と比べるとFVで約25%、Contactで約24%短い。末尾の休止も定義上1.6秒から0.9秒へ減らしたため、待ち時間を含む周期全体は直前版からおよそ3割短くなる。休止の実時間はFVが0.576秒、Contactが0.63秒。

点灯と減衰の曲線は、`buildLightFadeProgress(t)`のsmootherstep（6t⁵ − 15t⁴ + 10t³）を使う。opacityとscaleの変化は、開始・頂点・終了で速度と加速度が0になるため、上昇から減衰へ滑らかにつながる。各パターンのrise・fade・開始間隔・strengthは維持する。

各パターンの1周期は、`(最後の点灯開始時刻 + rise + fade + 0.9) × 時間係数`で求める。時間係数はFVが0.64、Contactが0.7。sparkleは生成時のランダムな点灯時刻によって周期が変わるため、表には約値の範囲を示す。

| パターン | 点灯順                         | FV・14列（約） | FV・7列（約） | Contact・14列（約） | Contact・7列（約） |
| -------- | ------------------------------ | -------------- | ------------- | ------------------- | ------------------ |
| sweep    | 左右のどちらかから列順         | 4.48秒         | 3.36秒        | 4.90秒              | 3.68秒             |
| ripple   | 中央から外側へ                 | 4.30秒         | 3.71秒        | 4.71秒              | 4.06秒             |
| cascade  | 上から下へ、列ごとに少しずらす | 4.45秒         | 4.45秒        | 4.87秒              | 4.87秒             |
| diagonal | 対角線に沿って順に             | 5.32秒         | 4.29秒        | 5.82秒              | 4.70秒             |
| sparkle  | 各点をランダムな時刻に         | 2.66〜5.73秒   | 2.66〜5.73秒  | 2.91〜6.27秒        | 2.91〜6.27秒       |

再生時のFVは全灯でbase 0.28・peak 1.25、Contactは全灯でbase 0.22とする。peakは`LIGHT_PEAK_INTENSITY = 1.25`にパターンごとのstrengthを掛ける（cascadeは0.95、sparkleは0.9、ほかは1）。Contactはさらにpeakへ0.9、stage全体へopacity 0.70を掛け、FVより光量を抑える。文字の位置による差は付けない。

WebGLはGSAPが書き込んだinlineの点灯値を読み、1.25まで受け取る。元のDOM光点へ戻る場合はCSS opacityの表示上限1が適用される。JavaScript無効時や動きを減らす設定では、FVとContactの各光点のCSSによる静止opacity 0.22を維持する。

字形、fluid()による文字サイズと余白、作品の並び、実績画像、連絡先は引き続き維持する。見出し下の光点は14〜18pxへ拡大し、見出しと本文の合計間隔は42〜66pxになった。

## 動作と配慮

- FVとContactでは5種類のtimelineを事前生成し、同時に再生するのは1本だけ。種類の選択は再生ごとに行い、点灯時刻や向きはtimeline生成時に決める。
- 画面外と非表示タブでは現在位置で停止し、可視のstageだけ同じ位置から再開する。末尾の休止もtimelineに含め、停止中は次のパターンへ進まない。
- content-visibilityの描画省略時にも停止する。非対応ブラウザーではIntersectionObserverによる可視判定を使用。
- prefers-reduced-motionでは新しい光のtimelineを生成せず、静止した光点と内容を表示する。
- IntersectionObserver非対応時はCSSの静止表示を維持する。
- 強制カラーでは装飾を非表示にする。装飾はaria-hiddenで読み上げ・操作の対象外。
- ホバーの既存演出はany-hover: hoverの条件を維持。
- 767px／768pxの変更時はGSAP matchMediaが古いtimelineをrevertし、可視点数を再計算する。cleanupはObserverとevent listenerを解除する。

## 見出し・作品画像・リンクの演出

セクション見出しだけを単語・文字へ分割し、各文字を0.6秒・`power3.out`で、左から順に光が点くように表示します。文字ごとの開始間隔は0.045秒で、opacityのみを変えます。文字とglyphはinline、単語はinline-block・nowrapとして、文字の位置と字間を保ちます。Works・Skills・Aboutは隣接する7点のcueと同じtimelineに組み込み、時刻0から同時に始めます。ContactとWorks一覧など、cueが隣接しない見出しはScrollTriggerで初めて表示範囲に入ったときに再生します。FVの名前・作品名・日本語の名前は既存の構造を維持します。

見出しのタグ・ID・フォント・fluid()の文字サイズは維持します。分割した単語に`aria-hidden="true"`を付け、見出しの`aria-label`に元の全文を保持して、セクションの`aria-labelledby`からも同じ名前を参照できるようにします。空白はテキストノードとして残し、単語単位で折り返します。完了済みの見出しをWeakSetに記録し、画面幅や動きの設定による再初期化で再分割・再演しません。cleanupでは元の子ノードと`aria-label`を復元します。JavaScript無効・IntersectionObserver非対応・動きを減らす設定では、分割せず原文を表示します。

作品画像リンクのhoverでは、輪郭に沿って12pxの光源が0.65秒で1周します。既存の画像Reveal・拡大と、小さなスクロール移動を維持し、追加した光はリンクの疑似要素で表示します。詳細ページのリンクではない作品画像は、既存のRevealを使用します。

Worksの作品名・View Project・All Works・Gmail・ヘッダーの名前とナビ・詳細ページの戻る／Contactリンクでは、下線上の10pxの光源を左から右へ0.35秒で一度だけ流します。光源は`background-position`で移動し、文字・光源の寸法を保ちます。画像の輪郭とリンクの下線には既存の生成WebPを再利用します。作品名とヘッダーの名前も同じhover・静止focus・動き軽減・強制カラーの共用ルールを使い、文字サイズ・改行・リンク領域を維持します。ヘッダーの名前のhoverでは既存ナビと同じ0.25秒のtransitionでopacityを0.65へ変えます。

hoverの動きは`any-hover: hover`の条件で有効になります。キーボードのfocusでは輪郭・下線と既存のfocus-visibleを静止表示します。動きを減らす設定では光源の移動を停止し、強制カラーでは光源を隠して通常の線とfocusを残します。疑似要素は`pointer-events: none`で、リンクの操作・読み上げ名を維持します。

## 画像遷移・スクロール進捗

### ページ内リンクの移動

Works・Skills・About・Contactへの同一ページの通常クリックは、ブラウザーの滑らかなスクロールで移動する。リンクのhrefは従来のfragmentを保持し、JavaScriptがクリックだけを処理するため、移動時にURLへ`#works`などを追加しない。既にfragmentがある場合は、現在のhistory.state・pathname・queryを保持してfragmentだけを取り除く。別のページ／query、修飾クリック、新規タブ、download、skip linkは通常のリンク動作を使う。

移動先のsectionには既存の32pxのscroll-marginを使い、そのh2へ`focus({ preventScroll: true })`でフォーカスを移す。一時的に足したtabindexはblurまたはcleanupで外し、元からある値は維持する。動きを減らす設定では即時移動する。初めから4項目のfragmentで開いた場合や実績詳細から戻る場合は、loadとfontの準備後に正しいsectionへ即時補正してfragmentを除去する。待機中の別クリック・pagehideでは補正をキャンセルし、BFCache復帰では再スクロールしない。

処理は独立した`src/assets/js/_portfolio-navigation.js`を共通エントリから読み込む。光・画像遷移・スクロール進捗のソースは変更していない。標準APIの確認資料：[scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView)、[focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)、[replaceState](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState)。

Worksの画像・作品名・View Projectから詳細を開くと、同じ作品の画像を0.38秒でつなぎます。対応ブラウザーの同一オリジンのView Transitionを使い、通常のWordPressリンクで移動します。共有する画像は一度に1枚だけです。画像が読み込み済みで画面内にある場合に共有し、画面外・未読み込みの場合はページの短いフェードを使います。非対応ブラウザーや動きを減らす設定では通常のページ移動になります。

`portfolio-transition.js`は独立した小さなheadエントリです。`pagereveal`より先にイベントを登録するため、moduleに`async blocking="render"`を指定します。`rel="expect"`はページごとの存在するIDを指定し、詳細画像のpreloadには表示画像と同じsrc・srcset・sizesを使います。画像のダウンロードを待つ処理、AJAXによるページ置換、強制スクロールは追加していません。完了時に一時的な共有名を外し、戻る操作で復元されたページでも重複を防ぎます。共有された詳細画像は既存のReveal・Parallaxから外し、表示が再び隠れないようにします。

FVとContactのマウス応答は、ユーザーの指示により削除しました。視点移動・マウス近傍の追加点灯・応答用の格子とCSS・pointer listenerを取り除き、位置を固定してGSAPの点灯だけを使います。作品画像・リンクのhoverは引き続き有効です。

画面上端には1pxの進捗線と10〜12pxの小さな光を表示します。ページ全体のスクロール量を0〜1へ変換して線を伸ばし、先端に光を置きます。8pxの固定領域内へ収め、背景が暗い場所では白、明るい場所では暗い線へ切り替えます。WordPress管理バーの実際の高さにも追従します。スクロールできない短いページでは隠します。

進捗線は非表示タブでは更新を止めます。ページを離れる時はRAF・Observer・イベントを片付け、BFCacheの戻る操作では再設定します。動きを減らす設定と強制カラーでは進捗線を隠します。内容とリンクは引き続き表示・操作できます。

調整箇所は`_portfolio-interaction.js`（進捗・停止条件）、`portfolio-transition.js`（画像選択・遷移条件）、`_c-portfolio-effects.scss`（進捗線）、`_c-portfolio-transition.scss`（0.38秒の遷移）、`portfolio-scroll-progress.php`（装飾の出力）、`func-enqueue.php`（headエントリ・expect・preload）です。

## Aboutの光点イコライザー

2026年10月4日、選定された光の格子を、下から点灯するイコライザー風の演出にしました。8列×12段の96点をAbout右側に置き、既存の透明WebPをモノトーンで再使用します。ゲージの高さは、事前に用意した6種類のパターンの目標値の間を滑らかに補間します。目標高さは3〜12段です。音声の取り込みや解析は行いません。

初回の表示では、高さ0から初期高さ `[4, 7, 10, 6, 11, 8, 5, 3]` まで各列0.65秒・`sine.out`で立ち上げます。初回だけ列を0.02秒ずつずらすため、8列全体の立ち上がりは0.79秒です。

その後は、再生ごとに直前の種類を除いてランダムに選びます。6種類とも共通の初期高さから始まり、末尾で同じ高さへ戻るため、次のパターンへ連続して切り替わります。各周期の時間は初回の立ち上がりを除き、末尾の初期高さへの遷移を含みます。

| パターン    | 高さの変化                           | 1周期  |
| ----------- | ------------------------------------ | ------ |
| spectrum    | 各列が不規則に上下する               | 4.90秒 |
| wave        | 幅のある山が横へ移動する             | 4.80秒 |
| ripple      | 左右対称の山が中央から外側へ移動する | 3.68秒 |
| alternating | 偶数列と奇数列が交互に高くなる       | 3.74秒 |
| sweep       | 細い山が左右を往復する               | 4.16秒 |
| pulse       | 全列が同じタイミングで跳ねる         | 4.04秒 |

1拍0.24〜0.38秒で、上昇を0.192〜0.24秒・`sine.out`、下降を拍全体・`sine.inOut`で補間します。上昇の時間は `min(0.24, 拍の時間 × 0.8)` で決め、残りの拍では頂点を保ちます。列の開始時刻をそろえ、拍の間に休止を追加しません。pulseも列ごとの高さは異なりますが、上下するタイミングはそろえます。

光点の位置と大きさは固定し、高さの境界からopacityを計算します。高さが整数のときは非点灯0.16、点灯0.68、頂点0.84となり、補間途中は境界付近の2点を滑らかに点灯・減衰させます。下段の点灯を保ちながら上端が増減するため、固定した光点でゲージの高さを表します。

初回用と6種類の有限timelineを初期化時に作成し、同時に再生するのは1本だけです。切り替え時は既存のtimelineを先頭から再生し、各フレームでは既存のsetterでopacityを更新します。切り替え・フレーム・拍ごとに新しいTweenを追加しません。最初の `gsap.set()` でopacityの設定をGSAP Contextに登録し、画面幅や動きの設定が変わったときは `revert` でCSSの静止表示へ戻せるようにしています。

1280px以上で表示し、本文の右端から48px以上の間隔を確保します。本文の45rem幅と、見出し・名前・本文の左揃えは維持します。狭い画面では装飾を隠しtimelineも作りません。画面外・非表示タブ・描画省略時は既存と同じ停止・再開の仕組みを使います。動きを減らす設定では高さの異なる静止ゲージにします。1280pxの条件はFVの条件とは分け、装飾の表示切替で既存の演出を再生成しないようにしています。

調整箇所は、`_portfolio-animation.js`の`listLightEqualizerPatterns()`（6種類の形状・目標高さ・拍の時間）、`createLightEqualizerSequence()`（初回の立ち上がり・上昇と下降の速度・ランダム切り替え）、`buildLightEqualizerOpacity()`（高さに応じた明るさ）、`_c-light-stage.scss`（光点・静止表示）、`_p-portfolio.scss`のAbout（配置と寸法）、`portfolio-light-equalizer.php`（初期の点灯高さ）です。デザイン比較は[design-qa.md](../design-qa.md)、ブラウザー証跡・制御試験は`work/light-equalizer/`にあります。

## 光源の素材

`src/assets/images/light_strobe.webp`はbuilt-in ImageGenで生成した透明ビットマップ。256×256px、13,346 bytes。単一の白いコアと短い冷白色のハローを反復して使用する。Sharpで縮小・WebP化した。元画像、生成プロンプト、alpha検査の結果は`work/light-motion/`に保存。

生成プロンプトの要点：透明背景、正面向きで中心にある単一の白いカメラストロボ。小さく鮮明な白コアと短い冷白色ハロー。機材、背景、光線、星形、文字、複数の光点を含めない。

## 調整箇所

- SCSS：`src/assets/styles/components/_c-light-stage.scss`で光源のサイズ・配置・Contactの親光量、`projects/_p-portfolio.scss`でFV背景・見出し間隔・文字分割の表示・作品画像の輪郭・リンク下線の光を管理。
- JavaScript：`src/assets/js/_portfolio-animation.js`のlistLightPatterns()で5種類の点灯順・rise・fade・strength、LIGHT_PEAK_INTENSITYで点灯ピーク値、buildLightFadeProgress()でFVとContactの点灯・減衰曲線、createLightSequence()で速度・光量・scale・ランダム再生・休止、createLightCueSequence()でcueの3種類と見出しの同時再生を管理。createHeadingLetters()で見出しの分割・読み上げ名・復元、initHeadingReveals()でcueとの対応・ScrollTrigger・完了済み見出しの管理を行う。
- PHP：`template-parts/portfolio-lights.php`で7行×14列、`portfolio-light-cue.php`で見出しの7点を出力する。

## 最新の速度・滑らかさの調整の検証

今回の変更はFV・Contactの再生速度・末尾の休止・点灯と減衰の曲線です。上の周期表はソースの設定から再計算しました。最終sourceの制御・回帰48件が成功し、20周期・光の連続境界・停止復帰・既存見出し／Aboutの6種類を確認しました。結果は`work/light-motion/fast-smooth-playback-results.json`、実ブラウザーの記録は`work/light-motion/faster-*`に保存しました。lint・buildも成功しています。実測結果と実ブラウザーで確認した範囲は[design-qa.md](../design-qa.md)を参照してください。

## 画像遷移・マウス反応・スクロール進捗追加時の検証（履歴）

画像遷移・マウスの光・スクロール進捗の3演出を追加しました。マウス・進捗の制御試験18件、画像遷移の制御試験82件、既存の光・見出しの回帰43件が成功しています。最終JS・SCSS・PHPのlint／format・PHP構文・wp buildを確認しました。画像遷移の実source制御結果は`work/interaction-effects/transition-test-results.json`、最終配信・実画面とブラウザーの検証範囲は[design-qa.md](../design-qa.md)に記録しました。PCでのマウス反応、スクロール進捗、Works詳細への移動と画像共有、375pxの表示も確認しています。

以下は先に追加した見出し・作品画像の輪郭・リンク下線の検証です。対象JS・SCSSのESLint／Stylelint／Prettierと`build:wp`が成功しました。実GSAP 3.15.0と当時のproduction sourceの制御試験43件が成功し、見出しの同時開始、原文・ARIA・元ノードの復元、一度の表示、停止・復帰、FV／Contact／Aboutの回帰を確認しています。

実ブラウザーでは文字ごとのopacity変化とcueの同時再生、元の書体・字間、作品輪郭0.65秒／下線0.35秒の一度のhover、キーボードの静止focusを確認しました。375pxと1440pxで横のはみ出しはなく、consoleのerror／warningは0件です。証跡と制御fixture・実機の検証範囲は[design-qa.md](../design-qa.md)へ記録しました。以下の36件は、この追加前の速度・光量調整の結果です。

2026年10月4日のFV・Contactの速度と光量調整では、対象JS・SCSSのESLint／Stylelint／Prettierと`build:wp`が成功。実GSAP 3.15.0とproduction sourceの制御試験36件が成功し、速度、14列・7列の減光範囲、停止・復帰、ランダム切り替え、Aboutの6種類の動きを確認した。1440pxのFV・Contactと375pxのContactを実ブラウザーで撮影し、横のはみ出しなし、consoleのerror／warning 0件を確認した。実機・OS設定の切り替えと制御fixtureの範囲は[design-qa.md](../design-qa.md)に記録した。

## 光点の複数パターン導入時の検証（履歴）

今回の更新では`build:wp`、対象JSのESLint、SCSSのStylelint、対象コードのPrettierが成功。実GSAP 3.15.0とproduction JSを使うNode VMの制御試験15件が成功し、100回の切り替えで全5種類への到達と連続重複0を確認した。追加100回後もContext記録数とtimeline数は増加しなかった。

DOM・IntersectionObserver・matchMedia条件は試験用fixtureのため、実機やOS設定の確認とは区別する。PC・スマホ・タブレットの表示、画像、停止状態、ブラウザーconsoleを別途確認した。今回の詳細は[複数パターンと光量のQA](light-random-qa.md)に記録している。

光点を導入した初回の制御試験9件と画像比較は[初回のデザインQA](../design-qa.md)、面状光の確認は[変更前のQA](portfolio-design-qa-initial.md)に残した。`work/light-motion/`と`work/light-random-motion/`の証跡はローカル作業用でGit管理対象外。
