# 性能改善の検証

対象：http://localhost:8888/。本番の更新は行っていない。詳細は `doc/performance-20261019.md`。

| ID | 判定 | 証跡・範囲 |
| --- | --- | --- |
| OPS-01 | pass | テーマZIPと変更前JSを退避済み |
| NET-03 | pass | 元の公式Lighthouseレポートを確認、ローカルの前後Long Taskを観測 |
| NET-03 本番の改善スコア | unverified | 未公開のため再測定していない |
| NET-04 | pass | TOPのレンダリング阻害CSS通信を2本から1本へ削減 |
| UI-04 | pass | 球体・inside・カード・装飾線をブラウザーで確認、コンソールerrorなし |
| COMP-02 | pass | 4ページ×320/390/768/1440pxで横はみ出しなし |
| COMP-01 | unverified | 実機・Safari・Firefoxでは確認していない |
| CODE-01 | warning | 全体静的監査の既存を含む指摘2,119件。前後件数は同じ。計測用コードは削除済み |
| CODE-05 | not-applicable | 画像のサイズ・遅延読込の実装は今回変更なし |

PageSpeedのTBTと独自計測の50ms超過合計は同一指標として比較しない。スコアの改善幅は保証しない。フォーム・メール・全リンク・原稿監査は今回の性能改善の範囲外。
