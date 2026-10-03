import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function createLightSequence(stage) {
  const lights = [...stage.querySelectorAll(".c-light")].filter(light => getComputedStyle(light).display !== "none");
  const columns = Math.max(...lights.map(light => Number(light.dataset.lightColumn))) + 1;
  const quiet = stage.classList.contains("c-light-stage--contact");
  const loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.4, defaults: { ease: "sine.inOut" } });

  lights.forEach(light => {
    const row = Number(light.dataset.lightRow);
    const column = Number(light.dataset.lightColumn);
    const isBehindTitle = !quiet && row >= 2 && row <= 4 && column >= columns * 0.2 && column <= columns * 0.8;
    const base = isBehindTitle ? 0.06 : 0.16;
    const peak = (isBehindTitle ? 0.26 : 0.8) * (quiet ? 0.7 : 1);
    const sweepStart = column * 0.24 + row * 0.12;
    const rippleStart = 9 + (Math.abs(column - (columns - 1) / 2) + Math.abs(row - 3)) * 0.18;

    gsap.set(light, { opacity: base });
    // Fixed light positions echo a strobe wall; only luminance changes, with a long afterglow.
    loop.to(light, { opacity: peak, duration: 1.35 }, sweepStart).to(light, { opacity: base, duration: 2.25 }, sweepStart + 1.35);
    loop.to(light, { opacity: peak * 0.8, duration: 1.55 }, rippleStart).to(light, { opacity: base, duration: 2.6 }, rippleStart + 1.55);
  });
  return loop;
}

function createLightCueSequence(stage) {
  const lights = [...stage.querySelectorAll(".c-light")];
  const sequence = gsap.timeline({ paused: true, onComplete: () => (stage.dataset.lightPlayback = "complete") });
  gsap.set(lights, { opacity: 0.18 });
  lights.forEach((light, index) => {
    sequence.to(light, { opacity: 0.72, duration: 0.65, ease: "sine.inOut" }, index * 0.13);
    sequence.to(light, { opacity: 0.3, duration: 1.5, ease: "sine.inOut" }, index * 0.13 + 0.65);
  });
  return sequence;
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
      if (loop.repeat() !== -1 && loop.progress() === 1) {
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
    stages.forEach(stage => {
      stage.removeEventListener("contentvisibilityautostatechange", handleLightRenderState);
      stage.removeAttribute("data-light-playback");
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
