import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PORTFOLIO_SCROLL_FRAME_SELECTORS = ".p-portfolio-project, .p-portfolio-skill, .p-portfolio-about__body, .p-portfolio-about__timeline > li, .p-portfolio-about__strengths, .p-portfolio-skills__additional";
const PORTFOLIO_SCROLL_REVEAL_PROFILES = {
  text: { animationName: "portfolio-scroll-entry", from: { y: 72 }, to: { y: 0 }, opacityDuration: 0.45, start: 0.12, end: 0.44 },
  frame: { animationName: "portfolio-scroll-frame-entry", from: {}, to: {}, opacityDuration: 0.5, start: 0, end: 0.12 },
  card: { animationName: "portfolio-scroll-card-entry", from: { y: 144, scale: 0.9 }, to: { y: 0, scale: 1 }, opacityDuration: 0.3, start: 0.08, end: 0.42 },
  image: { animationName: "portfolio-scroll-image-entry", from: { y: 88, scale: 1.2, clipPath: "inset(48% 14% 52% 14%)" }, to: { y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }, opacityDuration: 0, start: 0.1, end: 0.54 },
  tag: { animationName: "portfolio-scroll-tag-entry", from: { y: 36, scale: 0.86 }, to: { y: 0, scale: 1 }, opacityDuration: 0.5, start: 0.12, end: 0.38 },
  title: { animationName: "portfolio-scroll-title-entry", from: { y: 128, clipPath: "inset(0% 0% 100% 0%)" }, to: { y: 0, clipPath: "inset(0% 0% 0% 0%)" }, opacityDuration: 0.25, start: 0.12, end: 0.54 },
  heading: { animationName: "portfolio-scroll-heading-track", start: 0.12, end: 0.58 },
};
const PORTFOLIO_SCROLL_REVEAL_SELECTORS = [
  PORTFOLIO_SCROLL_FRAME_SELECTORS,
  ".p-portfolio-header__brand",
  ".p-portfolio-header__nav a",
  ".p-portfolio-hero__eyebrow",
  ".p-portfolio-hero__description",
  ".p-portfolio-section__title",
  ".p-portfolio-about__eyebrow",
  ".p-portfolio-about__intro > *",
  ".p-portfolio-about__lead",
  ".p-portfolio-about__timeline > li > :is(h4, p)",
  ".p-portfolio-about__strengths > h4",
  ".p-portfolio-about__strengths li",
  ".p-portfolio-section__intro",
  ".p-portfolio-section__note",
  ".p-portfolio-eyebrow",
  ".p-portfolio-experience__heading > *",
  ".p-portfolio-project__image",
  ".p-portfolio-project__content > :not(.p-portfolio-project__meta, .p-portfolio-tags)",
  ".p-portfolio-project__meta :is(dt, dd)",
  ".p-portfolio-tags > li",
  ".p-portfolio-skill > p",
  ".p-portfolio-skill__heading > *",
  ".p-portfolio-skills__additional > h3",
  ".p-portfolio-skills__additional dl :is(dt, dd)",
  ".p-portfolio-skills__tools",
  ".p-portfolio-works__more > a",
  ".p-portfolio-contact__text",
  ".p-portfolio-contact__link",
  ".p-portfolio-contact__pending",
  ".p-portfolio-footer .l-portfolio-inner > *",
];

function listPortfolioScrollRevealElements() {
  // Dedicated sequences own these sections, keeping each element on one animation track.
  return [...document.querySelectorAll(PORTFOLIO_SCROLL_REVEAL_SELECTORS.join(","))].filter(element => !element.closest(".p-portfolio-project, .p-portfolio-skill, .p-portfolio-section__title"));
}

function buildPortfolioScrollRevealKind(element) {
  if (element.matches(".p-portfolio-project, .p-portfolio-skill")) return "card";
  if (element.matches(PORTFOLIO_SCROLL_FRAME_SELECTORS)) return "frame";
  if (element.matches(".p-portfolio-section__title")) return /^[\u0020-\u007e]+$/.test(element.textContent.trim()) ? "heading" : "title";
  if (element.matches(".p-portfolio-project__image")) return "image";
  if (element.matches(".p-portfolio-tags > li")) return "tag";
  return "text";
}

function buildPortfolioScrollTriggerPosition(element, progress, entryRange) {
  const viewportHeight = window.innerHeight;
  // Cover spans the viewport plus the untransformed border box; entry spans the shorter box.
  const rangeHeight = entryRange ? Math.min(viewportHeight, element.offsetHeight) : viewportHeight + element.offsetHeight;
  return `top ${viewportHeight - rangeHeight * progress}px`;
}

export function initPortfolioScrollReveals(revealedElements, createHeadingLetters) {
  if (!document.body.classList.contains("home")) return () => {};
  const nativeTimeline = typeof CSS !== "undefined" && CSS.supports("(animation-timeline: view()) and (animation-range: entry)");
  const records = new Map();
  let destroyed = false;

  function showPortfolioScrollElement(element) {
    const record = records.get(element);
    if (!record || record.shown || destroyed) return;
    record.shown = true;
    revealedElements.add(element);
    // Removing the native animation or reverting GSAP restores the element's own styles.
    element.dataset.portfolioReveal = "shown";
    record.tween?.revert();
    record.tween = null;
  }

  function handlePortfolioRevealAnimationEnd(event) {
    if (event.pseudoElement || !records.has(event.target)) return;
    const record = records.get(event.target);
    if (event.animationName !== record.animationName) return;
    const animation = event.animation ?? event.target.getAnimations().find(animation => animation.animationName === record.animationName);
    if ((animation?.effect?.getComputedTiming().progress ?? 0) < 1) return;
    showPortfolioScrollElement(event.target);
  }

  function handlePortfolioRevealFocus(event) {
    records.forEach(record => {
      if (record.element.contains(event.target)) showPortfolioScrollElement(record.element);
    });
  }

  function createPortfolioScrollTween(record) {
    const { element, kind, profile } = record;
    const tagOffset = kind === "tag" ? ([...element.parentElement.children].indexOf(element) % 4) * 0.03 : 0;
    const contact = element.dataset.portfolioRevealRange === "contact";
    const footer = element.dataset.portfolioRevealRange === "footer";
    const rangeStart = footer ? 0 : contact ? 0.04 : profile.start + tagOffset;
    const rangeEnd = footer ? 1 : contact ? (kind === "heading" ? 0.4 : 0.24) : profile.end + tagOffset;
    const sequence = gsap.timeline({
      onComplete: () => showPortfolioScrollElement(element),
      scrollTrigger: {
        trigger: element,
        start: () => buildPortfolioScrollTriggerPosition(element, rangeStart, footer),
        end: () => `clamp(${buildPortfolioScrollTriggerPosition(element, rangeEnd, footer)})`,
        scrub: 0.35,
      },
    });
    if (kind === "heading") {
      const rangeLength = rangeEnd - rangeStart;
      const glyphDuration = (contact ? 0.2 : 0.28) / rangeLength;
      // Keep the heading's completion track even when a short word finishes its last letter earlier.
      sequence.to({}, { duration: 1 }, 0);
      record.heading.glyphs.forEach((glyph, index) => {
        const offset = (index * 0.02) / rangeLength;
        sequence.fromTo(glyph, { yPercent: 175, rotation: 10 }, { yPercent: 0, rotation: 0, duration: glyphDuration, ease: "none" }, offset);
        sequence.fromTo(glyph, { opacity: 0 }, { opacity: 1, duration: glyphDuration * 0.3, ease: "none" }, offset);
      });
      return sequence;
    }
    sequence.fromTo(element, profile.from, { ...profile.to, duration: 1, ease: "none" }, 0);
    if (profile.opacityDuration) sequence.fromTo(element, { opacity: 0 }, { opacity: 1, duration: profile.opacityDuration, ease: "none" }, 0);
    return sequence;
  }

  // Read positions together before adding animation attributes invalidates layout.
  const revealElements = listPortfolioScrollRevealElements().map(element => ({ element, top: element.getBoundingClientRect().top }));
  revealElements.forEach(({ element, top }) => {
    const kind = buildPortfolioScrollRevealKind(element);
    const profile = PORTFOLIO_SCROLL_REVEAL_PROFILES[kind];
    const record = { element, kind, profile, heading: null, tween: null, shown: false, animationName: profile.animationName };
    records.set(element, record);
    element.dataset.portfolioRevealKind = kind;
    if (revealedElements.has(element) || top <= window.innerHeight * 0.74 || element.contains(document.activeElement)) {
      showPortfolioScrollElement(element);
      return;
    }
    element.dataset.portfolioReveal = "pending";
    element.dataset.portfolioRevealMode = nativeTimeline ? "native" : "gsap";
    if (kind === "heading") record.heading = createHeadingLetters(element);
    // The final section has less scroll distance left than the rest of the page.
    if (element.closest(".p-portfolio-contact")) element.dataset.portfolioRevealRange = "contact";
    if (element.closest(".p-portfolio-footer")) element.dataset.portfolioRevealRange = "footer";
    if (nativeTimeline) return;

    record.tween = createPortfolioScrollTween(record);
    // A restored scroll position can finish a clamped trigger during its construction.
    if (record.shown) {
      record.tween.revert();
      record.tween = null;
    }
  });

  document.addEventListener("animationend", handlePortfolioRevealAnimationEnd);
  document.addEventListener("focusin", handlePortfolioRevealFocus);

  return () => {
    destroyed = true;
    document.removeEventListener("animationend", handlePortfolioRevealAnimationEnd);
    document.removeEventListener("focusin", handlePortfolioRevealFocus);
    records.forEach(record => {
      record.tween?.revert();
      record.heading?.restore();
      record.element.removeAttribute("data-portfolio-reveal");
      record.element.removeAttribute("data-portfolio-reveal-mode");
      record.element.removeAttribute("data-portfolio-reveal-kind");
      record.element.removeAttribute("data-portfolio-reveal-range");
    });
    records.clear();
  };
}
