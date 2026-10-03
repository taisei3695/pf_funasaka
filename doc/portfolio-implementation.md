# ポートフォリオ実装と運用

作成日: 2026年10月3日（日本時間）

舩坂太成 / TAISEI FUNASAKAのポートフォリオを、既存のWordPressクラシックテーマ `wp-template` に実装しました。PHPは `functions-lib/` と `template-parts/`、スタイルは `src/assets/styles/` のFLOCSS構成を維持しています。ViteでSCSSとJavaScriptをビルドし、WordPressのenqueue処理から配信します。

## ページとデザイン

TOPはHeader、FV、Works、Skills、About、Contact、Footerで構成します。FVはチャコール背景に `TAISEI`、`FUNASAKA`、`PORTFOLIO` の文字と柔らかい光を配置し、約100svhを使います。WorksからAboutまではオフホワイト背景、Contactでは光を弱く再使用します。

公開実績の一覧は `/works/`、詳細は `/works/{slug}/` です。デスクトップでは画像と情報を左右交互に配置し、小さい画面では1カラムへ切り替えます。作品の通し番号は表示しません。作品名・サイト種別・担当範囲・リンクには同じ英字フォントJostを使用し、種類ごとにフォントを変えません。Jostはライセンスを同梱し、ローカル配信します。

TOPは公開実績の新着3件を取得します。一覧と取得ヘルパーは公開日が新しい順に並べ、同日時の場合は投稿IDの降順で順序を安定させます。新しい実績を追加しても、コード内に作品名や表示番号を追加する必要はありません。

非公開実績は `/private-works/`、詳細は `/private-works/{slug}/` に分け、公開実績と同じ表示パーツを使います。

## アニメーションと表示

GSAPとScrollTriggerをViteのJavaScriptエントリへ組み込みました。FVの文字は行単位で順に表示し、スクロールに合わせて文字と光を少し上へ動かします。作品画像はマスクと弱い拡大縮小で表示し、デスクトップでは小さな移動を加えます。Skillsは軽いstagger、AboutはFade Up、リンクと画像は小さなhover変化を使用します。

光は少ないDOM要素にCSSのradial-gradientとblurを使い、GSAPでゆっくり明滅させます。音声再生、Web Audio、動画、Three.jsは使用していません。画面外と非表示タブでは光のループを停止します。画面幅や `prefers-reduced-motion` の変更に合わせて再設定し、動きを減らす設定では内容を表示状態に保ちます。

スタイルには375pxを想定した左右20pxの余白、可変文字サイズ、リンクの44px以上のタップ領域、キーボード用のfocus-visibleを設定しています。実ブラウザでの結果は末尾に記録しています。

## Worksの追加と編集

WordPress管理画面の「制作実績 → 新規追加」から登録します。投稿タイプはテーマのPHPで定義しているため、CPT UIのDB設定がなくても利用できます。Worksの管理は既存のACF無料版とLocal JSONを使用します。

1. タイトル、必要に応じてサブタイトルを入力します。
2. サイト種別、担当範囲、使用技術、制作区分を設定します。
3. 概要と実装内容に、実際に担当した範囲と説明を入力します。
4. 公開する作品はメイン画像を設定し、実在するサイトURLがある場合だけ入力します。
5. 掲載範囲を「公開実績」または「非公開実績」から選び、公開または保存します。

掲載範囲が未設定の作品はサイトへ出しません。下書きは掲載範囲を選んでも公開しません。掲載済みの作品をprivateへ変更するとWordPressの投稿状態も非公開へ同期します。公開実績へ戻す場合は、公開される情報と画像を確認してから保存してください。

「公開デモの閲覧情報」は公開詳細に表示する任意欄です。公開許可のあるデモ案内だけを入力します。Private Worksの資格情報や社外秘の情報はこの欄へ保存しません。

## 登録済みの実績と連絡先

以下の3件はスクール卒業制作として登録しています。各詳細ページに `School Graduation Project / スクール卒業制作` を表示します。

| 作品 | サイト種別 | 担当範囲 | 提供URL |
|---|---|---|---|
| Next Realty | Corporate Website | Coding / WordPress / JavaScript | [Next Realty](https://schiff.wpx.jp/nextrealty/?utm_source=mail&utm_medium=email&utm_campaign=pf001) |
| Kidsland | School Website | Coding / WordPress | [Kidsland](https://schiff.wpx.jp/kidsland/?utm_source=mail&utm_medium=email&utm_campaign=pf001) |
| Valentine Rose | Reservation Website | Coding / WordPress / JavaScript | [Valentine Rose](https://schiff.wpx.jp/valentine_rose/?utm_source=mail&utm_medium=email&utm_campaign=pf001) |

この3件の公開デモ案内は、本人から公開許可を得た **閲覧用ID: demo / Password: demo** です。公開詳細ページに表示しています。ポートフォリオ自身のPrivate Worksを保護する資格情報とは別の情報です。

Contactはフォームを使用せず、[funasaka195@gmail.com](mailto:funasaka195@gmail.com) へのmailtoリンクを設定しました。WordPressの `portfolio_contact_email` オプションに保存し、初期設定用の `config/wp-options.json` にも反映しています。既存の本番DBへ移行する場合は、このオプションまたは `wp-config.php` の `PORTFOLIO_CONTACT_EMAIL` を設定してください。

Worksの画像は提供サイトを撮影した実際のスクリーンショットです。WordPressのメディア画像として登録し、画像の寸法とレスポンシブ画像を利用します。AboutのPCデスクとギターの写真はデザイン用の生成イメージで、本人の実際の作業環境を撮影した写真ではありません。画像の記録は [portfolio-images.md](portfolio-images.md) にあります。

## Private Worksの保護

ローカル環境ではWebサーバー側のApache Basic認証を設定し、実HTTPで確認しました。未認証と誤ったパスワードは401、正しい認証では一覧・詳細・専用画像の配信が200になります。公開TOP、一覧、検索、RSS、REST、Sitemapへprivate作品を含めないことも確認しました。詳しい結果は [portfolio-privacy-qa.md](portfolio-privacy-qa.md) に記録しています。

非公開画像はWeb公開領域の外に保管し、認証が必要な `/private-works/media/{作品ID}/` 経由で返します。通常の公開メディア画像を非公開作品の代替画像に使用しません。過去に公開アップロードへ置いた画像をprivateへ移す場合は、公開領域の元画像と派生画像、CDNキャッシュも整理する必要があります。

このPCでは `.cache/private-auth/credentials.json` にローカルの資格情報、`.cache/private-media/` に専用画像を置きます。どちらもGit管理から除外します。`wp-start` がローカルの認証を設定し、`wp-private:sync` が画像をDocker内のWeb公開領域外へ同期します。

本番サーバーの設定は別途必要です。Apache、nginx、レンタルサーバーの機能に合わせてBasic認証、HTTPS、内部リライト後の認証情報、非公開画像の保管、キャッシュ制御を確認します。テーマだけをアップロードしてもサーバーのBasic認証は設定されません。手順は [private-works.md](private-works.md) を参照してください。

## 主な変更ファイル

| 区分 | ファイル・ディレクトリ | 内容 |
|---|---|---|
| テーマの既存PHP | `wordpress/themes/wp-template/functions.php`、`front-page.php`、`archive-works.php`、`single-works.php`、`header.php`、`page-contact.php`、`404.php` | ページ構成、作品表示、共通処理の読み込み |
| 共通表示 | 同テーマの `template-parts/header.php`、`template-parts/footer.php` | テキストロゴ、アンカーナビ、簡素なフッター |
| 新しい表示パーツ | 同テーマの `template-parts/portfolio-hero.php`、`portfolio-lights.php`、`portfolio-works.php`、`portfolio-work-card.php`、`portfolio-work-detail.php`、`portfolio-skills.php`、`portfolio-about.php`、`portfolio-contact.php` | TOPセクションと公開・非公開で共用する作品表示 |
| 新しいPHP機能 | 同テーマの `functions-lib/func-works.php`、`func-private-works.php`、`func-portfolio.php`、`page-private-works.php` | CPT、作品データ、公開判定、privateルート、専用画像、連絡先 |
| 既存のPHP機能 | 同テーマの `functions-lib/func-enqueue.php`、`func-structured-data.php` | ローカルフォントの配信方針、個人情報・公開作品の構造化データ |
| ACF | 同テーマの `acf-json/group_877134248a9c6.json` | Works管理項目と掲載範囲 |
| スタイル | `src/assets/styles/components/_c-portfolio-font.scss`、`_c-light-stage.scss`、`projects/_p-portfolio.scss` | フォント、光、ポートフォリオ全体のレイアウトと状態 |
| JavaScript | `src/assets/js/script.js`、`_portfolio-animation.js` | GSAP、ScrollTrigger、光、Reveal、reduced-motion対応 |
| 画像・フォント | `src/assets/images/portfolio-*.webp`、`src/assets/fonts/`、テーマ側の対応アセット、`wordpress/uploads/` | 実績スクリーンショット、About生成画像、Jost、公開メディア |
| 環境・運用 | `package.json`、`yarn.lock`、`.gitignore`、`config/wp-options.json`、`bin/seed-portfolio.php`、`bin/setup-private-works.js` | GSAP導入、再現用seed、ローカル認証・画像同期、除外設定 |
| 記録 | `doc/portfolio-implementation.md`、`portfolio-images.md`、`portfolio-privacy-qa.md`、`private-works.md` | 実装、画像出典、保護検証、運用手順 |

`bin/seed-portfolio.php` は指定slugの作品がない場合だけ、卒業制作3件とprivate一覧用固定ページを作成します。既存の作品・URL・画像を上書きしません。投稿データやGmailオプションはDBにも保存されるため、GitだけでDBの編集履歴は保存できません。

## 開発・ビルド

プロジェクトのPowerShellから実行します。WordPressの起動にはDocker Desktopが必要です。

```powershell
# WordPressとローカルBasic認証の設定
.\bin\yarn.ps1 wp-start

# Vite開発サーバー
.\bin\yarn.ps1 dev

# WordPressテーマ用ビルド
.\bin\yarn.ps1 build:wp

# 非公開画像の同期
.\bin\yarn.ps1 wp-private:sync
```

WordPressは `http://localhost:8888/`、Viteは `http://localhost:5173/` です。テーマの最終表示確認にはWordPress側を使用します。開発環境の既存手順は [vite-setup.md](vite-setup.md) にあります。

## 未入力の内容と本番前の作業

現在の実績Overviewは「スクール卒業制作。」、Implementationの詳細は未入力です。実際の制作意図、担当範囲、WordPressの管理項目、JavaScriptの処理、工夫した点を各作品へ追記してください。未入力のImplementationは詳細ページへ表示しません。制作成果や担当内容を推測で追加していません。

About画像は生成イメージのまま使用できます。本人の作業環境を伝えたい場合は実際の写真へ差し替えてください。本番ではWordPressのDB・画像の移行、サイトURL、Gmail設定、Basic認証・非公開画像領域を確認します。

## 最終ブラウザ確認

CodexのブラウザでWordPressの実画面を確認しました。スクリーンショットは `work/portfolio-qa/` に保存しています。ブラウザの実機エミュレーションではなく、CSS viewportを変更した確認です。

| 画面幅 | 確認する内容 | 結果・証跡 |
|---|---|---|
| 375px × 812px | 横スクロール、FV文字、左右20px余白、Works1列、Skills2列、About順序、タップ領域 | 横はみ出しなし。FV高812px、光5個。メニュー44px以上、Gmail高さ50.59px。`mobile-hero.jpg`、`mobile-works.jpg`、`mobile-skills.jpg`、`mobile-about.jpg`、`mobile-contact.jpg`、`mobile-work-detail.jpg` |
| 768px × 1024px | ナビと各セクションの収まり、作品画像、文字折り返し | 横はみ出しなし。Works1列、Skills3列、画像読み込み成功。`tablet-hero.jpg`、`tablet-works.jpg`、`tablet-work-detail.jpg` |
| 1440px × 900px | FV文字と光、左右80px余白、Works交互配置、画像と情報のバランス | 横はみ出しなし。FV高900px、光10個。Works3件の作品名が1行。見出し・作品名の大きさを選定画像と比較して調整。`desktop-hero-final.jpg`、`desktop-works-final.jpg` |
| reduced-motion・JavaScript無効 | 内容の表示、光とParallaxの停止、リンク操作 | CSSとGSAP分岐をコード確認。既定CSSは内容を表示し、動き軽減時はアニメーションを生成しない。OS設定変更やJavaScript無効化を伴う実ブラウザ試験は未実施 |

アンカーナビ、実績詳細、一覧へ戻る導線、Gmailのmailto、提供URLとdemo案内を確認しました。キーボードのTab移動と2pxのfocus-visible、ローカルフォントの読み込みも確認しています。ブラウザのconsole error / warningは0件でした。

`build:wp`、対象JavaScriptのESLint、対象SCSSのStylelint、PHPの構文検査、ACF JSONの検証、`git diff --check` が通過しました。Private Worksの保護試験は [portfolio-privacy-qa.md](portfolio-privacy-qa.md)、デザイン比較の修正履歴は [design-qa.md](../design-qa.md) を参照してください。

実機Safari、モバイル端末、公開サーバーでの確認は未実施です。ローカルの完成状態をそのまま本番サーバー設定の完了として扱わないでください。
