import { clamp } from '../js/palette.js';

/**
 * The two-tone statements fill in as you read them: every word starts pale and takes its own tone (the lead
 * sentence dark, the rest lighter) as the paragraph scrolls up the screen, word by word. With reduced motion
 * the statement is simply two-tone.
 */
export function initWords({ reduce }) {
  if (reduce) return;
  const items = [...document.querySelectorAll('.two-tone')].map((p) => {
    p.setAttribute('aria-label', p.textContent.replace(/\s+/g, ' ').trim());
    const words = [];
    const wrap = (node, lead) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 1) { wrap(child, lead || child.tagName === 'STRONG'); return; }
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span');
          w.className = lead ? 'wd lead' : 'wd';
          w.setAttribute('aria-hidden', 'true');
          w.textContent = part;
          words.push(w);
          frag.append(w);
        });
        child.replaceWith(frag);
      });
    };
    wrap(p, false);
    p.classList.add('filling');
    return { p, words, done: -1 };
  });
  if (!items.length) return;

  const update = () => {
    const vh = innerHeight;
    items.forEach((it) => {
      const r = it.p.getBoundingClientRect();
      // from its top at 88% of the screen to its bottom at 55%
      const k = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.33), 0, 1);
      const n = Math.round(k * it.words.length);
      if (n === it.done) return;
      it.words.forEach((w, i) => w.classList.toggle('on', i < n));
      it.done = n;
    });
  };
  addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  addEventListener('resize', update);
  update();
}
