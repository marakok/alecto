import { mix, rand, clamp } from './palette.js';

const STAGES = ['Instruct', 'Investigate', 'Exchange', 'Complete', 'Keys'];

// Illustrative activity. Replace with anonymised case events from Alecto's case system to make it real.
const EVENTS = [
  ['ID verified', 'Terms signed', 'Quote accepted'],
  ['Searches returned', 'Enquiries answered', 'Mortgage offer received'],
  ['Contracts exchanged', 'Completion date agreed', 'Deposit transferred'],
  ['Funds transferred', 'Completion confirmed'],
  ['Keys released', 'Land Registry updated', 'Stamp Duty filed'],
];
const CITIES = ['Bristol', 'Leeds', 'Manchester', 'Brighton', 'York', 'Bath', 'Norwich', 'Cardiff', 'Sheffield', 'Oxford', 'Exeter', 'Nottingham'];

const colsFor = (w) => (w < 640 ? 8 : w < 1000 ? 12 : 16);

/**
 * The live hero: a grid of tiles (columns = moves, grouped by stage) that the brand dot builds,
 * then keeps updating with live activity toasts.
 */
export function createHero({ reduce }) {
  const $ = (id) => document.getElementById(id);
  const grid = $('grid');
  const legend = $('legend');
  const stage = $('stage');
  const period = $('period');
  if (!grid || !stage) return null;

  let COLS = 0;
  let ROWS = 0;
  let tiles = [];
  let heights = [];
  let targets = [];
  let colStage = [];
  let liveTimer = null;

  const tile = (c, k) => tiles[(ROWS - 1 - k) * COLS + c]; // k = 0 is the bottom row

  function build() {
    COLS = colsFor(innerWidth);
    ROWS = innerWidth < 640 ? 4 : 5;
    grid.style.setProperty('--cols', COLS);
    legend.style.setProperty('--cols', COLS);
    grid.innerHTML = '';
    tiles = [];
    cur = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const d = document.createElement('div');
        d.className = 't';
        d.style.setProperty('--c', mix(c / (COLS - 1)));
        grid.appendChild(d);
        tiles.push(d);
      }
    }
    // Spread columns over the five stages; extra columns go to the later stages.
    const base = Math.floor(COLS / 5);
    const rem = COLS - base * 5;
    const spans = STAGES.map((_, i) => base + (i >= 5 - rem ? 1 : 0));
    colStage = [];
    spans.forEach((s, i) => { for (let j = 0; j < s; j++) colStage.push(i); });
    legend.innerHTML = STAGES.map((s, i) => `<div style="grid-column:span ${spans[i]}"><span>0${i + 1}</span>${s}</div>`).join('');
    targets = Array.from({ length: COLS }, (_, c) => clamp(Math.round(ROWS * (0.3 + 0.62 * (c / (COLS - 1))) + rand(-0.7, 0.7)), 1, ROWS));
    heights = targets.map(() => 0);
  }

  function paint(c, h, ghost = true) {
    heights[c] = h;
    for (let k = 0; k < ROWS; k++) {
      let a = 0;
      if (k < h) a = 0.5 + 0.5 * (1 - k / ROWS);
      else if (k === h && ghost) a = 0.14;
      tile(c, k).style.setProperty('--a', a);
    }
  }

  function markLegend() {
    const top = Math.max(...heights);
    [...legend.children].forEach((d, i) => d.classList.toggle('on', heights.some((h, c) => colStage[c] === i && h >= top - 1)));
  }

  function settle() {
    for (let c = 0; c < COLS; c++) paint(c, targets[c]);
    markLegend();
  }

  function wave() {
    for (let c = 0; c < COLS; c++) {
      for (let k = 1; k <= targets[c]; k++) {
        setTimeout(() => paint(c, k, k === targets[c]), c * 70 + k * 110);
      }
    }
    setTimeout(markLegend, COLS * 70 + ROWS * 110 + 200);
  }

  /** The headline full stop hops out and lands as the first tile, then the skyline builds. */
  function intro() {
    if (reduce || document.hidden) { settle(); return; }
    const from = period.getBoundingClientRect();
    const target = tile(0, 0);
    const to = target.getBoundingClientRect();
    const fly = document.createElement('div');
    fly.className = 'fly';
    document.body.appendChild(fly);
    const box = (r) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    period.style.visibility = 'hidden';
    const anim = fly.animate(
      [
        box(from),
        { left: `${from.left}px`, top: `${from.top - 34}px`, width: `${from.width}px`, height: `${from.height}px`, offset: 0.22 },
        box(to),
      ],
      { duration: 1150, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' },
    );
    anim.onfinish = () => {
      fly.remove();
      paint(0, 1);
      target.classList.add('flash');
      setTimeout(() => target.classList.remove('flash'), 1400);
      wave();
      setTimeout(() => {
        period.style.visibility = '';
        period.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }, 600);
    };
  }

  function toast(c) {
    const k = Math.max(0, heights[c] - 1);
    const el = tile(c, k);
    const sr = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const st = colStage[c];
    const ev = EVENTS[st][Math.floor(Math.random() * EVENTS[st].length)];
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.setProperty('--c', getComputedStyle(el).getPropertyValue('--c'));
    t.style.left = `${clamp(r.left - sr.left + r.width / 2, 120, sr.width - 120)}px`;
    t.style.top = `${r.top - sr.top - 10}px`;
    t.innerHTML = `<i></i><b>${ev}</b><small>${CITIES[Math.floor(Math.random() * CITIES.length)]} · just now</small>`;
    stage.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 420); }, 2300);
    if (ev === 'Keys released') { const kEl = $('keys'); kEl.textContent = +kEl.textContent + 1; }
  }

  function tick() {
    if (document.hidden) return;
    const c = Math.floor(Math.random() * COLS);
    let h = heights[c] + (Math.random() < 0.55 ? 1 : -1);
    if (h > targets[c] + 1) h = targets[c] - 1;
    h = clamp(h, 1, ROWS);
    paint(c, h);
    const top = tile(c, h - 1);
    top.classList.remove('flash'); void top.offsetWidth; top.classList.add('flash');
    toast(c);
    markLegend();
    const nd = $('navdot');
    nd.classList.remove('ping'); void nd.offsetWidth; nd.classList.add('ping');
    const m = $('moving');
    m.textContent = clamp(+m.textContent + (Math.random() < 0.5 ? 1 : -1), 110, 150);
  }

  function startLive(delay = 0) {
    if (reduce) return;
    clearInterval(liveTimer);
    setTimeout(() => { liveTimer = setInterval(tick, 2400); }, delay);
  }

  // Hover: tiles near the cursor rise, tilt towards it, fill with colour and glow.
  // Values ease towards their target every frame, so the field follows the cursor smoothly.
  const RADIUS = 220;
  let centers = [];
  let size = 0;
  let cur = [];
  let raf = 0;
  let px = -1e4;
  let py = -1e4;
  let hot = null;
  const measure = () => {
    centers = tiles.map((t) => { const r = t.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2 + scrollY]; });
    size = tiles[0]?.getBoundingClientRect().width || 60;
    if (cur.length !== tiles.length) cur = tiles.map(() => ({ l: 0, rx: 0, ry: 0, gx: 0, gy: 0 }));
  };
  const step = () => {
    raf = 0;
    const y = py + scrollY;
    let moving = false;
    let nearest = null;
    let nd = Infinity;
    tiles.forEach((t, i) => {
      const vx = px - centers[i][0];
      const vy = y - centers[i][1];
      const d = Math.hypot(vx, vy);
      let k = Math.max(0, 1 - d / RADIUS);
      k = k * k * (3 - 2 * k); // smooth falloff
      const goal = { l: k, rx: (-vy / RADIUS) * 18 * k, ry: (vx / RADIUS) * 18 * k, gx: clamp(vx / size, -1, 1) * 40 * k, gy: clamp(vy / size, -1, 1) * 40 * k };
      const c = cur[i];
      for (const key in goal) {
        const delta = goal[key] - c[key];
        if (Math.abs(delta) > 0.002) { c[key] += delta * 0.18; moving = true; } else c[key] = goal[key];
      }
      t.style.setProperty('--lift', c.l.toFixed(3));
      t.style.setProperty('--rx', c.rx.toFixed(2));
      t.style.setProperty('--ry', c.ry.toFixed(2));
      t.style.setProperty('--gx', c.gx.toFixed(1));
      t.style.setProperty('--gy', c.gy.toFixed(1));
      t.style.zIndex = c.l > 0.55 ? '2' : '';
      if (d < nd) { nd = d; nearest = t; }
    });
    const next = nd < size * 0.75 ? nearest : null;
    if (next !== hot) { hot?.classList.remove('hot'); next?.classList.add('hot'); hot = next; }
    if (moving) raf = requestAnimationFrame(step);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(step); };

  // Click: a ripple of square outlines spreads out from the tile you pressed.
  const ripple = (e) => {
    const y = e.clientY + scrollY;
    tiles.forEach((t, i) => {
      const d = Math.hypot(centers[i][0] - e.clientX, centers[i][1] - y);
      if (d > RADIUS * 1.6) return;
      setTimeout(() => { t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash'); }, d * 1.4);
    });
  };

  if (!reduce) {
    stage.addEventListener('pointerenter', (e) => { measure(); px = e.clientX; py = e.clientY; kick(); });
    stage.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; kick(); });
    stage.addEventListener('pointerleave', () => { px = py = -1e4; kick(); });
    stage.addEventListener('pointerdown', ripple);
    addEventListener('scroll', () => { if (px > -1e4) { measure(); kick(); } }, { passive: true });
  }

  build();
  addEventListener('resize', () => {
    if (colsFor(innerWidth) !== COLS) { build(); settle(); }
    measure();
  });

  return { intro, settle, startLive };
}
