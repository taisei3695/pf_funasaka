# 性能改善の本番反映（2026-10-19）

ユーザーの指示により、ローカルで検証済みの性能改善を本番へ反映した。

## 配布内容

初回本番配布テーマを土台として、次のファイルだけを更新・追加した。

- `.vite/manifest.json`
- `functions-lib/func-enqueue.php`
- `assets/js/script.im6rbU7k.js`
- `assets/js/_portfolio-intro-scene.BuWYPLUV.js`

CSSはローカルの光アンダーバーを含む `style.BPc-jf49.css` のまま。点数・サイズ・光・リボン等の仕様は変更していない。WP管理画面のテーマ更新から適用成功を確認した。

ZIP: `work/deployment/20261019-performance-live/wp-template-performance-20261019.zip`

復元用の更新前テーマ: `work/deployment/20261018-live/wp-template.zip`。今回データベース・投稿・設定のインポートや編集は行っていない。

## 確認

- ESLint・Prettier確認に成功。直前のビルド済み成果物を使用した。
- TOPのタイトル・説明文・OGP・canonical・robots・GA4タグ・追加CSS・ヘッダーリンクは更新前後のJSON比較で一致。
- TOPの小さなエントリーCSS 4,856文字をインライン出力し、テーマの外部CSSが2本から1本になったことを確認。
- 新しいメインJSを本番で読み込み。Three.js描画成功、PC900点・390px幅540点、振動なし、点の光リボン、スクロールでinside状態を確認。
- 390px幅でカードの幕開けがshownへ遷移、Works画像4点の読み込みを確認。
- 制作実績一覧・詳細・プライバシーポリシーの390px幅で横はみ出しなし。画像読込エラーなし。サブページの外部CSS2本を維持。
- TOPおよび巡回中のブラウザーerrorログなし。

証跡は `work/deployment/20261019-performance-live/`。`production-before.json` と `production-after.json` は一致。実機スマートフォンや公開後のLighthouse再測定は行っていないため、改善後のスコア・TBTは未確定。

ローカルの変更理由と計測上の制限は `doc/performance-20261019.md` を参照。
