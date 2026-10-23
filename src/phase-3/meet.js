import { clamp } from '../js/palette.js';

/**
 * Phase 3 · the AI, where our people meet ([data-meet-pin], pinned): Mark's moment, in line squares. Four outlined
 * squares come in from the corners as you scroll and meet; the space between their rounded corners is the AI star,
 * and it lights up. Then the statement beside them fills in, word by word. The squares follow the scroll smoothly
 * (eased towards it every frame), so a flick of the wheel glides instead of jumps. Reduced motion: met and lit.
 */
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initMeet({ reduce }) {
  document.querySelectorAll('[data-meet-pin]').forEach((sec) => {
    if (reduce) {
      sec.classList.add('still', 'met');
      sec.style.setProperty('--m', '1');
      return;
    }
    let target = 0;
    let cur = 0;
    let raf = 0;
    const apply = (p) => {
      const k = ease(clamp((p - 0.04) / 0.5, 0, 1));
      sec.style.setProperty('--m', k.toFixed(4));
      sec.classList.toggle('met', k > 0.985);
      // the statement fills in once they've met (words.js leaves it to us: [data-words-driven])
      const words = sec.querySelectorAll('.am-copy .wd');
      const n = Math.round(clamp((p - 0.5) / 0.32, 0, 1) * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    const step = () => {
      cur += (target - cur) * 0.1;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      apply(cur);
      raf = cur === target ? 0 : requestAnimationFrame(step);
    };
    const measure = () => {
      const r = sec.getBoundingClientRect();
      target = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
      if (!raf) raf = requestAnimationFrame(step);
    };
    addEventListener('scroll', measure, { passive: true });
    addEventListener('resize', measure);
    measure();
  });
}
