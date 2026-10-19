// DOM measurements stay on the page; the same renderer runs in a worker or fallback.
export function createPortfolioIntroScene(intro) {
  let canvas = intro.querySelector("canvas");
  const stage = intro.querySelector(".p-portfolio-intro__stage");
  const hero = intro.querySelector(".p-portfolio-hero");
  const journey = intro.querySelector(".p-portfolio-intro__journey");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const forcedColors = window.matchMedia("(forced-colors: active)");
  if (!canvas || !stage || !hero) return () => {};
  let worker = null;
  let renderer = null;
  let destroyed = false;
  let fallbackStarted = false;
  let transferred = false;
  let visible = true;
  let frame = 0;
  let layoutDirty = true;
  let startupTimer = 0;
  let state = {};

  function replaceIntroCanvas() {
    const replacement = canvas.cloneNode(false);
    delete replacement.dataset.introTransferred;
    canvas.replaceWith(replacement);
    canvas = replacement;
    transferred = false;
  }
  // A transferred canvas cannot be transferred again after a BFCache restore.
  if (canvas.dataset.introTransferred === "true") replaceIntroCanvas();

  function printIntroDiagnostics(values) {
    if (destroyed) return;
    Object.entries(values).forEach(([name, value]) => {
      if (intro.dataset[name] !== value) intro.dataset[name] = value;
    });
  }

  function readIntroLayout() {
    const scrollY = window.scrollY;
    const bounds = stage.getBoundingClientRect();
    const headerBottom = document.querySelector(".p-portfolio-header")?.getBoundingClientRect().bottom || 0;
    const heroHeight = hero.offsetHeight;
    return {
      width: bounds.width,
      height: bounds.height,
      headerInset: Math.max(0, headerBottom - bounds.top),
      introTop: intro.getBoundingClientRect().top + scrollY,
      journeyDistance: (journey?.offsetHeight || heroHeight * 3.2) - heroHeight,
      sectionStarts: [...intro.querySelectorAll(":scope > .p-portfolio-section[id]")].map(section => ({ id: section.id, top: section.getBoundingClientRect().top + scrollY })),
      screenWidth: window.innerWidth,
      pixelRatio: window.devicePixelRatio || 1,
    };
  }

  function updateIntroHostState() {
    frame = 0;
    if (destroyed) return;
    const resize = layoutDirty;
    state = { ...state, ...(resize ? readIntroLayout() : {}), scrollY: window.scrollY, hidden: document.hidden, visible, reducedMotion: reducedMotion.matches, forcedColors: forcedColors.matches };
    layoutDirty = false;
    canvas.hidden = state.forcedColors;
    if (worker && transferred) worker.postMessage({ type: "state", state, resize });
    else renderer?.updateIntroState(state, resize);
  }

  function queueIntroHostState() {
    if (!destroyed && !frame) frame = requestAnimationFrame(updateIntroHostState);
  }
  function queueIntroHostLayout() {
    layoutDirty = true;
    queueIntroHostState();
  }
  function syncIntroHostPlayback() {
    if (frame) cancelAnimationFrame(frame);
    // rAF is suspended in a background tab; deliver the pause immediately.
    updateIntroHostState();
  }

  async function startIntroFallback() {
    if (destroyed || fallbackStarted) return;
    fallbackStarted = true;
    clearTimeout(startupTimer);
    worker?.terminate();
    worker = null;
    if (transferred) replaceIntroCanvas();
    try {
      const { createPortfolioIntroRenderer } = await import("./_portfolio-intro-renderer.js");
      if (destroyed) return;
      updateIntroHostState();
      renderer = createPortfolioIntroRenderer(canvas, state, printIntroDiagnostics);
      intro.dataset.introThread = "main";
    } catch {
      intro.dataset.introRenderer = "fallback";
    }
  }

  function handleIntroWorkerMessage(event) {
    if (destroyed) return;
    if (event.data.type === "ready") {
      if (!event.data.supported) {
        startIntroFallback();
        return;
      }
      try {
        clearTimeout(startupTimer);
        updateIntroHostState();
        const offscreen = canvas.transferControlToOffscreen();
        transferred = true;
        canvas.dataset.introTransferred = "true";
        worker.postMessage({ type: "init", canvas: offscreen, state }, [offscreen]);
        intro.dataset.introThread = "worker";
      } catch {
        startIntroFallback();
      }
    } else if (event.data.type === "diagnostics") printIntroDiagnostics(event.data.values);
    else if (event.data.type === "error") startIntroFallback();
  }

  const intersectionObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) intro.dataset.introPlayback = "offscreen";
    syncIntroHostPlayback();
  });
  intersectionObserver.observe(intro);
  const resizeObserver = new ResizeObserver(queueIntroHostLayout);
  [stage, intro, hero, journey].filter(Boolean).forEach(element => resizeObserver.observe(element));
  window.addEventListener("scroll", queueIntroHostState, { passive: true });
  window.addEventListener("resize", queueIntroHostLayout, { passive: true });
  document.addEventListener("visibilitychange", syncIntroHostPlayback);
  reducedMotion.addEventListener("change", syncIntroHostPlayback);
  forcedColors.addEventListener("change", syncIntroHostPlayback);
  document.fonts?.ready.then(queueIntroHostLayout);
  updateIntroHostState();

  if (typeof Worker === "function" && typeof canvas.transferControlToOffscreen === "function") {
    try {
      worker = new Worker(new URL("./_portfolio-intro-worker.js", import.meta.url), { type: "module" });
      worker.addEventListener("message", handleIntroWorkerMessage);
      worker.addEventListener("error", startIntroFallback);
      // Recover from a blocked or interrupted worker download without blanking the page.
      startupTimer = setTimeout(startIntroFallback, 12000);
    } catch {
      startIntroFallback();
    }
  } else startIntroFallback();

  return () => {
    destroyed = true;
    clearTimeout(startupTimer);
    if (frame) cancelAnimationFrame(frame);
    worker?.terminate();
    renderer?.disposeIntroRenderer();
    intersectionObserver.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener("scroll", queueIntroHostState);
    window.removeEventListener("resize", queueIntroHostLayout);
    document.removeEventListener("visibilitychange", syncIntroHostPlayback);
    reducedMotion.removeEventListener("change", syncIntroHostPlayback);
    forcedColors.removeEventListener("change", syncIntroHostPlayback);
  };
}
