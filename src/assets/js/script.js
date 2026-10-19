// リセット（node_modules の kiso.css）
import "kiso.css";
import "../styles/portfolio-light-depth.css";
import "./_viewport.js";
import { queuePortfolioAfterContentPaint } from "./_portfolio-first-paint.js";

function loadPortfolioEnhancements() {
  import("./_portfolio-enhancements.js").catch(() => {
    // The server-rendered text, images and native links remain available.
  });
}

const paintTarget = document.querySelector(".p-portfolio-hero__name, main .p-portfolio-project__image img, main .p-portfolio-detail__image img, .p-portfolio-detail--privacy h1");
queuePortfolioAfterContentPaint(loadPortfolioEnhancements, paintTarget);

// 開発環境でのみCSSをインポート（JS経由でスタイルを注入）
if (import.meta.env.DEV) {
  if (document.body.classList.contains("home")) import("../styles/portfolio-hero-reveal.css");
  import("../styles/style.scss");
}
