import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CURTAIN_DURATION = 1200;
const TEXT_START_DELAY = CURTAIN_DURATION + 160;
const TEXT_REVEAL_DURATION = 650;
const TEXT_STAGGER = 100;

// Each card owns its complete entrance, independently of image-link hover motion.
export function initPortfolioProjectEntrances(revealedElements) {
  const records = new Map();
  let destroyed = false;

  function showPortfolioProject(record) {
    if (record.shown || destroyed) return;
    record.shown = true;
    revealedElements.add(record.card);
    record.card.dataset.portfolioProjectEntrance = "shown";
    record.animations.forEach(animation => animation.cancel());
    record.animations.length = 0;
    record.curtain?.remove();
    record.trigger?.kill();
    record.trigger = null;
  }

  function playPortfolioProjectEntrance(record) {
    if (record.started || record.shown || destroyed) return;
    record.started = true;
    // Remember an encountered card even if a media change interrupts its entrance.
    revealedElements.add(record.card);
    record.card.dataset.portfolioProjectEntrance = "playing";
    if (record.curtain) {
      record.animations.push(record.curtain.animate([{ transform: "translateX(0)" }, { transform: "translateX(101%)" }], { duration: CURTAIN_DURATION, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "both" }));
    }
    record.text.forEach((element, index) => {
      record.animations.push(
        element.animate(
          [
            { opacity: 0, transform: "translateY(18px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: TEXT_REVEAL_DURATION, delay: TEXT_START_DELAY + index * TEXT_STAGGER, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
        ),
      );
    });
    const lastAnimation = record.animations.at(-1);
    if (lastAnimation) lastAnimation.onfinish = () => showPortfolioProject(record);
    else showPortfolioProject(record);
  }

  function handlePortfolioProjectFocus(event) {
    const card = event.target.closest?.("article.p-portfolio-project");
    const record = records.get(card);
    if (record) showPortfolioProject(record);
  }

  const cardEntries = [...document.querySelectorAll(".portfolio-site article.p-portfolio-project")].map(card => ({ card, top: card.getBoundingClientRect().top }));
  cardEntries.forEach(({ card, top }) => {
    const content = card.querySelector(".p-portfolio-project__content");
    const record = { card, text: content ? [...content.children] : [], curtain: null, animations: [], trigger: null, started: false, shown: false, originalEntrance: card.getAttribute("data-portfolio-project-entrance") };
    records.set(card, record);
    // Restored scroll positions and already-seen cards should never start concealed.
    // This module arrives after first paint. Never cover an already-visible LCP
    // image again; the page curtain owns entry, and offscreen cards keep theirs.
    if (revealedElements.has(card) || top < window.innerHeight || card.contains(document.activeElement) || typeof card.animate !== "function") {
      showPortfolioProject(record);
      return;
    }

    const image = card.querySelector(".p-portfolio-project__image");
    if (image) {
      record.curtain = document.createElement("span");
      record.curtain.className = "p-portfolio-project__curtain";
      record.curtain.setAttribute("aria-hidden", "true");
      image.append(record.curtain);
    }
    card.dataset.portfolioProjectEntrance = "pending";
    record.trigger = ScrollTrigger.create({
      trigger: card,
      start: "top 88%",
      end: "bottom top",
      onEnter: () => playPortfolioProjectEntrance(record),
      onEnterBack: () => showPortfolioProject(record),
      // A large wheel jump or anchor navigation must not leave unseen text behind.
      onLeave: () => showPortfolioProject(record),
      onRefresh: trigger => {
        if (trigger.progress === 1) showPortfolioProject(record);
      },
    });
    // Trigger construction may synchronously complete a restored card.
    if (record.shown) {
      record.trigger.kill();
      record.trigger = null;
    } else if (top <= window.innerHeight * 0.88) playPortfolioProjectEntrance(record);
  });

  document.addEventListener("focusin", handlePortfolioProjectFocus);

  return () => {
    destroyed = true;
    document.removeEventListener("focusin", handlePortfolioProjectFocus);
    records.forEach(record => {
      record.trigger?.kill();
      record.animations.forEach(animation => animation.cancel());
      record.curtain?.remove();
      if (record.originalEntrance === null) record.card.removeAttribute("data-portfolio-project-entrance");
      else record.card.setAttribute("data-portfolio-project-entrance", record.originalEntrance);
    });
    records.clear();
  };
}
