import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initPortfolioScrollReveals } from "./_portfolio-scroll-reveal.js";
import { initPortfolioTimelineMotion } from "./_portfolio-timeline-motion.js";
import { initPortfolioProjectEntrances } from "./_portfolio-project-motion.js";
import { initPortfolioSectionAccents } from "./_portfolio-section-motion.js";

gsap.registerPlugin(ScrollTrigger);

const LIGHT_PEAK_INTENSITY = 1.25;

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

function buildLightFadeProgress(progress) {
  // Keep velocity and acceleration at zero where a light rises, peaks and settles.
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

function createLightSequence(stage) {
  const lights = [...stage.querySelectorAll(".c-light")].filter(light => getComputedStyle(light).display !== "none");
  const columns = Math.max(...lights.map(light => Number(light.dataset.lightColumn))) + 1;
  const contact = stage.classList.contains("c-light-stage--contact");
  const base = contact ? 0.22 : 0.28;
  const patterns = listLightPatterns(columns);
  const lightStates = new Map(lights.map(light => [light, { opacity: base, scale: 1 }]));
  const originalStyles = lights.map(light => ({ light, opacity: light.style.opacity, transform: light.style.transform }));
  let domFallback = true;
  let activeIndex = -1;
  let playing = false;

  function syncLightDom() {
    if (!domFallback) return;
    lightStates.forEach((state, light) => {
      const opacity = String(Math.round(state.opacity * 10000) / 10000);
      const transform = `scale(${Math.round(state.scale * 10000) / 10000})`;
      if (light.style.opacity !== opacity) light.style.opacity = opacity;
      if (light.style.transform !== transform) light.style.transform = transform;
    });
  }

  function setDomFallback(value) {
    const next = Boolean(value);
    if (domFallback === next) return;
    domFallback = next;
    if (domFallback) syncLightDom();
  }

  // Build a bounded set inside matchMedia's GSAP context. Only one timeline runs at a time.
  const sequences = patterns.map(pattern => {
    const sequence = gsap.timeline({ paused: true, defaults: { ease: buildLightFadeProgress }, onUpdate: syncLightDom, onComplete: playNextLightPattern }).timeScale(1 / (contact ? 0.7 : 0.64));
    lights.forEach(light => {
      const row = Number(light.dataset.lightRow);
      const column = Number(light.dataset.lightColumn);
      const peak = LIGHT_PEAK_INTENSITY * pattern.strength * (contact ? 0.9 : 1);
      const start = pattern.buildStartTime(row, column);

      const state = lightStates.get(light);
      sequence.fromTo(state, { opacity: base, scale: 1 }, { opacity: peak, scale: 1.2, duration: pattern.rise, immediateRender: false }, start).to(state, { opacity: base, scale: 1, duration: pattern.fade }, start + pattern.rise);
    });
    // The quiet gap belongs to the timeline, so pausing also stops the next pattern's countdown.
    sequence.to({}, { duration: 0.9 });
    return sequence;
  });

  syncLightDom();

  function playNextLightPattern() {
    if (!playing) return;
    if (activeIndex >= 0) sequences[activeIndex].pause();
    const candidates = patterns.map((_, index) => index).filter(index => index !== activeIndex);
    activeIndex = candidates[Math.floor(Math.random() * candidates.length)];
    stage.dataset.lightPattern = patterns[activeIndex].name;
    sequences[activeIndex].restart();
  }

  return {
    lightStates,
    setDomFallback,
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
    destroy: () => {
      playing = false;
      sequences.forEach(sequence => sequence.kill());
      originalStyles.forEach(({ light, opacity, transform }) => {
        if (opacity) light.style.opacity = opacity;
        else light.style.removeProperty("opacity");
        if (transform) light.style.transform = transform;
        else light.style.removeProperty("transform");
      });
    },
  };
}

function createHeadingLetters(heading) {
  const originalChildren = [...heading.childNodes];
  const originalLabel = heading.getAttribute("aria-label");
  const text = heading.textContent;
  const fragment = document.createDocumentFragment();
  const glyphs = [];
  text
    .split(/(\s+)/)
    .filter(Boolean)
    .forEach(part => {
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }
      const word = document.createElement("span");
      word.className = "c-heading-word";
      word.setAttribute("aria-hidden", "true");
      [...part].forEach(character => {
        const letter = document.createElement("span");
        letter.className = "c-heading-letter";
        const glyph = document.createElement("span");
        glyph.className = "c-heading-letter__glyph";
        glyph.textContent = character;
        letter.appendChild(glyph);
        word.appendChild(letter);
        glyphs.push(glyph);
      });
      fragment.appendChild(word);
    });
  heading.setAttribute("aria-label", originalLabel ?? text.trim());
  heading.replaceChildren(fragment);
  return {
    glyphs,
    restore: () => {
      heading.replaceChildren(...originalChildren);
      if (originalLabel === null) heading.removeAttribute("aria-label");
      else heading.setAttribute("aria-label", originalLabel);
    },
  };
}

function initHeadingReveals(revealedHeadings) {
  const cues = new Map();
  const restores = [];
  // Cue playback uses viewport observation; keep its heading readable with the same fallback.
  if (typeof IntersectionObserver !== "function") return { cues, restore: () => {} };
  document.querySelectorAll(".p-portfolio-section__title").forEach(heading => {
    if (revealedHeadings.has(heading)) return;
    const { glyphs, restore } = createHeadingLetters(heading);
    restores.push(restore);
    const reveal = { glyphs, onComplete: () => revealedHeadings.add(heading) };
    const cue = heading.nextElementSibling;
    if (cue?.classList.contains("js-light-cue")) {
      cues.set(cue, reveal);
      return;
    }
    gsap.from(glyphs, {
      opacity: 0,
      duration: 0.6,
      stagger: 0.045,
      ease: "power3.out",
      clearProps: "opacity",
      onComplete: reveal.onComplete,
      scrollTrigger: { trigger: heading, start: "top 94%", once: true },
    });
  });
  return { cues, restore: () => restores.forEach(restore => restore()) };
}

function createLightCueSequence(stage, headingReveal) {
  const lights = [...stage.querySelectorAll(".c-light")];
  const line = stage.querySelector(".c-light-cue__line");
  const sweep = stage.querySelector(".c-light-cue__sweep");
  const sweepDuration = 2;
  // The white core sits at 75% of the 25%-wide sweep; track its full-width travel.
  const coreStart = sweepDuration * 0.05;
  const coreDuration = sweepDuration * 0.8;
  const pointInset = 0.5 / Math.max(1, lights.length);
  // The connecting line spans only the first and last point centers.
  const lineStart = coreStart + coreDuration * pointInset;
  const lineDuration = coreDuration * (1 - 2 * pointInset);
  const lightRiseDuration = 0.12;
  const sequence = gsap.timeline({ paused: true, onComplete: () => (stage.dataset.lightPlayback = "complete") });
  stage.dataset.lightPattern = "sweep";
  gsap.set(lights, { opacity: 0, scale: 0.65 });
  if (line) {
    gsap.set(line, { scaleX: 0 });
    sequence.to(line, { scaleX: 1, duration: lineDuration, ease: "none" }, lineStart);
  }
  if (sweep) {
    gsap.set(sweep, { x: 0, xPercent: -100, opacity: 0 });
    sequence
      .to(sweep, { xPercent: 400, duration: sweepDuration, ease: "none" }, 0)
      .to(sweep, { opacity: 1, duration: 0.1, ease: "sine.out" }, 0)
      .to(sweep, { opacity: 0, duration: 0.2, ease: "sine.in" }, sweepDuration - 0.2);
  }
  if (headingReveal)
    sequence.from(
      headingReveal.glyphs,
      {
        opacity: 0,
        duration: 0.6,
        stagger: 0.045,
        ease: "power3.out",
        clearProps: "opacity",
        onComplete: headingReveal.onComplete,
      },
      0,
    );
  lights.forEach((light, index) => {
    const start = coreStart + (coreDuration * (index + 0.5)) / lights.length;
    sequence.to(light, { opacity: 1, scale: 1.25, duration: lightRiseDuration, ease: "sine.out" }, start);
    sequence.to(light, { opacity: 0.86, scale: 1, duration: 0.5, ease: "sine.inOut" }, start + lightRiseDuration);
  });
  return { isComplete: () => sequence.progress() === 1, pause: () => sequence.pause(), resume: () => sequence.resume() };
}

function buildLightEqualizerOpacity(row, height) {
  const level = 12 - row;
  const fill = Math.max(0, Math.min(1, height - level + 1));
  const peak = Math.max(0, 1 - Math.abs(height - level));
  return 0.16 + 0.52 * fill + 0.16 * peak;
}

function listLightEqualizerPatterns(initialHeights) {
  const spectrum = [
    { heights: [11, 6, 3, 10, 5, 12, 4, 8], beat: 0.34 },
    { heights: [4, 11, 8, 3, 12, 6, 10, 4], beat: 0.28 },
    { heights: [9, 4, 12, 7, 4, 10, 3, 11], beat: 0.32 },
    { heights: [3, 8, 5, 12, 9, 3, 11, 6], beat: 0.24 },
    { heights: [12, 5, 10, 4, 7, 11, 5, 9], beat: 0.38 },
    { heights: [6, 12, 4, 9, 3, 7, 12, 3], beat: 0.28 },
    { heights: [10, 3, 9, 5, 12, 4, 8, 11], beat: 0.34 },
    { heights: [4, 9, 3, 11, 6, 10, 4, 7], beat: 0.26 },
    { heights: [11, 6, 12, 4, 10, 5, 9, 3], beat: 0.36 },
    { heights: [3, 11, 5, 9, 4, 12, 6, 10], beat: 0.28 },
    { heights: [9, 4, 10, 12, 7, 3, 11, 5], beat: 0.32 },
    { heights: [5, 10, 3, 6, 12, 9, 4, 11], beat: 0.24 },
    { heights: [12, 3, 8, 11, 5, 10, 7, 4], beat: 0.38 },
    { heights: [4, 12, 5, 3, 11, 6, 10, 8], beat: 0.28 },
    { heights: [9, 5, 11, 8, 3, 12, 4, 10], beat: 0.34 },
    { heights: initialHeights, beat: 0.26 },
  ];
  const wave = Array.from({ length: 16 }, (_, step) => ({ heights: initialHeights.map((_, column) => Math.round(7.5 + 4.5 * Math.cos(((column - step) * Math.PI) / 4))), beat: 0.28 }));
  const ripple = Array.from({ length: 12 }, (_, step) => ({ heights: initialHeights.map((_, column) => Math.round(7.5 + 4.5 * Math.cos((step * Math.PI) / 3 - Math.abs(column - 3.5) * 0.9))), beat: step % 2 ? 0.32 : 0.24 }));
  const alternating = Array.from({ length: 12 }, (_, step) => ({ heights: initialHeights.map((_, column) => (column % 2 === step % 2 ? 11 + (step % 2) : 3 + (column % 3))), beat: step % 4 === 3 ? 0.36 : 0.26 }));
  const sweep = Array.from({ length: 16 }, (_, step) => ({ heights: initialHeights.map((_, column) => Math.round(3 + 9 * Math.max(0, 1 - Math.abs(column - (step < 8 ? step : 15 - step)) / 2.5))), beat: 0.24 }));
  const pulse = Array.from({ length: 12 }, (_, step) => ({ heights: step % 2 ? [3, 4, 5, 4, 4, 5, 4, 3] : [9, 10, 12, 11, 11, 12, 10, 9], beat: step % 2 ? 0.36 : 0.26 }));
  const closingStep = { heights: initialHeights, beat: 0.32 };
  return [
    { name: "spectrum", steps: spectrum },
    { name: "wave", steps: [...wave, closingStep] },
    { name: "ripple", steps: [...ripple, closingStep] },
    { name: "alternating", steps: [...alternating, closingStep] },
    { name: "sweep", steps: [...sweep, closingStep] },
    { name: "pulse", steps: [...pulse, closingStep] },
  ];
}

function createLightEqualizerSequence(stage) {
  const lights = [...stage.querySelectorAll(".c-light")];
  const initialHeights = [4, 7, 10, 6, 11, 8, 5, 3];
  // Register opacity with the media context before using direct setters, so revert restores CSS.
  gsap.set(lights, { opacity: (_, light) => buildLightEqualizerOpacity(Number(light.dataset.lightRow), initialHeights[Number(light.dataset.lightColumn)]), scale: 1 });
  const columns = initialHeights.map((_, column) => ({
    height: 0,
    lights: lights.filter(light => Number(light.dataset.lightColumn) === column).map(light => ({ row: Number(light.dataset.lightRow), setOpacity: gsap.quickSetter(light, "opacity"), opacity: -1 })),
  }));
  const patterns = listLightEqualizerPatterns(initialHeights);
  let activeIndex = -1;
  let introComplete = false;
  let playing = false;

  function updateLightEqualizer() {
    columns.forEach(column => {
      column.lights.forEach(light => {
        const opacity = buildLightEqualizerOpacity(light.row, column.height);
        if (Math.abs(opacity - light.opacity) < 0.0001) return;
        light.setOpacity(opacity);
        light.opacity = opacity;
      });
    });
  }

  updateLightEqualizer();
  const intro = gsap.timeline({
    paused: true,
    onUpdate: updateLightEqualizer,
    onComplete: () => {
      introComplete = true;
      playNextLightEqualizerPattern();
    },
  });
  intro.to(columns, { height: index => initialHeights[index], duration: 0.65, stagger: 0.02, ease: "sine.out" });

  // Prebuild every finite pattern in the media context. Shared endpoints keep switches continuous.
  const sequences = patterns.map(pattern => {
    const sequence = gsap.timeline({ paused: true, onUpdate: updateLightEqualizer, onComplete: playNextLightEqualizerPattern });
    let start = 0;
    let previousHeights = initialHeights;
    pattern.steps.forEach(step => {
      columns.forEach((column, index) => {
        const rising = step.heights[index] > previousHeights[index];
        sequence.fromTo(column, { height: previousHeights[index] }, { height: step.heights[index], duration: rising ? Math.min(0.24, step.beat * 0.8) : step.beat, ease: rising ? "sine.out" : "sine.inOut", immediateRender: false }, start);
      });
      start += step.beat;
      previousHeights = step.heights;
    });
    sequence.to({}, { duration: start }, 0);
    return sequence;
  });

  function playNextLightEqualizerPattern() {
    if (!playing) return;
    intro.pause();
    if (activeIndex >= 0) sequences[activeIndex].pause();
    const candidates = patterns.map((_, index) => index).filter(index => index !== activeIndex);
    activeIndex = candidates[Math.floor(Math.random() * candidates.length)];
    stage.dataset.lightPattern = `equalizer-${patterns[activeIndex].name}`;
    sequences[activeIndex].restart();
  }

  stage.dataset.lightPattern = "equalizer-intro";
  return {
    isComplete: () => false,
    pause: () => {
      playing = false;
      intro.pause();
      if (activeIndex >= 0) sequences[activeIndex].pause();
    },
    resume: () => {
      if (playing) return;
      playing = true;
      if (!introComplete) intro.resume();
      else if (activeIndex < 0) playNextLightEqualizerPattern();
      else sequences[activeIndex].resume();
    },
  };
}

function initLightPlayback(selector = ".js-light-stage, .js-light-cue", headingReveals = new Map(), { heroAnimations = [], heroStage = null } = {}) {
  // Keep the CSS light wall static when viewport observation is unavailable.
  if (typeof IntersectionObserver !== "function") return () => {};
  const stages = [...document.querySelectorAll(selector)];
  if (!stages.length) return () => {};
  const stageVisible = new Map(stages.map(stage => [stage, false]));
  const renderSkipped = new Map();
  const sequences = stages.map(stage => ({ stage, loop: null, renderer: null, rendererPending: false, rendererFailed: false, context: null }));
  let destroyed = false;
  let heroRendererReady = heroAnimations.length === 0;
  let heroReadyFrame = 0;

  function queueHeroRendererStart() {
    if (destroyed || heroRendererReady || heroReadyFrame) return;
    // Let the completed heading frame paint before a cached renderer import can allocate shaders.
    heroReadyFrame = window.requestAnimationFrame(() => {
      heroReadyFrame = 0;
      if (destroyed) return;
      heroRendererReady = true;
      syncLightPlayback();
    });
  }

  function ensureLightSequence(record) {
    if (record.loop) return;
    // A stage first seen later still owns a context that can be reverted on a breakpoint change.
    record.context = gsap.context(() => {
      const { stage } = record;
      record.loop = stage.classList.contains("js-light-equalizer") ? createLightEqualizerSequence(stage) : stage.classList.contains("js-light-cue") ? createLightCueSequence(stage, headingReveals.get(stage)) : createLightSequence(stage);
    });
  }

  function ensureLightRenderer(record) {
    if (!record.stage.classList.contains("js-light-stage") || record.renderer || record.rendererPending || record.rendererFailed) return;
    // Keep shader allocation outside the heading reveal while the existing DOM lights keep playing.
    if (record.stage === heroStage && !heroRendererReady) return;
    record.rendererPending = true;
    import("./_portfolio-webgl.js")
      .then(({ createWebglLightStage }) => {
        record.rendererPending = false;
        if (destroyed || document.hidden || !stageVisible.get(record.stage) || renderSkipped.get(record.stage)) return;
        record.renderer = createWebglLightStage(record.stage, record.loop.lightStates, record.loop.setDomFallback);
        record.rendererFailed = !record.renderer;
        record.renderer?.setAvailable(true);
      })
      .catch(() => {
        record.rendererPending = false;
        record.rendererFailed = true;
      });
  }

  sequences.forEach(record => {
    if (!record.stage.classList.contains("c-light-stage--contact")) ensureLightSequence(record);
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => stageVisible.set(entry.target, entry.isIntersecting));
    syncLightPlayback();
  });
  if (heroAnimations.length) Promise.allSettled(heroAnimations.map(animation => animation.finished)).then(queueHeroRendererStart);

  function syncLightPlayback() {
    if (destroyed) return;
    sequences.forEach(record => {
      const { stage } = record;
      const shouldPlay = !document.hidden && stageVisible.get(stage) && !renderSkipped.get(stage);
      if (shouldPlay) {
        ensureLightSequence(record);
        ensureLightRenderer(record);
      }
      const { loop, renderer } = record;
      if (!loop) return;
      if (loop.isComplete()) {
        stage.dataset.lightPlayback = "complete";
        return;
      }
      if (shouldPlay) loop.resume();
      else loop.pause();
      renderer?.setAvailable(shouldPlay);
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
    destroyed = true;
    if (heroReadyFrame) window.cancelAnimationFrame(heroReadyFrame);
    observer.disconnect();
    document.removeEventListener("visibilitychange", syncLightPlayback);
    sequences.forEach(({ loop, renderer, context }) => {
      loop?.pause();
      renderer?.destroy();
      loop?.destroy?.();
      context?.revert();
    });
    stages.forEach(stage => {
      stage.removeEventListener("contentvisibilityautostatechange", handleLightRenderState);
      stage.removeAttribute("data-light-playback");
      stage.removeAttribute("data-light-pattern");
    });
  };
}

function listHeroRevealAnimations(hero) {
  if (!hero) return [];
  return [...hero.querySelectorAll(".js-hero-line")].flatMap(line => {
    if (typeof line.getAnimations !== "function") return [];
    return line.getAnimations().filter(animation => animation.animationName === "portfolio-hero-reveal" && animation.playState !== "finished" && animation.playState !== "idle");
  });
}

function createPortfolioDetailHeadingCues() {
  const source = document.querySelector(".p-portfolio-detail .p-portfolio-detail__title + .js-light-cue");
  if (!source) return;
  document.querySelectorAll(".p-portfolio-detail__body h2").forEach(heading => {
    if (heading.nextElementSibling?.classList.contains("js-light-cue")) return;
    heading.after(source.cloneNode(true));
  });
}

function initPortfolioMotion() {
  if (!document.body.classList.contains("portfolio-site")) return;
  if (document.documentElement.dataset.portfolioEntrancePending === "true") {
    document.addEventListener("portfolio:entrance-ready", initPortfolioMotion, { once: true });
    return;
  }
  // Clone the pristine shared markup before GSAP adds any playback state.
  createPortfolioDetailHeadingCues();
  const media = gsap.matchMedia();
  const revealedHeadings = new WeakSet();
  const revealedContent = new WeakSet();
  const isHome = document.body.classList.contains("home");

  // Progressive enhancement: all content stays visible without JS or with reduced motion.
  media.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 767px)", motion: "(prefers-reduced-motion: no-preference) and (forced-colors: none)" }, context => {
    if (!context.conditions.motion) return;
    const headingReveals = isHome ? { cues: new Map(), restore: () => {} } : initHeadingReveals(revealedHeadings);
    const stopContentReveals = isHome ? initPortfolioScrollReveals(revealedContent, createHeadingLetters) : () => {};
    const stopProjectEntrances = initPortfolioProjectEntrances(revealedContent);
    const stopTimelineMotion = isHome ? initPortfolioTimelineMotion() : () => {};
    const stopSectionAccents = initPortfolioSectionAccents(revealedHeadings, revealedContent);
    let refreshFrame = 0;
    let active = true;
    function queuePortfolioMotionRefresh() {
      if (!active || refreshFrame) return;
      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = 0;
        if (active) ScrollTrigger.refresh();
      });
    }
    // The asynchronously loaded sphere expands the intro's scroll journey after DOM ready.
    const layoutTarget = document.querySelector(".js-portfolio-intro") ?? document.querySelector(".l-main");
    const layoutObserver = typeof ResizeObserver === "function" ? new ResizeObserver(queuePortfolioMotionRefresh) : null;
    if (layoutTarget) layoutObserver?.observe(layoutTarget);
    const desktop = context.conditions.desktop;
    const hero = document.querySelector(".p-portfolio-hero");
    if (hero && !hero.closest(".js-portfolio-intro")) {
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
      // Shared-image navigation already reveals this frame, including bfcache restores.
      if (frame.dataset.portfolioTransitionRevealed === "true") return;
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
      if (isHome || element.classList.contains("p-portfolio-section__title")) return;
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
    if (skills && !isHome)
      gsap.from(skills.children, {
        y: 22,
        opacity: 0,
        duration: 0.7,
        stagger: 0.065,
        ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: skills, start: "top 92%", once: true },
      });

    const stopLightPlayback = initLightPlayback(undefined, headingReveals.cues, { heroAnimations: listHeroRevealAnimations(hero), heroStage: hero?.querySelector(".js-light-stage") });
    return () => {
      active = false;
      layoutObserver?.disconnect();
      if (refreshFrame) window.cancelAnimationFrame(refreshFrame);
      stopLightPlayback();
      stopSectionAccents();
      stopTimelineMotion();
      stopProjectEntrances();
      stopContentReveals();
      headingReveals.restore();
    };
  });

  // The About decoration has its own breakpoint, so resizing it does not replay the other sections.
  media.add({ wide: "(min-width: 1280px)", motion: "(prefers-reduced-motion: no-preference)" }, context => {
    if (!context.conditions.wide || !context.conditions.motion) return;
    return initLightPlayback(".js-light-equalizer");
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPortfolioMotion, { once: true });
else initPortfolioMotion();
