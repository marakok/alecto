import { clamp } from '../js/palette.js';

/**
 * Hero collage: play the intro once the photos have loaded and the collage is in view, then let the pieces
 * drift a few pixels with the pointer, each by its own depth (--d in CSS).
 */
export function initCollage({ reduce }) {
  const collage = document.querySelector('.collage');
  if (!collage) return;
  if (reduce) { collage.classList.add('in'); return; }

  // Start when the photos are ready (1.2s at most) and the collage is on screen: on narrow screens it
  // sits below the copy, and the intro should not play out of sight.
  const imgs = [...collage.querySelectorAll('img')];
  const loaded = Promise.all(imgs.map((img) => img.decode().catch(() => {})));
  const timeout = new Promise((r) => setTimeout(r, 1200));
  const visible = new Promise((r) => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); r(); } }, { threshold: 0.25 });
    io.observe(collage);
  });
  Promise.all([Promise.race([loaded, timeout]), visible]).then(() => collage.classList.add('in'));

  if (!matchMedia('(hover: hover)').matches) return;
  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let running = false;
  const tick = () => {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    collage.style.setProperty('--mx', x.toFixed(3));
    collage.style.setProperty('--my', y.toFixed(3));
    if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) requestAnimationFrame(tick);
    else running = false;
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
  addEventListener('pointermove', (e) => {
    const r = collage.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    tx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1.5, 1.5) * 0.6;
    ty = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1.5, 1.5) * 0.6;
    kick();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
}
