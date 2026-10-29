# 文字を優先した読みやすさ調整を本番反映

2026年10月25日、ユーザーの本番反映依頼により実施。

- 更新前のWPvivid全体バックアップ：2026年10月25日19:12、Manual、47.60 MB。手動削除のみ指定。本番 wp-content/wpvividbackups に保存。
- テーマ更新package175で成功。
- 配布ZIP：work/deployment/20261025-text-priority/wp-template-text-priority-20261025.zip
- SHA256：84588c6efecdbeb08487a11f70b47a15b423b56723c1eb9017c8b0fa3db7b7f4
- 直前の本番package174を基に、ビルド済みCSS6ファイルと .vite/manifest.json のみ追加・更新。旧アセットを保持。
- PHP・JavaScript・画像は直前の本番版と同一。球体・光・暗幕の処理を維持。投稿・DB・SEO・GA4・Clarity・SiteGuard等の保存設定は変更していない。

本文16px中心、補足文字の明度向上、技術名・カードタイトル等の強弱、説明幅の調整、SKILLSと長文の背後の自然な陰影を反映。

## 確認

新しい style.D6cKOD8B.css の読み込み、カードタイトル600、SKILLS本文16pxと90%の下地、球体のthree描画を確認。GA4・Clarityのスクリプト読み込みも確認。
TOP・制作実績一覧・代表詳細・プライバシーポリシーで320 / 375 / 768 / 1280pxの横はみ出しおよび対象本文の横はみ出しなし。
本番PCのSKILLSを目視確認。実機確認・PageSpeedの再計測は未実施。

同配布フォルダーにバックアップ画面・更新成功画面・本番表示・幅別検証JSONとパッケージ差分を保存。
切り戻しは work/deployment/20261025-section-order/wp-template-section-order-20261025.zip（package174）。表示の切り戻しにDB復元は不要。
