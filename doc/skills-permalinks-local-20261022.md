# SKILLSの読みやすさと制作実績URLの統一（ローカルのみ）

実施日：2026年10月22日。本番のファイル・DB・設定は変更していない。

## 表示

- SKILLSだけに暗いグラデーションの背景を追加。セクションの境目は透明へなじませる。
- 技術カードと補足説明に92%の黒い下地と左右の余白を追加。
- 球体・粒子・光・スクロール表示の処理は変更せず、ぼかしフィルターや追加JavaScriptも使用していない。
- 既存のステージ照明が使う疑似要素を維持するため、背景は専用の装飾要素で実装。

## URL

`/works/`は維持し、日本語だった10件の末尾を以下に変更した。日本語のタイトル・本文・表示順は変更していない。既存の`next-realty`、`kidsland`、`valentine-rose`も維持。

| 制作実績 | 新しいスラッグ |
| --- | --- |
| 建設・建築会社 Webサイト制作 | construction-website |
| オークション・商品販売サイト制作 | auction-website |
| 害虫駆除サービス LP制作 | pest-control-lp |
| 和菓子店 Webサイト保守・運用 | wagashi-maintenance |
| オンライン学習塾 Webサイト制作 | online-tutoring-shopify |
| イラストレーター ポートフォリオサイト制作 | illustrator-studio |
| 農業向け業務管理システム | agricultural-system |
| 製造業向け業務管理システム | manufacturing-system |
| 卓球練習用ラリーマシンの開発 | table-tennis-machine |
| 星空・星座表示アプリの開発 | astronomy-app |

WordPressの`wp_update_post()`で更新し、標準の`_wp_old_slug`保存と旧URL転送を利用。独自の転送プラグインや本番向けの転送設定は追加していない。

対応表は`post-data/works-permalink-slugs.json`。`bin/update-local-work-slugs.php`はlocalhostと管理者権限を必須にした手動実行用で、通常アクセス時には動作しない。`wp eval-file`の第1引数にJSONのコンテナ内パスを指定するとドライラン、第2引数に`apply`を指定すると適用する。公開済み投稿の個別canonical設定があれば自動変更せず停止する。

## 確認

- ビルド、変更SCSSのStylelint、変更PHP/SCSS/JSONのPrettier、移行PHPの構文チェック成功。
- ビューポート幅320・375・768・1280pxでSKILLSを確認。本文の折り返し、カードの収まり、横はみ出しを確認した。スクロールバーを除くコンテンツ幅は305・360・753・1265px。
- 旧URL10件すべてが新URLへ転送され、HTTP 200で表示されることを確認。
- TOP・一覧のリンクと、一覧から詳細への遷移を確認。
- 建設会社詳細のcanonicalとog:urlが新しいローカルURLを出力することを確認。

## バックアップと証跡

`work/20261022-skills-permalinks/`（Git対象外）に保存。

- `local-before.sql`：変更前のローカルDB。
- `profile-before.scss`：変更前のSKILLSスタイル。
- `slug-mapping.json`：適用時の投稿ID・旧URL・新URL。
- `redirect-checks.json`：旧URL10件のHTTP確認結果。
- `archive-links.json`：一覧リンクの確認記録。
- `skills-desktop-1280.png`、`skills-mobile-320.png`、`skills-mobile-375.png`、`skills-tablet-768.png`：表示証跡。
- `build.log`：ビルド記録。

復元する場合、URLだけを戻すなら`slug-mapping.json`の投稿IDと`old_slug`を使い、ローカルで`wp post update ID --post_name=旧スラッグ`を実行する。DB全体の復元が必要な場合は`local-before.sql`をローカルのCLIコンテナへコピーして`wp db import`するが、その後の別の編集も戻るため、必要時だけ行う。スタイルは退避SCSSを戻し、追加した背景用divを削除して再ビルドする。

本番への反映は別途依頼を受けてから行う。DBバックアップの本番への一括インポートは行わない。

その後の本番反映依頼を受けて実施した内容は、`doc/skills-permalinks-production-20261022.md`に記録した。
