import { clamp } from '../../js/palette.js';

/**
 * The path photo (two people carrying boxes over square stepping stones): the stones light up in the brand
 * periwinkle, one by one, far to near, like footsteps. Then a soft step runs along them every few seconds.
 *
 * Markup: <div class="path-photo" data-path> with the photo and an empty <span class="stones">. The stone
 * shapes come from one mask (public/phase-2/move-path-stones.png, made from the photo); each stone is that
 * mask clipped to the outline below (in % of the photo, far to near).
 * - In a frame (hero 2a) the stones light once the hero intro runs.
 * - With data-path="pan" (hero 2b boxed, 2c full width) the photo pans down as you scroll, from the faces to the
 *   path, and the stones light as they come into view, and go out again when you scroll back.
 * Without JS or with reduced motion the stones are simply lit (.stones::before).
 */
const STONES = [ // from scripts/stone-mask.py
  '28.06% 57.63%, 28.23% 55.90%, 28.31% 55.84%, 38.26% 57.51%, 38.48% 57.63%, 38.56% 57.75%, 38.56% 57.86%, 38.48% 57.98%, 38.26% 58.10%, 36.11% 58.53%, 31.95% 58.80%, 29.06% 58.54%, 28.22% 58.39%, 28.14% 58.33%, 28.06% 58.22%',
  '30.16% 60.35%, 33.43% 57.97%, 35.55% 57.76%, 41.11% 60.30%, 41.33% 60.47%, 41.33% 60.53%, 41.18% 60.65%, 40.65% 60.78%, 32.94% 62.11%, 32.78% 62.10%, 30.23% 60.47%',
  '53.05% 61.05%, 57.51% 60.76%, 58.91% 60.62%, 59.99% 60.67%, 61.79% 61.05%, 63.53% 61.46%, 64.74% 61.72%, 64.89% 61.78%, 64.97% 61.89%, 64.97% 61.95%, 64.89% 62.07%, 64.74% 62.18%, 64.29% 62.31%, 63.07% 62.52%, 60.68% 63.05%, 58.47% 63.25%, 57.00% 63.08%, 54.33% 62.71%, 53.65% 62.58%, 53.57% 62.52%, 53.49% 62.35%, 53.26% 61.78%, 53.05% 61.16%',
  '59.57% 65.54%, 59.65% 65.48%, 60.18% 65.36%, 60.86% 65.23%, 64.58% 64.55%, 65.66% 64.45%, 67.01% 64.47%, 68.25% 64.59%, 68.67% 64.68%, 68.92% 64.75%, 69.01% 64.82%, 69.10% 64.94%, 70.78% 68.16%, 70.74% 68.60%, 70.65% 68.71%, 70.57% 68.77%, 63.89% 68.40%, 59.64% 65.77%, 59.57% 65.65%',
  '73.24% 72.41%, 75.64% 68.04%, 75.92% 67.72%, 76.09% 67.61%, 76.34% 67.60%, 84.41% 69.94%, 85.20% 70.42%, 85.21% 70.70%, 85.14% 70.93%, 83.51% 72.75%, 83.17% 73.00%, 83.01% 73.06%, 82.51% 73.21%, 81.30% 73.51%, 78.29% 74.04%, 77.93% 74.07%, 77.84% 74.07%, 73.56% 72.87%, 73.48% 72.81%, 73.24% 72.47%',
  '39.16% 68.02%, 39.31% 67.91%, 44.72% 65.34%, 57.61% 67.91%, 57.69% 67.96%, 57.76% 68.67%, 57.76% 68.78%, 57.61% 68.89%, 57.08% 69.01%, 54.75% 69.20%, 42.57% 69.69%, 42.42% 69.69%, 39.38% 68.29%, 39.16% 68.13%',
  '12.30% 72.58%, 12.53% 72.47%, 12.75% 72.42%, 20.59% 71.12%, 22.10% 70.86%, 24.23% 70.74%, 25.72% 70.84%, 27.36% 71.21%, 27.60% 71.28%, 30.83% 72.30%, 30.98% 72.35%, 31.13% 72.52%, 31.13% 72.74%, 30.91% 72.90%, 30.38% 73.24%, 30.15% 73.35%, 26.54% 74.24%, 20.94% 75.14%, 20.77% 75.13%, 18.12% 74.81%, 16.94% 74.60%, 16.32% 74.42%, 16.17% 74.36%, 12.30% 72.69%',
  '45.46% 74.91%, 45.61% 71.99%, 45.69% 71.93%, 49.15% 71.94%, 58.88% 73.32%, 67.67% 74.96%, 67.67% 75.07%, 65.92% 76.56%, 65.84% 76.62%, 58.24% 78.62%, 47.96% 75.92%, 45.69% 75.24%, 45.46% 75.07%',
  '-0.52% 73.24%, -0.41% 73.17%, -0.23% 73.15%, 3.05% 74.26%, 3.38% 74.53%, 3.36% 74.85%, 3.27% 74.94%, 2.99% 75.13%, 2.56% 75.35%, 1.60% 75.65%, -0.12% 75.73%, -0.58% 75.67%',
  '3.75% 78.96%, 4.21% 78.58%, 4.28% 78.52%, 16.03% 77.03%, 16.52% 77.00%, 17.62% 76.95%, 18.02% 76.96%, 19.80% 77.08%, 26.63% 78.66%, 24.98% 79.99%, 24.90% 80.04%, 13.46% 82.29%, 13.28% 82.30%, 10.34% 82.18%, 8.75% 81.89%, 7.30% 81.55%, 5.26% 80.29%, 3.98% 79.45%, 3.75% 79.29%',
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
