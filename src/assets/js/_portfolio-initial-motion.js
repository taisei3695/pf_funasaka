// First-view accents should not wait for the below-fold GSAP bundle.
export function initPortfolioInitialMotion() {
  if (document.body.classList.contains("home") || !document.body.classList.contains("portfolio-site")) return;
  if (!window.matchMedia("(prefers-reduced-motion: no-preference) and (forced-colors: none)").matches || typeof Element.prototype.animate !== "function") return;
  const animations = [];
  const layers = [];

  function playPortfolioInitialMotion() {
    document.querySelectorAll(".p-portfolio-section__title, .p-portfolio-detail__title").forEach(heading => {
      const bounds = heading.getBoundingClientRect();
      if (bounds.top >= window.innerHeight || bounds.bottom <= 0 || heading.dataset.portfolioInitialMotion) return;
      heading.dataset.portfolioInitialMotion = "true";
      const text = heading.textContent;
      for (const color of ["blue", "rose"]) {
        const layer = document.createElement("span");
        layer.className = `p-portfolio-heading-motion__layer p-portfolio-heading-motion__layer--${color}`;
        layer.setAttribute("aria-hidden", "true");
        layer.textContent = text;
        heading.appendChild(layer);
        layers.push(layer);
      }
      heading.dataset.portfolioHeadingMotion = "playing";
      const cue = heading.nextElementSibling;
      if (!cue?.classList.contains("js-light-cue")) return;
      const line = cue.querySelector(".c-light-cue__line");
      const sweep = cue.querySelector(".c-light-cue__sweep");
      const lights = [...cue.querySelectorAll(".c-light")];
      const pointInset = 0.5 / Math.max(1, lights.length);
      if (line) animations.push(line.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1600 * (1 - 2 * pointInset), delay: 100 + 1600 * pointInset, fill: "both", easing: "linear" }));
      if (sweep)
        animations.push(
          sweep.animate(
            [
              { transform: "translateX(-100%)", opacity: 0 },
              { opacity: 1, offset: 0.05 },
              { opacity: 1, offset: 0.9 },
              { transform: "translateX(400%)", opacity: 0 },
            ],
            { duration: 2000, fill: "both", easing: "linear" },
          ),
        );
      lights.forEach((light, index) => {
        animations.push(
          light.animate(
            [
              { opacity: 0, transform: "scale(0.65)" },
              { opacity: 1, transform: "scale(1.28)", offset: 0.2 },
              { opacity: 0.86, transform: "scale(1)" },
            ],
            { duration: 620, delay: 100 + (1600 * (index + 0.5)) / lights.length, fill: "both", easing: "ease-in-out" },
          ),
        );
      });
    });
  }

  if (document.documentElement.dataset.portfolioEntrancePending === "true") document.addEventListener("portfolio:entrance-ready", playPortfolioInitialMotion, { once: true });
  else playPortfolioInitialMotion();
  window.addEventListener(
    "pagehide",
    () => {
      document.removeEventListener("portfolio:entrance-ready", playPortfolioInitialMotion);
      animations.forEach(animation => animation.cancel());
      layers.forEach(layer => layer.remove());
    },
    { once: true },
  );
}
