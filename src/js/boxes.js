import { clamp } from './palette.js';

/**
 * The moving boxes: every [data-boxes] gets --s from -1 (just below the screen) to 1 (just above),
 * so the two boxes shift and tilt a little as the page scrolls past them.
 */
export function initBoxes({ reduce }) {
  const boxes = [...document.querySelectorAll('[data-boxes]')];
  if (reduce || !boxes.length) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    boxes.forEach((b) => {
      const r = b.getBoundingClientRect();
      if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return;
      const s = clamp(((vh / 2) - (r.top + r.height / 2)) / vh, -1, 1);
      b.style.setProperty('--s', s.toFixed(3));
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}
