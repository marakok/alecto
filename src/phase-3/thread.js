import { clamp } from '../js/palette.js';
import { afterIntro } from '../phase-2/concept-2/reveal.js';

/**
 * The thread: the square as a line. The light on the wall is the calm surface; underneath it, Alecto's AI never
 * stops working (Alēktō: unceasing). So from the full stop of the headline a fine line runs through the whole
 * page, past the light, down the left margin, to the evening at the end, and small squares of data keep flowing
 * along it, day and night.
 *
 *  - The line draws itself as you read: it is drawn down to a little below the middle of the screen.
 *  - Squares of data travel along the drawn part at a calm pace. When one passes a station, the station blinks.
 *  - Stations ([data-thread="label one|label two|…"]): a node on the line and a label beside it, in the margin,
 *    showing what the AI just did (the first label; they take turns only with data-thread-swap).
 *  - The hero's status line ([data-ticker]) cycles through what it's working on right now.
 * Wide screens only (the line lives in the margin). Reduced motion: the whole line, no data, first labels.
 */
const SVG = 'http://www.w3.org/2000/svg';
const R = 28; // corner radius
const SPEED = 38; // px per second: slow
const GAP = 900; // px between two squares of data: a few, not a stream

export function initThread({ reduce }) {
  const main = document.getElementById('main');
  const start = document.getElementById('k0');
  const end = document.querySelector('[data-thread-end]');
  const stations = [...document.querySelectorAll('[data-thread]')];
  ticker(reduce);
  if (!main || !start || !end) return;

  const svg = document.createElementNS(SVG, 'svg');
  svg.classList.add('thread');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<path class="th-ghost"/><path class="th-line"/><g class="th-nodes"></g><g class="th-data"></g>';
  main.prepend(svg);
  const ghost = svg.querySelector('.th-ghost');
  const line = svg.querySelector('.th-line');
  const nodesG = svg.querySelector('.th-nodes');
  const dataG = svg.querySelector('.th-data');

  // labels live in HTML (crisper text), one per station
  const labels = stations.map((s) => {
    const el = document.createElement('p');
    el.className = 'th-label mono';
    el.setAttribute('aria-hidden', 'true');
    main.append(el);
    return { el, items: s.dataset.thread.split('|'), i: 0, station: s };
  });

  let len = 0;
  let samples = []; // [length, y] along the path, to find how far to draw
  let nodes = []; // { len, el, label }
  let on = false;

  const layout = () => {
    on = innerWidth >= 900;
    svg.style.display = on ? '' : 'none';
    labels.forEach((l) => { l.el.style.display = on ? '' : 'none'; });
    if (!on) return;
    const m = main.getBoundingClientRect();
    const rel = (r) => ({ x: r.left - m.left, y: r.top - m.top, w: r.width, h: r.height });
    svg.setAttribute('width', m.width);
    svg.setAttribute('height', main.scrollHeight);
    svg.setAttribute('viewBox', `0 0 ${m.width} ${main.scrollHeight}`);

    const wrapPad = Math.max(0, (m.width - 1440) / 2) + clamp(innerWidth * 0.0833, 16, 120);
    const gx = Math.round(wrapPad / 2); // the margin
    const p = rel(start.getBoundingClientRect());
    const hero = rel(start.closest('section').getBoundingClientRect());
    const copy = rel(start.closest('.hero-copy').getBoundingClientRect());
    const e = rel(end.getBoundingClientRect());
    const x0 = p.x + p.w + 10;
    const y0 = p.y + p.h / 2;
    const x1 = Math.round(copy.x + copy.w + 48); // between the words and the light
    const yh = hero.y + hero.h - 64;
    const ye = e.y + e.h / 2;

    // out of the full stop, down past the light, into the margin, down the page, into the evening
    const d = [
      `M${x0} ${y0}`, `H${x1 - R}`, `Q${x1} ${y0} ${x1} ${y0 + R}`,
      `V${yh - R}`, `Q${x1} ${yh} ${x1 - R} ${yh}`,
      `H${gx + R}`, `Q${gx} ${yh} ${gx} ${yh + R}`,
      `V${ye - R}`, `Q${gx} ${ye} ${gx + R} ${ye}`, `H${e.x - 12}`,
    ].join(' ');
    ghost.setAttribute('d', d);
    line.setAttribute('d', d);
    len = line.getTotalLength();
    samples = [];
    for (let s = 0; s <= len; s += 16) samples.push([s, line.getPointAtLength(s).y]);
    line.style.strokeDasharray = `${len} ${len}`;

    // stations: a node where the line passes the top of each one
    nodesG.innerHTML = '';
    nodes = labels.map((l) => {
      const r = rel(l.station.getBoundingClientRect());
      const y = r.y + 36;
      const n = document.createElementNS(SVG, 'rect');
      n.setAttribute('class', 'th-node');
      n.setAttribute('x', gx - 4);
      n.setAttribute('y', y - 4);
      n.setAttribute('width', 8);
      n.setAttribute('height', 8);
      n.setAttribute('rx', 0.5);
      nodesG.append(n);
      l.el.style.left = `${gx + 12}px`;
      l.el.style.top = `${y + 16}px`;
      const at = samples.find(([, sy]) => sy >= y)?.[0] ?? len;
      return { len: at, el: n, label: l };
    });
    draw();
  };

  // draw the line down to a little below the middle of the screen
  let drawn = 0;
  const draw = () => {
    if (!on) return;
    const m = main.getBoundingClientRect();
    const target = (reduce ? Infinity : innerHeight * 0.72 - m.top);
    let L = 0;
    for (const [s, y] of samples) { if (y > target) break; L = s; }
    drawn = Math.max(drawn, reduce ? len : L);
    line.style.strokeDashoffset = `${len - drawn}`;
    nodes.forEach((n) => {
      const lit = drawn >= n.len;
      n.el.classList.toggle('on', lit);
      n.label.el.classList.toggle('on', lit);
    });
  };
  addEventListener('scroll', () => requestAnimationFrame(draw), { passive: true });

  // the labels take turns
  const say = (l) => { l.el.textContent = l.items[l.i % l.items.length]; };
  labels.forEach(say);
  if (!reduce && labels.some((l) => l.station.hasAttribute('data-thread-swap'))) { // labels stay put unless asked
    setInterval(() => labels.forEach((l) => {
      if (!l.el.classList.contains('on')) return;
      l.el.classList.add('swap');
      setTimeout(() => { l.i++; say(l); l.el.classList.remove('swap'); }, 450);
    }), 5200);
  }

  layout();
  addEventListener('resize', layout);
  addEventListener('load', layout);
  new ResizeObserver(() => requestAnimationFrame(layout)).observe(main);
  if (reduce) return;

  // data: small squares flowing along the drawn part, never stopping
  const data = [];
  afterIntro(() => {
    let t0 = performance.now();
    const frame = (now) => {
      if (on && len) {
        const need = Math.ceil(len / GAP);
        while (data.length < need) {
          const r = document.createElementNS(SVG, 'rect');
          r.setAttribute('class', 'th-bit');
          r.setAttribute('width', 5);
          r.setAttribute('height', 5);
          dataG.append(r);
          data.push(r);
        }
        const head = ((now - t0) / 1000) * SPEED;
        data.forEach((r, i) => {
          const s = (head + i * GAP) % (need * GAP);
          if (s > drawn || i >= need) { r.style.opacity = '0'; return; }
          const pt = line.getPointAtLength(s);
          r.setAttribute('x', (pt.x - 2.5).toFixed(1));
          r.setAttribute('y', (pt.y - 2.5).toFixed(1));
          r.style.opacity = String(clamp(Math.min(s, drawn - s) / 80, 0, 1)); // fade at the start and the drawn end
          nodes.forEach((n) => { if (Math.abs(s - n.len) < 3) { n.el.classList.remove('ping'); void n.el.getBBox(); n.el.classList.add('ping'); } });
        });
      }
      requestAnimationFrame(frame);
    };
    t0 = performance.now();
    requestAnimationFrame(frame);
  });
}

// the hero's status line: what the AI is working on right now
function ticker(reduce) {
  const el = document.querySelector('[data-ticker]');
  if (!el) return;
  const items = el.dataset.ticker.split('|');
  let i = 0;
  el.textContent = items[0];
  if (reduce) return;
  setInterval(() => {
    el.classList.add('swap');
    setTimeout(() => { i = (i + 1) % items.length; el.textContent = items[i]; el.classList.remove('swap'); }, 450);
  }, 4200);
}
