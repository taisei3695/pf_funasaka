# 光のアニメーション

androp「Bright Siren」の[MV](https://www.youtube.com/watch?v=hYgw7XRf5nc)と[PARTYの制作紹介](https://prty.jp/projects-detail/androp-bright-siren)を参考に、点光源の規則的な配置と順次点灯、発光の余韻をポートフォリオへ取り入れた。音源や映像はサイトへ組み込んでいない。

## 表現

- FV：14列×7行の光点。375pxでは7列×7行に減らす。列を斜めに流れる点灯と、中央から外側へ広がる点灯が約18秒の周期で続く。
- 文字の背後：中央の光量を抑え、名前の読みやすさを保つ。光点の座標は固定し、opacityだけを変える。
- Works・Skills・About：見出し下の7点が表示時に順番に点灯し、余韻を残して静止する。画像や本文へ光を重ねない。
- Contact：FVと同じ光点配置を弱い明るさで再利用する。親opacityは0.42、各点のpeakもFVの周辺光より低く設定。

字形、fluid()による文字サイズと余白、作品の並び、実績画像、連絡先は維持した。見出しと本文の合計間隔は、追加した光点の高さを含めて従来の40〜64pxを保つ。

## 動作と配慮

- 画面外と非表示タブでは停止し、可視のstageだけ再開する。
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
- JavaScript：`src/assets/js/_portfolio-animation.js`のcreateLightSequence()で点灯順・最高光量・余韻の長さ、createLightCueSequence()で見出しの点灯を管理。
- PHP：`template-parts/portfolio-lights.php`で7行×14列、`portfolio-light-cue.php`で見出しの7点を出力する。

## 検証

`build:wp`、対象JSのESLint、SCSSのStylelint、変更PHP5ファイルの構文検査、Prettierが成功。実コードを使うNode VMによる停止・再開・cleanup・SP可視点数の制御試験は9件成功。GSAPやDOMをstubにしているため、エンジンの描画・easingの証明には使わない。

画面比較とブラウザー確認は[最新のデザインQA](../design-qa.md)に記録。`work/light-motion/`の証跡はローカル作業用でGit管理対象外。初期の面状光の確認は[変更前のQA](portfolio-design-qa-initial.md)に保存した。
