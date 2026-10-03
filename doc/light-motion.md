# 光のアニメーション

androp「Bright Siren」の[MV](https://www.youtube.com/watch?v=hYgw7XRf5nc)と[PARTYの制作紹介](https://prty.jp/projects-detail/androp-bright-siren)を参考に、点光源の規則的な配置と順次点灯、発光の余韻をポートフォリオへ取り入れた。音源や映像はサイトへ組み込んでいない。

## 表現

- FV：14列×7行の光点。767px以下では7列×7行に減らす。sweep・ripple・cascade・diagonal・sparkleの5種類から、再生ごとに直前の種類を除いてランダムに選ぶ。
- 文字の背後：中央の光量を抑え、名前の読みやすさを保つ。光点の座標は固定し、opacityとscaleを変える。各点のサイズはfluid(40px, 54px)、scaleは中央で最大1.05、周辺で最大1.2。
- Works・Skills・About：見出し下の7点はsweep・ripple・sparkleから1種類をランダムに選び、表示時に一度だけ再生する。余韻を残して静止し、画像や本文へ光を重ねない。
- Contact：FVと同じ5種類を再利用する。親opacityは0.62、各点のpeakにはさらに0.9を掛ける。

各パターンの1周期は、点灯・減衰と末尾の休止1.6秒を含めて約5〜10秒。ソースの設定から求めた時間は次のとおり。

| パターン | 点灯順                         | 14列の周期             | 7列の周期              |
| -------- | ------------------------------ | ---------------------- | ---------------------- |
| sweep    | 左右のどちらかから列順         | 7.70秒                 | 5.95秒                 |
| ripple   | 中央から外側へ                 | 約7.43秒               | 約6.49秒               |
| cascade  | 上から下へ、列ごとに少しずらす | 7.66秒                 | 7.66秒                 |
| diagonal | 対角線に沿って順に             | 9.02秒                 | 7.41秒                 |
| sparkle  | 各点をランダムな時刻に         | 4.85秒以上、9.65秒未満 | 4.85秒以上、9.65秒未満 |

中央のopacityはbase 0.1・peak 0.4、周辺はbase 0.22・peak 1。peakにはパターンごとのstrengthを掛ける（cascadeは0.95、sparkleは0.9、ほかは1）。Contactでは、このpeakと親opacityの両方で光量を抑える。

字形、fluid()による文字サイズと余白、作品の並び、実績画像、連絡先は引き続き維持する。見出し下の光点は14〜18pxへ拡大し、見出しと本文の合計間隔は42〜66pxになった。

## 動作と配慮

- FVとContactでは5種類のtimelineを事前生成し、同時に再生するのは1本だけ。種類の選択は再生ごとに行い、点灯時刻や向きはtimeline生成時に決める。
- 画面外と非表示タブでは現在位置で停止し、可視のstageだけ同じ位置から再開する。休止1.6秒もtimelineに含め、停止中は次のパターンへ進まない。
- content-visibilityの描画省略時にも停止する。非対応ブラウザーではIntersectionObserverによる可視判定を使用。
- prefers-reduced-motionでは新しい光のtimelineを生成せず、静止した光点と内容を表示する。
- IntersectionObserver非対応時はCSSの静止表示を維持する。
- 強制カラーでは装飾を非表示にする。装飾はaria-hiddenで読み上げ・操作の対象外。
- ホバーの既存演出はany-hover: hoverの条件を維持。
- 767px／768pxの変更時はGSAP matchMediaが古いtimelineをrevertし、可視点数を再計算する。cleanupはObserverとevent listenerを解除する。

## 光源の素材

`src/assets/images/light_strobe.webp`はbuilt-in ImageGenで生成した透明ビットマップ。256×256px、13,346 bytes。単一の白いコアと短い冷白色のハローを反復して使用する。Sharpで縮小・WebP化した。元画像、生成プロンプト、alpha検査の結果は`work/light-motion/`に保存。

生成プロンプトの要点：透明背景、正面向きで中心にある単一の白いカメラストロボ。小さく鮮明な白コアと短い冷白色ハロー。機材、背景、光線、星形、文字、複数の光点を含めない。

## 調整箇所

- SCSS：`src/assets/styles/components/_c-light-stage.scss`で光源のサイズ・配置・Contactの親光量、`projects/_p-portfolio.scss`でFV背景と見出し間隔を管理。
- JavaScript：`src/assets/js/_portfolio-animation.js`のlistLightPatterns()で5種類の点灯順・rise・fade・strength、createLightSequence()で光量・scale・ランダム再生・休止、createLightCueSequence()で見出しの3種類と一度だけの再生を管理。
- PHP：`template-parts/portfolio-lights.php`で7行×14列、`portfolio-light-cue.php`で見出しの7点を出力する。

## 検証

今回の更新では`build:wp`、対象JSのESLint、SCSSのStylelint、対象コードのPrettierが成功。実GSAP 3.15.0とproduction JSを使うNode VMの制御試験15件が成功し、100回の切り替えで全5種類への到達と連続重複0を確認した。追加100回後もContext記録数とtimeline数は増加しなかった。

DOM・IntersectionObserver・matchMedia条件は試験用fixtureのため、実機やOS設定の確認とは区別する。PC・スマホ・タブレットの表示、画像、停止状態、ブラウザーconsoleを別途確認した。今回の詳細は[複数パターンと光量のQA](light-random-qa.md)に記録している。

光点を導入した初回の制御試験9件と画像比較は[初回のデザインQA](../design-qa.md)、面状光の確認は[変更前のQA](portfolio-design-qa-initial.md)に残した。`work/light-motion/`と`work/light-random-motion/`の証跡はローカル作業用でGit管理対象外。
