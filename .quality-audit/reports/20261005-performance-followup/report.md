# パフォーマンス追加改善の確認結果

2026年10月5日。対象: https://schiff-web.com/ 。今回の変更は本番へ反映済みです。

## 結果

ユーザー提供の [変更前レポート](https://pagespeed.web.dev/analysis/https-schiff-web-com/4blk23q20i?form_factor=mobile) と、反映後23:02の [スマホ](https://pagespeed.web.dev/analysis/https-schiff-web-com/qb0f48md42?form_factor=mobile)・[PC](https://pagespeed.web.dev/analysis/https-schiff-web-com/qb0f48md42?form_factor=desktop) を比較しています。いずれもLighthouse 13.5.0、HeadlessChromium 153です。

| 指標 | スマホ変更前 | スマホ変更後 | PC変更前 | PC変更後 |
|---|---:|---:|---:|---:|
| パフォーマンス | 56 | 66 | 94 | 98 |
| FCP | 2,811ms | 2,707ms | 760ms | 739ms |
| LCP | 3,997ms | 3,969ms | 806ms | 934ms |
| TBT | 944ms | 443ms | 163ms | 56ms |
| CLS | 0 | 0 | 0 | 0 |
| Speed Index | 6,541ms | 6,393ms | 1,470ms | 1,346ms |

ユーザー補助・おすすめの方法・SEOは両端末とも100です。スマホのメインスレッド処理は5.3秒から3.6秒、長いタスクは20件から16件へ減りました。これらは単回の比較です。以前の同一ファイルの測定でも結果が変動しているため、改善幅が常に再現するとは断定しません。実ユーザーのCrUXデータはまだありません。

スマホのLCPは約4秒のままで、初期表示の改善はこの測定では確認できません。PCのLCPも約0.13秒増えており、すべての指標が改善したわけではありません。

## 実装

1. FVの3行の表示をGSAPの`from()`から有限時間のCSSアニメーションへ移しました。メインJSが読み込まれなくても表示が完了します。0.7秒、0.08秒刻み、下から105%の移動を維持し、CSSのイージングは以前の曲線へ近づけています。
2. WebGLはFVのCSS表示完了後に開始します。キャンセル・reduced motion・API不在・破棄後の遅延処理を確認しました。
3. WebGLのプログラム、描画先、頂点設定、テクスチャなどを保持し、変更のない設定の再送を減らしました。画面サイズに依存するuniformはサイズ変更時に更新します。
4. 通常描画では常に透明になる前景7点を省き、bloom側には残しました。光の数値、ぼかし、明るさ、6回の描画処理は維持しています。

旧版と新版の同じ描画状態を比較するテストでは、変化のある通常フレームのGL API呼び出しが112回から48回へ減りました。57.1%という値はAPI呼び出し数の削減率で、GPU時間・FPS・PageSpeedの改善率ではありません。[比較記録](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/webgl-gl-call-comparison.json)

## 検証

| 確認項目 | 結果 |
|---|---|
| 変更したJSのESLint、CSSのStylelint、Prettier | 合格 |
| Vite本番ビルド | 合格 |
| 光のタイミング・DOM fallback・表示範囲外の停止 | 合格 |
| CSS完了・キャンセル待機、JS不在での見出し表示 | 合格 |
| GL状態の旧版との一致、resize・DPR・負荷による解像度調整 | 合格 |
| WebGL context lossとrestore | モデルと実ブラウザーで合格 |
| PC、320px、375px幅 | 表示崩れ・横方向のはみ出しなし |
| Contactへの移動 | 描画開始、FV停止、URLハッシュなしを確認 |
| 本番JS/CSSのSHA256、公開HTMLの参照 | 合格 |
| 本番独自CSS・フォントpreload・GA4 | 保持を確認 |

320px・375pxは同一オリジンのiframeによる幅の検証です。実機のスマホ検証ではありません。Dockerは起動していません。

ブラウザーのログには以前も見られた`MutationObserver.observe`のNode型エラーが1件ありました。今回のテーマソースとビルド済みJSにはMutationObserverがなく、ログには発生元が示されていません。表示・移動・context復旧は確認できましたが、コンソールが完全に無エラーとは扱っていません。[ブラウザー確認記録](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/browser-checks.json)

## 本番反映と復元

反映したファイルは次の3つとmanifestです。

- `assets/js/script.BgtR640M.js`
- `assets/js/_portfolio-webgl.CHHCYm8p.js`
- `assets/styles/script.13hMW9dT.css`
- `.vite/manifest.json`のscript・WebGLエントリ

main CSSは`style.privacy-link-20261005.css`を維持しています。PHP・WordPress設定・認証設定は今回変更していません。

変更前の[本番manifest](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/manifest.production-before.json)と[ソース](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/source-before/script.js)を保存しています。旧JS/CSSもサーバーに残してあるため、本番manifestを変更前の内容へ戻せば、この追加改善前へ復元できます。前回の全体バックアップは`.quality-audit/backups/project-20261005-210117.zip`です。

## 残る改善対象

スマホの初期表示が次の課題です。CSSによる表示のJS依存は取り除きましたが、PageSpeedのLCPの待ち時間はほぼ変わりませんでした。CSSの読み込みを含む300msの描画ブロック見積もりは残っています。初期表示用CSSの整理を進める場合は、見出し・光のDOM fallback・フォント・ナビの表示を先に保証し、既存のリンクアニメーションと本番CSSとの差分を維持する必要があります。

GA4による外部JSの未使用コードも診断に含まれますが、ユーザーが設定した計測は保持しています。測定スコアだけを上げるためのUA分岐や機能停止はしていません。

## 証跡

- [変更前スマホ](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/pagespeed-mobile-before.txt)・[変更前PC](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/pagespeed-desktop-before.txt)
- [変更後スマホの詳細](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/pagespeed-mobile-after-details.txt)・[変更後PC](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/pagespeed-desktop-after.txt)
- [本番配信確認](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/production-checks.json)・[実際に保存されたmanifest](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/manifest.production-deployed.json)
- [CSS表示の検証](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/hero-css-reveal-verification.json)・[JS不在の検証](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/hero-without-main.json)
- [GL状態の回帰テスト](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/check-webgl-state.mjs)・[差分](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/webgl-state-cache.diff)
- [本番FV](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/production-home.png)・[375px FV](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/mobile-375-home.png)・[375px Contact](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/mobile-375-contact.png)
- [PageSpeedスマホ画像](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/pagespeed-mobile-after.png)・[PageSpeed PC画像](C:/Users/oyaji/Desktop/pf_funasaka/work/performance-followup-20261005/pagespeed-desktop-after.png)
