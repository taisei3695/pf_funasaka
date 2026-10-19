import { queuePortfolioAfterContentPaint } from "./_portfolio-first-paint.js";

function initPortfolioBackdrop() {
  const backdrop = document.querySelector(".js-portfolio-backdrop");
  if (!backdrop) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const forcedColors = window.matchMedia("(forced-colors: active)");
  const listing = backdrop.dataset.backdropVariant === "list";
  let animations = [];
  let frame = 0;
  let settleTimer = 0;
  let previousY = window.scrollY;
  let rate = 1;
  let targetRate = 1;
  let stopped = false;

  function updateBackdropRate() {
    frame = 0;
    if (stopped || document.hidden || reducedMotion.matches || forcedColors.matches) return;
    rate += (targetRate - rate) * 0.18;
    if (Math.abs(targetRate - rate) < 0.01) rate = targetRate;
    animations.forEach(animation => animation.updatePlaybackRate(rate));
    backdrop.dataset.backdropRate = rate.toFixed(2);
    if (rate !== targetRate) frame = requestAnimationFrame(updateBackdropRate);
  }

  function resetBackdropRate() {
    settleTimer = 0;
    targetRate = 1;
    if (!frame) frame = requestAnimationFrame(updateBackdropRate);
  }

  function handleBackdropScroll() {
    if (document.hidden || reducedMotion.matches || forcedColors.matches) return;
    const distance = Math.abs(window.scrollY - previousY);
    previousY = window.scrollY;
    targetRate = 1 + Math.min(0.65, distance / 240);
    if (!frame) frame = requestAnimationFrame(updateBackdropRate);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(resetBackdropRate, 180);
  }

  function syncBackdropPlayback() {
    cancelAnimationFrame(frame);
    clearTimeout(settleTimer);
    frame = 0;
    settleTimer = 0;
    rate = 1;
    targetRate = 1;
    previousY = window.scrollY;
    const paused = document.hidden || reducedMotion.matches || forcedColors.matches;
    backdrop.classList.toggle("is-backdrop-paused", paused);
    backdrop.dataset.backdropPlayback = paused ? "paused" : "playing";
    animations = [...backdrop.querySelectorAll(".c-portfolio-backdrop__particle")].flatMap(particle => (typeof particle.getAnimations === "function" ? particle.getAnimations() : []));
    animations.forEach(animation => animation.updatePlaybackRate(1));
    backdrop.dataset.backdropRate = "1.00";
  }

  function stopPortfolioBackdrop() {
    stopped = true;
    cancelAnimationFrame(frame);
    clearTimeout(settleTimer);
    backdrop.classList.add("is-backdrop-paused");
    document.removeEventListener("visibilitychange", syncBackdropPlayback);
    window.removeEventListener("resize", syncBackdropPlayback);
    window.removeEventListener("scroll", handleBackdropScroll);
    reducedMotion.removeEventListener("change", syncBackdropPlayback);
    forcedColors.removeEventListener("change", syncBackdropPlayback);
  }

  function handleBackdropPageShow(event) {
    if (!event.persisted) return;
    window.removeEventListener("pageshow", handleBackdropPageShow);
    initPortfolioBackdrop();
  }

  if (listing) window.addEventListener("scroll", handleBackdropScroll, { passive: true });
  window.addEventListener("resize", syncBackdropPlayback, { passive: true });
  document.addEventListener("visibilitychange", syncBackdropPlayback);
  reducedMotion.addEventListener("change", syncBackdropPlayback);
  forcedColors.addEventListener("change", syncBackdropPlayback);
  window.addEventListener("pagehide", stopPortfolioBackdrop, { once: true });
  window.addEventListener("pageshow", handleBackdropPageShow);
  syncBackdropPlayback();
  if (import.meta.hot) import.meta.hot.dispose(stopPortfolioBackdrop);
}

function queuePortfolioBackdrop() {
  if (!document.querySelector(".js-portfolio-backdrop")) return;
  const image = document.querySelector("main .p-portfolio-project__image img, main .p-portfolio-detail__image img");
  const bounds = image?.getBoundingClientRect();
  const target = image && bounds.top < window.innerHeight && bounds.bottom > 0 ? image : document.querySelector(".p-portfolio-detail--privacy .wp-block-paragraph, main h1");
  queuePortfolioAfterContentPaint(initPortfolioBackdrop, target);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", queuePortfolioBackdrop, { once: true });
else queuePortfolioBackdrop();
