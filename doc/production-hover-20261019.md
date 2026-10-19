# 本番リンクホバー更新（2026-10-19）

ユーザー承認に基づき、旧アンダーバーを削除し、既存のミニイコライザーと文字色変化を残した。

- ソース: `src/assets/styles/projects/_p-portfolio-links.scss`
- 本番CSS: `assets/styles/style.aIrhhXKY.css`
- 本番JSは `script.Bhe4pRI5.js` のまま。性能改善のローカルJS・PHP変更は未公開。
- 配布ZIP: `work/deployment/20261019-hover/wp-template-hover-20261019.zip`
- 初回配布テーマをベースに、CSS追加とmanifestのCSS参照だけを変更。PHP・JSは元ファイルとハッシュ一致。
- WordPress追加CSSにも旧ホバーが残っていたため、旧疑似要素用9ルールだけを除去。通常の本文リンク下線、パンくず、動きを抑える設定は保持。
- 追加CSS変更前後: `work/deployment/20261019-hover/production-additional-css-{before,after}.css`

本番TOP・制作実績一覧・詳細・プライバシーポリシーで旧下線の疑似要素が生成されないことを確認。TOPのキーボードフォーカスでイコライザー表示とフォーカス枠を確認。一覧ページ送りにイコライザーなし。説明文・OGP出力、TOPのGA4タグも維持。

確認記録: `work/deployment/20261019-hover/verification.json`

復元する場合は、`work/deployment/20261018-live/wp-template.zip` と退避した追加CSSを組み合わせる。SEO・投稿・プラグインの設定は今回変更していない。

## 同日の追加依頼：ローカルの光アンダーバーを本番へ反映

ユーザーの最新依頼により、青白いグラデーションの下線が広がり消えるローカル演出を復元。ソースはHEADと同一へ戻し、ビルドCSSは style.BPc-jf49.css（初回配布ファイルとSHA256一致）。初回テーマZIPを本番へ適用し、追加CSSの旧疑似要素9ルールは削除したまま維持した。ミニイコライザーも維持。ヘッダーのフォーカスで下線のopacity/scale遷移、詳細リンクは文字ラベルのみの下線、OGP出力を確認。スクリーンショット: work/deployment/20261019-hover/production-light-underline-restored.png。性能改善JS/PHPは引き続きローカルのみ。
