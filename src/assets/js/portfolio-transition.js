const transitionClass = "is-portfolio-transition-image";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const readNativeExceptionName = Object.getOwnPropertyDescriptor(DOMException.prototype, "name").get;
let activeTransition = null;

function parsePortfolioUrl(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value, window.location.href);
    return url.origin === window.location.origin ? url : null;
  } catch {
    return null;
  }
}

function isSamePortfolioPage(first, second) {
  return Boolean(first && second && first.origin === second.origin && first.pathname.replace(/\/+$/, "") === second.pathname.replace(/\/+$/, ""));
}

function findWorkTransitionImage(url) {
  return [...document.querySelectorAll("[data-portfolio-transition-image][data-portfolio-work-url]")].find(frame => isSamePortfolioPage(parsePortfolioUrl(frame.dataset.portfolioWorkUrl), url)) ?? null;
}

function isWorkListingUrl(url, detailImage) {
  if (!url || (url.hash && url.hash !== "#works")) return false;
  const detail = detailImage.closest(".p-portfolio-detail");
  return [...(detail?.querySelectorAll(".p-portfolio-detail__breadcrumb a, .p-portfolio-detail__navigation a") ?? [])].some(link => {
    const destination = parsePortfolioUrl(link.href);
    return destination && !destination.hash && isSamePortfolioPage(destination, url);
  });
}

function findOutgoingWorkImage(destination) {
  const cardImage = findWorkTransitionImage(destination);
  if (cardImage?.classList.contains("p-portfolio-work__image")) return cardImage;
  const detailImage = document.querySelector(".p-portfolio-detail__image[data-portfolio-transition-image]");
  return detailImage && isWorkListingUrl(destination, detailImage) ? detailImage : null;
}

function findIncomingWorkImage(source, destination) {
  const cardImage = findWorkTransitionImage(source);
  if (cardImage?.classList.contains("p-portfolio-work__image")) return cardImage;
  const detailImage = document.querySelector(".p-portfolio-detail__image[data-portfolio-transition-image]");
  return detailImage && isSamePortfolioPage(parsePortfolioUrl(detailImage.dataset.portfolioWorkUrl), destination) && isWorkListingUrl(source, detailImage) ? detailImage : null;
}

function canShareWorkImage(frame) {
  if (!frame) return false;
  const image = frame.querySelector("img");
  if (!image?.complete || !image.naturalWidth) return false;
  const style = getComputedStyle(frame);
  const rect = frame.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
}

function removeWorkTransitionNames() {
  document.querySelectorAll(`.${transitionClass}`).forEach(frame => frame.classList.remove(transitionClass));
}

function setPortfolioPageTransition(transition, frame = null, incoming = false) {
  activeTransition = transition;
  if (frame) {
    frame.classList.add(transitionClass);
    // Kept for this document, including BFCache: the main GSAP entry must skip this frame's reveal/parallax.
    if (incoming) frame.dataset.portfolioTransitionRevealed = "true";
  }
  const cleanup = () => {
    if (activeTransition !== transition) return;
    removeWorkTransitionNames();
    activeTransition = null;
  };
  transition.finished.then(cleanup, cleanup);
}

function assertExpectedPortfolioTransitionAbort(error) {
  let name;
  try {
    // The native getter validates the DOMException brand across realms; mutable name/tag fields cannot impersonate it.
    name = readNativeExceptionName.call(error);
  } catch {
    throw error;
  }
  if (!["AbortError", "InvalidStateError", "TimeoutError"].includes(name)) throw error;
}

function ensurePortfolioTransitionPromisesHandled(transition) {
  // Limit ordinary native abort handling to this transition; application exceptions still propagate.
  for (const promise of [transition.ready, transition.updateCallbackDone, transition.finished]) {
    promise.catch(assertExpectedPortfolioTransitionAbort);
  }
}

function handlePortfolioPageSwap(event) {
  removeWorkTransitionNames();
  activeTransition = null;
  if (!event.viewTransition) return;
  ensurePortfolioTransitionPromisesHandled(event.viewTransition);
  const destination = parsePortfolioUrl(event.activation?.entry?.url);
  const image = !reducedMotion.matches && destination ? findOutgoingWorkImage(destination) : null;
  if (!image) {
    event.viewTransition.skipTransition();
    return;
  }
  setPortfolioPageTransition(event.viewTransition, canShareWorkImage(image) ? image : null);
}

function handlePortfolioPageReveal(event) {
  // Clear names saved with an outgoing BFCache document before assigning the single incoming name.
  removeWorkTransitionNames();
  activeTransition = null;
  if (!event.viewTransition) return;
  ensurePortfolioTransitionPromisesHandled(event.viewTransition);
  const source = parsePortfolioUrl(window.navigation?.activation?.from?.url);
  const destination = parsePortfolioUrl(window.navigation?.activation?.entry?.url);
  const image = !reducedMotion.matches && source && destination ? findIncomingWorkImage(source, destination) : null;
  if (!image) {
    event.viewTransition.skipTransition();
    return;
  }
  setPortfolioPageTransition(event.viewTransition, canShareWorkImage(image) ? image : null, true);
}

function handlePortfolioPageShow(event) {
  if (event.persisted && !activeTransition) removeWorkTransitionNames();
}

function handlePortfolioReducedMotion(event) {
  if (event.matches && activeTransition) activeTransition.skipTransition();
}

// This independent head entry registers before pagereveal; it does not defer to DOMContentLoaded.
if ("onpageswap" in window && "onpagereveal" in window && "navigation" in window && CSS.supports("view-transition-name", "portfolio-work-image")) {
  window.addEventListener("pageswap", handlePortfolioPageSwap);
  window.addEventListener("pagereveal", handlePortfolioPageReveal);
  window.addEventListener("pageshow", handlePortfolioPageShow);
  reducedMotion.addEventListener("change", handlePortfolioReducedMotion);
}
