import { mix, rand, clamp } from './palette.js';

/** "How it works": each stage gets one more square than the last, warming towards the keys. */
export function initStageStacks() {
  document.querySelectorAll('.stack').forEach((s, i) => {
    for (let k = 0; k <= i; k++) {
      const sp = document.createElement('span');
      sp.style.setProperty('--c', mix(Math.min(1, (i / 4) * 0.92 + k * 0.02)));
      s.appendChild(sp);
    }
  });
}

/** Small tile skyline along the bottom of the closing CTA. */
export function initSkyline(el, cols = 24) {
  if (!el) return;
  for (let c = 0; c < cols; c++) {
    const p = c / (cols - 1);
    const col = document.createElement('div');
    const h = clamp(Math.round(1 + 3.2 * p + rand(-0.6, 0.6)), 1, 4);
    for (let k = 0; k < h; k++) {
      const sp = document.createElement('span');
      sp.style.setProperty('--c', mix(p));
      sp.style.opacity = (1 - k * 0.14).toFixed(2);
      col.appendChild(sp);
    }
    el.appendChild(col);
  }
}
