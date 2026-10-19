# LCPの表示待ち調査と改善（2026-10-19）

対象は本番とローカル。球体・光・暗幕・見出しの演出を維持し、DB・SEO・OGP・GA4・SiteGuardの保存設定は変更しない。

## 確認できたこと

- TOPのLCP要素は `FUNASAKA` のテキスト。一覧は先頭カードの画像。
- 一覧の改善前レポートでは、画像の取得遅延110ms・転送50msに対し、描画待ちが2,120ms。画像ファイルの転送だけを速くしても解消しない状態だった。
- FCPはヘッダーだけで成立する場合がある。FCP直後に見出しの装飾や背景を初期化すると、主要画像の初回描画より先にDOM追加・レイアウト計測が走る余地があった。
- `load` と二重のrequestAnimationFrameだけでは、実際の初回描画より早く装飾を開始するケースがローカルで確認された。
- 改善後のローカル計測では主要画像の描画2,480msに対し背景起動2,507msとなり、本文の描画を先にできた。
- 管理者限定の本番診断で通常時とGA4スクリプトを抑止した専用URLを比較した。温まった通常アクセスでは画像のロードから描画まで約25ms、抑止側では約41ms。キャッシュ・端末・ネットワーク条件が異なるため、GA4を主因と断定できない。
- 幅判定で `outerWidth === 0` を狭い端末と扱う可能性も検討した。ただし防御条件を追加した版でTOPのFCPが2回とも2.7秒台へ悪化したため、原因と断定せず、この条件変更は採用しなかった。

## 採用した変更

1. 主要なテキスト・画像のLCP観測を優先し、非対応・対象がLCPにならない場合は実際のFCPとloadを使って装飾の開始を待つ。固定秒数の待機や操作必須の待機は追加しない。
2. 球体・背景の起動を主要内容の描画後にする。背景の移動光・粒子の合成レイヤーもその時点で有効にする。最初の静かな背景色は維持する。
3. 最小限のJSエントリーから、本文描画後に装飾コントローラーを動的に読み込む。暗幕用の早期headエントリーは維持する。
4. 下層ページの見出しグリッチ・装飾線も主要画像・本文の描画後に開始する。暗幕がある場合は従来どおり開幕後まで待つ。
5. 一覧の先頭行を通常描画し、遠くのカードに `content-visibility:auto` と記憶する仮の高さを指定する。非対応ブラウザーは通常のグリッドとして表示する。TOPの固定Aboutやセクション照明に描画の包含を適用しない。
6. viewportの同値の書き換えを省くため、headの初期値の文字列をJSの通常値とそろえる。360px以下の既存判定条件は維持する。

## 採用しなかった実験

- TOPのセクション内容をcontent-visibilityで省略する案は、LCPがほぼ変わらずFCPが悪化したため撤回した。
- 共通フォントの全量埋め込みは、転送の往復は減るがHTMLが増え、LCPが改善しなかったため撤回した。ASCIIサブセットも検討用に作成しただけで配信しない。
- GA4の通常の読み込み・計測設定は変更しない。診断の比較URL以外の訪問では抑止していない。
- 画面幅の判定を追加防御した版はTOPのFCPが2.726秒・2.765秒、LCPが3.469秒・3.497秒。LCPがほぼ変わらず初回表示が悪化したため撤回した。記録は `final-lcp-results.json` と `final-top-repeat.json`（実験段階の名称を維持）。

## 本番への一時診断と撤去

本番の管理者限定診断コードの追加は最初に自動承認レビューで拒否されたため、有効化を中止した。その後、ユーザーが「一時診断を承認する」と明示したため、パッケージ129で短時間だけ有効化した。診断は管理者かつ専用クエリーの要求だけが対象で、通常の公開アクセス・DB設定は変更しない。

パッケージ130以降は診断を含まない。最終パッケージ138にも診断コードは含まない。テーマの `functions.php` は調査前と同じSHA256 `49F791BCEF5ACB0092890B7D586551CC9484A7685A5FE8F25F0DB5E1310D0A4D`。

## 計測記録

直前の本番パッケージ126のモバイルLCPはTOP3.525秒、一覧4.162秒、ポリシー3.632秒、詳細3.913秒。

起動順の改善と一覧の描画削減後（パッケージ131・同一内容の134）の2回では、TOP3.502〜3.519秒、一覧3.864〜3.939秒、ポリシー3.472〜3.489秒、詳細3.741〜3.887秒だった。TOPは実質横ばい。一覧・ポリシーで短縮が見られるが、単回の最良値だけを恒久的改善として扱わない。詳細ではFCPが0.994秒から2.707秒へ振れる回があり、すべての変動は解消していない。

- `work/performance-lcp-20261019/multipage-complete-results.json`: 調査前。
- `work/performance-lcp-20261019/content-paint-production-results.json`: 背景・球体の描画待ちだけを調整した段階。
- `work/performance-lcp-20261019/production-admin-ga-comparison.json`: 管理者限定の比較。匿名PSIとは条件が異なる。
- `work/performance-lcp-20261019/enhancement-order-results.json`: 起動順改善の1回目。
- `work/performance-lcp-20261019/enhancement-order-repeat-results.json`: 同じ版の再計測。
- `work/performance-lcp-20261019/initial-layout-results.json`: 採用しなかったTOPの描画省略案。
- `work/performance-lcp-20261019/inline-font-results.json`: 採用しなかった全量フォント埋め込み案。

## 配布物と検証

- 最終ZIP: `work/deployment/20261019-lcp-final/wp-template-lcp-final-20261019.zip`。
- 直前版への切り戻しZIP: `work/deployment/20261019-multipage-complete/wp-template-multipage-complete-20261019.zip`。
- 古いHTMLキャッシュが参照するハッシュ付きアセットは配布ZIPに残す。
- Viteビルド、変更JSのESLint、変更SCSSのStylelint、Prettierを確認。
- ローカル320px・390pxで横はみ出しなし。幅判定の条件変更は撤回し、最終版のビルドmanifestが確認済みのパッケージ131と同じSHA256 `D3DFA4B29EDB0815400EF55EFAB6F1B165DB6053A53268EB0D06C3D013AC4128` になったことを確認。
- 本番スマートフォン表示で球体の起動、Worksへのアンカー移動、カードから詳細への遷移、見出しのグリッチ2層、背景の再生を確認した。
- 本番TOPのcanonical、OGP画像、GA4 IDを調査前と照合。投稿や設定のDB移行はしていない。

## 最終配信版の計測（パッケージ136、138は同一ZIP）

| ページ | モバイル点数 前→後 | FCP 前→後 | LCP 前→後 | TBT 前→後 | PC点数 前→後 |
| --- | ---: | ---: | ---: | ---: | ---: |
| TOP | 89→83 | 1.001→2.932秒 | 3.525→3.567秒 | 72→0ms | 98→97 |
| 一覧 | 84→88 | 1.032→0.960秒 | 4.162→3.857秒 | 105→60ms | 97→99 |
| ポリシー | 87→88 | 1.028→0.994秒 | 3.632→3.593秒 | 169→136ms | 98→99 |
| 詳細 | 85→89 | 1.009→0.972秒 | 3.913→3.765秒 | 157→39ms | 99→97 |

一覧と詳細のLCP短縮は確認できた。ポリシーは最終回では差が小さい。TOPのLCPは実質横ばいで、FCPと総合点数は最終回で悪化した。したがって、全ページの性能改善や、TOPの悪化原因の完全な特定・解消を達成したとは報告しない。

同じビルドmanifestのパッケージ131・134ではTOPのFCPが1.000〜1.030秒だったが、136では2.932秒だった。幅判定の条件変更を戻しても悪化する回があり、幅判定だけに原因を帰属できない。フォント・初期描画とラボ測定のタイミングを含む変動が未解消。GA4の通常計測を抑止する変更や、LCPの対象テキストを画像化して指標だけを変える変更は行わない。

最終モバイルCLSはTOP約0.009、他3ページは0。TOPの小さなレイアウト変化も残る。PCのLCPは0.943〜1.034秒。

全4ページ×2デバイスの記録: `work/performance-lcp-20261019/verified-final-results.json`。

- [TOPの最終レポート](https://pagespeed.web.dev/analysis/https-schiff-web-com/3ywsg2bygw?form_factor=mobile)
- [一覧の最終レポート](https://pagespeed.web.dev/analysis/https-schiff-web-com-works/epind0aqv4?form_factor=mobile)
- [ポリシーの最終レポート](https://pagespeed.web.dev/analysis/https-schiff-web-com-privacy-policy/qllkac6sb2?form_factor=mobile)
- [詳細の最終レポート](https://pagespeed.web.dev/analysis/https-schiff-web-com-works-%e5%bb%ba%e8%a8%ad%e3%83%bb%e5%bb%ba%e7%af%89%e4%bc%9a%e7%a4%be-web%e3%82%b5%e3%82%a4%e3%83%88%e5%88%b6%e4%bd%9c/yeykapmxom?form_factor=mobile)

本番更新成功と配信中の `script.B_hfjaXI.js` を確認。最終ZIPのSHA256は `884BD3228D8B8AA72CB31217C4A9D3386109608AACECF853026B5A35A35CFF12`。本番の球体はthree rendererで動作し、主要設定・通常のGA4読み込み・診断コードなしを再確認した。プライバシーポリシーへの遷移後に暗幕が終了し、見出しのグリッチ2層と背景の再生が始まることも確認。

最終画面は `work/performance-lcp-20261019/final-production-top.png` と `final-production-policy.png`。

## TOPの固定表示の追加検証と撤回

最終計測後もTOPの課題が残ったため、最初の見出しを通常フローで描画し、three renderer起動後に従来のsticky表示へ切り替える案をパッケージ137で検証した。ローカル・本番で演出開始後のsticky表示、横はみ出しなしを確認したが、PSIは83点・FCP2.857秒・LCP3.542秒で有意な改善を確認できなかった。記録は `work/performance-lcp-20261019/sticky-paint-result.json`。

この試行は採用せず、ソースを元に戻して再ビルドした。パッケージ136と同じmanifestのSHA256になることを確認し、同一の最終ZIPをパッケージ138として再適用。「テーマの更新に成功しました。」を確認した。最終版にstickyの切り替え変更は含まない。
