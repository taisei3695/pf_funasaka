# 自然になじむ文字背後の陰影を本番反映

2026年10月25日、ユーザーの本番反映依頼により、ローカルの最終版を適用した。

- 反映前のWPvivid全体バックアップ：2026年10月25日16:29、Manual、47.47 MB。手動削除のみを指定し、本番の`wp-content/wpvividbackups`に保存。
- テーマ更新package173で成功。
- 配布：`work/deployment/20261025-copy-shade-diffuse/wp-template-copy-shade-diffuse-20261025.zip`
- SHA256：`fd690cc2f5ee28c14d03b60851fc3c611b235fccb4a13495cf37d1b6d415b330`
- 変更はビルド済みCSS6ファイルと`.vite/manifest.json`。直前の本番package152を基に作成し、PHP・JavaScript・旧アセットは同一のまま保持。

TOPは文章ごとの黒い帯を外し、各セクション全体の柔らかい放射状の陰影と薄い文字影へ変更。詳細・一覧・プライバシーポリシーの陰影も画面幅になじませた。前段階でローカル調整したFVのフェード、SKILLSの84%の下地と12remの上下フェード、下層ページの横はみ出し防止も含む。

画像・投稿・DB・SEO・GA4・Clarity・SiteGuard等の設定は変更していない。球体・光・暗幕のJavaScriptも維持。

## 確認

- 本番のEXPERIENCEでセクションの放射状背景を確認。文章単位の疑似要素は`content: none`で、黒い帯がなくなっている。
- 新しい`style.BhzVHzNP.css`、従来のテーマJS、球体canvasの描画、GA4・Clarityの読み込みを確認。
- TOP・一覧・代表詳細・プライバシーポリシーを320・375・768・1280pxで確認し、横はみ出しなし。
- PCと375pxのEXPERIENCEを目視確認。
- PageSpeed再計測・実機確認・全アニメーション時点のコントラスト適合を保証する検査は未実施。

上記配布フォルダーにバックアップ画面・テーマ更新成功画面・PCとスマホの表示・幅別検証JSON・パッケージ差分を保存。

切り戻しは`work/deployment/20261025-project-covers-v2/wp-template-project-covers-v2-20261025.zip`（package152）でテーマを戻す。今回の表示だけを戻すためにDB復元や画像差し替えは不要。
