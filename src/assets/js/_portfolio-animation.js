import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function listLightPatterns(columns) {
  const reverse = Math.random() < 0.5;
  return [
    { name: "sweep", rise: 0.85, fade: 2, strength: 1, buildStartTime: (_, column) => (reverse ? columns - 1 - column : column) * 0.25 },
    { name: "ripple", rise: 1, fade: 2.3, strength: 1, buildStartTime: (row, column) => Math.hypot(column - (columns - 1) / 2, (row - 3) * 1.2) * 0.34 },
    { name: "cascade", rise: 0.9, fade: 2.1, strength: 0.95, buildStartTime: (row, column) => row * 0.46 + (column % 3) * 0.15 },
    { name: "diagonal", rise: 0.85, fade: 2.2, strength: 1, buildStartTime: (row, column) => (reverse ? columns - 1 - column + 6 - row : column + row) * 0.23 },
    { name: "sparkle", rise: 0.85, fade: 2.4, strength: 0.9, buildStartTime: () => Math.random() * 4.8 },
  ];
}

function createLightSequence(stage) {
  const lights = [...stage.querySelectorAll(".c-light")].filter(light => getComputedStyle(light).display !== "none");
  const columns = Math.max(...lights.map(light => Number(light.dataset.lightColumn))) + 1;
  const quiet = stage.classList.contains("c-light-stage--contact");
  const patterns = listLightPatterns(columns);
  let activeIndex = -1;
  let playing = false;

  // Build a bounded set inside matchMedia's GSAP context. Only one timeline runs at a time.
  const sequences = patterns.map(pattern => {
    const sequence = gsap.timeline({ paused: true, defaults: { ease: "sine.inOut" }, onComplete: playNextLightPattern });
    lights.forEach(light => {
      const row = Number(light.dataset.lightRow);
      const column = Number(light.dataset.lightColumn);
      const isBehindTitle = row >= 2 && row <= 4 && column >= columns * 0.2 && column <= columns * 0.8;
      const base = isBehindTitle ? 0.1 : 0.22;
      const peak = (isBehindTitle ? 0.4 : 1) * pattern.strength * (quiet ? 0.9 : 1);
      const start = pattern.buildStartTime(row, column);

      sequence
        .fromTo(light, { opacity: base, scale: 1 }, { opacity: peak, scale: isBehindTitle ? 1.05 : 1.2, duration: pattern.rise, immediateRender: false }, start)
        .to(light, { opacity: base, scale: 1, duration: pattern.fade }, start + pattern.rise);
    });
    // The quiet gap belongs to the timeline, so pausing also stops the next pattern's countdown.
    sequence.to({}, { duration: 1.6 });
    return sequence;
  });

  lights.forEach(light => {
    const row = Number(light.dataset.lightRow);
    const column = Number(light.dataset.lightColumn);
    const isBehindTitle = row >= 2 && row <= 4 && column >= columns * 0.2 && column <= columns * 0.8;
    gsap.set(light, { opacity: isBehindTitle ? 0.1 : 0.22, scale: 1 });
  });

  function playNextLightPattern() {
    if (!playing) return;
    if (activeIndex >= 0) sequences[activeIndex].pause();
    const candidates = patterns.map((_, index) => index).filter(index => index !== activeIndex);
    activeIndex = candidates[Math.floor(Math.random() * candidates.length)];
    stage.dataset.lightPattern = patterns[activeIndex].name;
    sequences[activeIndex].restart();
  }

  return {
    isComplete: () => false,
    pause: () => {
      playing = false;
      if (activeIndex >= 0) sequences[activeIndex].pause();
    },
    resume: () => {
      if (playing) return;
      playing = true;
      if (activeIndex < 0) playNextLightPattern();
      else sequences[activeIndex].resume();
    },
  };
}

function createLightCueSequence(stage) {
  const lights = [...stage.querySelectorAll(".c-light")];
  const sequence = gsap.timeline({ paused: true, onComplete: () => (stage.dataset.lightPlayback = "complete") });
  const patterns = ["sweep", "ripple", "sparkle"];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const reverse = Math.random() < 0.5;
  stage.dataset.lightPattern = pattern;
  gsap.set(lights, { opacity: 0.2, scale: 1 });
  lights.forEach((light, index) => {
    const start = pattern === "ripple" ? Math.abs(index - 3) * 0.16 : pattern === "sparkle" ? Math.random() * 0.9 : (reverse ? lights.length - 1 - index : index) * 0.14;
    sequence.to(light, { opacity: 1, scale: 1.15, duration: 0.7, ease: "sine.inOut" }, start);
    sequence.to(light, { opacity: 0.5, scale: 1, duration: 1.6, ease: "sine.inOut" }, start + 0.7);
  });
  return { isComplete: () => sequence.progress() === 1, pause: () => sequence.pause(), resume: () => sequence.resume() };
}

function initLightPlayback() {
  // Keep the CSS light wall static when viewport observation is unavailable.
  if (typeof IntersectionObserver !== "function") return () => {};
  const stages = [...document.querySelectorAll(".js-light-stage, .js-light-cue")];
  const stageVisible = new Map(stages.map(stage => [stage, false]));
  const renderSkipped = new Map();
  const sequences = stages.map(stage => ({ stage, loop: stage.classList.contains("js-light-cue") ? createLightCueSequence(stage) : createLightSequence(stage) }));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => stageVisible.set(entry.target, entry.isIntersecting));
    syncLightPlayback();
  });

  function syncLightPlayback() {
    sequences.forEach(({ stage, loop }) => {
      if (loop.isComplete()) {
        stage.dataset.lightPlayback = "complete";
        return;
      }
      const shouldPlay = !document.hidden && stageVisible.get(stage) && !renderSkipped.get(stage);
      if (shouldPlay) loop.resume();
      else loop.pause();
      stage.dataset.lightPlayback = shouldPlay ? "playing" : "paused";
    });
  }

  function handleLightRenderState(event) {
    renderSkipped.set(event.currentTarget, event.skipped);
    syncLightPlayback();
  }

  stages.forEach(stage => {
    stage.dataset.lightPlayback = "paused";
    stage.addEventListener("contentvisibilityautostatechange", handleLightRenderState);
    observer.observe(stage);
  });
  document.addEventListener("visibilitychange", syncLightPlayback);
  syncLightPlayback();

  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", syncLightPlayback);
    sequences.forEach(({ loop }) => loop.pause());
    stages.forEach(stage => {
      stage.removeEventListener("contentvisibilityautostatechange", handleLightRenderState);
      stage.removeAttribute("data-light-playback");
      stage.removeAttribute("data-light-pattern");
    });
  };
}

function initPortfolioMotion() {
  if (!document.body.classList.contains("portfolio-site")) return;
  const media = gsap.matchMedia();

  // Progressive enhancement: all content stays visible without JS or with reduced motion.
  media.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 767px)", motion: "(prefers-reduced-motion: no-preference)" }, context => {
    if (!context.conditions.motion) return;
    const desktop = context.conditions.desktop;
    const hero = document.querySelector(".p-portfolio-hero");
    if (hero) {
      gsap.timeline({ defaults: { duration: 1.15, ease: "power3.out" } }).from(".js-hero-line", { yPercent: 105, stagger: 0.17, delay: 0.15 });
      gsap.to(".p-portfolio-hero__type", {
        y: desktop ? -50 : -20,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      gsap.to(hero.querySelector(".js-light-stage"), {
        y: desktop ? -35 : -15,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    }
    document.querySelectorAll(".js-work-reveal").forEach(frame => {
      const image = frame.querySelector("img");
      if (!image) return;
      gsap
        .timeline({ scrollTrigger: { trigger: frame, start: "top 90%", once: true } })
        .from(frame, { clipPath: "inset(0 0 100% 0)", duration: 1.05, ease: "power3.out", clearProps: "clipPath" })
        .from(image, { scale: 1.06, duration: 1.3, ease: "power3.out", clearProps: "transform" }, 0);
      if (desktop && frame.classList.contains("p-portfolio-work__image")) {
        gsap.fromTo(
          frame,
          { y: 10 },
          {
            y: -10,
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      }
    });
    document.querySelectorAll(".js-fade-up").forEach(element => {
      gsap.from(element, {
        y: 22,
        opacity: 0,
        duration: 0.85,
        ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: element, start: "top 94%", once: true },
      });
    });
    const skills = document.querySelector(".p-portfolio-skills__list");
    if (skills)
      gsap.from(skills.children, {
        y: 22,
        opacity: 0,
        duration: 0.7,
        stagger: 0.065,
        ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: skills, start: "top 92%", once: true },
      });

    return initLightPlayback();
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPortfolioMotion, { once: true });
else initPortfolioMotion();
