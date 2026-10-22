import { clamp } from '../js/palette.js';
import { afterIntro } from '../phase-2/concept-2/reveal.js';

/**
 * Phase 3 · Lines: the square as a system of lines, the way Verve uses one shape for everything (Miro).
 * One grid runs through the page; its columns are measured from the right edge of the content, every --cell.
 *
 *  - The page load (the "grid" load, loader.js): hairlines draw outward from the middle of the empty screen
 *    into the grid, the square appears, and as the screen lifts the grid carries on in the hero, line for line.
 *  - [data-grid] (hero, evening CTA): big rounded tiles on the grid (data-tiles, or a field with data-fill), the lines running on to the edges, "+" where
 *    they cross. One periwinkle tile walks along data-walk, cell by cell (your move, going home), and small
 *    squares of data can slide along the lines (only with data-bits: off by default, to keep it quiet).
 *  - Where four tiles meet, the gap between their corners is a four-pointed star: the AI sparkle, made by the
 *    squares themselves. Faint at every crossing; the four round your tile light up as it walks.
 *  - Hover (mouse only): the tile under the pointer and its four stars light up, then fade slowly behind you.
 *  - The rest of the page shows no grid at rest; under the pointer a soft patch of it fades in (bodyGrid).
 *  data-accent: tiles drawn in periwinkle. Cells are "col,row": col from data-x0 (that many cells left of the content's right edge), row from data-y0
 *  (a fraction of the height). Reduced motion: drawn, still, the periwinkle tile at the end of its path.
 */
const NS = 'http://www.w3.org/2000/svg';

// the grid's measures, the same everywhere on the page
export function measures(width = innerWidth) {
  const cell = width < 900 ? Math.round(width / 3.2) : Math.round(clamp(width * 0.142, 150, 210));
  const gutter = Math.max(0, (width - 1440) / 2) + clamp(width * 0.0833, 16, 120);
  return { cell, right: width - gutter };
}

const cells = (s) => (s || '').trim().split(/\s+/).filter(Boolean).map((p) => p.split(',').map(Number));

// The star: where four rounded tiles meet, the space between their corners is a four-pointed star, the AI
// sparkle. Four quarter circles of the tiles' corner radius r, round the crossing (x, y).
export const star = (x, y, r) => `M${x} ${y - r}A${r} ${r} 0 0 0 ${x + r} ${y}A${r} ${r} 0 0 0 ${x} ${y + r}A${r} ${r} 0 0 0 ${x - r} ${y}A${r} ${r} 0 0 0 ${x} ${y - r}Z`;

function draw(el, reduce) {
  const { width: W, height: H } = el.getBoundingClientRect();
  if (!W || !H) return;
  const pageW = document.documentElement.clientWidth;
  const { cell: C, right } = measures(pageW);
  const left = el.getBoundingClientRect().left;
  const xr = right - left; // the content's right edge, in this element
  const x0 = xr - Number(el.dataset.x0 || 3) * C;
  const y0 = Math.round(H * Number(el.dataset.y0 || 0.2));
  const R = Math.round(C * 0.16);

  const xs = [];
  for (let x = xr - Math.ceil(xr / C) * C; x <= W + C; x += C) xs.push(Math.round(x));
  const ys = [];
  for (let y = y0 - Math.ceil(y0 / C) * C; y <= H + C; y += C) ys.push(Math.round(y));

  const lines = [
    ...xs.map((x, i) => `<line class="gl" style="--d:${i * 60}ms" x1="${x}" y1="0" x2="${x}" y2="${H}" pathLength="1"/>`),
    ...ys.map((y, i) => `<line class="gl" style="--d:${i * 60 + 120}ms" x1="0" y1="${y}" x2="${W}" y2="${y}" pathLength="1"/>`),
  ];
  const at = ([c, r]) => [x0 + c * C, y0 + r * C];
  // "+" at every crossing, or with a few tiles (no field) only at their corners, like the example
  let plus = '';
  const mark = (x, y) => { plus += `M${x - 6} ${y}h12M${x} ${y - 6}v12`; };
  if (el.dataset.fill) xs.forEach((x) => ys.forEach((y) => mark(x, y)));
  else {
    const corners = new Set();
    cells(el.dataset.tiles).forEach(([c, r]) => [[c, r], [c + 1, r], [c, r + 1], [c + 1, r + 1]].forEach((k) => corners.add(k.join(','))));
    corners.forEach((k) => mark(...at(k.split(',').map(Number))));
  }
  const accent = new Set(cells(el.dataset.accent).map((t) => t.join(',')));
  // tiles: the listed ones, plus a whole field (data-fill="c0 r0 c1 r1")
  const list = cells(el.dataset.tiles);
  const [f0, g0, f1, g1] = (el.dataset.fill || '').split(/\s+/).map(Number);
  if (el.dataset.fill) for (let r = g0; r <= g1; r++) for (let c = f0; c <= f1; c++) list.push([c, r]);
  const has = new Set(list.map((t) => t.join(',')));
  const seen = new Set();
  const tiles = list.filter((t) => !seen.has(t.join(',')) && seen.add(t.join(','))).map((t, i) => {
    const [x, y] = at(t);
    return `<rect class="tile${accent.has(t.join(',')) ? ' acc' : ''}" data-cell="${t.join(',')}" style="--d:${400 + (i % 12) * 90}ms" x="${x}" y="${y}" width="${C}" height="${C}" rx="${R}" pathLength="1"/>`;
  });
  // stars: at every crossing with a tile on all four sides
  const stars = [];
  seen.forEach((k) => {
    const [c, r] = k.split(',').map(Number);
    if (![[c - 1, r - 1], [c, r - 1], [c - 1, r]].every((n) => has.has(n.join(',')))) return;
    const [x, y] = at([c, r]);
    stars.push(`<path class="star" data-at="${c},${r}" style="--d:${900 + ((c * 7 + r * 3) % 9) * 110}ms" d="${star(x, y, R)}"/>`);
  });
  // data: small squares sliding along a few of the lines
  const bits = [];
  ys.filter((y) => y > 0 && y < H).slice(0, 4).forEach((y, i) => bits.push(`<rect class="bit h" style="--y:${y - 2}px;--w:${W}px;--t:${14 + i * 5}s;--o:${-i * 3.7}s" width="5" height="5"/>`));
  xs.filter((x) => x > xr - 3 * C && x < W).slice(0, 3).forEach((x, i) => bits.push(`<rect class="bit v" style="--x:${x - 2}px;--h:${H}px;--t:${11 + i * 4}s;--o:${-i * 2.9}s" width="5" height="5"/>`));

  el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <g class="g-lines">${lines.join('')}<path class="g-plus" d="${plus}"/></g>
    <g class="g-tiles">${tiles.join('')}</g>
    <g class="g-stars">${stars.join('')}</g>
    <rect class="tile you" width="${C}" height="${C}" rx="${R}"/>
    <g class="g-bits">${reduce || el.dataset.bits === undefined ? '' : bits.join('')}</g>
  </svg>`;

  el._geo = { x0, y0, C };
  const path = cells(el.dataset.walk);
  const you = el.querySelector('.you');
  const put = (i) => {
    const [x, y] = at(path[i]);
    you.style.transform = `translate(${x}px, ${y}px)`;
    el.querySelectorAll('.tile[data-cell]').forEach((t) => t.classList.toggle('lit', t.dataset.cell === path[i].join(',')));
    // the AI around your move: the stars at your tile's four corners light up
    const [c, r] = path[i];
    const near = new Set([[c, r], [c + 1, r], [c, r + 1], [c + 1, r + 1]].map((n) => n.join(',')));
    el.querySelectorAll('.star').forEach((s) => s.classList.toggle('hot', near.has(s.dataset.at)));
  };
  if (!path.length) { you.remove(); return; }
  el._walk = { put, n: path.length, i: el._walk?.i ?? (reduce ? path.length - 1 : 0) };
  put(el._walk.i);
}

export function initLines({ reduce }) {
  const grids = [...document.querySelectorAll('[data-grid]')];
  // draw each grid once it has a size, and again whenever its size changes
  const size = new WeakMap();
  const ro = new ResizeObserver((entries) => entries.forEach(({ target, contentRect: { width, height } }) => {
    const k = `${Math.round(width)}x${Math.round(height)}`;
    if (!width || !height || size.get(target) === k) return;
    size.set(target, k);
    draw(target, reduce);
  }));
  grids.forEach((g) => ro.observe(g));
  veil();

  if (reduce) { grids.forEach((g) => g.classList.add('drawn', 'still')); return; }
  grids.forEach(hover);
  bodyGrid();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.classList.add('drawn');
    const w = e.target._walk;
    if (!w) return;
    setTimeout(() => setInterval(() => { w.i = (w.i + 1) % w.n; w.put(w.i); }, 5200), 2400); // slow: one step every five seconds
  }), { threshold: 0.2 });
  afterIntro(() => grids.forEach((g) => io.observe(g)));
}

// hover: the tile under the pointer lights up with the stars at its corners, and fades slowly after you
function hover(el) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const area = el.closest('section') || el.parentElement;
  let last = '';
  area.addEventListener('pointermove', (e) => {
    const g = el._geo;
    if (!g) return;
    const r = el.getBoundingClientRect();
    const c = Math.floor((e.clientX - r.left - g.x0) / g.C);
    const row = Math.floor((e.clientY - r.top - g.y0) / g.C);
    const key = `${c},${row}`;
    if (key === last) return;
    last = key;
    el.querySelectorAll('.tile.hover').forEach((t) => t.classList.remove('hover'));
    el.querySelectorAll('.star.glint').forEach((t) => t.classList.remove('glint'));
    el.querySelector(`.tile[data-cell="${key}"]`)?.classList.add('hover');
    [[c, row], [c + 1, row], [c, row + 1], [c + 1, row + 1]].forEach((n) => el.querySelector(`.star[data-at="${n.join(',')}"]`)?.classList.add('glint'));
  });
  area.addEventListener('pointerleave', () => {
    last = '';
    el.querySelectorAll('.tile.hover, .star.glint').forEach((t) => t.classList.remove('hover', 'glint'));
  });
}

// The rest of the page: no grid at rest. Under the pointer a soft round patch of it fades in and follows with a
// little lag, on the same columns and rows as the hero's, with the tile you're over (and its four stars) faintly
// outlined. One fixed layer behind the content, so only the screen repaints.
function bodyGrid() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const main = document.getElementById('main');
  const hero = document.querySelector('.hero-grid');
  if (!main || !hero) return;
  const layer = document.createElement('div');
  layer.className = 'body-grid';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `<i class="bg-lines"></i><svg class="bg-tile" aria-hidden="true"><rect class="bt"/><path class="bs"/></svg>`;
  document.body.append(layer);
  const tile = layer.querySelector('.bg-tile');
  const rect = tile.querySelector('.bt');
  const stars = tile.querySelector('.bs');

  let mx = 0; let my = 0; // where the pointer is
  let x = 0; let y = 0; // where the patch is (follows, softly)
  let on = false;
  let raf = 0;
  let lastC = 0;
  const frame = () => {
    raf = 0;
    const g = hero._geo;
    if (!g) return;
    const { cell: C, right } = measures(document.documentElement.clientWidth);
    // the hero grid's first row, in page px, carried on down the page
    const oy = hero.getBoundingClientRect().top + g.y0;
    const gx = ((right % C) + C) % C;
    const gy = ((oy % C) + C) % C;
    x += (mx - x) * 0.14;
    y += (my - y) * 0.14;
    layer.style.setProperty('--mx', `${x.toFixed(1)}px`);
    layer.style.setProperty('--my', `${y.toFixed(1)}px`);
    layer.style.setProperty('--gx', `${gx}px`);
    layer.style.setProperty('--gy', `${gy}px`);
    layer.style.setProperty('--c', `${C}px`);
    // the tile under the pointer, snapped to the grid; it glides from cell to cell
    const tx = gx + Math.floor((mx - gx) / C) * C;
    const ty = gy + Math.floor((my - gy) / C) * C;
    tile.style.transform = `translate(${tx}px, ${ty}px)`;
    if (C !== lastC) {
      lastC = C;
      const R = Math.round(C * 0.16);
      tile.setAttribute('width', C + 2 * R);
      tile.setAttribute('height', C + 2 * R);
      tile.setAttribute('viewBox', `${-R} ${-R} ${C + 2 * R} ${C + 2 * R}`);
      tile.style.margin = `${-R}px 0 0 ${-R}px`;
      rect.setAttribute('width', C);
      rect.setAttribute('height', C);
      rect.setAttribute('rx', R);
      stars.setAttribute('d', [[0, 0], [C, 0], [0, C], [C, C]].map(([sx, sy]) => star(sx, sy, R)).join(''));
    }
    if (on || Math.abs(mx - x) > 0.5 || Math.abs(my - y) > 0.5) raf = requestAnimationFrame(frame);
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(frame); };

  main.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    // the hero and the evening have grids of their own; over cards and content it stays away
    const own = e.target.closest('.c2-hero, .c2-cta, .grid-band, .step, .review, .mate, .fr-proactive, .fr-lawyer, .faq details, .proof-row > div');
    if (!on && !own) { x = mx; y = my; } // appear where the pointer is, then follow
    on = !own;
    layer.classList.toggle('on', on);
    go();
  });
  main.addEventListener('pointerleave', () => { on = false; layer.classList.remove('on'); });
  addEventListener('scroll', () => { if (on) go(); }, { passive: true });
}

// the page load: the same grid, drawn on the empty screen from the middle out (html[data-l="grid"])
function veil() {
  const v = document.querySelector('.veil');
  const hero = document.querySelector('.hero-grid');
  if (!v || !hero || document.documentElement.dataset.l !== 'grid') return;
  const W = innerWidth;
  const H = innerHeight;
  const { cell: C, right } = measures(document.documentElement.clientWidth);
  const top = hero.getBoundingClientRect().top + Math.round(hero.getBoundingClientRect().height * Number(hero.dataset.y0 || 0.2));
  const xs = [];
  for (let x = right - Math.ceil(right / C) * C; x <= W; x += C) xs.push(x);
  const ys = [];
  for (let y = top - Math.ceil(top / C) * C; y <= H; y += C) ys.push(y);
  const d = (p, mid, span) => Math.round((Math.abs(p - mid) / span) * 700);
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'veil-grid');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = [
    ...xs.map((x) => `<line style="--d:${d(x, W / 2, W)}ms" x1="${x}" y1="0" x2="${x}" y2="${H}" pathLength="1"/>`),
    ...ys.map((y) => `<line style="--d:${d(y, H / 2, H) + 150}ms" x1="0" y1="${y}" x2="${W}" y2="${y}" pathLength="1"/>`),
  ].join('');
  v.prepend(svg);
}
