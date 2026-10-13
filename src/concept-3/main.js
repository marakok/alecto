import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { mix, rand, clamp, prefersReducedMotion } from '../js/palette.js';

/**
 * Concept 3: Square by square.
 * No loader: the page builds itself. Every block appears tile by tile as it enters the screen,
 * and in the pinned "build" section ~170 squares fly in from all sides to build a house, one stage
 * at a time. The headline full stop is the first square: it lifts off and becomes the foundation.
 * Everything is scrubbed by scroll, so scrolling back takes the house apart again.
 */

const reduce = prefersReducedMotion();
const root = document.documentElement;
root.classList.add('pbjs'); // JS is running: the CSS safety reveal can stand down
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false, reveals: false });

const live = root.classList.contains('bl') && !reduce;
// Wait briefly for the web fonts, so the covers match the final text size.
Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 400))]).then(initPageBuild);
initHouse();

/* ---------- the house ---------- */

// A 15 x 16 pixel house. Stage: 0 foundation, 1 walls, 2 roof, 3 windows + chimney, 4 front door.
function blueprint() {
  const cells = [];
  const add = (c, r, stage, type = 'brick') => cells.push({ c, r, stage, type });
  const isWindow = (c, r) => (r === 9 || r === 10) && (c === 3 || c === 4 || c === 10 || c === 11);
  const isDoor = (c, r) => r >= 11 && r <= 14 && c >= 6 && c <= 8;

  for (let c = 0; c < 15; c++) add(c, 15, 0, 'base');
  for (let r = 14; r >= 8; r--) for (let c = 1; c <= 13; c++) if (!isWindow(c, r) && !isDoor(c, r)) add(c, r, 1);
  for (let k = 7; k >= 0; k--) for (let c = 7 - k; c <= 7 + k; c++) add(c, k, 2, 'roof');
  [[12, 4], [11, 3], [12, 3], [11, 2], [12, 2], [11, 1], [12, 1]].forEach(([c, r]) => add(c, r, 3, 'chimney'));
  for (let r = 10; r >= 9; r--) [3, 4, 10, 11].forEach((c) => add(c, r, 3, 'window'));
  for (let r = 14; r >= 11; r--) for (let c = 6; c <= 8; c++) add(c, r, 4, c === 8 && r === 12 ? 'knob' : 'door');

  // Within a stage, build outward from the middle of the foundation, then bottom-up, row by row.
  cells.sort((a, b) => a.stage - b.stage || b.r - a.r || Math.abs(a.c - 7) - Math.abs(b.c - 7) || a.c - b.c);
  return cells;
}

function initHouse() {
  const scene = document.getElementById('scene');
  const build = document.getElementById('build');
  const seed = document.getElementById('seed');
  if (!scene || !build) return;
  const chaps = [...build.querySelectorAll('.bchap')];
  const count = document.getElementById('bcount');
  const bar = document.getElementById('bbar');
  const placedEl = document.getElementById('bplaced');
  const STAGES = 5;
  const END = STAGES + 0.7; // extra scroll after the last stage: lights on, hold

  const cells = blueprint();
  const squares = cells.map((cell, i) => {
    const el = document.createElement('i');
    el.className = `sq ${cell.type}${i === 0 ? ' seed' : ''}`;
    // Brand gradient across the house, a touch lighter towards the top.
    if (cell.type !== 'window' && cell.type !== 'door' && cell.type !== 'knob') {
      el.style.setProperty('--c', mix(clamp(cell.c / 14 * 0.86 + (15 - cell.r) / 15 * 0.14, 0, 1)));
    }
    scene.appendChild(el);
    // Each square gets its own flight: where it comes from, how it curves, how much it spins.
    const angle = rand(0, Math.PI * 2);
    return {
      el, cell, seed: i === 0,
      angle, dist: rand(0.75, 1.3), bend: rand(-0.45, 0.45), spin: rand(-300, 300),
      t: -1, landed: false,
    };
  });

  // Stagger each stage's squares over its slice of the scroll.
  for (let s = 0; s < STAGES; s++) {
    const group = squares.filter((q) => q.cell.stage === s && !q.seed);
    group.forEach((q, j) => {
      const start = s + 0.06 + (j / Math.max(1, group.length)) * 0.56;
      q.start = start;
      q.end = start + 0.32;
    });
  }

  let size = 0;
  let cell = 0;
  let ox = 0;
  let oy = 0;
  let top = 0;
  let range = 1;
  const measure = () => {
    const r = scene.getBoundingClientRect();
    size = r.width;
    cell = size / 16;
    ox = (size - 15 * cell) / 2;
    oy = 0;
    scene.style.setProperty('--sq', `${cell * 0.9}px`);
    top = build.getBoundingClientRect().top + scrollY;
    range = Math.max(1, build.offsetHeight - innerHeight);
    squares.forEach((q) => { q.t = -1; }); // force a repaint at the new size
  };

  const target = (q) => [ox + q.cell.c * cell + cell * 0.05, oy + q.cell.r * cell + cell * 0.05];
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutBack = (t) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  function place(q, t, from) {
    const [tx, ty] = target(q);
    const [fx, fy, fs] = from;
    const e = easeInOut(t);
    // Quadratic curve: the control point sits off to one side of the straight line.
    const mx = (fx + tx) / 2;
    const my = (fy + ty) / 2;
    const dx = tx - fx;
    const dy = ty - fy;
    const cx = mx - dy * q.bend;
    const cy = my + dx * q.bend;
    const u = 1 - e;
    const x = u * u * fx + 2 * u * e * cx + e * e * tx;
    const y = u * u * fy + 2 * u * e * cy + e * e * ty;
    const s = fs + (1 - fs) * easeOutBack(t);
    const rot = q.spin * Math.pow(1 - t, 2);
    q.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${s.toFixed(3)})`;
    q.el.style.opacity = q.seed ? 1 : Math.min(1, t * 3.5).toFixed(3);
    q.el.style.setProperty('--f', Math.sin(Math.PI * t).toFixed(3)); // in-flight glow
  }

  const scatter = (q) => {
    const R = size * q.dist;
    return [size / 2 + Math.cos(q.angle) * R - cell / 2, size / 2 + Math.sin(q.angle) * R - cell / 2, 0.3];
  };

  let active = -1;
  function frame() {
    const y = scrollY;
    const P = live ? clamp((y - top) / range, 0, 1) * END : END;
    let placed = 0;

    squares.forEach((q) => {
      let t;
      let from;
      if (q.seed) {
        // The headline full stop: flies from the headline, landing as the pin takes hold.
        t = live ? clamp(y / Math.max(1, top), 0, 1) : 1;
        const sr = scene.getBoundingClientRect();
        const pr = seed.getBoundingClientRect();
        const sq = cell * 0.9; // squares scale around their centre, so start centred on the full stop
        from = [pr.left - sr.left + pr.width / 2 - sq / 2, pr.top - sr.top + pr.height / 2 - sq / 2, pr.width / sq];
        if (t < 1 || q.t !== 1) { q.t = -1; } // its start point moves with the page, so keep painting until landed
      } else {
        t = clamp((P - q.start) / (q.end - q.start), 0, 1);
        from = null;
      }
      if (t >= 1) placed++;
      if (t === q.t) return;
      const was = q.t;
      q.t = t;
      if (t <= 0 && !q.seed) {
        q.el.style.opacity = 0;
        q.landed = false;
        return;
      }
      place(q, t, from || scatter(q));
      if (t >= 1 && was < 1 && was >= 0 && !q.landed) {
        q.landed = true;
        q.el.classList.remove('land'); void q.el.offsetWidth; q.el.classList.add('land');
      }
      if (t < 1) q.landed = false;
    });

    const ch = clamp(Math.floor(P), 0, STAGES - 1);
    if (ch !== active) {
      active = ch;
      chaps.forEach((c, i) => c.classList.toggle('on', i === ch));
      count.textContent = `0${ch + 1} / 0${STAGES}`;
    }
    bar.style.transform = `scaleX(${clamp(P / STAGES, 0, 1).toFixed(4)})`;
    placedEl.textContent = placed;
    scene.style.setProperty('--done', clamp((P - (STAGES - 0.35)) / 0.6, 0, 1).toFixed(3));
    scene.classList.toggle('home', P >= STAGES);
    if (live) requestAnimationFrame(frame);
  }

  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  if (document.fonts) document.fonts.ready.then(measure);
  if (live) requestAnimationFrame(frame);
  else frame();
}

/* ---------- the page builds itself, tile by tile ---------- */

function initPageBuild() {
  const blocks = [...document.querySelectorAll('[data-build]')];
  if (!live) { blocks.forEach((b) => b.classList.add('built')); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      buildIn(e.target, +(e.target.dataset.build || 0));
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  // What is on screen at load builds straight away (the hero); the rest builds as it scrolls in.
  blocks.forEach((b) => {
    if (b.getBoundingClientRect().top < innerHeight) buildIn(b, +(b.dataset.build || 0));
    else io.observe(b);
  });
}

/**
 * Covers the block with page-coloured tiles, then lifts them in a diagonal sweep from bottom-left.
 * Each tile flashes a brand colour as it goes, so the block looks assembled square by square.
 */
function buildIn(el, delay = 0) {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) { el.classList.add('built'); return; }
  const dpr = Math.min(2, devicePixelRatio || 1);
  const cv = document.createElement('canvas');
  cv.className = 'build-cover';
  cv.setAttribute('aria-hidden', 'true');
  const pad = 2;
  const w = r.width + pad * 2;
  const h = r.height + pad * 2;
  Object.assign(cv.style, { left: `${r.left + scrollX - pad}px`, top: `${r.top + scrollY - pad}px`, width: `${w}px`, height: `${h}px` });
  cv.width = Math.ceil(w * dpr);
  cv.height = Math.ceil(h * dpr);
  document.body.appendChild(cv);
  el.classList.add('built');

  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  const bg = getComputedStyle(document.body).backgroundColor;
  const T = clamp(Math.round(Math.min(w, h) / 6), 14, 30); // tile size
  const cols = Math.ceil(w / T);
  const rows = Math.ceil(h / T);
  const sweep = Math.min(650, 18 * (cols + rows)); // ms from the first tile to the last
  const dur = 420; // ms per tile
  const tiles = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const d = ((x + (rows - 1 - y)) / (cols + rows - 2 || 1)) * sweep + rand(0, 90);
      tiles.push({ x: x * T, y: y * T, d, col: mix(clamp(x / Math.max(1, cols - 1), 0, 1)) });
    }
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const t0 = performance.now() + delay;
  const step = (now) => {
    const ms = now - t0;
    ctx.clearRect(0, 0, w, h);
    let busy = false;
    for (const t of tiles) {
      const p = (ms - t.d) / dur;
      if (p < 0) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = bg;
        ctx.fillRect(t.x, t.y, T, T);
        busy = true;
      } else if (p < 1) {
        // The tile is revealed; a coloured square pops and shrinks away over it.
        const k = 1 - p;
        const s = T * (0.25 + 0.6 * k);
        ctx.globalAlpha = Math.pow(k, 1.6) * 0.9;
        ctx.fillStyle = t.col;
        ctx.fillRect(t.x + (T - s) / 2, t.y + (T - s) / 2, s, s);
        busy = true;
      }
    }
    ctx.globalAlpha = 1;
    if (busy) requestAnimationFrame(step);
    else cv.remove();
  };
  requestAnimationFrame(step);
  setTimeout(() => cv.remove(), delay + sweep + dur + 1500); // never leave content covered (e.g. a background tab without rAF)
}
