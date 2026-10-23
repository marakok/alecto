/**
 * Phase 3 · Lines 3: one rule. Squares are people and your move; the star only appears where squares meet, and
 * that is where the AI works. Only the star is periwinkle, and only the star glows.
 *
 *  - [data-grid][data-meet] (lines.js draws it): four tiles start apart and slide together once drawn; the space
 *    between their corners lights up as the AI star.
 *  - [data-work] (the hero): then the star works. A small square of data runs from it along the line between two
 *    tiles, and that tile quietly fills with what got done (.l3-status), clockwise, one at a time, without end.
 * Reduced motion: the tiles met, the star lit, the first four results shown.
 */
const SETS = [
  [['02:14', 'Searches ordered'], ['02:31', 'Lease checked'], ['06:05', 'Enquiry chased'], ['07:40', 'Funds on track']],
  [['01:52', 'Title register read'], ['03:18', 'Mortgage offer matched'], ['05:46', 'Seller’s reply filed'], ['08:02', 'Chain in step']],
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const parse = (k) => k.split(',').map(Number);

export function initLines3({ reduce }) {
  document.querySelectorAll('[data-grid][data-meet]').forEach((el) => meet(el, reduce));
}

function meet(el, reduce) {
  const cells = el.dataset.tiles.trim().split(/\s+/).map(parse);
  const cx = Math.min(...cells.map(([c]) => c)) + 1; // the crossing the four tiles share
  const ry = Math.min(...cells.map(([, r]) => r)) + 1;
  // clockwise from the top left: the line each result travels along, and the tile it fills
  const routes = [[0, -1, [cx - 1, ry - 1]], [1, 0, [cx, ry - 1]], [0, 1, [cx, ry]], [-1, 0, [cx - 1, ry]]];
  const hero = el.closest('section');
  const box = el.dataset.work !== undefined ? hero.querySelector('.l3-status') : null;
  const labels = box ? routes.map(() => box.appendChild(document.createElement('p'))) : [];
  const done = new Set(); // the tiles showing a result

  // lines.js redraws the svg on resize: dress it again each time
  const dress = () => {
    const g = el._geo;
    if (!g) return;
    el.style.setProperty('--apart', `${Math.round(g.C * 0.42)}px`);
    el.querySelectorAll('.tile[data-cell]').forEach((t) => {
      const [c, r] = parse(t.dataset.cell);
      t.style.setProperty('--dx', c < cx ? -1 : 1);
      t.style.setProperty('--dy', r < ry ? -1 : 1);
      t.classList.toggle('done', done.has(t.dataset.cell));
    });
    el.querySelector(`.star[data-at="${cx},${ry}"]`)?.classList.add('ai');
    if (!box) return;
    const gr = el.getBoundingClientRect();
    const hr = hero.getBoundingClientRect();
    const pad = Math.round(g.C * 0.12);
    routes.forEach(([, , [c, r]], i) => {
      const s = labels[i].style;
      s.left = `${gr.left - hr.left + g.x0 + c * g.C + pad}px`;
      s.top = `${gr.top - hr.top + g.y0 + r * g.C + pad}px`;
      s.width = `${g.C - pad * 2}px`;
    });
  };
  new MutationObserver(dress).observe(el, { childList: true });
  addEventListener('resize', () => requestAnimationFrame(dress));
  dress();

  const show = (set, i, on) => {
    const [time, what] = SETS[set][i];
    if (on) labels[i].innerHTML = `<span class="l3-by mono"><svg class="icn" aria-hidden="true"><use href="#i-spark"/></svg>AI · ${time}</span><b>${what}</b>`;
    labels[i].classList.toggle('on', on);
    const k = routes[i][2].join(',');
    if (on) done.add(k); else done.delete(k);
    el.querySelector(`.tile[data-cell="${k}"]`)?.classList.toggle('done', on);
  };

  if (reduce) {
    el.classList.add('met', 'lit');
    if (box) routes.forEach((_, i) => show(0, i, true));
    return;
  }

  // a small square of data runs from the star along the line, then the tile fills
  const send = (i) => new Promise((res) => {
    const g = el._geo;
    const svg = el.querySelector('svg');
    if (!g || !svg) { res(); return; }
    const [dx, dy] = routes[i];
    const x = g.x0 + cx * g.C;
    const y = g.y0 + ry * g.C;
    const bit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bit.setAttribute('class', 'l3-bit');
    bit.setAttribute('width', '8');
    bit.setAttribute('height', '8');
    bit.setAttribute('rx', '1.5');
    svg.append(bit);
    const d = g.C * 0.55;
    const at = (k) => `translate(${x - 4 + dx * d * k}px, ${y - 4 + dy * d * k}px)`;
    const a = bit.animate([{ transform: at(0), opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { transform: at(1), opacity: 0 }], { duration: 1500, easing: 'cubic-bezier(.45, 0, .2, 1)' });
    a.onfinish = () => { bit.remove(); res(); };
  });

  const work = async () => {
    for (let set = 0; ; set = (set + 1) % SETS.length) {
      for (let i = 0; i < routes.length; i++) {
        await send(i);
        show(set, i, true);
        await sleep(1300);
      }
      await sleep(6000); // a moment with everything done
      routes.forEach((_, i) => show(set, i, false));
      await sleep(1600);
    }
  };

  // once lines.js has drawn the grid: the tiles meet, the star lights, and (in the hero) it starts working
  const start = async () => {
    await sleep(1500);
    el.classList.add('met');
    await sleep(1700);
    el.classList.add('lit');
    if (box) { await sleep(1400); work(); }
  };
  if (el.classList.contains('drawn')) start();
  else {
    const mo = new MutationObserver(() => {
      if (!el.classList.contains('drawn')) return;
      mo.disconnect();
      start();
    });
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
  }
}
