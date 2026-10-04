# PCを含む全画面幅でFV・Contactの光点を水平に

確認日：2026-10-04。実装URL：http://localhost:8888/。final result: passed

PCでは透視係数0.1が残っていたため、光の行が斜めになっていた。全幅で共通の係数0へ固定し、PCも行を水平・列を垂直にそろえた。壁のshader、器具のCPU投影、床始点、main／Bloomの描画は同じ係数を使う。床反射・周辺ぼけ・点灯入力1.25・均一光量・点灯速度は維持する。PCのDPR上限1.5とBloom0.18、モバイルのDPR1とBloom0.14、描画と資源の上限、停止／復帰も維持。

- ESLint・Prettier・JS構文確認・WordPress用Vite build／clean-dev-filesが成功。配信JSは`script.BuPhyUGN.js`、CSSは`style.CVGxJClN.css`。renderer SHA256は`18929fa965974715c362939704c4a77ab7b6e9877728af041fcefce7a12a9469`。変更はperspectiveDepthのconst0化と、配置更新時のPC用0.1代入の削除だけ。
- 最終rendererの制御26/26件が成功。FV・Contactの計12条件で器具の行y・列xのズレ0と水平な横桟、PC・モバイル・768px境界のmain／Bloom係数0、床始点、DPR／Bloomの分岐、停止／復帰を確認。結果は`work/webgl-light/all-width-alignment-control-results.json`。旧ハーネス・結果は`history/before-all-width-alignment-fc6527f2/`へ保全。
- 実WordPressのPC1284px幅でFV・Contactの水平・垂直の光点、床反射、文字とGmailリンク、最新JSの配信を確認。98灯、document幅／scroll幅1269pxで横はみ出しなし。375px幅のContactも49灯、document幅／scroll幅360pxを確認。両タブのconsole error／warningは0件。画像とDOM状態は`work/webgl-light/all-width-alignment-*`。

制御のGPU・DOM・mediaはfixtureで、数値はCPU器具bufferの確認。実GPUの描画はブラウザー画像で別途確認した。全frameの速度・GPU負荷や他ブラウザーは今回の測定範囲外。

---

# ヘッダーの名前リンクのホバー演出（PC光点整列前の履歴）

確認日：2026-10-04。final result: passed

左上のTAISEI FUNASAKAへ既存の光下線traceを追加した。any-hover条件で光を0.35秒で一度流し、文字opacityを0.25秒で0.65へ変える。静的focus・暗／明背景の光量・動き軽減・強制カラーの共用分岐にも名前リンクを追加。既存の文字設定・flex・min-height44px・ホームへのURLは維持する。

Stylelint・Prettier・WordPress用Vite build／clean-dev-filesが成功。配信CSSは`style.CVGxJClN.css`、JSは`script.D1xHRMMP.js`のまま。SCSS SHA256は`8b3f8241254855329f4fcec20914be5a92d34e40b97a6693198dda2132d11c5e`。ブラウザーで最新CSSの配信、通常表示、ホームリンク、Shift+Tabでのfocus-visibleと静的下線、console error／warning0件を確認。hoverの分岐と特殊設定はソースを確認し、実ポインターのhover中のframe計測は行っていない。画像とDOM記録は`work/brand-hover/`。小さな共用CSS追加のため新しい制御テストは追加していない。

---

# ページ内リンクの滑らかな移動とfragment非表示（名前リンク演出追加前の履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

Works・Skills・About・Contactの同一ページの通常クリックにnative smooth scrollを追加した。URLへfragmentを追加せず、既存fragmentがある場合はhistory.state・pathname・queryを保ったまま除去する。リンクのhref自体は維持し、JavaScript無効時・修飾クリック・新規タブ・別ページ・別query・skip linkでは通常の導線を使う。

- 新しい`_portfolio-navigation.js`を共通エントリへ追加。sectionの既存scroll-margin32pxを使い、h2へpreventScroll付きでfocusする。一時tabindexはblur／cleanupで復元。動きを減らす設定ではinstantを使う。
- 初期fragmentや実績詳細からの着地はloadとfontの準備後に即時補正し、fragmentを除去。待機中の別クリック・pagehide・hash変更では旧ターゲットへの補正をキャンセルし、BFCache復帰はclick listenerの再登録だけを行う。画像遷移・光・進捗のソースは未変更。
- ESLint・Prettier・JS構文確認・WordPress用Vite build／clean-dev-filesが成功。配信JSは`script.D1xHRMMP.js`、CSSは`style.SMvrAziP.css`。navigation SHA256は`8930a73c9df1b3c6ee64ac9c3c9c86cf83a3db86dbe16790cdaea9ac2836438e`。
- 独立した制御18/18件が成功。対象判定・smooth／instant・URL／state保持・focusとtabindex復元・初期補正のキャンセル・BFCacheとcleanupを確認。`work/section-navigation/control-results.json`。DOM・history・mediaはfixtureで、実ブラウザーの描画や時間は測定しない。
- 実WordPressの375px幅とPC1284px幅で4リンクのスクロール中と完了後の位置変化、fragmentなしURL、h2 focusを確認。Works・Skills・Aboutのsection上端は32px前後へ着地し、Contactはページ末尾の上限で全体を表示する。preview queryも保持。Next Realtyの詳細リンクと、詳細からContactへ戻りfragmentを除去する導線も確認。EnterでWorksへ移動後、Tabで先頭の実績画像リンクへ進み、一時tabindexが除去されることも確認。両タブのconsole error／warningは0件。証跡は`work/section-navigation/`。

スクロールの速度とイージングはブラウザーが決める。OSの動き軽減設定の実切替と他ブラウザーは今回の実画面確認範囲外。

---

# スマートフォン幅でFV・Contactの光点を整列（ページ内移動追加前の履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

スマートフォン幅でもPC用の透視係数0.1を使っていたため、光の行が斜めになっていた。767px以下では係数0、768px以上では従来の0.1を使う。壁の光・器具の中心とサイズ・床の始点へ同じ係数を適用し、mainとBloomの描画にも同じuniformを送る。

- 点灯ピーク1.25と全位置の均一光量、床反射の形状とgain0.95、前景、5種類の点灯、速度を維持。描画と資源の上限、画面外／hidden／描画省略での停止、設定変更・Context lossの復帰処理も維持。
- ESLint・Prettier・JS構文確認・WordPress用Vite build／clean-dev-filesが成功。新しい配信JSは`script.DVDHm7JK.js`、CSSは`style.SMvrAziP.css`。renderer SHA256は`fc6527f291a0e1c1c21a95f7941c7215fb1164461c2233506631107dd179e035`。animation／interactionは未変更。
- 最終rendererのGPU制御26/26件が成功。FV・Contactの320／375／600／767px相当で投影済み器具の行列・横桟の整列、PCの透視維持、main／Bloomのuniform一致と床始点、画面外での幅切替・停止・復帰と資源数一定を確認。viewport768px／stage753pxの境界でも両セクションが透視係数0.1・14列98灯となり、stageの幅ではなくmedia条件を使うことを確認。結果は`work/webgl-light/mobile-alignment-control-results.json`。以前の光量統一の結果は別ファイルで保全。
- 実WordPressの375px幅でFV・Contactの水平な光点、床反射、文字とGmailリンクを確認。49灯でdocument幅／scroll幅360px、横はみ出しなし。PC1284px幅では98灯と従来の奥行き、最新JSの配信、console error／warning0件を確認。画像とDOM状態は`work/webgl-light/mobile-alignment-*`。

制御のGPU・DOM・mediaはfixtureで、整列の数値はCPUの器具bufferを確認したもの。実GPUの描画はブラウザー画像で別途確認した。全frameの速度・GPU負荷や他ブラウザーは今回の測定範囲外。

---

# FV・Contactの点灯25%増と文字背後の光量統一（整列修正前の履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

ユーザーの指定により、文字背後も周辺と同じ点灯値・広がりにそろえた。点灯ピーク値は1から1.25へ変更。FVの全灯baseは0.28、Contactは0.22、scaleは全灯1.2を使う。Contactのpeak係数0.9・親opacity0.70は維持する。文字の位置で光量を変えるGSAP設定と、壁・床反射・前景・器具・Bloomのquiet判定とマスクを削除した。

- rendererはinlineの点灯値を全位置で上限1.25まで読み取る。spriteのalphaを最大1へ制限し、同じ値でRGBをpremultiplyする。白い芯には表示上限があるため、25%は点灯ピーク設定の増加率を指す。元DOMのCSS描画へ戻る場合はopacityの表示上限1が適用される。
- 壁の位置、床の形状とgain0.95、器具と横桟、7点の前景、5種類の点灯、速度、画面外／hidden／描画省略の停止、無マウス追従を維持。6 drawcalls・203／105点・FBO2枚・DPRとpixel上限も維持する。
- ESLint・Prettier、WordPress用Vite build／clean-dev-filesが成功。配信JSは`script.CVtDdVKk.js`、CSSは`style.SMvrAziP.css`。renderer SHA256は`2e19921e076b608777601fd3df40486542541eed7916637e01bd34998098b2b2`、animationは`e6d11a47f31f8e970ea8ca6f3a3d23cd375f64169c49b0ff6fb53044ce969297`。
- 新契約へ更新したGPU制御24/24件が成功。全294 source cellsの位置による抑制なし、最大入力1.25、過剰／負入力のclamp、mask・uniformの撤去、静的座標・消灯・器具維持・資源と停止／復旧を確認。`uniform-light-control-results.json`。
- 実GSAPの回帰・統合50/50件が成功。全1470ピークが25%増、全位置の同じbaseとscale1.2、既存の周期・型境界・停止・cleanupを確認。`uniform-light-playback-results.json`。interactionは未変更をSHA照合し既存6/6証跡を維持した。旧ハーネスと結果は`work/webgl-light/history/before-uniform-light-d227fead/`へ保全。
- 実WordPressのPCと375px幅で新shaderの正常描画・文字背後の光・床反射・文字とGmailリンクを確認。モバイルは49灯、document幅／scroll幅360pxで横はみ出しなし。証跡は`work/webgl-light/uniform-light-*`。実DOMでFVのinline点灯値1.2494（peak1.25直前）、Contactの1.1243（peak1.125直前）を観測し、CSSの表示上限を超える値がrenderer入力に保持されることを確認した。

制御のGPU・DOM・mediaはfixture。実画面で光と文字の見え方は確認したが、全frameの速度・GPU負荷、他ブラウザー、実OSの動き軽減／強制カラー変更は今回の測定範囲外。

---

# FV・Contactの床反射の増量（光量統一前の履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

床反射のサイズを約39〜58%拡大し、縦の厚みと手前の光量を増やした。gainは0.85から0.95、手前の残光は20%から40%へ変更。最前列の中心を画面高さ97%へ移し、下端での欠けを減らす。減光後の20%の反射を既存の点描画に重ね、Bloomだけでは薄かった床を見えやすくした。

- 拡大した床の直描画にも、画面固定のquiet矩形と20pxのsoft edgeを掛ける。各描画先の実viewportでgl_FragCoordを正規化し、DPRやBloomの縮小解像度でも位置を合わせる。壁・器具・5種類の点灯・無追従・6 drawcalls・FBO2枚・描画上限は維持する。
- ESLint・Prettier、WordPress用Vite build／clean-dev-filesが成功。配信JSは`script.UA4CW--b.js`。CSSは`style.SMvrAziP.css`のまま。整形後のrenderer SHA256は`d227feadb11c031bb6b2b677fb3c469bb36f842438218ce5413cf853dcbd5d8f`。
- 最終rendererの制御24/24件が成功。無追従・消灯・器具維持・描画順・資源上限・停止・復旧を確認。証跡は`work/webgl-light/stronger-floor-control-results.json`。旧結果は別ファイルに保全。未変更のGSAP／interactionを再実行していない。
- 実WordPressのPCと375px幅で最終shaderの正常描画と、反射・文字・Gmailリンクを確認。モバイルは49灯、document幅／scroll幅360pxで横はみ出しなし。画面と状態は`stronger-floor-*`へ保存。

制御のGPU・DOM・mediaはfixture。実ブラウザーでは画素の見え方を確認したが、全frameの速度・GPU負荷や他ブラウザーは今回測定していない。

---

# FV・Contactの床反射と暗い器具（増量前の履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

選択された②床反射・③暗い器具と横桟を追加した。光の壁の配置・大きさと5種類の点灯は維持する。反射は壁の根元から手前へ広がり、厚みとぼけを増やして減衰する。暗い器具は点滅と独立して固定し、光が消えたときにも残る。マウス追従や波の移動は追加していない。

- 床反射は元の98／49灯と1対1で対応。gain0.85をBloomだけに描き、合成強度0.18／0.14で抑える。文字の減光を維持。静的な床の周辺光も追加した。
- 器具98／49個と0.8pxの横桟91／42区間は静的triangle bufferで1pass描画。合計6 drawcalls、光203／105点、DPR上限1.5／1・約180万pixel・Bloom FBO2枚は維持。これはソース上の予算であり、GPU負荷測定ではない。
- JSのESLint・SCSSのStylelint・Prettier、WordPress用Vite build／clean-dev-filesが成功。配信JSは`script.p8Bq-Jc3.js`、CSSは`style.SMvrAziP.css`。renderer SHA256は`9bb69b00b0688147952511f74e4cb91f01eefe8c63c142cc5cadd47055c8deb9`。
- 最終production ESMのGPU制御24/24件が成功。全入力0でも器具だけが残ること、固定geometry・quiet・無追従・描画順とclear、新資源の生成失敗時cleanup、停止・BFCache・Context喪失と復旧を確認。`work/webgl-light/floor-fixtures-control-results.json`。GPU・DOM・mediaはfixtureなので実画素・速度は証明しない。
- 無追従・スクロール進捗6/6件、実GSAPの回帰・統合50/50件も成功。最終の色・光量調整後は、変更していないinteraction／animation／SCSSのhash一致を確認。`non-pointer-interaction-results.json`・`playback-regression-results.json`。
- 実WordPressのPC1284×869pxでFV canvas1269×869・Contact1269×550を確認。375×812pxでは49灯・FV360×812・Contact360×403。document幅／scroll幅360pxで横はみ出しなし。Contact opacity0.70・Gmailのmailtoを維持。画面は`floor-fixtures-{fv,contact}-{desktop,mobile}.png`。
- 独立したローカル確認画面で最終GLSL・WebPを実GPUで描画し、消灯時の暗い器具、Context喪失時の元格子表示、復旧後の再描画、destroy後canvas0枚を確認。`floor-fixtures-gpu-lifecycle-check.json`と`floor-fixtures-gpu-{live,dark,fallback,restored}.png`へ記録した。

実OSの動き軽減・強制カラー変更、実機タッチ、Safari／Firefox、全frameの速度・GPU負荷測定は今回の確認範囲外。静止画像は点灯全体の滑らかさを証明しない。

---

# FV・Contactのマウス追従の削除（履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

マウスに光点が追従しないよう、rendererの視点移動・`u_tilt`・補間時計・pointer listenerと、マウス近傍の点灯格子・専用CSS・監視を削除した。固定壁・前景ぼけ・床反射とGSAPの5種類の点灯を維持。作品・リンクのhover、スクロール進捗も維持する。奥行きをさらに強める案は提案のみで、今回の変更へ追加していない。

- 対象JSのESLint・SCSSのStylelint・Prettierと、WordPress用Vite build／clean-dev-filesが成功。配信JSは`script.DoeEAzFZ.js`、CSSは`style.B_D91v5l.css`。
- renderer SHA256は`5d001ebb3c393a2fcf843cbaf5b4f2fa86b771edfa36f489a10ea1cd383b1455`、interactionは`f6004df2bdee3695a8b1ba875758c9763695a1d4b6a03e9b198c01dadf6dd4b4`。
- unchanged production ESMのWebGL制御22/22件が成功。fine／coarse・Contact／mobileでpointermove・leave・cancel・touch・pen・scroll・入力機器変更後も空間入力と点灯入力が変わらず、pointer／scroll listenerと`u_tilt`・応答MutationObserverが0であることを確認。固定壁の点数・GSAP入力対応・quiet・資源・停止・BFCache・喪失／復旧・cleanupも確認した。`non-pointer-control-results.json`。
- interactionの実sourceを実行した無追従とprogress制御6/6件が成功。応答DOM・host pointer listener・光点への書き込みが0、progressの先頭／途中／末尾・短いページ・管理バー・hidden・BFCache・動き軽減を確認した。`non-pointer-interaction-results.json`。既存GSAP・統合50/50件も成功し、旧pointer証跡は履歴として分離した。
- 実WordPressで新JS／CSSを配信し、応答格子と応答光が0で、FVとContactのWebGLが正常描画していることを確認した。Contactのopacity0.70・Gmailのmailtoを維持し、スクロール進捗も引き続き表示する。証跡は`work/webgl-light/no-pointer-*`。GPUとmediaの制御fixtureは実GPUの画素・速度を証明しない。今回の実OS設定変更・実機タッチ・Safari／Firefox・GPU負荷測定は未実施。

---

# FV・Contactの固定した光の壁と奥行き（追従削除前の履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

ユーザーが不要とした波の座標移動を削除した。MVの1:27・2:25付近で見た固定したストロボの壁、手前の暗い空間、床の反射を参考に、遠景の光の壁・周辺の淡いぼけ光・下端の弱い反射へ変更した。前景のぼけ光は距離差を補助するサイト独自の表現。映像・音源は組み込んでいない。

- 固定壁は元の98／49灯を幅90%・高さ76%へ投影し、右側ほどわずかに小さくする。時間による位置の変化、`u_time`・`u_travel`・`WAVE_PERIOD`・sin／cosを除去した。既存の5種類の点灯とマウスによる弱い視点差は維持する。
- 反射は各灯と同じ点灯入力を使用し、gain0.08で下端14%へ圧縮する。周辺7点の大きな光はBloom側だけに描く。壁・反射・前景をまとめて描き、5 drawcallsを維持。PC203／スマートフォン幅105の描画点、DPR上限1.5／1、約180万pixel上限は維持する。これはソース上の予算であり、実機のGPU負荷を計測したものではない。
- 文字の保護領域は画面上に固定する。投影後の灯の位置・サイズ・マウス移動の余白でもquietを判定し、芯とBloomを抑える。SCSSの静的な周辺減光と暗い空間を追加した。Contactの親opacity0.70、名前・本文・作品・Gmailリンク・Aboutの演出は維持。
- 対象JSのESLint・対象SCSSのStylelint・Prettier、WordPress用Vite build／clean-dev-filesが成功。配信JSは`script.BNWamz9O.js`、CSSは`style.DIJSt1BT.css`。renderer SHA256は`b5c35dab94e74c407114a1b9e8a13471a7b291f23806028f6a7f3d99dc69f9f8`。
- 変更しないproduction ESMをimportした新制御23/23件が成功。時刻のみでは空間入力が変わらないこと、98／49灯・反射・周辺7点の対応、quiet・点灯入力・資源上限・停止・BFCache・喪失イベント前の競合・復旧・cleanupを確認。結果は`work/webgl-light/depth-control-results.json`。GPU・DOM・media・Observerはfixtureであり、実GPUの画素や速度を証明する試験ではない。
- 実GSAPの既存回帰・統合50/50件も再実行して成功。結果は`playback-regression-results.json`。画像遷移とマウス応答の独立sourceは変更していないため、過去の個別試験を再実行していない。
- 実WordPressでPCのFV98灯とcanvas1269×1015、Contact1269×550・opacity0.70を確認。375×812pxで49灯、FV360×812・Contact360×403、document幅／scroll幅360pxで横はみ出しなし。文字とGmailのmailtoを確認した。画面は`depth-fv-desktop.png`・`depth-contact-desktop.png`・`depth-fv-mobile.png`・`depth-contact-mobile.png`。
- 独立したローカル確認画面で最終sourceのGLSLとWebPを実GPUで描画した。描画→`WEBGL_lose_context`による喪失と元格子への切り替え→復旧→destroy後canvas0枚を確認。`depth-gpu-lifecycle-check.json`と`depth-gpu-live.png`・`depth-gpu-fallback.png`・`depth-gpu-restored.png`へ保存。確認用tabとserverは終了。

実ブラウザーのconsoleのerror／warningは0件。通常viewportへ戻し、最新配信のFVを表示した。OSの動き軽減・強制カラー変更、実機タッチ・Safari／Firefox、全frameの速度・GPU負荷測定は今回の実ブラウザー検証範囲外。静止画像は点灯全体の滑らかさを証明しない。

---

# FV・ContactのWebGLの光の波とBloom（置き換え前の履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

選定された「奥行きのある光の波＋弱めのBloom」をFVとContactへ追加した。native WebGL1で既存の98／49点と生成WebPを描画し、GSAPの5種類の点灯とマウス応答のopacityを読み取る。文字背後の光量・移動量とBloomの裾を抑え、Contactの親opacity0.70と既存のスクロール移動を継承する。Works・Skills・Aboutの演出、作品画像と本文は維持した。

- 波は2つの周期で前後に動き、平面上の移動量は10〜22px。fine pointerのマウスでは小さな傾きを補間する。Bloomは1/4の縦横解像度へ描画し、水平・垂直にblurして合成する。強度はPC0.18／スマートフォン幅0.14。DPR上限はPC1.5／スマートフォン幅1、canvasは約180万pixel以内に抑える。
- 正常な初回drawまでDOM光を表示する。WebGL非対応や永久失敗はDOMへ戻り、GPU資源・canvas・監視を解放する。context lossはCSSへ切り替え、復旧時にGPU資源を再生成する。画面外・非表示・描画省略・pagehideで停止し、pageshowは座標と時刻を更新して可視条件を継続する。動き軽減・強制カラーも既存の静止／非表示へ戻す。
- 最終JS・SCSSのESLint／Stylelint／Prettier、WordPress用Vite build／clean-dev-filesが成功。配信JSは`script.C3Z-Jyp0.js`、CSSは`style.BQbHcir9.css`、画像遷移entryは`portfolio-transition.CO6pdL3X.js`。WebGL moduleのSHA256は`9d129fb92facd2e54cf7a661166ebc26fa691337f757a2e8f3f6af682f488d7b`。
- WebGLのproduction ESMを変更せずimportした制御21/21件が成功。RAFの停止・再開と時計の連続性、BFCache、DPRと画素予算、98／49点、quiet領域、マウス入力、resizeでのGPU資源再利用、shader／FBO／画像／GL失敗時の即cleanup、context lossイベント前の競合と復旧を確認した。結果は`work/webgl-light/control-results.json`。WebGL・DOM・画像・Observer・mediaはfixtureであり、GLSLの実GPUコンパイルやピクセルの見た目は別途確認する。
- 実GSAPによる既存回帰とrenderer統合50/50件が成功。48件はWebGL非対応分岐で5種類の光・見出し・About6種類を再検証し、2件はrenderer spyでFV／Contactのみの生成、IO・hidden・描画省略の共通条件、media変更時のexact-once cleanupを確認した。結果は`playback-regression-results.json`。マウス応答・画像遷移はソースが変わっていないため以前の個別試験を再実行していない。
- 実WordPressのFVで98点、WebGL正常描画、元grid opacity0、canvas1269×1015を確認。Contactでcanvas1269×550、親opacity0.70、Gmailのmailtoを維持した。375×812pxでは49点・canvas360×403、document幅360で横はみ出しなし。通常viewportへ戻し、最新JS／CSSでFV playing・Contact paused、各stage canvas1枚を確認した。ブラウザーconsoleのerror／warningは0件。
- 検証用の独立したローカル画面で最終source・WebP・GLSLを使い、実GPUで描画した。`WEBGL_lose_context`による喪失→DOMへの切り替え→復旧後のWebGL再描画と、destroy後canvas0枚を確認した。画面は`gpu-live.png`・`gpu-fallback.png`・`gpu-restored.png`、最終の記録は`gpu-lifecycle-check.json`。検証用tabとserverは終了した。
- 作品名からNext Realty詳細へ移動し、戻った後にstageごとcanvas1枚・合計2枚を確認した。既存マウス応答の入力もFV中央のクリックでopacity0.0718413を観測した。傾きや波の全frameを計測したわけではない。

最終画面は`work/webgl-light/fv-desktop.png`・`contact-desktop.png`・`contact-mobile.png`。配信と状態は`final-preview-check.json`・`contact-desktop-check.json`・`contact-mobile-check.json`に保存。OSの動き軽減・強制カラー変更、実機タッチ・Safari／Firefox、全frameの速度やGPU負荷の測定は今回の実ブラウザー検証範囲外。静止画はアニメーション全体の滑らかさを証明しない。

---

# WORKSの作品名リンクのホバー（履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/#works

final result: passed

作品名のリンク`.p-portfolio-work__title a`を、既存の光が流れる下線の共用対象へ追加した。any-hover: hoverで0.35秒・1回だけ光が左から右へ進み、hover中は下線を表示する。focus-visibleでは静止した下線と2pxのoutlineを表示する。動き軽減と強制カラーの対象も同期した。文字・フォント・サイズ・リンク・改行・最小44pxの操作領域は維持する。

- SCSSのStylelint・Prettier、WordPress用build／clean-dev-filesと`git diff --check`が成功。配信CSSは`style._d2chwoC.css`。JavaScript・PHPは変更していないため、前の制御試験は再実行していない。
- 実マウス操作でhover:true、下線opacity0.7、portfolio-link-light-trace 0.35s・1回、光のopacity1とbackground-position 92.917%を観測した。作品名の幅210.4375px・高さ58.203125pxはhover前後で一致した。
- キーボードのTabでNext Realtyの作品名を選択し、focus-visible:true、下線opacity1、光のanimation:none、2pxのoutlineを確認した。
- 375pxで3作品名のリンク高44px、max-width100%を維持。document幅360pxで横はみ出しなし。通常viewportへ戻し、メインプレビューを最新CSSのWorksへ更新した。consoleのerror／warningは0件。

画面は`work/light-motion/works-name-hover.png`、実DOMの記録は`works-name-hover-check.json`・`works-name-mobile-check.json`。動き軽減・強制カラーの実OS変更は未実施で、共用CSSの分岐を確認した。静止画像は動き全体の証明ではない。

---

# FV・Contactの光：速いテンポと滑らかな点灯・減光（履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

ユーザー指定の「FVとコンタクトのアニメーションの動きを早く滑らかにする」を反映した。FVのtimeScaleを1/0.85から1/0.64、Contactを1/0.92から1/0.7へ変更し、点灯順の進む速度を直前版より約33%／31%上げた。末尾の休止を定義上1.6秒から0.9秒へ短縮し、実時間はFVが1.36秒から0.576秒、Contactが1.472秒から0.63秒になった。

点灯と減光のeaseをsine.inOutからsmootherstepへ変更した。`buildLightFadeProgress(t)`は`6t^5 - 15t^4 + 10t^3`で、0から1へ単調に進み、両端の速度・加速度が0になる。base→peak→baseの接続点で急な加速や値の飛びを避ける。opacityとscaleだけを補間し、5種類の点灯順、光量・文字背後の減光、98／49点の配置、停止・再開、Aboutの6種類と前回の3演出は維持する。

## 実画面と証跡

- 最終sourceのESLint・PrettierとWordPress用Vite build／clean-dev-filesが成功。配信JSは`script.qc-Ka9a2.js`、CSSは`style.CE4xcZVY.css`、独立した画像遷移entryは`portfolio-transition.CO6pdL3X.js`。source SHA256は`42c3ab31e82527c2ad8320df545c2cb1f2ab72921b69f3ff803a45df15e00d68`。
- 実GSAP 3.15.0と最終production sourceの制御・回帰48/48が成功。FV／Contact×14／7列×5種の20周期、smootherstepの単調性・overshootなし・両端の1次／2次微分0、80通りの型境界・5880点でopacity／scaleの跳び0を確認した。停止60秒で値と乱数の変化0、再開位置・見出し・Aboutの6種類・cleanup、100回追加切り替え後の固定Context数も確認した。結果は`work/light-motion/fast-smooth-playback-results.json`。以前の結果は保持している。マウス／進捗のsourceは既存18件の対象とbyte一致し、今回再実行していない。
- 実ブラウザーのFVを335回・5009ms観測し、sparkle→diagonalの切り替え、opacityの途中値を4457点で確認した。Contactを257回・5002ms観測し、diagonal→sweepの切り替え、途中値を4308点で確認した。再生している側と画面外でpausedの側を確認した。記録は`work/light-motion/faster-fv-browser-samples.json`・`faster-contact-browser-samples.json`・`faster-browser-analysis.json`。
- 375×812pxのContactで49点・playing・親opacity0.7を確認。document幅360pxで横はみ出しなし、Gmailのmailtoを維持していた。記録は`faster-mobile-check.json`。画面は`faster-fv-preview.png`・`faster-contact-preview.png`・`faster-contact-mobile.png`へ保存した。
- 通常viewportに戻し、最新JSの配信と画面内のContact playing／画面外のFV pausedを確認した。consoleのerror／warningは0件。記録は`faster-final-preview-check.json`。最終`git diff --check`も成功した。

制御試験のGSAPエンジンは実物、DOM・Observer・media・ScrollTrigger入場はfixtureであり、native描画の代替ではない。実画面のサンプルは実DOMの一部時点の値であり、全frameの描画性能や体感の滑らかさを証明しない。OSの動き軽減・強制カラー切り替え、実機のタッチ操作・Safariは今回の実ブラウザー検証範囲外。以前の制御結果と画像は上書きせず保持した。

---

# 画像遷移・マウスの光・スクロール進捗の3演出（履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

ユーザー指定の「3つともとりあえず実装してみて」に合わせ、Worksから詳細への画像遷移、FV／Contactのマウス付近の点灯、画面上端のスクロール進捗線を追加した。

- 画像遷移：同一オリジンの通常のWordPressナビゲーションへ0.38秒のView Transitionを適用する。読み込み済みで画面内にある1枚だけを共有し、画面外・未読み込みでは短いページフェードへ切り替える。headの小さなmoduleで初回描画前に登録し、存在するIDへのexpectと表示画像と同じresponsive preloadを使う。共有後の画像が既存Revealで再び隠れないようにした。共有名は完了・復帰時に整理する。
- マウスの光：元の98点／49点と同じ位置へ独立した追加格子を置く。マウス半径140〜220pxの範囲でopacityを補間し、追加光量の上限は周辺0.62・文字背後0.12。元のGSAPのopacity・scaleを変更しない。落ち着いた時はRAFを止め、画面外・非表示・描画省略でも止める。タッチ操作は反応しない。
- 進捗：上端の8px領域内に1pxの線と小さな光を表示する。スクロール量を0〜1へ制限してscaleXと先端位置を更新し、背景と管理バーの高さに合わせる。短いページ・動きを減らす設定・強制カラーでは隠す。

既存の5種類のFV／Contact、6種類のAbout、文字・hoverの3演出と組み合わせた。新しいbitmapや映像は追加せず、既存の生成WebPを再利用した。本文・実績内容・リンクを維持する。

## 制御試験と実画面

- マウス・進捗の最終sourceによる制御試験18/18が成功。実GSAPとの非競合、光量・半径、quiet範囲、移動／離脱／touch除外、RAFの集約・停止、非表示・画面外・描画省略、98／49点の再設定、進捗0／0.5／1・短いページ・管理バー、5回のBFCache復元と最終cleanupを確認した。結果は`work/interaction-effects/control-test-results.json`。source SHA256は`ec81952f043a98fe1feeb683c2f90c75cf7053d79cd57a99e275c8fb338eab60`。
- 既存の見出しと5種類／6種類の光の回帰43/43が成功。結果は`work/interaction-effects/heading-regression-results.json`。source SHA256は`fb68bb13a9b4379179ac60284a6266255259481e1aa53c1ecd1303bd94104d1a`。以前の43件の結果は`work/light-equalizer/interaction-heading-*`へ保全した。
- 画像遷移の実sourceによる制御試験82/82が成功し、`work/interaction-effects/transition-test-results.json`に保存。画像・タイトル・View Project、詳細へ進む／戻る、別作品の選択、共有名の重複防止、画像の準備・画面内条件、フェード、外部／別hash／activation欠落、BFCacheと古いPromiseのrace、reduced-motion、非対応、head／expect／preloadの契約を検査した。ViewTransitionの3 Promiseへ限定した通常のnative中断処理と、別realmのDOMException判定、偽name／tagの拒否、アプリ例外の伝播も確認した。最終source SHA256は`15acd9eb5eb129f2131018f9f8eed9b54bf756e524d47ee887e724f3d5e1ca21`。
- 実ブラウザーのマウス操作で、FVの追加opacity最大0.598823を観測。元のランダム点灯の値は変化し続け、追加格子と独立していた。Contactの文字背後は最大0.11409、右側は0.56707。元画像と追加光点98個の中心差は全点0px。記録は`pointer-browser-samples.json`・`contact-pointer-check.json`、画像は`pointer-desktop.png`・`pointer-contact-desktop.png`。
- 実スクロールでWorksへの移動時に進捗0.163693、375×812pxのContact末尾で1を確認した。375pxのdocument幅は360pxで横はみ出しなし。画像は`progress-contact-mobile.png`、記録は`mobile-progress-check.json`。
- 実ブラウザー1440×1000pxでNext RealtyとKidslandの一覧から詳細への共有を確認し、TOP#worksへ戻る時も該当画像が共有された。Valentine RoseのView Projectから正しい詳細へ移動した。画面外の場合は共有名を付けずページフェードへ切り替わる。記録は`shared-navigation-check.json`。
- 375×812pxでもNext Realtyの詳細で共有済みの属性、clip-path:none、transform:none、読み込み済み画像を確認した。詳細画像の上端は686.78125px、document幅360pxで横はみ出しなし。画面は`shared-detail-mobile.png`、記録は`mobile-work-navigation.json`。
- 対象JS・SCSS・PHPのPrettier、JSのESLint、SCSSのStylelint、変更したPHP6ファイルの`php -l`が成功。既存WordPress containerを使い、環境・DBの変更は行っていない。最終`build:wp`相当のVite wp buildとclean-dev-filesが成功し、配信は`script.o_e07xsG.js`・`portfolio-transition.CO6pdL3X.js`・`style.CE4xcZVY.css`になった。最終`git diff --check`も成功した。
- 試験途中で対象外の移動にnativeのInvalidStateErrorが記録されたため、対象ViewTransitionのPromiseだけに通常中断処理を追加した。最終CO6pdL3X版の新しいtabでNext Realty詳細→TOP#aboutを確認し、consoleのerror／warningは0件。結果は`final-abort-check.json`。別作品や外部への移動・アプリ例外を全体のerror handlerで抑制していない。
- 通常viewportへ戻し、メインプレビューを最新ビルドへreloadした。FVの完成画面とContactのマウス反応を保存した。最終メインプレビューの配信アセット・進捗線・追加格子とconsoleは`final-preview-check.json`に記録した。

上記の証跡はすべて`work/interaction-effects/`に保存した。制御試験のDOM・Observer・media・Navigation・ViewTransitionはfixtureであり、nativeの画像読込・描画・スクロール復元を代替しない。実ブラウザーではレイアウト・マウス入力・スクロール・画像共有・通常リンクを別途確認した。OSのreduced-motion／forced-colors変更、実機タッチ操作、Safari・Firefox、実スクリーンリーダーは今回の検証範囲外。静止画像は全描画frameの滑らかさの証明ではない。

---

# 見出し・Worksの輪郭・リンク下線の3演出（履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/#works

final result: passed

ユーザー指定の「3つ入れてみて」に合わせ、英字セクション見出し、Works画像リンクの輪郭、リンク下線に光を使った演出を追加した。FV・Contactの光量と速度、Aboutの6種類のゲージ、本文・実績画像・配置は維持する。

- 見出し：各文字のopacityを0.6秒・power3.outで表示し、開始を0.045秒ずつずらす。Works・Skills・Aboutは7点のcueと同じtimelineの時刻0で始め、ContactとWorks一覧はScrollTriggerで一度だけ再生する。字形・字間を保つため文字はinline、単語はinline-block／nowrapとする。
- Works画像リンク：12pxの光源が輪郭を0.65秒で一周する。既存の画像Reveal・拡大と組み合わせ、光源は画像リンク内へ収める。
- View Project・All Works・Gmail・ヘッダーナビ・詳細ページのナビ：10pxの光源が下線を0.35秒で一度流れる。小さな疑似要素のbackground-positionを変え、横のはみ出しを防ぐ。

見出しは元の全文をaria-labelへ保持し、分割した文字を読み上げ対象から外す。cleanupでは元の子ノードとARIA属性を復元し、完了した見出しは画面幅の変更で再演しない。hoverはany-hover: hoverに限定し、キーボードでは静止した輪郭・下線を表示する。reduced-motionとforced-colorsの静止・装飾非表示を維持する。光源は既存の生成WebPを再利用した。

## 検証と証跡

- 最終JS・SCSSのPrettier／ESLint／Stylelintと`yarn build:wp`が成功。最終配信JSは`script.2hNsV1Si.js`、CSSは`style.1ui3hpWY.css`。最終lintのYarn shimはsandbox内のVolta directory作成で失敗したため、既存のNode.jsと同じローカルlint実体を直接呼び出し、すべて成功した。
- 実GSAP 3.15.0と最終production sourceの制御試験43/43が成功。空白・原文・ARIA・元ノードの復元、cue同時開始、Contactの一度の表示、見出し全体との二重fade防止、reduced-motion・Observer非対応、停止・復帰、完了後の再初期化と既存FV／Contact／Aboutの回帰を確認した。結果は`work/light-equalizer/playback-test-results.json`。JSのSHA256は`d2403b83a2a107cb641718b9c8532478852741696ca742e90262e6d26998dc2d`と一致した。
- 実ブラウザー1284pxで全4見出しのフォント・サイズ・字間・行高・高さが変更前と一致した。文字幅の差はWORKS +0.015625px、SKILLS +0.03125px、ABOUT +0.046875px、CONTACT +0.0625px。計測は`work/light-motion/interaction-headings-before.json`・`interaction-headings-after.json`。
- Skillsで左側の文字から順にopacityが増え、最終的に全6文字が1になることを実DOMで確認した。Worksでは文字の途中opacityと、同時にplayingの7光点を観測した。記録は`interaction-heading-reveal.json`・`interaction-cue-heading.json`。
- ポインター操作で作品輪郭のanimation 0.65秒・1回とリンク下線のanimation 0.35秒・1回を確認した。hoverを維持しても光源opacityは0へ戻る。リンクの光源はbackground-positionで右へ移動し、transformはnone・横overflowなし。記録は`interaction-hover-check.json`。画像とView Projectのキーボードfocus-visibleで線opacity 1・光源animation noneを確認した。記録は`interaction-focus-check.json`。
- 375×812pxのAbout・Contactと1440×900pxのWorks一覧で横overflowなし。本文・Gmailのmailto・WORKSのh1と全文の読み上げ名を維持し、Contactの全7文字が表示されることを確認した。幅変更で完了済み見出しの原文が復元されることも実DOMで確認した。記録は`interaction-responsive-check.json`。
- 画面は`work/light-motion/interaction-works-desktop.png`、`interaction-about-mobile.png`、`interaction-contact-mobile.png`、`interaction-works-archive.png`。通常幅へ戻し、最新ビルドのメインプレビューをWorksへ移動した。ブラウザーconsoleのerror／warningは0件。最終`git diff --check`も成功。

制御試験のDOM・Observer・media変更・ScrollTrigger入場はfixtureであり、実ブラウザーの書体・レイアウト・実スクロール・hover・キーボードfocusは別途確認した。ARIAのブラウザー表示を確認したが、実スクリーンリーダー、OSのreduced-motion／forced-colors切り替え、実機Safariは今回の検証範囲外。保存画像は静止した一時点の証跡であり、全描画frameの滑らかさは証明しない。

---

# FV・Contactの速度と光量の調整（履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/

final result: passed

ユーザー承認の調整案を反映した。FVはtimelineのtimeScaleを1/0.85にして周期を15%短縮し、周辺の通常opacityを0.22から0.28へ変更。中央のbase 0.1／peak 0.4は維持する。ContactはtimeScale 1/0.92で周期を8%短縮し、親opacityを0.62から0.70へ変更した。末尾の休止も同率で短くなり、実時間はFV 1.36秒、Contact 1.472秒。

Contactの本文とGmailに合わせ、減光範囲を左側へ変更した。14列ではrow 1〜5・column 0〜6、7列ではrow 1〜5の全列がbase 0.1／peak 0.4×strength×0.9となる。右側、またはスマホの上下端は周辺の明るさを使用する。光点の素材・数・寸法、ページの文字・レイアウト、Aboutの6種類の動きは維持した。

## 検証と証跡

- 対象JS・SCSSのPrettier／ESLint／Stylelintと`yarn build:wp`が成功。配信JSは`script.CoDEAXFD.js`、CSSは`style.Dhvaany3.css`。
- 実GSAP 3.15.0とproduction sourceの制御試験36/36が成功。14列・7列の減光範囲、5種類×FV/Contactの1,470点のpeak、timeScaleを含む実時間の進行、60秒停止中の無変化、同位置への復帰、連続重複なし、cleanup、Aboutの6種類への切り替えを確認した。Aboutは追加100回の切り替え後もContext736件・Tween720本・Timeline7本で増加なし。
- 結果は`work/light-equalizer/fv-contact-playback-test-results.json`。source SHA256は`8efce64c153394df03b67e29180fd78fe6a22ce4f5bfe6a77e41952347685556`で一致を確認した。旧6種類の32件の検証は`varied-playback-test-results.json`に保全した。
- デスクトップ1440×900pxのFV発光中を`work/light-motion/adjusted-fv-desktop.jpg`へ保存。実DOMで周辺の通常opacity 0.28、発光opacity 0.997、中央の上限0.4以内を確認した。Contactでは親opacity 0.7・playing・横のはみ出しなしを確認。画面は`adjusted-contact-desktop.jpg`、観測値は`adjusted-fv-samples.json`・`adjusted-contact-samples.json`。
- スマホ375×812pxのContactは49点・playing、本文側のopacity上限0.36以内、Gmailのmailtoを維持、横のはみ出しなし。画面は`work/light-motion/adjusted-contact-mobile.jpg`。通常幅1284pxへ戻し、メインプレビューに最新JSが配信され、FVがplayingであることを確認した。ブラウザーconsoleのerror/warningは0件。

DOM・Observer・media配信は制御用fixtureで、実GSAPによる進行・値の復元と実画面の見え方は区別した。画像と実DOM観測は再生途中の状態を示し、すべての描画frameや体感の滑らかさを証明しない。OSのreduced-motion／forced-colors切り替えと実機Safariは今回の実ブラウザー検証範囲外。既存の静止・停止仕様は制御検証で確認した。

---

# Aboutの光点ゲージ：6種類のランダム切り替え（履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/#about

final result: passed

ユーザー指定の「パターンの種類を増やしたい」に合わせ、Aboutの光点ゲージを6種類へ拡張した。既存の激しい不規則な上下動を残し、同じ96点の素材・配置・明るさで別の高さの動きを作る。

| 種類        | 動き                                         | 1回の長さ |
| ----------- | -------------------------------------------- | --------- |
| spectrum    | 列ごとに大きく不規則に跳ねる                 | 4.90秒    |
| wave        | 幅のある波が横へ流れる                       | 4.80秒    |
| ripple      | 中央を軸に左右対称の波が広がる               | 3.68秒    |
| alternating | 偶数列と奇数列が交互に跳ねる                 | 3.74秒    |
| sweep       | 狭い山が左右に往復する                       | 4.16秒    |
| pulse       | 中央が少し高い全列のゲージが同じ拍で上下する | 4.04秒    |

初回の0.79秒の立ち上がり後、直前の種類を除く候補からランダムに選択する。全種類の開始・終了高さを`[4,7,10,6,11,8,5,3]`へ揃え、切り替えの瞬間も点灯の形が飛ばないようにした。終了後は既存timelineをrestartする。

## 実装と検証

- 有限timeline6本と初回用1本を初期化時に作成し、同時に再生するのは1本。切り替え時・frameごとに新しいTweenを生成しない。
- 画面外・非表示タブ・描画省略では現在位置で停止。停止中は種類を選ばず、復帰時は同じ種類の同じ位置から再開する。reduced-motion・狭い画面・Observer非対応の静止仕様を維持。
- opacityは高さ境界の連続値から計算し、下から順に点灯・上から消灯する。CSS・PHP・本文・実績の内容は変更していない。
- 対象JSのPrettier・ESLintと`yarn build:wp`が成功。初回buildの画像copyで一時的なアクセスエラーが発生したが、同じbuildの再実行で成功した。原因の断定はしていない。
- 実GSAP 3.15.0とproduction sourceの制御試験32/32が成功。6種類への到達・連続重複なし・同時再生1本・切り替え境界の一致・停止中の乱数消費なし・Contextの復元を確認した。全種類の初期化後、追加100回の切り替えでもContext736件・Tween720本・Timeline7本で増加しない。結果は`work/light-equalizer/varied-playback-test-results.json`、source SHA256は`f67afeddff78135a6af04db557a93374dcc69ebc475ea18b186d85beadd99f1a`。
- 実ブラウザー100回・1618msの観測で`ripple`から`pulse`への自動切り替えを確認。800列の解析で下段の穴・高さとopacityの不一致は0。93回で途中のopacityを確認した。画面外では種類を維持してpausedとなり、30回・386msのopacity変更は0。記録は`varied-browser-samples.json`・`varied-browser-paused.json`・`varied-browser-analysis.json`。
- 1440×1024pxの画面を`work/light-equalizer/varied-desktop-about.jpg`へ保存。1279pxではdisplay:none、再生属性を除去し、inline opacityも0件へ復元。通常幅1284pxへ戻し、Aboutのplaying状態と横のはみ出しなしを確認した。ブラウザーconsoleのerror/warningは0件。

エンジン・setter・Contextは実GSAPで検証し、DOM・Observer・media配信はfixtureである。実DOM観測は一部の再生時間のopacityを確認するもので、すべての描画frameや体感の滑らかさを証明しない。OSのreduced-motion／forced-colors切り替えと実機Safariは今回の実ブラウザー検証範囲外。既存仕様は制御試験で確認した。

---

# Aboutの光点ゲージ：強いリズムと滑らかな上下動（履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/#about

final result: passed

ユーザー提供の[参考1](https://www.shutterstock.com/ja/video/clip-1097738913-audio-equalizer-bars-animation-background-loop-music)・[参考2](https://www.shutterstock.com/ja/video/clip-3616615439-loop-animation-equalizer-multicolored-sound-nightclub-disco)の再生プレビューをブラウザーで確認した。初回の自動閲覧チェック完了後に両方の動画が表示され、複数の時点で高さが変わる様子を確認。列ごとの大きな上下動と素早い反応を、既存のモノトーンの光点へ取り入れた。

参考画面は`work/light-equalizer/energetic-reference-one.png`、`energetic-reference-two.png`。動画素材をダウンロード・購入・サイトへ埋め込みはしていない。光源は引き続き既存の生成WebPを使用する。

## 変更と実画面

- 8拍・6.72秒の穏やかなループを、16拍・4.90秒へ変更。拍間隔は0.24〜0.38秒で、約3倍のテンポ。
- 各列の目標高は主に3〜12段。最も右の列は最大11段。前の高さからの変化は主に3〜9段で、各列が同じ方向へ揺れ続けない配列にした。
- 上昇は0.192〜0.24秒・sine.out、下降は0.24〜0.38秒・sine.inOut。上昇を先に終える列には短い頂点保持があり、ほかの列は下降を続ける。高さを連続補間するため、下から順に点灯し上から消灯する表示が維持される。
- 初回の立ち上がりは0.65秒、列間0.02秒、全列の完了は0.79秒。反復の終点は最初の高さと一致する。
- 光点96個・位置・素材・明るさ・本文・1280pxの表示条件・最小48pxの間隔を維持。停止・再開とquickSetterのContext復元も既存処理を使用する。
- 実画面：`work/light-equalizer/energetic-desktop-about.jpg`。通常幅1284pxで横のはみ出しなし、本文への重なりなし。
- 再生中100回・1561msの実DOM観測で全回playing、全回で途中のopacityを確認。800列の解析で下段の穴・形状の不一致は0。各列は約7〜9段の範囲を動き、3〜5回上下を反転した。記録は`work/light-equalizer/energetic-browser-samples.json`、集計は`energetic-browser-analysis.json`。
- 画面外ではpaused。30回・417msの比較でopacity変更0点。記録は`work/light-equalizer/energetic-browser-paused.json`。
- 1279pxへ変更するとdisplay:none、再生状態属性を除去し、96点のinline opacityも0へ復元。通常幅への復帰後の表示を確認。ブラウザーconsoleのerror/warningは0件。

## 検証

対象JSのESLint・Prettierと`yarn build:wp`が成功。今回の変更は高さの目標値・タイミング・easeを対象とし、CSS・PHP・データは変更していない。OS設定のreduced-motion/forced-colors切替、実端末・実機Safariは今回の実ブラウザー検証範囲外。

実GSAP 3.15.0とproduction sourceの制御試験30/30が成功した。全16拍で上昇列と下降列が混在し、全列の高さの範囲が8〜9段であること、平均変化量5.453段、上下別のduration/ease、初回立ち上がり、段境界、停止・再開・破棄を確認した。反復の境界でopacity差は0、追加100周期後もContext142件・Tween131本・Timeline2本で増加なし。

試験結果は`work/light-equalizer/energetic-playback-test-results.json`。production sourceのSHA256は`f2870db5a735be2a3a4344c056717ca7ad72cf99e05f4afeeb63590f02b9a092`で一致を確認した。エンジン・quickSetter・Contextは実物、DOM・Observer・media配信はfixtureであり、実画面の描画やOS設定の検証と区別する。実DOMサンプルの連続性も描画の全frameや体感の滑らかさを証明するものではない。画面を別途撮影・目視確認し、CSSOMの復元は上記1279pxの実ブラウザーで確認した。`git diff --check`も成功。

---

# Aboutの光点ゲージ：滑らかな高さ補間の確認（履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/#about

final result: passed

ユーザー指定の「実際のイコライザーのように、下から増えて滑らかに動く」に合わせて、列の整数段を同時にfadeする処理から、列ごとの連続的な高さを補間する処理へ変更した。少しリズミカルなテンポ、配置、本文、光源の画像、色、画面幅の条件は維持した。

## 今回の変更と実画面

- 初回は高さ0から既定の高さへ1.05秒で立ち上がる。列間0.035秒の差により、全列の立ち上がりは1.295秒。以後は8拍・6.72秒のループで、各拍0.76〜0.92秒の全体を高さの遷移に使う。
- 高さの境界を越えると次の段が徐々に点灯し、下がると上の段から消灯する。下の点は点灯を維持する。頂点の明るさも境界に沿って連続的に移る。
- 素材の位置・サイズは固定。GSAPは8列の高さを補間し、事前に作ったquickSetterで変化した点のopacityを更新する。毎フレーム新しいTweenは作らない。
- 初期gsap.setでopacityをContextへ登録し、media条件の解除時は元のCSS表示へ復元する。画面外・非表示タブ・描画省略の停止と、現在位置からの再開は既存処理を使う。
- 実画面の証跡：`work/light-equalizer/smooth-desktop-about.jpg`。通常幅1284pxで本文とゲージの間隔があり、横方向のはみ出しはない。
- 再生中のDOMを40回・798msにわたり観測し、全40回で途中の明るさを確認した。320列の解析で上段の先行点灯・下段の穴は0。記録は`work/light-equalizer/smooth-browser-samples.json`、集計は`work/light-equalizer/smooth-browser-analysis.json`。
- Worksへ移動した画面外ではpaused。30回・421msの観測でopacity変更は0点。記録は`work/light-equalizer/smooth-browser-paused.json`。
- 1279px・375pxでは非表示、残ったinline opacityは0点で、quickSetterによる書き込みも実CSSOMで復元された。375pxのAbout本文を確認し、横方向のはみ出しはない。
- 通常幅へ戻した後はgrid・playingへ復帰した。ブラウザーconsoleのerror/warningは0件。

## 検証

対象JSのESLint・Prettierと`yarn build:wp`が成功。最初のsandbox内ビルドはesbuildが親ディレクトリへアクセスできず失敗したため、同じビルドを権限付きで再実行して成功した。OS設定のreduced-motion/forced-colors切替、実端末・実機Safariは今回の実ブラウザー検証範囲外。

実GSAP 3.15.0を使う制御試験29/29が成功した。既存光パターンの回帰と、高さ0〜12の連続点灯、131frameの初回立ち上がり、整数境界の連続性、680frameの途中段、反復の継ぎ目、停止・再開、quickSetter後のContext復元を確認した。ループ境界のopacity差は0、追加100周期後もTween10本・Timeline2本で一定。画面外で60秒停止後も初回の立ち上がりを再実行せず、停止位置から再開した。

試験結果は`work/light-equalizer/playback-test-results.json`。production sourceのSHA256は`fb15a2bb45f6ec5cd4fde42f765da406f2f0e6f072ec669832e1152c5f3646e0`で一致を確認した。GSAPのエンジン・quickSetter・Contextは実物、DOM・Observer・media配信はfixtureのため、実ブラウザーの描画やOS設定の検証と区別する。CSSOMの復元は上記1279pxの実画面で別途確認した。今回の`git diff --check`も成功した。

---

# Aboutの光点イコライザーの初版比較（履歴）

確認日：2026-10-04。実装URL：http://localhost:8888/#about

final result: passed

選定案3の光点グリッドを、ユーザーの「イコライザーのゲージみたいな動き」「少しリズミカル」という指定に合わせて実装した。Aboutの右側に8列×12段の光点を配置し、列ごとの点灯高を変える。見出し・名前・本文の左揃えと、提供された文章を維持する。音声は再生しない。

## 比較対象と証跡

- Source visual truth：`C:/Users/oyaji/.codex/generated_images/01a10132-d4d3-7dd1-8a10-77b09fa48ac6/exec-3489574c-d588-4e2a-a2b4-e48d1ebc02ef.png`。選定後に作成した光点ゲージの静止参考画像、1554×1012px。
- 実装全体：`work/light-equalizer/desktop-about.jpg`。CSS viewport 1440×1024px、出力1425×1013px。
- 実装拡大：`work/light-equalizer/desktop-equalizer.jpg`。全体画像から実測座標に従って切り出した355×473px。
- スマートフォン：`work/light-equalizer/mobile-about.jpg`。375×812pxの表示で本文を確認。
- 同一入力での比較：`work/light-equalizer/comparison-about.png`、`comparison-equalizer.png`。左に参考画像、右に実装を並べ、全体配置と光点をそれぞれ確認した。
- 座標・正規化：`work/light-equalizer/comparison-metadata.json`、`desktop-bounds.json`、`mobile-bounds.json`、`boundary-layout.json`。
- 再生・停止の実ブラウザー記録：`work/light-equalizer/browser-playback.json`。
- 制御試験：`work/light-equalizer/playback-test-results.json`。

## 状態と正規化

公開TOPのAboutを、ログアウト・通常motion設定で撮影した。参考画像は静止した一位相、実装は再生中の一位相であり、各列の高さは一致させる対象ではない。

全体比較では参考画像を900×586px、実装を900×640pxへ比例縮小した。高さの差は余白で補い、画像を変形していない。参考画像の外側余白や生成時の文章よりも、既存サイトの共通左端・fluid()・提供文章を優先した。

拡大比較では参考画像の(1020,155)から490×650pxを切り出した。実装はDOMで測定したゲージ座標とスクリーンショット倍率0.989583を用い、(976,284)から355×473pxを切り出した。初回のブラウザーclip出力は指定領域と異なるため採用せず、全体画像からの切り出しに修正した。これは証跡の修正であり、サイトのデザイン変更ではない。

## 必須5項目の評価

| 項目         | 結果                                                                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 字体と文字   | 既存のJost・日本語フォント・fluid()を維持。見出し、名前、肩書き、4段落が読める。ゲージは本文と重ならない                                                              |
| 余白・配置   | 1440pxで本文の左端80px・幅720pxを維持。ゲージ約359×479px、本文との間隔約186px。1280pxでも最小48pxの間隔を確保。375/1279/1280/1284/1440pxで横方向のはみ出しなし        |
| 色とトークン | 白地と墨色を維持。光源をgrayscaleとbrightness(.12)で調整し、消灯.16・点灯.68・頂点.84のopacityで高さを表す。淡いハローで既存の光の演出と統一                          |
| 画像と素材   | 既存の生成ビットマップ`src/assets/images/light_strobe.webp`（256×256px）を反復。実表示に対して2倍以上の解像度がある。CSS/SVGによる代用やAbout写真の復活は行っていない |
| 内容         | ユーザー提供の大学・SE経験・現在の制作・運用への配慮の4段落をそのまま保持。名前・肩書き・趣味も保持。Works/Skills/Contactの内容は変更対象外                           |

## 動き・操作・技術確認

- 8段階・6.72秒のループ。各拍は0.76〜0.92秒、opacityの遷移は0.38〜0.48秒、列間のずれは0.035秒。各列は下から連続して点灯し、頂点だけ少し明るくなる。
- 光点の位置・大きさは固定し、opacityだけを変える。実ブラウザーの可視状態では23点のopacity変化を観測。画面外ではpausedとなり、時間を空けた比較で変化は0点だった。
- 1280px以上で表示・再生。1279px以下では装飾を隠し、タイムラインを解除する。375pxではアニメーション対象のinline opacity/transformは0点で、本文4段落が表示された。
- 既存のFV・見出し・Revealとは独立したmatchMedia条件で制御し、1280pxの境界で既存演出を再構築しない。
- reduced-motionは静止ゲージ、forced-colorsは装飾非表示。aria-hiddenとpointer-events:noneを適用。
- 制御試験26/26成功。既存光パターンの回帰15件とゲージ11件を含む。GSAP 3.15.0の実エンジンを使用し、列の連続点灯、ループ境界、100周期での割り当て数の固定、画面外・非表示タブ・描画省略での停止、再開、cleanupを確認した。
- 制御試験のDOM・IntersectionObserver・matchMedia配信などはfixtureである。ブラウザー描画、OS設定の自動切替、実機Safariを証明する試験とは区別する。
- `yarn build:wp`、JS ESLint、SCSS Stylelint、PHP2ファイルの構文検査、対象ファイルのPrettier、`git diff --check`が成功。ブラウザーconsoleのerror/warningは0件。

## Findings・比較履歴

全体と拡大の最初の有効な比較で、修正が必要なP0・P1・P2の差異はなかった。参考画像より柔らかい光源のコアは、既存FVと同じ素材を使う意図的な選択。光量やテンポの好みはプレビューで追加調整できるが、今回のP3修正要求はない。

スマートフォンでの非表示は、本文の読みやすさと装飾のための余白を両立するための仕様。OSのreduced-motion/forced-colors設定切替、実端末・実機Safariは今回の実ブラウザー検証範囲外。

## 実装チェックリスト

- [x] 実ビットマップ96点と、少しリズミカルな列ごとのゲージ
- [x] 左揃え・提供文章・本文幅を維持
- [x] 画面外停止・非表示停止・cleanup・静止fallback
- [x] 全体・拡大の同一入力比較とPC/SP・境界幅の確認
- [x] ビルド・静的検査・制御試験・実ブラウザー再生確認

---

# 光点導入時のデザイン比較（履歴）

複数パターンと光量の改修（2026-10-04）は、[複数パターンと光量のQA](doc/light-random-qa.md)に記録している。以下は、光点を導入した初回の比較記録。光量・周期・試験結果は当時のもの。

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

| CSS viewport     | スクリーンショット寸法 | 確認内容                                                   |
| ---------------- | ---------------------- | ---------------------------------------------------------- |
| 1440×900         | FV 1425×891            | 98点、中央の輝度抑制、文字とナビ、Works交互配置、Skills3列 |
| 通常表示1221×616 | About/Contact 1206×608 | アンカー位置を安定させて撮影。本文・Contact・Gmailの視認性 |
| 375×812          | FV/Contact 360×780     | 49点、名前2行、メニューの収まり、Works1列、Skills2列       |
| 768×1024         | FV 753×1004            | 98点、Works1列、Skills3列、動的な点数切替                  |

各幅でdocumentのscrollWidthとclientWidthの差は0。375pxのWorksは、ブラウザーの全ページ画像360×4651pxからY=812の領域を切り出した。全ページ出力は通常のviewport撮影と高さの変換が異なるため、CSS scrollHeightと実際の出力寸法を使い、画像の変形をしていない。Contactは実際に末尾までスクロールし、見出しと本文のReveal後に別途撮影した。

## 必須5項目の評価

| 項目         | 結果                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 字体と文字   | 既存Jostと日本語フォントを維持。FVの名前、ナビ、Works、Skills、About本文、Contactが読める。光点は文字の背後の最高光量を抑制           |
| 余白・配置   | FVの100svh、Worksの左右交互/1列、見出し→本文の合計40〜64pxを維持。cueは既存の間隔へ収めた                                             |
| 色とトークン | FVを#111315へ深めた。白地セクションのpaper/inkは維持。Contactの親opacity0.42で光量を減らした                                          |
| 画像と素材   | 生成された透明ビットマップを反復。中心の白コアと冷白色ハローが参照と同じ方向。実績画像4枚は読み込み成功し、光のレイヤーを重ねていない |
| 内容         | TAISEI FUNASAKA、実績3件、Skills8件、About、Gmailを維持。番号・jQueryの再追加なし。サイトへ音楽や映像を埋め込んでいない               |

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
