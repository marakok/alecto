/**
 * Hero intro: split the headline into words (each rises from its own mask; see journey.css), then start
 * every hero animation at once by adding html.hero-go. Waits for the web fonts, at most 600ms, so the
 * words are measured in Inter and not in the fallback font.
 */
export function initHeroIntro({ reduce }) {
  const root = document.documentElement;
  if (reduce || !root.classList.contains('jl')) return;
  const h1 = document.querySelector('.c2-hero h1');
  if (!h1) return;

  const label = h1.textContent.trim();
  let i = 0;
  const split = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!child.classList.contains('period')) split(child);
        return;
      }
      if (child.nodeType !== Node.TEXT_NODE) return;
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const outer = document.createElement('span');
        outer.className = 'w';
        outer.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.textContent = part;
        inner.style.setProperty('--i', i++);
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      child.replaceWith(frag);
    });
  };

  const go = () => {
    split(h1);
    h1.style.setProperty('--n', i);
    h1.setAttribute('aria-label', label);
    h1.dataset.split = 'word';
    requestAnimationFrame(() => root.classList.add('hero-go'));
  };
  const fonts = document.fonts?.ready ?? Promise.resolve();
  Promise.race([fonts, new Promise((r) => setTimeout(r, 600))]).then(go);
}
