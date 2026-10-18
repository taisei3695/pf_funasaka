const waveformBarCount = 25;
const waveformActiveWindow = 110;
const waveformTailHold = 160;
const waveformTailDuration = 840;

function createPortfolioScrollWaveform() {
  const waveform = document.createElement("div");
  waveform.className = "p-portfolio-scroll-waveform";
  waveform.setAttribute("aria-hidden", "true");
  waveform.dataset.portfolioWaveformState = "idle";
  waveform.dataset.portfolioWaveformLevel = "0.000";

  const bars = Array.from({ length: waveformBarCount }, () => {
    const bar = document.createElement("span");
    bar.className = "p-portfolio-scroll-waveform__bar";
    waveform.append(bar);
    return bar;
  });

  document.body.append(waveform);
  return { waveform, bars };
}

export function initPortfolioScrollWaveform() {
  if (!document.body.classList.contains("portfolio-site") || !window.matchMedia("(prefers-reduced-motion: no-preference) and (forced-colors: none)").matches) return () => {};

  const { waveform, bars } = createPortfolioScrollWaveform();
  let frame = 0;
  let destroyed = false;
  let previousScroll = window.scrollY;
  let previousSampleTime = performance.now();
  let previousFrameTime = 0;
  let lastScrollTime = 0;
  let energy = 0;
  let level = 0;
  let tailLevel = 0;
  let phase = 0;

  function updateWaveformBars() {
    waveform.dataset.portfolioWaveformLevel = level.toFixed(3);
    bars.forEach((bar, index) => {
      const distance = Math.abs((index / (waveformBarCount - 1)) * 2 - 1);
      const envelope = 0.2 + 0.8 * Math.pow(1 - distance, 0.65);
      const pulse = 0.35 + 0.65 * Math.abs(Math.sin(index * 0.62 - phase));
      const amplitude = Math.pow(level, 0.8) * envelope * pulse;
      bar.style.transform = `scaleX(${(0.14 + amplitude * 0.86).toFixed(3)})`;
      bar.style.opacity = (0.32 + level * 0.14 + amplitude * 0.54).toFixed(3);
    });
  }

  function resetWaveformMotion() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    energy = 0;
    level = 0;
    tailLevel = 0;
    phase = 0;
    previousFrameTime = 0;
    previousScroll = window.scrollY;
    previousSampleTime = performance.now();
    lastScrollTime = 0;
    waveform.dataset.portfolioWaveformState = "idle";
    updateWaveformBars();
  }

  function updateWaveformMotion(time) {
    frame = 0;
    if (destroyed || document.hidden) return;

    const isFirstFrame = previousFrameTime === 0;
    const elapsed = Math.min(64, Math.max(0, time - (previousFrameTime || time - 16)));
    const scrollAge = time - lastScrollTime;
    previousFrameTime = time;
    if (scrollAge < waveformActiveWindow || isFirstFrame) {
      energy *= Math.exp(-elapsed / 170);
      const responseTime = energy > level ? 50 : 320;
      level += (energy - level) * (1 - Math.exp(-elapsed / responseTime));
      tailLevel = level;
    } else {
      const tailProgress = Math.min(1, Math.max(0, (scrollAge - waveformTailHold) / waveformTailDuration));
      const tailEnvelope = 1 - tailProgress * tailProgress * (3 - 2 * tailProgress);
      level = tailLevel * tailEnvelope;
      energy = level;
    }
    phase += (elapsed / 1000) * (2.6 + level * 2);

    if (energy < 0.002 && level < 0.004) {
      resetWaveformMotion();
      return;
    }

    waveform.dataset.portfolioWaveformState = scrollAge < waveformActiveWindow ? "active" : "settling";
    updateWaveformBars();
    frame = requestAnimationFrame(updateWaveformMotion);
  }

  function handleWaveformScroll() {
    if (destroyed || document.hidden) return;
    const time = performance.now();
    const scroll = window.scrollY;
    const distance = Math.abs(scroll - previousScroll);
    const sampleDuration = Math.min(80, Math.max(16, time - previousSampleTime));
    previousScroll = scroll;
    previousSampleTime = time;
    if (distance < 0.25) return;

    energy = Math.max(energy, Math.min(1, (distance / sampleDuration) * (1000 / 1200)));
    lastScrollTime = time;
    waveform.dataset.portfolioWaveformState = "active";
    if (!frame) {
      previousFrameTime = 0;
      frame = requestAnimationFrame(updateWaveformMotion);
    }
  }

  function handleWaveformVisibility() {
    resetWaveformMotion();
  }

  window.addEventListener("scroll", handleWaveformScroll, { passive: true });
  window.addEventListener("resize", resetWaveformMotion, { passive: true });
  window.addEventListener("pageshow", resetWaveformMotion);
  document.addEventListener("visibilitychange", handleWaveformVisibility);
  updateWaveformBars();

  return () => {
    destroyed = true;
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("scroll", handleWaveformScroll);
    window.removeEventListener("resize", resetWaveformMotion);
    window.removeEventListener("pageshow", resetWaveformMotion);
    document.removeEventListener("visibilitychange", handleWaveformVisibility);
    waveform.remove();
  };
}
