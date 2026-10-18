const PORTFOLIO_EQUALIZER_LINKS = [
  ".p-portfolio-header__nav a[href]",
  ".p-portfolio-project__link[href]",
  ".p-portfolio-works__more a[href]",
  ".p-portfolio-text-link[href]",
  ".p-portfolio-detail__navigation > a[href]",
  ".p-portfolio-contact__link[href]",
];
const PORTFOLIO_EQUALIZER_HOST = "p-portfolio-link-equalizer-host";

function createPortfolioLinkEqualizer() {
  const equalizer = document.createElement("span");
  equalizer.className = "p-portfolio-link-equalizer";
  equalizer.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 4; index += 1) {
    const bar = document.createElement("span");
    bar.className = "p-portfolio-link-equalizer__bar";
    equalizer.appendChild(bar);
  }
  return equalizer;
}

export function initPortfolioLinkEqualizers() {
  const records = [];
  const selector = PORTFOLIO_EQUALIZER_LINKS.map(link => `.portfolio-site ${link}`).join(", ");
  document.querySelectorAll(selector).forEach(link => {
    // Avoid image links and leave decorations owned by another initializer alone.
    if (link.querySelector("img, picture, :scope > .p-portfolio-link-equalizer")) return;
    const equalizer = createPortfolioLinkEqualizer();
    const addedHost = !link.classList.contains(PORTFOLIO_EQUALIZER_HOST);
    if (addedHost) link.classList.add(PORTFOLIO_EQUALIZER_HOST);
    link.appendChild(equalizer);
    records.push({ link, equalizer, addedHost });
  });

  return () => {
    records.forEach(({ link, equalizer, addedHost }) => {
      equalizer.remove();
      if (addedHost) link.classList.remove(PORTFOLIO_EQUALIZER_HOST);
    });
    records.length = 0;
  };
}
