# Private Worksの設定と運用

非公開実績は `/private-works/` とその配下で表示します。テーマはWebサーバーのBasic認証済み情報を確認してから本文と画像を返します。サーバー設定が未完了の場合は表示を拒否します。

## このPCのローカル環境

Docker Desktopを起動した状態で、プロジェクトのPowerShellから実行します。

```powershell
.\bin\yarn.ps1 wp-start
```

`wp-start` はWordPressの起動後に、ローカルApacheのBasic認証と専用画像領域を設定します。ローカルの資格情報は `.cache/private-auth/credentials.json` に保存し、Git管理から除外します。Private Worksへ案内する相手に必要な場合だけ共有してください。

非公開画像はローカルの `.cache/private-media/` 内に置き、次のコマンドで同期します。ディレクトリ構造は保管キーと一致させます。

```powershell
.\bin\yarn.ps1 wp-private:sync
```

同期処理は画像をDocker内のWeb公開領域の外へコピーします。`wp-env` のWordPress配下へのmappingsは使用しません。`.cache/private-media/` もGit管理から除外します。新しいPCやコンテナを作り直した際は、資格情報と画像をローカルに用意して再設定してください。これらのローカル処理は本番サーバーへ認証設定を配布しません。

## 制作実績の登録

WordPress管理画面の「制作実績 → 新規追加」で、タイトル、サイト種別、担当範囲、使用技術、概要、実装内容を入力します。「掲載範囲」は必須で、未設定の作品は公開ページへ表示しません。

- 「公開実績」: 公開状態の作品をTOP、`/works/`、公開詳細ページへ表示します。
- 「非公開実績」: 投稿状態もWordPressの「非公開」に合わせ、サーバー認証済みのprivate領域だけで表示します。
- 「制作区分」: Next Realty、Kidsland、Valentine Roseには「スクール卒業制作」を設定します。

下書きは掲載範囲を選んでも公開しません。公開／非公開として掲載済みの作品は、掲載範囲の保存と投稿状態を同期します。公開日が新しい作品から表示します。

公開サイトURLは実際のURLがある場合のみ入力します。未入力なら外部リンクを表示しません。初期データの画像は、提供された公開サイトのスクリーンショットです。管理画面でメイン画像を登録すると、その画像に代わって表示します。

「公開デモの閲覧情報」は公開詳細へ表示する任意欄です。公開許可のある卒業制作の閲覧案内に使用し、Private Worksの資格情報や社外秘のパスワードは入力しないでください。

## 非公開画像の保管

非公開実績の画像は、WebサーバーのDocumentRootの外に配置します。例として `/var/lib/portfolio-private/` を使用します。このディレクトリをWeb公開用のAliasやCDNへ割り当てないでください。

ACFの「非公開画像の保管キー」へ、保管領域内のファイル名を入力します。たとえば `next-realty/main.webp` を指定すると、専用領域内のそのファイルを参照します。対応形式はJPEG、PNG、WebP、AVIFです。`..` を含むパスや領域外を指すシンボリックリンクは拒否します。

画像の配信URLは `/private-works/media/{作品ID}/` です。本文と同じサーバー認証が必要で、認証に成功した訪問者だけへ画像を返します。通常のメディア画像やテーマ画像を非公開作品の代替画像には使用しません。

公開メディアライブラリに一度置いた画像は、作品を非公開へ切り替えても元の画像URLから取得できます。移行する際は専用領域へコピーしたうえで、公開領域の元画像・派生画像・CDNキャッシュを削除またはアクセス禁止にしてください。本文や実装内容に公開画像URLを貼り付けないでください。

## Apache 2.4の設定例

`/private-works/` はWordPressの仮想URLなので、URLを対象とする `LocationMatch` をVirtualHost設定に追加します。以下のパスはサーバーの実際の構成に合わせて変更してください。パスワードファイルはWeb公開領域とGitの外に保管します。

```apache
<LocationMatch "^/private-works(?:/|$)">
    AuthType Basic
    AuthName "Private Works"
    AuthUserFile /etc/portfolio-private/htpasswd
    Require valid-user
    SetEnv AUTH_TYPE Basic
    SetEnv PORTFOLIO_PRIVATE_AUTH_ENABLED 1
    SetEnv PORTFOLIO_PRIVATE_MEDIA_DIR /var/lib/portfolio-private
</LocationMatch>
```

本番はHTTPSで使用してください。WordPressをサブディレクトリに設置する場合は、そのURL接頭辞を正規表現へ追加します。WordPressへの内部リライトで認証種別が引き継がれないApache構成に対応するため、認証を要求する同じ領域内で `AUTH_TYPE` を設定しています。リライト後のPHPへ認証済みの `REMOTE_USER` と環境変数が引き継がれることを確認します。テーマはApacheによる `REDIRECT_` 接頭辞も確認します。PHP-FPM構成では認証済み変数の受け渡し設定も必要です。任意のHTTPリクエストヘッダーを認証済み変数として転送しないでください。

設定反映後はApacheの構文確認と再読み込みを実施します。サーバー設定を変更できないレンタルサーバーでは、管理画面のアクセス制限が仮想URLにも適用されるか確認します。URL全体を確実に保護できない場合は、認証済みの物理ディレクトリや専用サブドメインへ構成を分けます。

参照: [Apache LocationMatch](https://httpd.apache.org/docs/2.4/mod/core.html#locationmatch)、[Apache Basic認証](https://httpd.apache.org/docs/2.4/mod/mod_auth_basic.html)。

## nginxの設定

nginxではprivate領域へ `auth_basic` と `auth_basic_user_file` を設定します。WordPressの `try_files` による内部リダイレクト後も認証を維持し、PHPへサーバーが検証したユーザーだけを渡す構成にしてください。既存のPHP用locationとリライトルールによって設定が異なるため、Apacheの設定例をそのまま転記できません。

PHPが確認する値は `AUTH_TYPE`、`REMOTE_USER`、`PORTFOLIO_PRIVATE_AUTH_ENABLED=1`、`PORTFOLIO_PRIVATE_MEDIA_DIR` です。PHP-FPMへの認証済み変数の受け渡しと、画像の直アクセス拒否を含めて検証します。参照: [nginx Basic認証](https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html)。

## 公開経路からの除外

テーマはprivate作品と掲載範囲未設定の作品を公開クエリから除外します。TOP、公開一覧、検索、RSS、関連記事・前後リンク、REST API、XML Sitemap、構造化データを対象とします。非公開領域には `noindex, nofollow`、共有キャッシュ禁止のヘッダーを設定します。

この制御はテーマの稼働を前提とします。テーマ変更や新しいRESTエンドポイント、独自SQLを使うプラグインの追加後は、公開経路を再検証してください。WordPress管理者には管理画面と認証済み管理APIで作品を編集する権限があります。

## 設定後の確認

| 対象 | 未認証 | 正しいBasic認証 |
|---|---|---|
| `/private-works/` | 401で認証を要求 | 一覧を表示 |
| `/private-works/{slug}/` | 401で認証を要求 | 非公開詳細を表示 |
| `/private-works/media/{作品ID}/` | 401で認証を要求 | 専用画像を配信 |
| 公開詳細URL、`?p={private ID}` | 本文を表示しない | 公開側では本文を表示しない |
| 検索、RSS、REST、XML Sitemap | private作品を含めない | 公開エンドポイントに含めない |

誤った資格情報も401になること、private画像を `/wp-content/uploads/` やテーマのassetsへ配置していないことを確認します。サーバー認証設定がない環境では、テーマの503応答で非公開領域を停止します。503はBasic認証の成功を意味しません。

掲載許可がある情報だけを登録してください。Basic認証は掲載許可の代わりにはなりません。
