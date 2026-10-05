# Web品質監査レポート

- 対象: schiff-web.com の WordPress ポートフォリオ。今回の性能改善と、その変更に関係する表示・動作に限定する。
- 基準URL: https://schiff-web.com/
- 実行日時: 2026-10-05（JST）。各PageSpeed測定の版と日時は本文・rawに記録。
- commit / branch: `669f9923e18952cbea9928ee674486bbbbae02c4` / `master`。未コミットの作業内容を含む監査。
- 使用browser・viewport: Codex内ブラウザー（Chromium）、desktop画面キャプチャー 1265×712、mobile preview iframe幅320px / 375px（スクロールバー15pxによりHTMLの実効幅305px / 360px）。PageSpeedはdesktop/mobileの各ラボ設定。
- backup: [project-20261005-210117.zip](../../backups/project-20261005-210117.zip)（376,703,978 bytes）。Dockerは停止を維持。
- 対象ID: `NET-03`、`NET-04`、`UI-04`、`COMP-02`、`OPS-01`。その他のチェック項目は本レポートの判定対象外。

## 結論

性能改善のコードと本番反映を確認した。hero文字revealを優先してWebGLを起動する最終main版の本番JavaScriptは、ローカル成果物とSHA256が一致する。既存のCSS・フォント・画像・GA4を維持し、観察した画面と操作は正常だった。ログイン中の本番タブでは出所未特定のconsole errorが記録されており、本番全体を「errorなし」とは判定しない。

実装と本番配信の検証は完了したが、desktopの性能改善は確認できなかった。対象5項目のうちblockerは0件、highのwarningは1件（`NET-03`）。最終D88版はdesktop63 / TBT13,279msで、再測定はLHR取得に失敗した。650k中間版の98 / TBT89msを全体の成果とは扱わない。mobileは変更前69から最終74・79、TBTは598msから248ms・100ms、LCPは4,070msから3,887ms・3,885msになった。一方、FCPは1,478msから2,622ms・2,586ms、Speed Indexは4,704msから6,073ms・5,966msへ悪化した。スコア90等の合格目標は設定しておらず、性能のfail判定ではない。最終結果と残課題を記録して、今回の測定を終了した。

### PageSpeed測定

同じhomeページのラボ測定。単位はCLSを除きms。結果には測定環境による変動がある。フィールドのCore Web Vitalsや、他ページのスコアを示す表ではない。

| 段階 | 対象 | Performance | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---:|---:|---:|---:|---:|---:|
| 変更前 | desktop | 66 | 768 | 945 | 8,342 | 0 | 1,849 |
| 変更前 | mobile | 69 | 1,478 | 4,070 | 598 | 0 | 4,704 |
| 1回目・中間結果（`av4svcgkib`） | desktop | 67 | 703 | 900 | 3,317 | 0 | 1,519 |
| 1回目・中間結果（`av4svcgkib`） | mobile | 75 | 2,658 | 3,922 | 268 | 0 | 4,977 |
| phase2・Cy版（`ynnu9vpg3k`） | desktop | 65 | 791 | 982 | 17,723 | 0 | 1,850 |
| phase2・Cy版（`ynnu9vpg3k`） | mobile | 76 | 2,636 | 3,928 | 231 | 0 | 5,298 |
| phase2・同じCy版の再測定（`3nqted1qfo`） | desktop | 70 | 723 | 917 | 860 | 0 | 1,181 |
| phase2・同じCy版の再測定（`3nqted1qfo`） | mobile | 81 | 2,569 | 3,838 | 38 | 0 | 4,974 |
| 650k画素上限版・中間結果（`m2v6dr2cjz`、22:09:50） | desktop | 98 | 719 | 944 | 89 | 0 | 1,069 |
| 650k画素上限版・中間結果（`m2v6dr2cjz`、22:09:50） | mobile | 70 | 2,757 | 4,019 | 393 | 0 | 5,011 |

根拠: [変更前desktop](../../../work/performance-20261005/pagespeed-desktop-before.txt)、[変更前mobile](../../../work/performance-20261005/pagespeed-mobile-before.txt)、[1回目desktop](../../../work/performance-20261005/pagespeed-desktop-after-first.txt)、[1回目mobile](../../../work/performance-20261005/pagespeed-mobile-after-first.txt)、[phase2 desktop](../../../work/performance-20261005/pagespeed-desktop-final.txt)、[phase2 mobile](../../../work/performance-20261005/pagespeed-mobile-final.txt)、[Cy版再測定desktop](../../../work/performance-20261005/pagespeed-desktop-final-repeat.txt)、[Cy版再測定mobile](../../../work/performance-20261005/pagespeed-mobile-final-repeat.txt)、[650k版desktop](../../../work/performance-20261005/pagespeed-desktop-pixel-budget.txt)、[650k版mobile](../../../work/performance-20261005/pagespeed-mobile-pixel-budget.txt)。`final.txt`や`final-repeat.txt`というファイル名の結果は650k画素上限を追加する前のCy版、`pixel-budget.txt`はhero起動順序の変更前の版。

最終D88版の結果は末尾の表に掲載。desktopの1回目のmain thread内訳はOther 27,547ms / Script 1,532ms / Style 332ms。Otherの発生源は未特定で、TBTの増分すべてをテーマJavaScriptに帰属させることはできない。

### 実施した変更と確認

- homeのheadにある小さなView Transitions処理を、依存を持たない本番ビルドの場合だけインライン化した。`pagereveal`等の事前登録を保ち、別リクエストによる描画待ちを減らす。ファイル不在・依存追加・開発環境では従来のタグを維持する。homeの既存Jostフォントにpreloadを追加した。
- 光のアニメーションは数値の状態を直接WebGLへ渡し、不要なDOM更新と同じ静止状態の再描画を減らした。WebGLの起動とcontactのループ開始を、各要素が必要になる時点へ遅らせた。
- WebGLの描画頻度を最大60fpsに制限した。描画のCPU処理が12msを超える状態が8回連続した場合、1秒以上の間隔で描画解像度を段階的に下げる。CSS上の座標・光の強さ・ぼかし半径を維持する式を確認した。CPU側の計測であり、GPU処理完了までの時間を直接測ってはいない。
- 最新版ではWebGLの描画画素を約650kに抑える上限を追加した。1350×940・DPR 1の例では1,269,000画素から650,118画素へ約49%減る（寸法の丸めを含む）。412×823のmobile例は上限以下のため変更なし。元の描画倍率に対する現在倍率の比率で光点サイズ・ぼかし幅を補正し、CSS上の大きさと強さを保つ。画素のサンプリングによる細部の軟化は生じる。[desktop preview](../../../work/performance-20261005/preview-pixel-budget.png)で見た目を確認した。
- hero文字の登場順・移動方向・最終位置を保ち、待ち時間・文字ごとの間隔・アニメーション時間を短縮した。`delay: 0.15 → 0`、`stagger: 0.17 → 0.08`、`duration: 1.15 → 0.7`。LCPの文字を早く表示する変更だが、測定結果から効果を単独で分離することはできない。
- 最終main版ではhero文字revealが完了した後、次の`requestAnimationFrame`まで待ってheroのWebGLを初期化する。文字の登場中は既存のDOMによる光の再生を続け、shader初期化との競合を減らす。contactはheroの完了を待たず、画面外のheroは再表示まで起動しない。完了前・待機フレーム中・import待機中の破棄、戻った時のrenderer再利用、heroなし・reduced motionを検査するテストも追加した。
- build・lint・unit検証と、60/120/144/240Hzの模擬フレーム、解像度変更、静止時の描画省略、resize、visibility、reduced motion、WebGL context loss/restore、遅延起動の破棄を確認した。previewではhome、contact、nextrealty詳細と戻る操作を確認し、観察した範囲でconsole errorや横overflowはなかった。

最終本番のmainは`script.D88ATChy.js`、WebGLは650k版と同じ`_portfolio-webgl.BzWoTkF9.js`。本番manifestを取得して必要なJavaScriptの更新をマージし、`assets/styles/style.privacy-link-20261005.css`、フォント・画像の既存URLを保持した。[本番検証JSON](../../../work/performance-20261005/production-checks-final.json)は22:24にD88版へ更新済みで7項目すべてpass。[配信HTML](../../../work/performance-20261005/public-final.html)のD88参照と、本番取得main / WebGLのSHA256一致も確認した。650k中間版のmainは`script.DPfhfhxO.js`だった。公開privacyページはHTTP 200、認証対象privateworksはHTTP 401を確認した。フォーム送信やアクセス制御全体の監査結果を意味するものではない。

## 集計

チェックID単位で集計する。生の静的解析件数はこの集計に含めない。

| 判定 | 件数 |
|---|---:|
| pass | 2 |
| fail | 0 |
| warning | 2 |
| not-applicable | 0 |
| unverified | 1 |

## 指摘

| ID | 重要度 | 判定 | URL / file | 内容 | 証跡 | 推奨修正 |
|---|---|---|---|---|---|---|
| NET-03 | high | warning | home / PageSpeed | 最終D88版はdesktop63 / TBT13,279msで改善を確認できず、再測定はLHR取得失敗。mobileは74・79、TBT248ms・100msに低下したが、LCP約3.9秒、FCP・Speed Index悪化が残る。同一Cy版にも大きな測定変動がある。スコアの合格基準はなく性能のfail判定ではない。 | 本文の測定表と末尾の最終結果・raw | 今回は残課題として記録する。中間版の98や、最も良い値だけを最終成果として扱わない。 |
| NET-04 | medium | unverified | 本番CSS・font・画像 / cache・圧縮 | CSS・font・画像のURL保持は照合済み。今回は画像・動画・cache・圧縮を包括的に再監査しておらず、これらの最適化完了を判定できない。 | [本番manifest](../../../work/performance-20261005/manifest.production-final.json)、[既存manifest](../../../work/performance-20261005/manifest.production-before.json) | 必要に応じ、対象ページの応答header・圧縮・転送量と画像の表示寸法を測定する。既存デザインに影響する一括削除は行わない。 |
| UI-04 | low | pass | home / contact / nextrealty / animation・WebGL | 文字revealの方向・順序・終点を保って時間を短縮。光の状態と描画の数式、reduced motion、停止・復帰、遅延起動の破棄を検証。確認したpreview操作に動作停止はない。 | [hero変更検証](../../../work/performance-20261005/hero-timing-verification.json)、[動作検証スクリプト](../../../work/performance-20261005/check-light-runtime.mjs)、[本番home](../../../work/performance-20261005/production-home-final.png) | 実機と他browserの確認は別途実施する。低解像度時の見え方は実GPUでも確認する。 |
| COMP-02 | medium | warning | home / contact / nextrealty | 650k版はdesktop previewとmobile iframe幅320px / 375px（HTML実効幅305px / 360px）、contactを確認し、横overflowなし。保存画像とruntimeはhero起動順序の変更前。全幅・全browserの保証ではない。 | [desktop](../../../work/performance-20261005/preview-pixel-budget.png)、[320px](../../../work/performance-20261005/mobile-320-final.png)、[375px](../../../work/performance-20261005/mobile-375-final.png)、[contact](../../../work/performance-20261005/mobile-contact-final.png)、[runtime](../../../work/performance-20261005/mobile-runtime-final.json) | 最終mainの実機Safari・Firefoxと、768px等の追加幅を確認する。 |
| OPS-01 | low | pass | project / 本番差分 | 変更前backupを保存し、本番PHP・manifest・JS・CSSと検証証跡を記録した。PHP・JSの更新範囲と配信済みhashを確認。Dockerは停止を維持。復元の実行試験は未実施。 | [backup](../../backups/project-20261005-210117.zip)、[本番反映確認](../../../work/performance-20261005/production-checks-final.json)、[変更前PHP](../../../work/performance-20261005/func-enqueue.production-before.php) | 必要時は変更前の本番PHP・manifest・JSへ戻し、独自CSSを保持してURLと画面を再確認する。 |

### 静的解析の扱い

変更前は175ファイル・1,040件（high 243 / medium 664 / low 133）、変更後は192ファイル・1,073件（high 250 / medium 672 / low 151）。取得・生成ファイルを含んで走査対象が17ファイル増えており、件数差を性能の悪化や公開ページの実不具合数として扱わない。開発用`.cache`、localhostの設定、単独HTML文書ではないPHPテンプレート片にも指摘が出ている。一括で「全項目clean」とは判定していない。根拠: [static-before.json](static-before.json)、[static-after.json](static-after.json)。

## 画面幅・ブラウザ結果

| page・環境 | browser | viewport / 証跡寸法 | overflow | console error | screenshot / 補足 |
|---|---|---|---|---|---|
| 本番home・旧Cy版 | Codex内ブラウザー（Chromium） | キャプチャー1265×712 | 確認範囲でなし | 版ごとの帰属は未確定。本番タブにNode型error記録あり | [production-home-final.png](../../../work/performance-20261005/production-home-final.png)。650k画素上限追加前。 |
| 本番home・最終D88版 | Codex内ブラウザー（Chromium） | キャプチャー1265×712 | なし | ログイン中に1件、出所未特定 | [production-home-hero-gate.png](../../../work/performance-20261005/production-home-hero-gate.png)。D88参照・home WebGL表示・画面外contact未起動を確認。 |
| 650k版・desktop preview | Chromium | キャプチャー1265×712 | 確認範囲でなし | 確認範囲でなし | [preview-pixel-budget.png](../../../work/performance-20261005/preview-pixel-budget.png)。hero起動順序変更前。 |
| 650k版・mobile preview | Chromium / mobile iframe | iframe幅320px、HTML実効幅305px。外側キャプチャー1265×897 | なし | 確認範囲でなし | [mobile-320-final.png](../../../work/performance-20261005/mobile-320-final.png)。hero起動順序変更前。 |
| 650k版・mobile preview | Chromium / mobile iframe | iframe幅375px、HTML実効幅360px。外側キャプチャー1265×897 | なし | 確認範囲でなし | [mobile-375-final.png](../../../work/performance-20261005/mobile-375-final.png)。hero起動順序変更前。 |
| 650k版・contact preview | Chromium / mobile iframe | iframe幅375px、HTML実効幅360px。外側キャプチャー1265×897 | なし | 確認範囲でなし | [mobile-contact-final.png](../../../work/performance-20261005/mobile-contact-final.png)、[runtime](../../../work/performance-20261005/mobile-runtime-final.json)。遅延起動を確認。 |
| preview nextrealty詳細 / 戻る操作 | Chromium | desktop / mobile iframe幅375px | 確認範囲でなし | 確認範囲でなし | 操作確認。個別の保存画像はなし。 |
| mobile実機 / Safari / Firefox | 未実施 | 未実施 | unverified | unverified | 実機・該当browserの追加検証が必要。 |

本番consoleには22:23:35 JST（13:23:35 UTC）に`MutationObserver.observe`のNode型errorを1件確認した。同じログイン中タブで650k版の22:07にも同種の記録があり、今回のhero起動順序変更に固有とは確定できない。テーマソースに`MutationObserver`の使用はなく、最終版の匿名ローカルHTML previewでは再現しなかった。観察した本番flowは正常。出所の追跡は今回の性能変更範囲外で、原因は未特定として記録する。

## 未検証と不足条件

- `NET-03`: 最終D88版のdesktop再測定は`failed to retrieve the LHR`で、再読込後も取得できなかった。home以外のPSI、継続的なフィールド計測、実機の長時間GPU負荷は未検証。長いOther処理の原因と測定変動の要因は未特定。
- `NET-04`: 画像・動画の全量最適化、cache・圧縮設定の包括的な検証は今回の変更範囲に含めていない。対象ページと応答headerを取得すれば転送量・cache・圧縮を追加確認できる。
- `UI-04`: 模擬フレームとChromium previewの検証を実機GPUの検証と同一視しない。実機Safari・Firefoxで、解像度低下時の光の見え方とView Transitionsの挙動を確認する。
- `COMP-02`: 650k版の320px / 375px（実効305px / 360px）とcontactの証跡は保存済み。hero起動順序を変更した最終mainの実機、768px等の追加幅とSafari・Firefoxが不足している。
- `OPS-01`: 最終D88版の本番JS hash照合は確認済み。backupと変更前本番ファイルは保存済み。別環境へ戻す復元の実行試験は行っていない。

## 生成物

- 静的解析: [static-before.json](static-before.json)、[static-after.json](static-after.json)
- backup: [project-20261005-210117.zip](../../backups/project-20261005-210117.zip)
- 本番照合: [production-checks-final.json](../../../work/performance-20261005/production-checks-final.json)、[manifest.production-final.json](../../../work/performance-20261005/manifest.production-final.json)、[public-final.html](../../../work/performance-20261005/public-final.html)
- 最終D88本番画面: [production-home-hero-gate.png](../../../work/performance-20261005/production-home-hero-gate.png)。本番consoleの出所未特定errorは上記browser結果に記録。
- 変更前本番: [func-enqueue.production-before.php](../../../work/performance-20261005/func-enqueue.production-before.php)、[manifest.production-before.json](../../../work/performance-20261005/manifest.production-before.json)、[既存CSS](../../../work/performance-20261005/style.privacy-link-20261005.css)
- 検証: [enqueue-verification.json](../../../work/performance-20261005/enqueue-verification.json)、[transition-inline-review.json](../../../work/performance-20261005/transition-inline-review.json)、[hero-timing-verification.json](../../../work/performance-20261005/hero-timing-verification.json)、[check-light-runtime.mjs](../../../work/performance-20261005/check-light-runtime.mjs)、[650k画素上限の差分](../../../work/performance-20261005/js-pixel-cap-650k.diff)、[hero起動順序の差分](../../../work/performance-20261005/js-hero-renderer-gate.diff)
- 650k版preview証跡: [preview-pixel-budget.png](../../../work/performance-20261005/preview-pixel-budget.png)、[mobile-320-final.png](../../../work/performance-20261005/mobile-320-final.png)、[mobile-375-final.png](../../../work/performance-20261005/mobile-375-final.png)、[mobile-contact-final.png](../../../work/performance-20261005/mobile-contact-final.png)、[mobile-runtime-final.json](../../../work/performance-20261005/mobile-runtime-final.json)。hero起動順序変更前の保存結果。
- 旧Cy版・従来previewの証跡: [production-home-final.png](../../../work/performance-20261005/production-home-final.png)、[mobile-preview.png](../../../work/performance-20261005/mobile-preview.png)、[mobile-contact-preview.png](../../../work/performance-20261005/mobile-contact-preview.png)、[mobile-preview-runtime.json](../../../work/performance-20261005/mobile-preview-runtime.json)。previewのruntime指標は長時間のローカル計測であり、PSIのLCP/TBTと直接比較しない。
- PageSpeed raw: 本文の測定表直下に掲載。

### 最終main版の測定・判断

最終本番mainは`script.D88ATChy.js`、WebGLは`_portfolio-webgl.BzWoTkF9.js`。同じ版で2回測定し、取得できた結果をすべて示す。日時は2026-10-05 JST。単位はCLSを除きms。

| 測定 | 対象 | Performance | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---:|---:|---:|---:|---:|---:|
| `i3pnx4cle4` / 22:25:04 | desktop | 63 | 832 | 1,064 | 13,279 | 0 | 2,300 |
| `i3pnx4cle4` / 22:25:04 | mobile | 74 | 2,622 | 3,887 | 248 | 0 | 6,073 |
| `1oymffj2xp` / 22:27:25 | desktop | 取得失敗 | — | — | — | — | — |
| `1oymffj2xp` / 22:27:25 | mobile | 79 | 2,586 | 3,885 | 100 | 0 | 5,966 |

根拠: [1回目desktop](../../../work/performance-20261005/pagespeed-desktop-hero-gate.txt)、[1回目mobile](../../../work/performance-20261005/pagespeed-mobile-hero-gate.txt)、[再測定desktop・取得失敗](../../../work/performance-20261005/pagespeed-desktop-hero-gate-repeat.txt)、[再測定mobile](../../../work/performance-20261005/pagespeed-mobile-hero-gate-repeat.txt)。desktop再測定は`failed to retrieve the LHR`で、再読込しても同じ結果だった。欠測を0や中間版の数値で補完していない。

性能改善の実装・build・lint・unit検証と、最終版の本番HTML / manifest / main・WebGLの配信照合は完了した。検証JSONの7項目はすべてpass、既存CSS・フォント・画像・GA4を維持した。mobileのTBT低下と小幅なLCP短縮を確認したが、FCP・Speed Indexは悪化した。desktopの改善は確認できず、測定変動と長いOther処理が残課題。650k中間版の98は最終版の成果ではない。今回の測定と報告をここで完了する。
