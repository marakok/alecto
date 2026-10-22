import { writeAt } from '../js/write.js';
import { afterIntro } from '../phase-2/concept-2/reveal.js';

/**
 * Section headings are written as they come into view, like the hero headline: a small square runs along each
 * line as a cursor and the words appear behind it (write.js). At the end the square fades away (the headings
 * have no full stop of their own any more). Runs on the headings motion.js has split into words, in place of
 * their rise. With reduced motion (no split) the headings are simply there.
 */
const SIZE = 9;

export function initHeadings({ reduce }) {
  if (reduce) return;
  const heads = [...document.querySelectorAll('.p3 main h2[data-split]')].filter((h) => h.querySelector('.w > span'));
  heads.forEach((h) => {
    h.classList.add('writing');
    const caret = document.createElement('i');
    caret.className = 'w-caret';
    caret.setAttribute('aria-hidden', 'true');
    h.append(caret);
  });

  const write = (h) => {
    const words = [...h.querySelectorAll('.w > span')];
    const caret = h.querySelector('.w-caret');
    const dur = Math.min(2000, 500 + words.length * 190);
    const t0 = performance.now();
    caret.classList.add('on');
    const frame = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const at = writeAt(words, 0.5 - Math.cos(Math.PI * k) / 2, { size: SIZE, below: 7 });
      const r = h.getBoundingClientRect();
      caret.style.transform = `translate(${at.x - r.left}px, ${at.y - r.top}px)`;
      if (k < 1) { requestAnimationFrame(frame); return; }
      h.classList.add('written');
      caret.classList.add('gone');
    };
    requestAnimationFrame(frame);
  };

  afterIntro(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      setTimeout(() => write(e.target), 150);
    }), { rootMargin: '0px 0px -18% 0px', threshold: 0.6 });
    heads.forEach((h) => io.observe(h));
  });
}
