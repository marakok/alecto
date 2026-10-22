import { clamp } from '../js/palette.js';

/**
 * Light through a window: the concept behind phase 3's pictures. Calm, home, movement, in one image: a square
 * of sunlight falls on a wall at home (the brand square), and the shadows of leaves outside move through it.
 * Through the page the day passes, the way a move does: morning in the hero (offer accepted), midday behind
 * the figures, evening with the lamp on at the end (keys in hand).
 *
 * <div class="light" data-light="morning|noon|evening">: the wall, the patch of sun with a window's bars, a
 * sheer curtain drifting across it, and leaf shadows (near: inside the sun, so they cut the light; far: faint,
 * on the whole wall). Drawn here so it costs nothing to load and works in dark mode. As the hero scrolls away
 * the sun slides across the wall (--p). Reduced motion: still.
 * A real clip (for example a Pexels "window light shadows" video) can go behind it later; the copy and the
 * square don't change.
 */
let seed = 7;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const r1 = (n) => Math.round(n * 10) / 10;

// one leaf, long and slim like olive or willow, pointing up from its stalk
const leaf = (len, w) => `M0 0 C ${r1(w * 0.55)} ${r1(-len * 0.25)} ${r1(w * 0.5)} ${r1(-len * 0.75)} 0 ${r1(-len)} C ${r1(-w * 0.5)} ${r1(-len * 0.75)} ${r1(-w * 0.55)} ${r1(-len * 0.25)} 0 0 Z`;

// a branch: a gentle curve with leaves on both sides, each with its own small flutter
function branch(x, y, angle, length, leaves, k = 1) {
  const bend = (rnd() - 0.5) * 0.5;
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const a = angle + bend * t;
    const prev = pts[i - 1] ?? [x, y];
    pts.push(i ? [prev[0] + Math.cos(a) * (length / 12), prev[1] + Math.sin(a) * (length / 12)] : [x, y]);
  }
  const stem = `M${pts.map(([px, py]) => `${r1(px)} ${r1(py)}`).join(' L')}`;
  let out = `<path class="stem" d="${stem}" stroke-width="${r1(3 * k)}"/>`;
  for (let i = 0; i < leaves; i++) {
    const t = 0.12 + (i / leaves) * 0.88;
    const [px, py] = pts[Math.min(12, Math.round(t * 12))];
    const side = i % 2 ? 1 : -1;
    const a = (angle * 180) / Math.PI + 90 + side * (35 + rnd() * 30);
    const len = (34 + rnd() * 34) * k * (1 - t * 0.35);
    out += `<path class="lf" style="--fd:${r1(rnd() * -6)}s;--fr:${r1(2 + rnd() * 4)}deg" transform="translate(${r1(px)} ${r1(py)}) rotate(${r1(a)})" d="${leaf(len, len * (0.2 + rnd() * 0.1))}"/>`;
  }
  return `<g class="br" style="--bd:${r1(rnd() * -9)}s;transform-origin:${r1(x)}px ${r1(y)}px">${out}</g>`;
}

const leaves = (cls, list) => `<svg class="leaves ${cls}" viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${list.join('')}</svg>`;

export function initLight({ reduce }) {
  document.querySelectorAll('[data-light]').forEach((el, n) => {
    seed = 7 + n * 31;
    const near = leaves('near', [
      branch(640, 40, Math.PI * 0.84, 420, 22),
      branch(620, 300, Math.PI * 0.95, 330, 16, 0.9),
      branch(560, -30, Math.PI * 0.62, 300, 14, 0.8),
    ]);
    const far = leaves('far', [branch(-40, 120, Math.PI * 0.08, 360, 16, 1.3), branch(-20, 520, -Math.PI * 0.1, 300, 12, 1.2)]);
    el.innerHTML = `<span class="wall"></span>${far}<span class="sun"><span class="sheer"></span>${near}<i class="bar v"></i><i class="bar h"></i></span><span class="glow"></span>`;
    if (reduce) el.classList.add('still');
  });

  // the hero: as it scrolls away, the sun slides across the wall
  const hero = document.querySelector('.hero-light');
  if (!hero || reduce) return;
  const section = hero.closest('section');
  let last = -1;
  const update = () => {
    const p = clamp(scrollY / Math.max(1, section.offsetHeight), 0, 1);
    if (Math.abs(p - last) < 0.002) return;
    last = p;
    hero.style.setProperty('--p', p.toFixed(3));
  };
  addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  update();
}
