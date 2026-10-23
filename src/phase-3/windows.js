/**
 * Phase 3 · Lines 2: the hero's clip shows only through a few of the grid's tiles, like windows in a wall
 * (<div data-grid data-windows="c,r …" data-open="c,r …">, cells as in lines.js). The video and its smoothed canvas
 * are clipped to rounded squares that sit just inside those tiles' lines. Every few seconds one window closes
 * (shrinks to its middle) while another opens somewhere else: one slow movement at a time. Windows never open
 * behind the words: tiles that overlap the headline, the buttons or Hannah's line stay plain.
 * Reduced motion: the first windows, open and still.
 */
const NS = 'http://www.w3.org/2000/svg';
const cells = (s) => (s || '').trim().split(/\s+/).filter(Boolean);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initWindows({ reduce }) {
  const grid = document.querySelector('[data-grid][data-windows]');
  const hero = grid?.closest('section');
  if (!grid || !hero) return;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'lw-defs');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<clipPath id="lw-clip" clipPathUnits="userSpaceOnUse"></clipPath>';
  hero.prepend(svg);
  const clip = svg.firstChild;
  hero.classList.add('lw');

  // every candidate window, with how open it is (0 to 1)
  const open = new Set(cells(grid.dataset.open));
  const wins = cells(grid.dataset.windows).map((k) => {
    const rect = document.createElementNS(NS, 'rect');
    clip.append(rect);
    const v = open.has(k) ? 1 : 0;
    return { k, rect, v, from: v, to: v };
  });

  const words = [...hero.querySelectorAll('h1, .sub, .ctas, .hello')];
  const pad = 16;
  let settled = false;

  const place = () => {
    const g = grid._geo; // set by lines.js once the grid is drawn
    if (!g) return false;
    const gr = grid.getBoundingClientRect();
    const hr = hero.getBoundingClientRect();
    const ox = gr.left - hr.left;
    const oy = gr.top - hr.top;
    const inset = 3; // just inside the tile's line
    const R = Math.round(g.C * 0.16);
    // a window may not sit behind the words
    const boxes = words.map((el) => { // the text itself, not its (wider) box
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect();
    }).filter((b) => b.width);
    wins.forEach((w) => {
      const [c, r] = w.k.split(',').map(Number);
      const L = gr.left + g.x0 + c * g.C;
      const T = gr.top + g.y0 + r * g.C;
      w.blocked = boxes.some((b) => L < b.right + pad && L + g.C > b.left - pad && T < b.bottom + pad && T + g.C > b.top - pad);
    });
    if (!settled) settle();
    wins.forEach((w) => {
      const [c, r] = w.k.split(',').map(Number);
      const full = g.C - inset * 2;
      const s = full * ease(w.v);
      const x = ox + g.x0 + c * g.C + inset + (full - s) / 2;
      const y = oy + g.y0 + r * g.C + inset + (full - s) / 2;
      w.rect.setAttribute('x', x.toFixed(1));
      w.rect.setAttribute('y', y.toFixed(1));
      w.rect.setAttribute('width', s.toFixed(1));
      w.rect.setAttribute('height', s.toFixed(1));
      w.rect.setAttribute('rx', Math.max(0, R - inset * (s / full)).toFixed(1));
    });
    return true;
  };

  // the first windows: the ones asked for that are clear of the words, topped up from the rest; any window that
  // has come to sit behind the words (after a resize) closes at once
  function settle() {
    settled = true;
    wins.forEach((w) => { if (w.blocked) { w.v = w.from = w.to = 0; } });
    const want = Math.min(open.size || 3, wins.filter((w) => !w.blocked).length);
    const free = wins.filter((w) => !w.blocked && w.to === 0);
    while (wins.filter((w) => w.to === 1).length < want && free.length) {
      const w = free.shift();
      w.v = w.from = w.to = 1;
    }
  }

  // wait for the grid, and place the windows again whenever the hero changes size
  const ready = () => (place() ? null : requestAnimationFrame(ready));
  ready();
  new ResizeObserver(() => requestAnimationFrame(() => { settled = false; place(); })).observe(hero);
  if (reduce) return;

  // one window closes while another opens, slowly
  const DUR = 2600;
  const swap = () => {
    const shut = wins.filter((w) => w.to === 1);
    const closed = wins.filter((w) => w.to === 0 && !w.blocked);
    if (!shut.length || !closed.length) return;
    const a = shut[Math.floor(Math.random() * shut.length)];
    const b = closed[Math.floor(Math.random() * closed.length)];
    [[a, 0], [b, 1]].forEach(([w, to]) => { w.from = w.v; w.to = to; });
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / DUR);
      [a, b].forEach((w) => { w.v = w.from + (w.to - w.from) * t; });
      place();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  setInterval(() => { if (!document.hidden) swap(); }, 6500);
}
