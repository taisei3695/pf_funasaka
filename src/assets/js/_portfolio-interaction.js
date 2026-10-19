import { initPortfolioLinkEqualizers } from "./_portfolio-link-equalizer.js";
import { initPortfolioScrollWaveform } from "./_portfolio-scroll-waveform.js";
import { queuePortfolioAfterPaint } from "./_portfolio-first-paint.js";

function buildScrollProgress(scroll, documentHeight, viewportHeight) {
  const distance = documentHeight - viewportHeight;
  return distance > 0 ? Math.min(1, Math.max(0, scroll / distance)) : 0;
}

function initScrollProgress() {
  const progress = document.querySelector(".js-scroll-progress");
  if (!progress) return () => {};
  const track = progress.querySelector(".c-portfolio-progress__track");
  const line = progress.querySelector(".c-portfolio-progress__line");
  const light = progress.querySelector(".c-portfolio-progress__light");
  let frame = 0;
  let destroyed = false;

  function updateScrollProgress() {
    frame = 0;
    if (destroyed || document.hidden) return;
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = document.documentElement.clientHeight;
    const ratio = buildScrollProgress(window.scrollY, documentHeight, viewportHeight);
    const width = track.getBoundingClientRect().width;
    const lightWidth = light.getBoundingClientRect().width;
    const adminBar = document.querySelector("#wpadminbar");
    const top = adminBar ? Math.max(0, adminBar.getBoundingClientRect().bottom) : 0;
    const sample = document.elementFromPoint(Math.max(0, window.innerWidth / 2), Math.min(window.innerHeight - 1, top + 12));
    const dark = sample?.closest(".p-portfolio-intro, .p-portfolio-hero, .p-portfolio-contact") || (sample?.closest(".p-portfolio-header") && sample.closest(".p-portfolio-header").dataset.portfolioDark !== "false");
    progress.dataset.portfolioDark = String(Boolean(dark));
    progress.dataset.portfolioScrollable = String(documentHeight > viewportHeight);
    progress.style.setProperty("--portfolio-progress-top", `${top}px`);
    line.style.transform = `scaleX(${ratio})`;
    light.style.transform = `translateX(${Math.max(0, Math.min(width - lightWidth, width * ratio - lightWidth / 2))}px)`;
    progress.classList.add("is-portfolio-progress-ready");
  }

  function queueScrollProgress() {
    if (!destroyed && !document.hidden && !frame) frame = requestAnimationFrame(updateScrollProgress);
  }

  function handleProgressVisibility() {
    if (document.hidden && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else queueScrollProgress();
  }

  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(queueScrollProgress) : null;
  resizeObserver?.observe(document.body);
  window.addEventListener("scroll", queueScrollProgress, { passive: true });
  window.addEventListener("resize", queueScrollProgress, { passive: true });
  window.addEventListener("load", queueScrollProgress);
  window.addEventListener("pageshow", queueScrollProgress);
  document.addEventListener("visibilitychange", handleProgressVisibility);
  document.fonts?.ready.then(queueScrollProgress);
  queueScrollProgress();

  return () => {
    destroyed = true;
    if (frame) cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    window.removeEventListener("scroll", queueScrollProgress);
    window.removeEventListener("resize", queueScrollProgress);
    window.removeEventListener("load", queueScrollProgress);
    window.removeEventListener("pageshow", queueScrollProgress);
    document.removeEventListener("visibilitychange", handleProgressVisibility);
    progress.classList.remove("is-portfolio-progress-ready");
    progress.removeAttribute("data-portfolio-dark");
    progress.removeAttribute("data-portfolio-scrollable");
    progress.style.removeProperty("--portfolio-progress-top");
    line.style.removeProperty("transform");
    light.style.removeProperty("transform");
  };
}

function initPortfolioInteractions() {
  if (!document.body.classList.contains("portfolio-site")) return;
  const motion = window.matchMedia("(prefers-reduced-motion: no-preference) and (forced-colors: none)");
  let stopProgress = () => {};
  let stopLinkEqualizers = () => {};
  let stopWaveform = () => {};

  function stopPortfolioInteractions() {
    stopProgress();
    stopLinkEqualizers();
    stopWaveform();
    stopProgress = () => {};
    stopLinkEqualizers = () => {};
    stopWaveform = () => {};
  }

  function syncPortfolioInteractions() {
    stopPortfolioInteractions();
    if (!motion.matches) return;
    stopProgress = initScrollProgress();
    stopLinkEqualizers = initPortfolioLinkEqualizers();
    stopWaveform = initPortfolioScrollWaveform();
  }

  function handlePortfolioPageShow(event) {
    if (event.persisted) syncPortfolioInteractions();
  }

  motion.addEventListener("change", syncPortfolioInteractions);
  window.addEventListener("pagehide", stopPortfolioInteractions);
  window.addEventListener("pageshow", handlePortfolioPageShow);
  syncPortfolioInteractions();
  return () => {
    stopPortfolioInteractions();
    motion.removeEventListener("change", syncPortfolioInteractions);
    window.removeEventListener("pagehide", stopPortfolioInteractions);
    window.removeEventListener("pageshow", handlePortfolioPageShow);
  };
}

function queuePortfolioInteractions() {
  const events = ["wheel", "touchstart", "pointerdown", "keydown", "focusin", "scroll", "pointerover"];
  function startPortfolioInteractions(event) {
    if (event?.type === "pointerover" && !event.target.closest?.("a,button,[tabindex]")) return;
    events.forEach(name => window.removeEventListener(name, startPortfolioInteractions, true));
    initPortfolioInteractions();
  }
  // Equalizers and the waveform respond to input; avoid adding their DOM and
  // measuring the full page before the visitor has started interacting.
  if (window.scrollY > 0) startPortfolioInteractions();
  else events.forEach(name => window.addEventListener(name, startPortfolioInteractions, { capture: true, passive: true }));
}

queuePortfolioAfterPaint(queuePortfolioInteractions);
