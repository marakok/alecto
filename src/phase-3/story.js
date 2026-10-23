import { clamp } from '../js/palette.js';
import { writeAt } from '../js/write.js';

/**
 * Phase 3 · Story: the brand story, told by the brand's own elements, one line per chapter, at your own pace.
 * The hero is pinned while you scroll through seven chapters (the lines are in the markup, [data-ch]):
 *
 *  0  Alecto means "never stops."            one square, the dot, alone in the dark
 *  1  The square is data …                   the square multiplies into a field; a few are labelled
 *  2  The lines connect it, step by step.    a hairline draws through the field, square to square
 *  3  AI works quietly in the shadows …      the window-light clip fades in behind the field
 *  4  It reads every square …                a band of light sweeps across; every square it passes is read
 *  5  Our lawyer makes every decision …      two squares come forward: the lawyer and you, one line between
 *  6  Law that keeps you moving.             the dot writes the headline as you scroll; the buttons follow
 *
 * Only one thing happens at a time, and only as you scroll. Reduced motion: the chapters as a plain list.
 */
const NS = 'http://www.w3.org/2000/svg';
const COLS = 9;
const ROWS = 7;
// a few squares carry a label: what the data is (illustrative)
const LABELS = { '1,1': 'Title register', '6,1': 'Searches · 12 Mar', '3,3': 'Lease, p. 46', '7,4': 'Mortgage offer', '1,5': 'ID check', '5,6': 'Completion · 6 Nov' };
// the path the line draws, step by step (col,row), from the first square to the last
const PATH = [[4, 3], [4, 2], [3, 2], [2, 2], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [2, 5], [3, 5], [3, 4], [3, 3], [4, 3], [5, 3], [6, 3], [6, 2], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [6, 4], [6, 5], [5, 5], [5, 6]];

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

export function initStory({ reduce }) {
  const story = document.querySelector('.story');
  if (!story) return;
  const field = story.querySelector('.story-field');
  const lines = [...story.querySelectorAll('[data-ch]')];
  const video = story.querySelector('.story-video');
  const title = story.querySelector('.story-title');
  const words = [...title.querySelectorAll('.w > span')];
  const stop = title.querySelector('.period');
  const duo = story.querySelector('.story-duo');
  const dots = [...story.querySelectorAll('.story-dots li')];
  const N = lines.length;

  if (reduce) { story.classList.add('still'); return; }
  story.classList.add('live');

  // the field: squares on a grid, a path through them, the light band
  let sq = [];
  let path = null;
  let geo = null;
  const build = () => {
    const { width: W, height: H } = field.getBoundingClientRect();
    if (!W || !H) return;
    const pitch = Math.min(W / (COLS + 1), H / (ROWS + 1));
    const s = Math.round(pitch * 0.42);
    const ox = (W - pitch * (COLS - 1)) / 2;
    const oy = (H - pitch * (ROWS - 1)) / 2;
    const at = (c, r) => [ox + c * pitch, oy + r * pitch];
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    let html = '';
    const d = PATH.map(([c, r], i) => `${i ? 'L' : 'M'}${at(c, r).map((v) => v.toFixed(1)).join(' ')}`).join('');
    html += `<path class="sf-path" d="${d}" pathLength="1"/>`;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const [x, y] = at(c, r);
        const k = `${c},${r}`;
        const dist = Math.hypot(c - 4, r - 3);
        html += `<rect class="sf-sq" data-k="${k}" data-d="${dist.toFixed(2)}" x="${(x - s / 2).toFixed(1)}" y="${(y - s / 2).toFixed(1)}" width="${s}" height="${s}" rx="${Math.max(1, s * 0.06).toFixed(1)}"/>`;
        if (LABELS[k]) html += `<text class="sf-label" data-k="${k}" x="${x.toFixed(1)}" y="${(y - s * 0.95).toFixed(1)}" text-anchor="middle">${LABELS[k]}</text>`;
      }
    }
    html += `<rect class="sf-band" x="0" y="0" width="${(pitch * 1.6).toFixed(1)}" height="${H}"/>`;
    svg.innerHTML = `<defs><linearGradient id="sf-band-g" x1="0" x2="1"><stop offset="0" style="stop-color:var(--band)" stop-opacity="0"/><stop offset=".5" style="stop-color:var(--band)" stop-opacity=".35"/><stop offset="1" style="stop-color:var(--band)" stop-opacity="0"/></linearGradient></defs>${html}`;
    field.replaceChildren(svg);
    sq = [...svg.querySelectorAll('.sf-sq')].map((el) => ({ el, d: Number(el.dataset.d), x: Number(el.getAttribute('x')) + s / 2, k: el.dataset.k }));
    path = svg.querySelector('.sf-path');
    geo = { W, H, pitch, band: svg.querySelector('.sf-band'), labels: [...svg.querySelectorAll('.sf-label')], onPath: new Set(PATH.map((p) => p.join(','))) };
    frame();
  };

  let last = -1;
  const frame = () => {
    if (!geo) return;
    const r = story.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    if (Math.abs(p - last) < 0.0005) return;
    last = p;
    const at = p * N; // chapter position, 0 .. N
    const ch = Math.min(N - 1, Math.floor(at));
    const t = at - ch; // within the chapter
    story.style.setProperty('--p', p.toFixed(4));
    lines.forEach((l, i) => l.classList.toggle('on', i === ch));
    dots.forEach((d, i) => d.classList.toggle('on', i <= ch)); // the chapters so far, as squares

    // 0 → 1: the one square becomes many (from the middle out)
    const grow = ch === 0 ? 0 : ch === 1 ? ease(seg(t, 0.05, 0.85)) : 1;
    const maxD = 7.3;
    // 2: the line draws, step by step
    const draw = ch < 2 ? 0 : ch === 2 ? ease(seg(t, 0.05, 0.9)) : 1;
    // 3: the light comes in; 4: it reads every square
    const light = ch < 3 ? 0 : ch === 3 ? ease(seg(t, 0.1, 0.9)) : ch < 5 ? 1 : ch === 5 ? 1 - ease(seg(t, 0, 0.6)) * 0.5 : 0.35;
    const sweep = ch < 4 ? -1 : ch === 4 ? seg(t, 0.05, 0.92) : 2;
    const bandX = -geo.pitch * 2 + sweep * (geo.W + geo.pitch * 2);
    // 5: the field steps back for the two squares; 6: further back for the headline
    const back = ch < 5 ? 0 : ch === 5 ? ease(seg(t, 0, 0.5)) * 0.75 : 0.88;

    sq.forEach((q) => {
      const shown = q.d === 0 ? 1 : clamp((grow * maxD - q.d) * 1.6, 0, 1);
      q.el.style.opacity = (shown * (1 - back)).toFixed(3);
      q.el.classList.toggle('path', draw > 0 && geo.onPath.has(q.k));
      q.el.classList.toggle('read', sweep >= 0 && q.x < bandX + geo.pitch * 0.8);
    });
    geo.labels.forEach((l) => { l.style.opacity = (ch === 1 ? seg(t, 0.55, 0.95) : ch > 1 && ch < 5 ? 1 : 0).toString(); });
    path.style.strokeDashoffset = (1 - draw).toFixed(4);
    path.style.opacity = (1 - back).toFixed(3);
    geo.band.setAttribute('x', bandX.toFixed(1));
    geo.band.style.opacity = sweep >= 0 && sweep <= 1 ? '1' : '0';
    video.style.opacity = (light * 0.7).toFixed(3);
    if (video.paused && light > 0) video.play().catch(() => {});

    // 5: the lawyer and you
    duo.style.setProperty('--k', (ch === 5 ? ease(seg(t, 0.15, 0.7)) : ch === 6 ? 1 - ease(seg(t, 0, 0.4)) : 0).toFixed(3));

    // 6: the dot writes the headline as you scroll
    const write = ch < 6 ? 0 : ease(seg(t, 0.05, 0.75));
    story.classList.toggle('writing', ch === 6);
    if (ch === 6) {
      const sr = stop.getBoundingClientRect();
      const pos = writeAt(words, write, { size: sr.width, end: { x: sr.left, y: sr.top }, below: sr.width * 1.2 * (1 - seg(write, 0.86, 1)) });
      const tr = title.getBoundingClientRect();
      title.style.setProperty('--cx', `${(pos.x - tr.left).toFixed(1)}px`);
      title.style.setProperty('--cy', `${(pos.y - tr.top).toFixed(1)}px`);
      story.classList.toggle('written', write >= 0.999);
      story.classList.toggle('ctas-on', t > 0.8);
    } else {
      words.forEach((w) => w.style.setProperty('--x', '-99999px'));
      story.classList.remove('written', 'ctas-on');
    }
  };

  new ResizeObserver(() => { last = -1; build(); }).observe(field);
  addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });
  addEventListener('resize', () => { last = -1; frame(); });
  video.playbackRate = 1 / 3;
  video.addEventListener('loadedmetadata', () => { video.playbackRate = 1 / 3; });
}
