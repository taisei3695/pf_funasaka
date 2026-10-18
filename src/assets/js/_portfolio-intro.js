function initPortfolioIntro() {
  const intro = document.querySelector(".js-portfolio-intro");
  if (!intro) return;
  let destroyed = false;
  let stopStage = () => {};
  let startupFrame = 0;

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

  function stopPortfolioIntro() {
    destroyed = true;
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
