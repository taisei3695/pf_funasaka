# 下層ページのフッター背景の境目を解消

2026年10月25日。ユーザーの指摘した本番フッターの明暗差を修正し、ローカルと本番へ反映。

原因：.l-main--ambient::after の共通下地がposition:absoluteで本文の高さに限定され、本文外の透明フッターには暗さが適用されていなかった。一方、光・粒子はfixedでフッターにも続くため、本文末で明るさが変わっていた。
修正：共通下地をposition:fixedへ変更し、光・粒子と同じ範囲に統一。フッター背景の透明、下地濃度44%、レイアウト・文字・演出を維持。

Stylelint・テーマビルド成功。ローカル一覧末尾で目視確認。本番の一覧・代表詳細・ポリシーで375px/1280pxを確認し、下地fixed・フッター透明・横はみ出しなし。本番一覧末尾で境目が消えていることを目視確認。

更新前WPvivid全体バックアップ：2026年10月25日19:56、Manual、47.73 MB、手動削除のみ指定。本番wp-content/wpvividbackupsに保存。
テーマ更新package177成功。直前package176を基にCSS5ファイルとmanifestだけを追加・更新。PHP・JavaScript・画像・投稿・本番設定は変更せず、旧アセットも保持。
配布：work/deployment/20261025-footer-shade/wp-template-footer-shade-20261025.zip
SHA256：9866089d640e31f8b4724c2966e8d50ab102679335e7a0a720b258b43a716037
切り戻し：work/deployment/20261025-continuous-readable/wp-template-continuous-readable-20261025.zip（package176）。DB復元不要。
バックアップ画面・更新成功画面・本番表示・検証JSON・パッケージ差分は同配布フォルダーへ保存。
