import { clamp } from '../js/palette.js';

/**
 * Phase 3 · Prototype: the client's own prototype, in the Lines 3 language.
 *  - [data-lights] (pinned): the usual way, in the dark. As you scroll the room lights up (--on), the headline turns
 *    over to the Alecto way, and the cards turn over one by one (--c) and square up to the grid.
 *  - [data-stories]: the row of stories scrolls a card at a time with the arrows beside it.
 *  - [data-mark-in]: tiles that slide into place when they come into view.
 * Reduced motion: the lights on, everything in its place.
 */
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initPrototype({ reduce }) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { threshold: 0.25 });
  document.querySelectorAll('[data-mark-in]').forEach((el) => (reduce ? el.classList.add('in') : io.observe(el)));

  stories();

  const lights = document.querySelector('[data-lights]');
  if (!lights) return;
  const cards = [...lights.querySelectorAll('.pr-card')];
  const set = (k) => {
    lights.style.setProperty('--on', k.toFixed(3));
    lights.classList.toggle('lit', k > 0.5);
    lights.querySelector('.pr-was').setAttribute('aria-hidden', String(k > 0.5));
    lights.querySelector('.pr-now').setAttribute('aria-hidden', String(k <= 0.5));
    cards.forEach((c, i) => c.style.setProperty('--c', ease(clamp((k - 0.15 - i * 0.12) / 0.4, 0, 1)).toFixed(3)));
  };
  if (reduce) { lights.classList.add('still'); set(1); return; }
  const frame = () => {
    const r = lights.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    set(clamp((p - 0.12) / 0.7, 0, 1)); // from a little after it pins, done well before it lets go
  };
  addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });
  addEventListener('resize', frame);
  frame();
}

function stories() {
  const row = document.querySelector('[data-stories]');
  if (!row) return;
  row.parentElement.querySelectorAll('.pr-arrows [data-dir]').forEach((b) => b.addEventListener('click', () => {
    const card = row.querySelector('.pr-story');
    const step = card ? card.getBoundingClientRect().width + 12 : row.clientWidth;
    row.scrollBy({ left: Number(b.dataset.dir) * step, behavior: 'smooth' });
  }));
}
