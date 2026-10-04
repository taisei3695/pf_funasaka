const PORTFOLIO_SECTION_IDS = new Set(["works", "skills", "about", "contact"]);

function findPortfolioNavigationSection(url) {
  const id = url.hash.slice(1);
  return PORTFOLIO_SECTION_IDS.has(id) ? document.getElementById(id) : null;
}

function initPortfolioNavigation() {
  if (!document.body.classList.contains("portfolio-site")) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const initialFragment = window.location.hash;
  let listening = false;
  let initialNavigationPending = Boolean(initialFragment);
  let restoreHeadingFocus = () => {};

  function removePortfolioSectionFragment() {
    if (!window.location.hash) return;
    try {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    } catch {
      // Scrolling still works if the browser restricts history changes.
    }
  }

  function focusPortfolioSection(section) {
    restoreHeadingFocus();
    const heading = section.querySelector("h2") || section;
    const addedTabindex = !heading.hasAttribute("tabindex");
    if (addedTabindex) heading.setAttribute("tabindex", "-1");
    function restorePortfolioHeadingFocus() {
      heading.removeEventListener("blur", restorePortfolioHeadingFocus);
      if (addedTabindex) heading.removeAttribute("tabindex");
      restoreHeadingFocus = () => {};
    }
    restoreHeadingFocus = restorePortfolioHeadingFocus;
    heading.addEventListener("blur", restorePortfolioHeadingFocus, { once: true });
    heading.focus({ preventScroll: true });
  }

  function scrollToPortfolioSection(section, animate) {
    focusPortfolioSection(section);
    section.scrollIntoView({ behavior: animate && !reducedMotion.matches ? "smooth" : "instant", block: "start", inline: "nearest" });
  }

  function handlePortfolioSectionClick(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target?.closest?.("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target.toLowerCase() !== "_self")) return;
    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search) return;
    const section = findPortfolioNavigationSection(url);
    if (!section) return;
    event.preventDefault();
    initialNavigationPending = false;
    window.removeEventListener("load", handleInitialPortfolioSection);
    removePortfolioSectionFragment();
    scrollToPortfolioSection(section, true);
  }

  function handleInitialPortfolioSection() {
    window.removeEventListener("load", handleInitialPortfolioSection);
    if (!listening || !initialNavigationPending || window.location.hash !== initialFragment) return;
    const section = findPortfolioNavigationSection(new URL(window.location.href));
    if (!section) return;
    function finishInitialPortfolioSection() {
      if (!listening || !initialNavigationPending || window.location.hash !== initialFragment) return;
      initialNavigationPending = false;
      // Preserve direct links and navigation from work details, then clean the URL.
      removePortfolioSectionFragment();
      scrollToPortfolioSection(section, false);
    }
    if (document.fonts?.ready) document.fonts.ready.then(finishInitialPortfolioSection);
    else finishInitialPortfolioSection();
  }

  function startPortfolioNavigation() {
    if (listening) return;
    listening = true;
    document.addEventListener("click", handlePortfolioSectionClick);
  }

  function stopPortfolioNavigation() {
    listening = false;
    initialNavigationPending = false;
    document.removeEventListener("click", handlePortfolioSectionClick);
    window.removeEventListener("load", handleInitialPortfolioSection);
    restoreHeadingFocus();
  }

  function handlePortfolioNavigationPageShow(event) {
    if (event.persisted) startPortfolioNavigation();
  }

  startPortfolioNavigation();
  window.addEventListener("pagehide", stopPortfolioNavigation);
  window.addEventListener("pageshow", handlePortfolioNavigationPageShow);
  if (initialFragment) {
    if (document.readyState === "complete") handleInitialPortfolioSection();
    else window.addEventListener("load", handleInitialPortfolioSection, { once: true });
  }
  return () => {
    stopPortfolioNavigation();
    window.removeEventListener("pagehide", stopPortfolioNavigation);
    window.removeEventListener("pageshow", handlePortfolioNavigationPageShow);
  };
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPortfolioNavigation, { once: true });
else initPortfolioNavigation();
