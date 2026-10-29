# SKILLS背景と英数字URLの本番反映

2026年10月22日、ユーザーの本番反映依頼に基づき、ローカルで確認した変更を適用した。

## バックアップ

反映前にWPvividでDBとファイルの全体バックアップを作成。バックアップIDは`e5c428ad0633a`、管理画面表示は2026年10月22日12:49、44.60 MB。

保存先は本番サーバーの`/home/schiff/schiff-web.com/public_html/wp-content/wpvividbackups`。ファイル名は`schiff-web.com_wpvivid-e5c428ad0633a_2026-10-22-12-49_backup_all.zip`。PCダウンロードの完了は確認できていないため、PC控えとしては扱わない。

## テーマ更新

- WordPress管理画面のテーマアップロードからpackage=149で更新成功。
- ZIP：`work/deployment/20261022-skills-permalinks/wp-template-skills-20261022.zip`
- SHA256：`cc6ae4d94f20dd88289bc503207ce93c9ffaf9c57ce18682da736901b907db01`
- 変更ファイルはSKILLSのテンプレート、ビルド済みCSS、`.vite/manifest.json`のみ。旧アセットも保持し、キャッシュされたページへの互換性を維持。
- 球体、光、暗幕などのJavaScriptは以前の本番パッケージ148と同一。
- 切り戻し用テーマ：`work/deployment/20261021-top-footer-background/wp-template-top-footer-final-20261021.zip`

## 制作実績URL

`post-data/works-permalink-slugs.json`の10件を、管理画面のクイック編集で個別に変更した。投稿IDは環境間で異なるため、ローカルDBのインポートやIDに基づく一括置換は行っていない。

既存の英数字URL3件、非公開実績のURLとアクセス制限は維持した。公開件数13件・非公開1件、タイトル、公開状態、日付、掲載先、表示順が変更前と一致することを確認。

WordPress標準の旧スラッグ転送を維持し、旧URL10件すべてから新URLへ転送され、HTTP 200で表示されることを確認した。canonicalとog:urlは10件とも新URL、SEO説明文も保持。サイトマップには公開13件の新しいURLが掲載されている。

本番の一般設定・SEO設定・GA4・Clarity・SiteGuard等の設定保存や、DB全体の置換は実施していない。GA4の測定IDとテーマスクリプトURLの一致、Clarityの読み込みを確認した。

## 表示と証跡

本番のPC・375pxスマホでSKILLSの暗い下地、文章の読みやすさ、横はみ出しがないことを確認。Three.js描画と球体・光の初期表示も確認した。ローカルでの320・375・768・1280px確認結果は`doc/skills-permalinks-local-20261022.md`に記録済み。

`work/deployment/20261022-skills-permalinks/`にテーマ更新成功画面、PC・スマホ画像、投稿一覧の変更前後、転送・SEO・サイトマップ検証、`final-verification.json`を保存。設定を含むバックアップや管理画面の記録は公開・Git追加しない。

切り戻しは、背景だけなら上記package148のテーマへ戻す。URLは`production-rows-before.json`の本番投稿IDと旧URLを確認し、管理画面で対象投稿のスラッグだけを戻す。DB全体を復元すると他の編集も戻るため、WPvividの全体復元は必要時に別途判断する。
