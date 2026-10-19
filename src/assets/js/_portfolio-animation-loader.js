import { queuePortfolioAfterPaint, queuePortfolioAfterContentPaint } from "./_portfolio-first-paint.js";
import { initPortfolioInitialMotion } from "./_portfolio-initial-motion.js";

// Scroll accents are an enhancement; the name and navigation paint first.
function loadPortfolioAnimations() {
  if (!document.body.classList.contains("portfolio-site")) return;
  // FCP can be only the header. Do not add glitch layers or measure heading
  // geometry while the page's larger image is still waiting for its first paint.
  if (!document.body.classList.contains("home")) {
    const image = document.querySelector("main .p-portfolio-project__image img, main .p-portfolio-detail__image img");
    const bounds = image?.getBoundingClientRect();
    const target = image && bounds.top < window.innerHeight && bounds.bottom > 0 ? image : document.querySelector("main h1");
    queuePortfolioAfterContentPaint(initPortfolioInitialMotion, target);
  }
  let queued = false;
  let observer = null;
  const events = ["wheel", "touchstart", "pointerdown", "keydown", "scroll"];

  function queuePortfolioAnimationImport() {
    if (queued) return;
    queued = true;
    observer?.disconnect();
    events.forEach(name => window.removeEventListener(name, queuePortfolioAnimationImport));
    requestAnimationFrame(() => {
      // A separate task gives the browser a paint opportunity before module work.
      window.setTimeout(() => {
        import("./_portfolio-animation.js").catch(() => {
          // Server-rendered content remains readable without the enhancement.
        });
      }, 0);
    });
  }

  const about = document.querySelector(".home .p-portfolio-about");
  // Inner-page first-view headings/cues use WAAPI; load scroll enhancements only
  // when the visitor starts navigating, rather than competing with the LCP.
  if (!document.body.classList.contains("home") && window.scrollY === 0) {
    events.forEach(name => window.addEventListener(name, queuePortfolioAnimationImport, { passive: true }));
    return;
  }
  if (!about || typeof IntersectionObserver !== "function" || window.scrollY > 0) {
    queuePortfolioAnimationImport();
    return;
  }
  // The sphere and CSS entrance need no GSAP. Warm up below-fold accents on
  // the first interaction or before About comes within a screen of view.
  observer = new IntersectionObserver(
    entries => {
      if (entries.some(entry => entry.isIntersecting)) queuePortfolioAnimationImport();
    },
    { rootMargin: "100% 0px" },
  );
  observer.observe(about);
  events.forEach(name => window.addEventListener(name, queuePortfolioAnimationImport, { passive: true }));
}

queuePortfolioAfterPaint(loadPortfolioAnimations);
