import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

    const lightLoops = [];
    const stageVisible = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => stageVisible.set(entry.target, entry.isIntersecting));
      syncLightPlayback();
    });
    function syncLightPlayback() {
      lightLoops.forEach(({ stage, loop }) => {
        if (!document.hidden && stageVisible.get(stage)) loop.resume();
        else loop.pause();
      });
    }
    document.querySelectorAll(".js-light-stage").forEach(stage => {
      stageVisible.set(stage, false);
      const quiet = stage.classList.contains("c-light-stage--contact");
      [...stage.children]
        .filter(light => getComputedStyle(light).display !== "none")
        .forEach((light, index) => {
          const strength = quiet ? 0.45 : 1;
          const loop = gsap.timeline({ repeat: -1, paused: true, delay: index * 0.45, defaults: { ease: "sine.inOut" } });
          // Uneven, slow pulses form a repeating phrase, without audio or rapid flashing.
          [0.2, 0.6, 0.35, 0.8, 0.4, 0.7].forEach((level, beat) => {
            loop.to(light, {
              opacity: level * strength * 0.75,
              scale: 1 + level * (desktop ? 0.09 : 0.035),
              x: (beat % 2 ? 1 : -1) * ((index % 3) + 1) * (desktop ? 5 : 2),
              y: (beat % 2 ? -1 : 1) * (desktop ? 6 : 2),
              duration: 2.6 + ((beat + index) % 3) * 0.45,
            });
          });
          lightLoops.push({ stage, loop });
        });
      observer.observe(stage);
    });
    document.addEventListener("visibilitychange", syncLightPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncLightPlayback);
    };
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPortfolioMotion, { once: true });
else initPortfolioMotion();
