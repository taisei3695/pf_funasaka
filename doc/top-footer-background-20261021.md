# TOPフッターの背景接続（2026年10月21日）

前の透明化ではフッター自体の背景色しか確認しておらず、TOPのWebGL背景の範囲がフッター直前で終わるため黒い帯が残っていた。

TOPの共通フッターパーツを.p-portfolio-intro内へ配置し、get_footerの引数portfolio_footer_renderedで二重出力を防止した。他ページでは従来のfooter.phpから共通パーツを出力する。フッターを背景より手前に配置。管理バー表示中にもcanvasが下端まで届くよう、sticky stageのtopをintro-admin-offsetへそろえた。ログアウト時は従来どおり0px。

- 本番最終更新package=148。中間版147を経て、PCと375pxの両方でstage下端とfooter下端が画面下端まで一致することを確認。
- TOPフッターは1個のみ、intro内、背景色は透明。粒子がフッター背後を通るスクリーンショットを確認。
- 一覧でもフッター1個・透明を維持。JSや球体・光の演出ロジック、DB設定は変更なし。
- 最終ZIP：`work/deployment/20261021-top-footer-background/wp-template-top-footer-final-20261021.zip`
- ハッシュと検証JSON・最終PC/スマホ画像を同フォルダーに保存。
- 切り戻し用：`work/deployment/20261021-transparent-footer/wp-template-transparent-footer-20261021.zip`
- ローカルも同じPHP・SCSS・ビルド済みファイルに反映。サーバーは停止状態を維持。
