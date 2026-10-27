/**
 * Phase 3 · Lines 2: a section's clip shows only through a few of the grid's tiles, like windows in a wall
 * (<div data-grid data-windows="c,r …" data-open="c,r …">, cells as in lines.js). The video and its smoothed canvas
 * are clipped to rounded squares that sit just inside those tiles' lines. Every few seconds one window closes
 * (shrinks to its middle) while another opens somewhere else: one slow movement at a time. Windows never open
 * behind the words: tiles that overlap the headline, the buttons or Hannah's line stay plain. Any number of these per
 * page (the header and the closing section), each with its own clip.
 * data-frame: the clip is fitted to the windows' own field instead of the whole section, so the panes show the whole
 * curtain rather than a strip of it. data-cluster: the open windows stay side by side, one window divided by the
 * grid's lines into panes, and a swap moves that window one pane at a time.
 * Reduced motion: the first windows, open and still.
 */
const NS = 'http://www.w3.org/2000/svg';
const cells = (s) => (s || '').trim().split(/\s+/).filter(Boolean);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initWindows({ reduce }) {
  document.querySelectorAll('[data-grid][data-windows]').forEach((grid, n) => windows(grid, n, reduce));
}

function windows(grid, n, reduce) {
  const hero = grid.closest('section');
  if (!hero) return;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'lw-defs');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<clipPath id="lw-clip-${n}" clipPathUnits="userSpaceOnUse"></clipPath>`;
  hero.prepend(svg);
  const clip = svg.firstChild;
  hero.classList.add('lw');
  hero.style.setProperty('--lw-clip', `url(#lw-clip-${n})`);

  // every candidate window, with how open it is (0 to 1)
  const open = new Set(cells(grid.dataset.open));
  const wins = cells(grid.dataset.windows).map((k) => {
    const rect = document.createElementNS(NS, 'rect');
    clip.append(rect);
    const v = open.has(k) ? 1 : 0;
    return { k, rect, v, from: v, to: v };
  });

  const media = [...hero.querySelectorAll('.hero-video, .cta-video')];
  const frame = grid.dataset.frame !== undefined;
  const cluster = grid.dataset.cluster !== undefined;
  hero.classList.toggle('lw-frame', frame);

  const words = [...hero.querySelectorAll('h1, h2, .sub, .hero-time, .cta-copy > p, .ctas, .hello')];
  const pad = 16;
  let settled = false;

  const place = () => {
    const g = grid._geo; // set by lines.js once the grid is drawn
    if (!g) return false;
    const gr = grid.getBoundingClientRect();
    if (frame) fit(g, gr);
    const hr = (hero.querySelector('.hero-video, .cta-video') || hero).getBoundingClientRect(); // the clip's own box
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

  // the clip sits over the windows' field only (data-frame), so the curtain is seen whole through the panes
  function fit(g, gr) {
    const at = wins.map((w) => w.k.split(',').map(Number));
    const xs = at.map(([c]) => c);
    const ys = at.map(([, r]) => r);
    const box = (media[0]?.offsetParent || hero).getBoundingClientRect();
    const L = gr.left - box.left + g.x0 + Math.min(...xs) * g.C;
    const T = gr.top - box.top + g.y0 + Math.min(...ys) * g.C;
    media.forEach((m) => Object.assign(m.style, {
      inset: 'auto', left: `${L}px`, top: `${T}px`,
      width: `${(Math.max(...xs) - Math.min(...xs) + 1) * g.C}px`, height: `${(Math.max(...ys) - Math.min(...ys) + 1) * g.C}px`,
    }));
  }

  // open windows that touch side by side form one window (data-cluster)
  const joined = (set) => {
    if (set.length < 2) return true;
    const keys = new Set(set.map((w) => w.k));
    const seen = new Set([set[0].k]);
    const todo = [set[0].k];
    while (todo.length) {
      const [c, r] = todo.pop().split(',').map(Number);
      [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]].map((n) => n.join(',')).forEach((k) => {
        if (keys.has(k) && !seen.has(k)) { seen.add(k); todo.push(k); }
      });
    }
    return seen.size === keys.size;
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
    let pairs = shut.flatMap((a) => closed.map((b) => [a, b]));
    if (cluster) pairs = pairs.filter(([a, b]) => joined([...shut.filter((w) => w !== a), b]));
    if (!pairs.length) return;
    const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
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
  setTimeout(() => setInterval(() => { if (!document.hidden) swap(); }, 6500), n * 2600); // two grids don't swap at once
}
