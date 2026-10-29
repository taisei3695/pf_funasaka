# SKILLSの表示順を本番反映

2026年10月25日、ユーザーの依頼により本番を更新。

- 新しい順番：TOP → ABOUT → SKILLS → WORKS → EXPERIENCE → PERSONAL PROJECTS → CONTACT。
- 共通ヘッダーメニューもABOUT → SKILLS → WORKS → EXPERIENCE → CONTACTへ変更。
- 更新前のWPvivid全体バックアップ：2026年10月25日18:08、Manual、47.60 MB、手動削除のみ指定。本番の`wp-content/wpvividbackups`に保存。
- テーマ更新package174で成功。`front-page.php`と`template-parts/header.php`だけの変更で、CSS・JavaScript・画像・その他ファイルはpackage173と同一。
- 投稿内容・DB・本番設定の変更は行っていない。
- 本番でセクション順とメニュー順を確認。320・375・768・1280pxで横はみ出しなし。認証情報なしの公開TOPでも新しい順番を確認。

配布ZIP：`work/deployment/20261025-section-order/wp-template-section-order-20261025.zip`

SHA256：`b61ff0b87c2f2855d4cee1b0d943f86d328868387f2967d4c9e638dca35eec4f`

同フォルダーにバックアップ・更新成功画面、確認画像、検証JSON、パッケージ差分を保存。切り戻しは`work/deployment/20261025-copy-shade-diffuse/wp-template-copy-shade-diffuse-20261025.zip`（package173）。DB復元は不要。
