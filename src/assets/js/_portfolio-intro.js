import { queuePortfolioAfterContentPaint } from "./_portfolio-first-paint.js";

function initPortfolioIntro() {
  const intro = document.querySelector(".js-portfolio-intro");
  if (!intro) return;
  let destroyed = false;
  let stopStage = () => {};
  let startupFrame = 0;
  let cancelContentPaint = () => {};

  async function loadPortfolioIntroScene() {
    if (destroyed) return;
    // FCP can contain only the header while the embedded name font is decoding.
    // Finish that font and present the title before parsing the scene module.
    try {
      await document.fonts?.load('400 64px "Portfolio Hero"', "TAISEIFUNASAKA");
    } catch {
      // A blocked font must not disable the scene or the readable fallback name.
    }
    if (destroyed) return;
    startupFrame = requestAnimationFrame(() => {
      startupFrame = requestAnimationFrame(importPortfolioIntroScene);
    });
  }

  function importPortfolioIntroScene() {
    startupFrame = 0;
    if (destroyed) return;
    import("./_portfolio-intro-scene.js")
      .then(({ createPortfolioIntroScene }) => {
        if (destroyed) return;
        // Allow the server-rendered title to paint before WebGL context / shader setup.
        startupFrame = requestAnimationFrame(() => {
          startupFrame = requestAnimationFrame(() => {
            startupFrame = 0;
            if (destroyed) return;
            try {
              stopStage = createPortfolioIntroScene(intro);
            } catch {
              intro.dataset.introRenderer = "fallback";
            }
          });
        });
      })
      .catch(() => {
        // The name, navigation and full About remain usable without WebGL.
        intro.dataset.introRenderer = "fallback";
      });
  }

  // Header-only FCP is too early: shaders must not compete with the name's paint.
  cancelContentPaint = queuePortfolioAfterContentPaint(loadPortfolioIntroScene, intro.querySelector(".p-portfolio-hero__name"));

  function stopPortfolioIntro() {
    destroyed = true;
    cancelContentPaint();
    if (startupFrame) cancelAnimationFrame(startupFrame);
    stopStage();
  }

  function handleIntroPageShow(event) {
    if (event.persisted) {
      window.removeEventListener("pageshow", handleIntroPageShow);
      initPortfolioIntro();
    }
  }

  window.addEventListener("pagehide", stopPortfolioIntro, { once: true });
  window.addEventListener("pageshow", handleIntroPageShow);
  if (import.meta.hot) import.meta.hot.dispose(stopPortfolioIntro);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPortfolioIntro, { once: true });
else initPortfolioIntro();
