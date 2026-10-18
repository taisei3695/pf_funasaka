# ローカルのページ遷移速度の調査・改善

対象：`http://localhost:8888/` のみ。本番への接続・更新は行っていません。

## 確認した原因

- 一覧ページの HTML 応答待ち（TTFB）は計測時 3,839ms / 4,044ms。CSS・JS の取得は約20〜40msで、主な待ちはHTML生成でした。
- 一時的なWordPress初期化プロファイルでは、MUプラグイン開始まで約3.24秒、init完了まで約5.05秒。Dockerでは本体・プラグイン・テーマがWindows上のディレクトリからマウントされていました。OPcacheは有効でしたが、ファイル確認に伴う待ちが残っていました。
- 一覧の `link rel="expect" blocking="render"` が、存在しない `#portfolio-work-image-32` を指定していました。
- WordPress標準のHTML先読みは `conservative`（クリック直前）でした。

## 変更

1. 一覧の描画待ち対象を、実在する最初の見出し `#works-title` に変更。詳細も画像まで待たず `#portfolio-work-title` を待つ構成に変更。
2. WordPress標準の先読みを `prefetch / moderate` に変更。ホバーなどの操作意図からHTMLだけを先読みします。ページのJavaScriptを先に実行するprerenderは使いません。
3. コアの管理画面・クエリ文字列などの除外条件を維持し、`/private-works` 以下を追加除外。ログイン中・非公開実績内では先読みを有効にしません。
4. ローカル専用PHP設定で `opcache.enable_file_override=1`、realpath cache 16M / TTL 600秒を設定。`opcache.validate_timestamps=1` と既存の更新確認間隔を維持。下記のDocker Compose起動処理で次回起動にも適用します（wp-envのmappingsはドキュメントルート内用のため使用しません）。

暗幕の1.25秒と「暗幕終了後に見出し・装飾線を開始」の順序は変更していません。

## 結果と限界

- 先読み後に未訪問のオークション案件へ移動した実測：`deliveryType=navigational-prefetch`、HTML応答待ち0ms、DOMContentLoaded 1,066ms、load 1,095ms。これは先読み済みの場合の結果で、全アクセスの保証値ではありません。
- PHP設定変更後の温まった連続リロードはTTFB 2,984ms / 1,448ms。一方、再起動直後7,428ms、間隔を空けた後6,260msの計測もあり、Windows/Dockerのファイルアクセスによる変動は残ります。キャッシュ設定だけで一定の高速化率が出たとは判断していません。
- PHP構文・Prettier・差分の空白検査が成功。公開時の先読み設定をCLIで確認し、管理者では無効のまま。制作実績の公開投稿13件を確認（この作業で投稿・DBは変更していません）。
- ブラウザーで描画待ちIDの実在、先読み利用、見出し・装飾線の完了、390px幅で横はみ出しがないこと、コンソールエラーがないことを確認。
- 一時計測用のテーマコード・MUプラグインは削除しました。HTML全体の永続キャッシュやDB変更は追加していません。

証跡：`work/music-accents-20261018/navigation-prefetch-measurement.json`、`navigation-performance-detail.png`。

参考：[PHP OPcache設定](https://www.php.net/manual/en/opcache.configuration.php)。WordPressの先読みフィルターは、インストール済みコアの `wp-includes/speculative-loading.php` と照合しました。

## 初回アクセスの追加改善：WordPress本体のDockerストレージ化

2026-10-18、本体のWindows bind mountを、Docker内の専用ボリュームに変更しました。

| 同じ一覧ページの再起動後・最初の通常アクセス | HTML応答待ち | DOMContentLoaded | load |
| --- | ---: | ---: | ---: |
| 変更前 | 7,386ms | 8,291ms | 8,442ms |
| 変更後 | 1,472ms | 1,610ms | 1,657ms |
| 元に戻して再適用した後 | 1,720ms | 1,811ms | 1,848ms |

先読みを利用しないナビゲーションで計測しました。HTML応答待ちは今回の比較で約77〜80%減りました。単一のローカル環境・少数回の測定であり、本番や全アクセスの保証値ではありません。

- 現在のWordPress 7.1.3をそのまま複製。DBのインポート・初期化・バージョン変更は行っていません。
- 本体は `<wp-env-project>_portfolio-core` ボリュームに保存。テーマ・プラグイン・uploadsの既存マウントとDBボリュームは維持します。テーマ編集は通常どおり反映されます。
- `bin/optimize-local-runtime.js` が現在のテーママウントから対象プロジェクトを特定し、既存のCompose設定に上書きを重ねます。DBサービスは再作成しません。新規ボリュームは現在の本体から一度だけ複製し、既存の完了済みボリュームを上書きしません。
- DBバックアップ：`wordpress/uploads/local-before-core-storage-20261018.sql`（Git対象外）。元の本体ファイルも残っています。
- 通常の `yarn wp-start` に高速化を組み込み済み。起動済み環境への再適用は `yarn wp-runtime:optimize`。元の構成に戻す場合は `yarn wp-runtime:restore`。両経路と繰り返し適用を実機確認しました。
- `yarn wp-stop` は通常どおり使用できます。直接 `wp-env start` を実行した場合は、その後 `yarn wp-runtime:optimize` を実行してください。
- 本体の更新を管理画面から行う場合、更新先はDockerボリュームです。`.wp-env.json` のcore指定を別バージョンへ変える際は、保持している本体と意図するバージョンを確認してください。自動で既存ボリュームを消したり上書きしたりはしません。
- PHP設定はComposeの正しい絶対パスへ読み取り専用でマウント。前回のwp-envマッピング指定を修正しました。
- 公開投稿13件のID・状態、`home=http://localhost:8888`、PHP変更検知、Basic認証再設定を確認。暗幕・見出しのコードと時間は変更していません。
- 一時的な計測用コードは削除済み。証跡は `work/music-accents-20261018/core-storage-before.json`、`core-storage-after.json`、`core-storage-restart-retest.json`。

参考：[Dockerのファイルシステム性能に関する説明](https://docs.docker.com/desktop/features/wsl/best-practices/)、[Composeのマウント上書き規則](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/)。
