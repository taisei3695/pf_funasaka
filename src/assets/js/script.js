// リセット（node_modules の kiso.css）
import "kiso.css";
import "../styles/portfolio-hero-reveal.css";
import "../styles/portfolio-light-depth.css";
import "./_viewport.js";
import "./_portfolio-animation.js";
import "./_portfolio-interaction.js";
import "./_portfolio-navigation.js";
import "./_portfolio-intro.js";
import "./_portfolio-background.js";

// 開発環境でのみCSSをインポート（JS経由でスタイルを注入）
if (import.meta.env.DEV) {
  import("../styles/style.scss");
}
