import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function buildTimelineAttributeSnapshot(element, name) {
  const value = element.getAttribute(name);
  return () => {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  };
}

function initAboutTimelineProgress(timeline) {
  const items = [...timeline.children].filter(item => item.tagName === "LI");
  if (!items.length) return () => {};
  const restores = [buildTimelineAttributeSnapshot(timeline, "data-timeline-motion"), buildTimelineAttributeSnapshot(timeline, "data-timeline-progress"), ...items.map(item => buildTimelineAttributeSnapshot(item, "data-timeline-state"))];
  const property = "--portfolio-timeline-progress";
  const originalProgress = timeline.style.getPropertyValue(property);
  const originalPriority = timeline.style.getPropertyPriority(property);
  const startProperty = "--portfolio-timeline-start";
  const originalStart = timeline.style.getPropertyValue(startProperty);
  const originalStartPriority = timeline.style.getPropertyPriority(startProperty);
  const nativeTimeline = window.CSS?.supports("animation-timeline", "view()") && window.CSS.supports("animation-range", "cover 1px cover 100%");
  let startOffset = 0;
  let stops = [];
  let progressLabel = "";

  function updateTimelineStops() {
    const centers = items.map(item => {
      const marker = getComputedStyle(item, "::before");
      return item.offsetTop + parseFloat(marker.top) + parseFloat(marker.height) / 2;
    });
    startOffset = centers[0];
    timeline.style.setProperty(startProperty, `${startOffset}px`);
    const height = Math.max(1, timeline.offsetHeight - startOffset);
    stops = centers.map(center => (center - startOffset) / height);
  }

  function updateTimelineStates(trigger) {
    const progress = trigger.progress;
    const beforeTimeline = trigger.scroll() < trigger.start;
    const afterTimeline = trigger.scroll() >= trigger.end;
    let active = -1;
    if (!beforeTimeline)
      stops.forEach((stop, index) => {
        if (progress >= stop) active = index;
      });
    items.forEach((item, index) => {
      const state = afterTimeline || index < active ? "passed" : index === active ? "active" : "waiting";
      if (item.dataset.timelineState !== state) item.dataset.timelineState = state;
    });
    const label = progress.toFixed(3);
    if (progressLabel !== label) {
      timeline.dataset.timelineProgress = label;
      progressLabel = label;
    }
  }

  timeline.dataset.timelineMotion = nativeTimeline ? "native" : "fallback";
  updateTimelineStops();
  const options = {
    trigger: timeline,
    start: () => {
      updateTimelineStops();
      return `top+=${startOffset} 58%`;
    },
    end: "bottom 58%",
    onRefresh: updateTimelineStates,
    onUpdate: updateTimelineStates,
  };
  // Native view timelines own the decorative line; GSAP only supplies a fallback and item states.
  const tween = nativeTimeline ? null : gsap.fromTo(timeline, { [property]: 0 }, { [property]: 1, ease: "none", scrollTrigger: { ...options, scrub: true } });
  const trigger = tween?.scrollTrigger ?? ScrollTrigger.create(options);
  updateTimelineStates(trigger);

  return () => {
    trigger.kill();
    tween?.kill();
    restores.forEach(restore => restore());
    if (originalProgress) timeline.style.setProperty(property, originalProgress, originalPriority);
    else timeline.style.removeProperty(property);
    if (originalStart) timeline.style.setProperty(startProperty, originalStart, originalStartPriority);
    else timeline.style.removeProperty(startProperty);
  };
}

export function initPortfolioTimelineMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)").matches) return () => {};
  const cleanups = [...document.querySelectorAll(".p-portfolio-about__timeline")].map(initAboutTimelineProgress);
  return () => cleanups.forEach(cleanup => cleanup());
}
