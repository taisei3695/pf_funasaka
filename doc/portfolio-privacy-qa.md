# Portfolioの非公開実績検証

検証日: 2026年10月3日（日本時間）

対象はこのPCのWordPress開発環境とApacheです。検証用に公開・非公開・掲載範囲未設定の作品を一時作成し、確認後にその3件だけを削除しました。実際の卒業制作3件は保持しています。

## WordPressデータとクエリ

| 確認項目 | 結果 |
|---|---|
| 掲載範囲publicの作品 | publishとして取得可能 |
| 掲載範囲privateの作品 | publish指定でもprivate状態を維持 |
| 掲載範囲未設定の作品 | 公開せず、公開ヘルパーから除外 |
| `get_posts()` の `suppress_filters` 指定 | private作品の公開クエリへの混入を拒否 |
| privateクエリ用の値だけを指定 | サーバー認証がなければ取得不可 |
| HTTPヘッダー・PHP_AUTH_USERの偽装 | 認証済みとして扱わない |
| 認証前の作品データ・画像ヘルパー | private情報を返さない |
| 無認証のREST個別取得 | privateは404、publicは200 |
| 認証済みprivateのメインクエリ | 詳細を取得し、WordPressの404判定にも該当しない |
| ACFフィールド定義と卒業制作3件 | 管理項目、制作区分、提供URL、公開デモ案内を確認 |
| PHP構文・ACF JSON・変更ファイルの整形 | 成功 |

## 公開HTTP経路

| 経路 | 応答と内容 |
|---|---|
| TOP、`/works/`、検索、RSS | 200、private本文とタイトルを含まない |
| REST一覧、XML Sitemap | 200、private作品を含まない |
| private作品への `?p=` | 404、本文を表示しない |
| `/works/` 配下のprivate作品slug | 404、本文を表示しない |
| 未認証の `/private-works/` | Apacheの401 |
| 未認証の `/private-works/media/` | Apacheの401 |

## サーバー認証と画像配信

以下は実HTTPによるApache認証の検証結果です。

| 確認項目 | 結果 |
|---|---|
| 誤ったBasic認証のパスワード | 401 |
| 正しいBasic認証のprivate一覧 | 200 |
| 正しいBasic認証のprivate詳細 | 200、検証用作品の本文と保護画像URLを表示 |
| 正しいBasic認証の画像配信 | 200、画像形式と寸法を確認 |
| private応答ヘッダー | no-store、noindex、nofollowを確認 |
| 公開URLから資格情報ファイル・保管領域を取得 | 404 |

ApacheからWordPressへ内部リライトする際に認証種別の変数が欠落する構成を確認し、認証を要求するサーバー設定内で明示しました。テーマはサーバーが確認したユーザーと設定値を要求し、任意のHTTPヘッダーを信用しません。

この結果はローカル環境の確認です。本番では、使用するサーバーのBasic認証、HTTPS、リライト後の認証変数、画像の非公開保管、共有キャッシュを同じ観点で確認してください。設定・運用手順は [private-works.md](private-works.md) に記載しています。
