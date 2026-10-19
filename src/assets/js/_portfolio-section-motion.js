const PORTFOLIO_HEADING_STATE = "data-portfolio-heading-motion";
const PORTFOLIO_SKILL_STATE = "data-portfolio-skill-motion";
const SKILL_CARD_STAGGER = 180;
const SKILL_CATEGORY_PAUSE = 520;
const SKILL_MAX_QUEUE_DELAY = 1600;

function restorePortfolioMotionAttribute(element, name, value) {
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
}

function createPortfolioHeadingLayers(heading) {
  const text = heading.textContent;
  return ["blue", "rose"].map(color => {
    const layer = document.createElement("span");
    layer.className = `p-portfolio-heading-motion__layer p-portfolio-heading-motion__layer--${color}`;
    layer.setAttribute("aria-hidden", "true");
    layer.textContent = text;
    heading.appendChild(layer);
    return layer;
  });
}

export function initPortfolioSectionAccents(revealedHeadings, revealedElements) {
  // Without observation, the unmodified headings and skill cards remain readable.
  if (typeof IntersectionObserver !== "function") return () => {};
  const headings = new Map();
  const skills = new Map();
  let destroyed = false;
  let scrollFrame = 0;
  let lastSkillStart = 0;
  let lastSkillCategory = "";

  function showPortfolioHeading(record, animate = false) {
    if (record.shown || destroyed) return;
    record.shown = true;
    revealedHeadings.add(record.element);
    record.element.setAttribute(PORTFOLIO_HEADING_STATE, animate ? "playing" : "shown");
    observer.unobserve(record.element);
  }

  function showPortfolioSkill(record) {
    if (record.shown || destroyed) return;
    if (record.timer) window.clearTimeout(record.timer);
    record.timer = 0;
    record.shown = true;
    revealedElements.add(record.element);
    record.element.setAttribute(PORTFOLIO_SKILL_STATE, "shown");
    observer.unobserve(record.element);
  }

  function startPortfolioSkillReveal(record) {
    record.timer = 0;
    if (destroyed || record.shown) return;
    const bounds = record.element.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top <= window.innerHeight * 0.42 || record.element.contains(document.activeElement)) {
      showPortfolioSkill(record);
      return;
    }
    // A queued card that has left below the viewport waits for its own next entry.
    if (!record.visible || bounds.top >= window.innerHeight) {
      record.element.setAttribute(PORTFOLIO_SKILL_STATE, "pending");
      return;
    }
    record.element.setAttribute(PORTFOLIO_SKILL_STATE, "playing");
    // Also settle if an unrelated stylesheet prevents animationend from firing.
    record.timer = window.setTimeout(() => showPortfolioSkill(record), 1000);
  }

  function queuePortfolioSkillReveals(records) {
    const now = performance.now();
    records
      .sort((first, second) => first.index - second.index)
      .forEach(record => {
        if (record.shown || record.timer || record.element.getAttribute(PORTFOLIO_SKILL_STATE) === "playing") return;
        const changesCategory = lastSkillCategory && lastSkillCategory !== record.category;
        const categoryPause = changesCategory ? SKILL_CATEGORY_PAUSE : SKILL_CARD_STAGGER;
        const earliestStart = changesCategory ? now + SKILL_CATEGORY_PAUSE : now;
        // Only visible cards enter this queue. A new mobile row never waits on offscreen categories.
        // Preserve the category pause even when the preceding row has already finished.
        const start = Math.min(now + SKILL_MAX_QUEUE_DELAY, Math.max(earliestStart, lastSkillStart + categoryPause));
        record.element.setAttribute(PORTFOLIO_SKILL_STATE, "queued");
        record.timer = window.setTimeout(() => startPortfolioSkillReveal(record), start - now);
        lastSkillStart = start;
        lastSkillCategory = record.category;
      });
  }

  function handlePortfolioSectionEntries(entries) {
    const visibleSkills = [];
    entries.forEach(entry => {
      const heading = headings.get(entry.target);
      if (heading) {
        if (entry.isIntersecting) showPortfolioHeading(heading, true);
        return;
      }
      const skill = skills.get(entry.target);
      if (!skill || skill.shown) return;
      skill.visible = entry.isIntersecting;
      if (entry.isIntersecting) visibleSkills.push(skill);
      else if (entry.boundingClientRect.bottom <= 0) showPortfolioSkill(skill);
      else if (skill.element.getAttribute(PORTFOLIO_SKILL_STATE) === "queued") {
        window.clearTimeout(skill.timer);
        skill.timer = 0;
        skill.element.setAttribute(PORTFOLIO_SKILL_STATE, "pending");
      }
    });
    queuePortfolioSkillReveals(visibleSkills);
  }

  const observer = new IntersectionObserver(handlePortfolioSectionEntries, { rootMargin: "0px 0px -12% 0px", threshold: 0 });

  // Cache both groups before heading layers or pending states change the DOM.
  const headingEntries = [...document.querySelectorAll(".p-portfolio-section__title, .p-portfolio-detail__title, .p-portfolio-detail__body h2")].map(element => ({ element, bounds: element.getBoundingClientRect() }));
  const skillEntries = [...document.querySelectorAll(".p-portfolio-skill")].map(element => ({ element, top: element.getBoundingClientRect().top }));
  headingEntries.forEach(({ element, bounds }) => {
    if (element.dataset.portfolioInitialMotion === "true") return;
    const record = { element, shown: false, layers: [], originalState: element.getAttribute(PORTFOLIO_HEADING_STATE) };
    headings.set(element, record);
    if (revealedHeadings.has(element) || bounds.bottom <= 0 || (document.body.classList.contains("home") && bounds.top <= window.innerHeight * 0.78)) {
      showPortfolioHeading(record);
      return;
    }
    record.layers = createPortfolioHeadingLayers(element);
    element.setAttribute(PORTFOLIO_HEADING_STATE, "pending");
    observer.observe(element);
  });

  skillEntries.forEach(({ element, top }, index) => {
    const record = { element, index, category: element.querySelector(".p-portfolio-skill__category")?.textContent.trim() ?? "", visible: false, shown: false, timer: 0, originalState: element.getAttribute(PORTFOLIO_SKILL_STATE) };
    skills.set(element, record);
    if (revealedElements.has(element) || top <= window.innerHeight * 0.78 || element.contains(document.activeElement)) {
      showPortfolioSkill(record);
      return;
    }
    element.setAttribute(PORTFOLIO_SKILL_STATE, "pending");
    observer.observe(element);
  });

  function handlePortfolioAccentAnimationEnd(event) {
    if (event.animationName === "portfolio-heading-glitch-blue") {
      const record = headings.get(event.target.parentElement);
      if (record?.shown) record.element.setAttribute(PORTFOLIO_HEADING_STATE, "shown");
    }
    if (event.animationName === "portfolio-skill-category-entry") {
      const record = skills.get(event.target);
      if (record) showPortfolioSkill(record);
    }
  }

  function syncPortfolioPassedSkills() {
    scrollFrame = 0;
    if (destroyed) return;
    skills.forEach(record => {
      if (record.shown) return;
      const bounds = record.element.getBoundingClientRect();
      // A fast scroll, anchor jump or restored position must never strand hidden text.
      if (bounds.bottom <= 0 || bounds.top <= window.innerHeight * 0.42) showPortfolioSkill(record);
    });
  }

  function handlePortfolioAccentScroll() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(syncPortfolioPassedSkills);
  }

  function handlePortfolioAccentFocus(event) {
    skills.forEach(record => {
      if (record.element.contains(event.target)) showPortfolioSkill(record);
    });
  }

  document.addEventListener("animationend", handlePortfolioAccentAnimationEnd);
  document.addEventListener("focusin", handlePortfolioAccentFocus);
  window.addEventListener("scroll", handlePortfolioAccentScroll, { passive: true });
  window.addEventListener("pageshow", handlePortfolioAccentScroll);

  return () => {
    destroyed = true;
    observer.disconnect();
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    document.removeEventListener("animationend", handlePortfolioAccentAnimationEnd);
    document.removeEventListener("focusin", handlePortfolioAccentFocus);
    window.removeEventListener("scroll", handlePortfolioAccentScroll);
    window.removeEventListener("pageshow", handlePortfolioAccentScroll);
    headings.forEach(record => {
      record.layers.forEach(layer => layer.remove());
      restorePortfolioMotionAttribute(record.element, PORTFOLIO_HEADING_STATE, record.originalState);
    });
    skills.forEach(record => {
      if (record.timer) window.clearTimeout(record.timer);
      restorePortfolioMotionAttribute(record.element, PORTFOLIO_SKILL_STATE, record.originalState);
    });
  };
}
