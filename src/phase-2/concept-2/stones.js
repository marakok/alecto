import { clamp } from '../../js/palette.js';

/**
 * The path photo (two people carrying boxes over square stepping stones): the stones light up in the brand
 * periwinkle, one by one, far to near, like footsteps. Then a soft step runs along them every few seconds.
 *
 * Markup: <div class="path-photo" data-path> with the photo and an empty <span class="stones">. The stone
 * shapes come from one mask (public/phase-2/move-path-stones.png, made from the photo); each stone is that
 * mask clipped to the outline below (in % of the photo, far to near).
 * - In a frame (hero 2b, 2c) the stones light once the hero intro runs.
 * - With data-path="pan" (hero 2d, full width) the photo pans down as you scroll, from the faces to the
 *   path, and the stones light as they come into view, and go out again when you scroll back.
 * Without JS or with reduced motion the stones are simply lit (.stones::before).
 */
const STONES = [
  '25.5% 55%, 39% 54.9%, 41.3% 60.1%, 26.4% 60.6%',
  '27.4% 57.6%, 42% 57.4%, 44.1% 62.6%, 28.4% 63.2%',
  '50.4% 58.8%, 65.3% 58.7%, 67.7% 64.2%, 51.6% 64.9%',
  '56.9% 62.6%, 70.9% 62.5%, 71.6% 69.3%, 59.3% 69.5%',
  '36.4% 65.2%, 45% 65.1%, 60.6% 70.6%, 45% 71.8%',
  '71.3% 67.4%, 84% 67.6%, 85.9% 73.2%, 73.5% 74.4%',
  '10.1% 69%, 28.5% 68.7%, 33.8% 74.6%, 15% 76.9%',
  '42.4% 71.4%, 60% 71.1%, 67.9% 77.2%, 60.8% 79.2%',
  '-3% 71.8%, 6% 72%, 6% 77.2%, -3% 77.2%',
  '0.8% 75%, 22.5% 74.9%, 28.1% 81.5%, 9.8% 84.1%',
];
const GAP = 130; // ms between two stones

export function initStones({ reduce }) {
  const root = document.documentElement;
  document.querySelectorAll('[data-path]').forEach((frame) => {
    if (reduce || !root.classList.contains('jl')) return; // stay simply lit
    const layer = frame.querySelector('.stones');
    const stones = STONES.map((c, i) => {
      const s = document.createElement('i');
      s.style.setProperty('--c', `polygon(${c})`);
      s.style.setProperty('--d', `${i * GAP}ms`);
      layer.append(s);
      return s;
    });
    layer.classList.add('seq');

    if (frame.dataset.path === 'pan') pan(frame, stones);
    else afterIntro(() => setTimeout(() => layer.classList.add('lit'), 1300));
  });
}

// Run once the load screen lifts (loader.js adds html.hero-go).
function afterIntro(fn) {
  const root = document.documentElement;
  if (root.classList.contains('hero-go')) return fn();
  const mo = new MutationObserver(() => {
    if (!root.classList.contains('hero-go')) return;
    mo.disconnect();
    fn();
  });
  mo.observe(root, { attributes: true, attributeFilter: ['class'] });
}

// Full width: scroll pans the photo from the faces (--fy .06) down to the path (.8). A stone lights once
// the photo has panned past it.
function pan(frame, stones) {
  const panel = frame.closest('.photo-panel') || frame;
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = panel.getBoundingClientRect();
    const p = clamp((innerHeight * 0.25 - r.top) / (r.height * 0.75), 0, 1);
    frame.style.setProperty('--fy', (0.06 + p * 0.74).toFixed(4));
    stones.forEach((s, i) => s.classList.toggle('on', p > 0.3 + (i / stones.length) * 0.55));
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', ask);
  update();
}
