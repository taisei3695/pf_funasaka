# コーディングガイドライン

このプロジェクトで守る記述ルールの簡易一覧です。

---

## HTML

- **BEM または FLOCSS** に従ってクラス名・構造を書く。
- **img タグ**
  - `width` と `height` を必ず指定する。
  - メインビジュアル以外は `loading="lazy"` を付ける。
- **クラス名**は略さず書く。
  - NG: `.ttl`
  - OK: `.title`
- **サイト内のパス**はルート相対（`/` 始まり）で書く。
  - NG: `./images/sample.png`
  - OK: `/images/sample.png`
- **文字**は UTF-8 で直接書く。数値文字参照・文字実体参照は使わない。
  - NG: `&copy;` `&#9312;`
  - OK: `©` `①`

---

## CSS / SCSS

- 妥当な CSS を使う（[CSS Validator](https://jigsaw.w3.org/css-validator/) を参照）。
- **インライン style は使わない**。クラスで指定する。
- **margin / padding** は方向を明示する（上・左は `block-start` / `inline-start`）。
  ```css
  margin-block-start: 10px;   /* 上 */
  margin-inline-start: 10px;  /* 左 */
  ```
- **等間隔**は `gap` を使う。
- **画像の縦横比**は `aspect-ratio` で指定する。
- **ネストは書かない**（FLOCSS の方針）。
- **font-size** は rem を基本とする。プロジェクトでは `calc(値 * var(--to-rem))` を使用する。

---

## 画像

- **ファイル名**: 英小文字・数字・ハイフン・アンダースコアのみ。
- **形式**: `カテゴリ[_名前][_連番][_状態].拡張子`
  - 例: `bg_sample.png` / `image_mv_01.webp` / `icon_arrow.svg`
- **配置**: すべて `src/assets/images/` に置く（ページ別フォルダには分けない）。
- 参考: [命名規則の記事](https://webnaut.jp/technology/20210910-3953/)

---

## JavaScript

- 変数は **`const` または `let`** を使う。**`var` は使わない**。
- ES モジュールで記述する。

---

## 関数の命名

[関数名の動詞に関する参照記事](https://ai.itokoba.com/archives/871/)を基準に、名前から対象・処理・副作用が分かるようにする。JavaScript、PHP、開発用スクリプトの独自関数に適用する。

- 言語・WordPress・Viteなどの標準APIと既存の契約を優先する。
- 名前空間の接頭辞に続けて、処理を表す動詞と具体的な対象を書く。PHPは `portfolio_list_public_works()`、JavaScriptは `updateViewportContent()` のように、各ファイルの表記に合わせる。
- 単件取得は `get`、不在が通常の結果となる探索は `find`、複数件の列挙は `list` を使う。不在時の戻り値は既存の契約を維持する。
- ファイルなどの読み取りは `read`、外部通信による取得は `fetch`、値の組み立ては `build`、新規の対象を作る処理は `create` を使う。
- 真偽値を返す判定は `is`、`has`、`can`、`should` などで条件を示す。
- 値の設定は `set`、一部変更は `update`、状態の一致は `sync`、必要な状態を成立させる処理は `ensure` を使う。
- 関連・集合から外す処理は `remove`、対象自体を消す処理は `delete` と区別する。
- 表示する内容を返す処理は `build`、PHPでその場へ出力する処理は `print` など、返却と出力を区別する。
- `handle` はイベント受付に限定する。`process`、`manage`、`do`、`perform`、結果が不明な `toggle` は具体的な操作名へ置き換える。
- `initPortfolioMotion()` の初期化、`debounce()` のアルゴリズム名、`fadeIn()` の演出名、ユーザー指定の `fluid()` など、意味と役割が明確な既存名は維持する。

改名時は定義、呼び出し、import／export、WordPressのhook callback、`function_exists()`、文書中の使用例を同期する。保存済みのoption・meta・ACFキー、URL、公開API、第三者ライブラリの名前を一括置換しない。処理内容の変更が必要なら、命名の整理と分けて扱う。
