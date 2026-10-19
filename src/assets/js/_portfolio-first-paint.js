// Decorative DOM writes must not force the initial title layout synchronously.
export function queuePortfolioAfterPaint(callback) {
  let observer = null;
  let frame = 0;
  let cancelled = false;

  function cancelPortfolioPaintCallback() {
    cancelled = true;
    observer?.disconnect();
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("pagehide", cancelPortfolioPaintCallback);
  }

  function queuePortfolioPaintCallback() {
    observer?.disconnect();
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = 0;
        window.removeEventListener("pagehide", cancelPortfolioPaintCallback);
        if (!cancelled) callback();
      });
    });
  }

  window.addEventListener("pagehide", cancelPortfolioPaintCallback, { once: true });
  if (typeof PerformanceObserver === "function" && PerformanceObserver.supportedEntryTypes?.includes("paint")) {
    observer = new PerformanceObserver(entries => {
      if (entries.getEntries().some(entry => entry.name === "first-contentful-paint")) queuePortfolioPaintCallback();
    });
    observer.observe({ type: "paint", buffered: true });
  } else queuePortfolioPaintCallback();
  return cancelPortfolioPaintCallback;
}

// Decorative compositing starts only after the primary text/image has painted.
// The load fallback handles browsers without LCP observation and smaller targets
// which never become the largest candidate. No timer or user input is required.
export function queuePortfolioAfterContentPaint(callback, target) {
  let observer = null;
  let frame = 0;
  let queued = false;
  let cancelled = false;
  let cancelFallback = () => {};

  function cancelPortfolioContentPaintCallback() {
    cancelled = true;
    observer?.disconnect();
    cancelFallback();
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("load", queuePortfolioContentPaintFallback);
    window.removeEventListener("pagehide", cancelPortfolioContentPaintCallback);
  }

  function queuePortfolioContentPaintCallback() {
    if (queued || cancelled) return;
    queued = true;
    observer?.disconnect();
    cancelFallback();
    window.removeEventListener("load", queuePortfolioContentPaintFallback);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = 0;
        window.removeEventListener("pagehide", cancelPortfolioContentPaintCallback);
        if (!cancelled) callback();
      });
    });
  }

  function queuePortfolioContentPaintFallback() {
    // load and even a double rAF can precede the browser's first actual paint.
    cancelFallback = queuePortfolioAfterPaint(queuePortfolioContentPaintCallback);
  }

  window.addEventListener("pagehide", cancelPortfolioContentPaintCallback, { once: true });
  if (target && typeof PerformanceObserver === "function" && PerformanceObserver.supportedEntryTypes?.includes("largest-contentful-paint")) {
    observer = new PerformanceObserver(entries => {
      if (entries.getEntries().some(entry => entry.element === target || (entry.element && target.contains(entry.element)))) queuePortfolioContentPaintCallback();
    });
    observer.observe({ type: "largest-contentful-paint", buffered: true });
  }
  if (document.readyState === "complete") queuePortfolioContentPaintFallback();
  else window.addEventListener("load", queuePortfolioContentPaintFallback, { once: true });
  return cancelPortfolioContentPaintCallback;
}
