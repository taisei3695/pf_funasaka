# 光の複数パターンと光量の確認

確認日：2026-10-04。実装URL：http://localhost:8888/

## 変更と表示

FVとContactには、横の波、中心からの波紋、上からの点灯、斜めの波、散らばる点灯の5種類を実装した。約5〜10秒の再生が終わるたびに直前と異なる種類をランダムに選ぶ。5本を事前生成し、同時に再生するのは各stageで1本だけ。

既存の透明WebPを使用し、光点を32〜44pxから40〜54pxへ拡大した。周辺の最高opacityを1、中央を0.4にし、光量の変化と最大1.2倍の拡大で残光を見やすくした。Contactの親opacityは0.42から0.62へ変更。Works・Skills・Aboutの見出し下は3種類から一つをランダムに選び、一度再生して静止する。

既存の名前、字体、実績3件の順序・画像・リンク、Skills8件、About、Gmailを維持。見出し下の光点の高さを2px増やしたため、見出しと本文の合計間隔は42〜66pxになった。

## ブラウザー確認

| CSS viewport | 確認結果 |
| --- | --- |
| 1440×900 | FV 98点、文字の中央光量抑制、Works見出しの静止、Contactでの再生を確認。横はみ出し0 |
| 375×812 | 各stage 49点、名前2行、メニューの収まり、Contact本文・Gmailを確認。横はみ出し0 |
| 768×1024 | 各stage 98点へ切り替わり、再生と文字の表示を確認。横はみ出し0 |

自然再生でsparkle・cascade・diagonal・rippleの現在型をDOMから観測した。FVを離れるとpaused、Contactではplayingとなり、Worksのcueはcompleteで静止した。実績とAboutの画像4枚は読み込み成功。検証用タブのconsole error/warningは0件。

証跡は`work/light-random-motion/`の`desktop-hero.jpg`、`desktop-works.jpg`、`desktop-contact.jpg`、`mobile-hero.jpg`、`mobile-contact.jpg`、`tablet-hero.jpg`。スクリーンショットは再生中の一時点であり、全種類の時間変化の証明とは区別する。初回のMVとの画像比較は[光点を導入したときのQA](../design-qa.md)に残している。

## 制御と静的検査

実際のGSAP 3.15.0とproduction JSを使うNode VMの試験15件が成功した。DOM・IntersectionObserver・matchMedia条件は試験用のfixtureを使用している。

- 100回の切り替えで101選択を観測し、全5種類への到達と連続重複0を確認。
- ウォームアップ後に追加100回再生してもContext記録数1088、tween数1083、timeline数5で増加なし。
- 画面外・非表示タブ・描画省略・休止中では再生位置と種類選択が停止し、可視のstageだけ再開。
- 完了したcueは再開せず、スマホは49点だけが対象。
- reduced-motionとIntersectionObserver不在の静止fallbackを確認。
- Context.revertでtimelineの破棄・値の復元・Observerとlistener・状態属性の解除を確認。

試験結果は`work/light-random-motion/playback-test-results.json`。対象JSのSHA256は`c594a0bd20df56024fe5e28078c5730c8374d70f4bc32184e1b06f9582fe0ed9`。

JSのESLint、SCSSのStylelint、対象コードのPrettier、`build:wp`、`git diff --check`が成功。PHP・DB・依存パッケージの変更はない。

OSのreduced-motion・強制カラー設定の実切り替え、実機Safari・実端末は未検証。変更範囲のPC/SP表示と制御に、追加修正を必要とする問題は見つからなかった。光量・速度の調整箇所は[light-motion.md](light-motion.md)を参照。
