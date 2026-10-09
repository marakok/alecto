import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { clamp, prefersReducedMotion } from '../js/palette.js';

/**
 * Concept 2: One square, one journey.
 * A single fixed square (the actor) travels between anchor elements as you scroll:
 * headline full stop → checkbox → reading marker → seal → key → lit window → logo dot.
 * Anchors are measured live every frame, so the actor stays glued to them while they move.
 */

const reduce = prefersReducedMotion();
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false }); // the square cursor would compete with the one square

const live = document.documentElement.classList.contains('jl') && !reduce;
if (live) initJourney();

function initJourney() {
  const actor = document.getElementById('actor');
  const journey = document.getElementById('journey');
  const texts = [...journey.querySelectorAll('.ctext')];
  const arts = [...journey.querySelectorAll('.art')];
  const count = document.getElementById('jcount');
  const bar = document.getElementById('jbar');
  const N = texts.length;
  const pad = (n) => String(n).padStart(2, '0');

  // Line drawings: normalise every stroke so it can draw itself with one dash.
  journey.querySelectorAll('.ink, .faint').forEach((el) => el.setAttribute('pathLength', '1'));

  // Keyframes: an anchor and where it sits on the journey, in chapters (0.5 = middle of chapter 1).
  const q = (k) => journey.querySelector(`[data-k="${k}"]`);
  const KEYS = [
    { el: document.getElementById('k0'), u: null, spin: 0 }, // hero headline, at scroll 0
    { el: q('instruct'), u: 0.45, spin: 1 },
    { el: q('read1'), u: 1.22, spin: 1 },
    { el: q('read2'), u: 1.5, spin: 0 },
    { el: q('read3'), u: 1.78, spin: 0 },
    { el: q('seal'), u: 2.5, spin: 1 },
    { el: q('key'), u: 3.5, spin: 1 },
    { el: q('window'), u: 4.5, spin: 1 },
    { el: q('logo'), u: 5.5, spin: 1 },
  ];
  const DWELL = 0.14; // fraction of a chapter the square rests on each anchor

  let J = 0;
  let seg = 1;
  const measure = () => {
    J = journey.getBoundingClientRect().top + scrollY;
    seg = (journey.offsetHeight - innerHeight) / N;
  };
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);

  const S = (k) => (KEYS[k].u === null ? 0 : J + KEYS[k].u * seg);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const rectOf = (el) => el.getBoundingClientRect();

  // "Reached" side effects: ticks, read lines, the lit window.
  const ticks = [...journey.querySelectorAll('.tick')];
  const readLines = [...journey.querySelectorAll('.rl')];
  const homeArt = journey.querySelector('[data-art="home"]');

  let active = -1;
  const frame = () => {
    const y = scrollY;
    const pj = (y - J) / seg; // journey progress in chapters

    // Which chapter is on stage.
    const ch = clamp(Math.floor(pj), 0, N - 1);
    if (ch !== active) {
      active = ch;
      texts.forEach((t, i) => t.classList.toggle('on', i === ch));
      arts.forEach((a, i) => a.classList.toggle('on', i === ch));
      count.textContent = `${pad(ch + 1)} / ${pad(N)}`;
    }
    bar.style.transform = `scaleX(${clamp(pj / N, 0, 1)})`;

    // Side effects tied to where the square is.
    ticks.forEach((t) => t.classList.toggle('lit', pj >= Number(t.dataset.tick)));
    readLines.forEach((l) => {
      const k = KEYS.findIndex((key) => key.el?.dataset.k === l.dataset.read);
      l.classList.toggle('lit', y >= S(k) + seg * 0.05);
    });
    homeArt.classList.toggle('hit-window', y >= S(7) - seg * 0.08);

    // Where is the square: between keyframe k and k+1.
    let k = 0;
    while (k < KEYS.length - 1 && y >= S(k + 1)) k++;
    const a = rectOf(KEYS[k].el);
    let x;
    let top;
    let size;
    let rot = 0;
    if (k === KEYS.length - 1) {
      ({ left: x, top } = a);
      size = a.width;
    } else {
      const from = S(k);
      const to = S(k + 1);
      const d = Math.min(DWELL * seg, (to - from) * 0.3);
      const t = ease(clamp((y - from - d) / (to - from - 2 * d), 0, 1));
      const b = rectOf(KEYS[k + 1].el);
      x = a.left + (b.left - a.left) * t;
      top = a.top + (b.top - a.top) * t - Math.sin(Math.PI * t) * Math.min(80, Math.abs(b.left - a.left) * 0.25);
      size = a.width + (b.width - a.width) * t;
      rot = KEYS[k + 1].spin * 90 * t;
    }
    actor.style.width = `${size}px`;
    actor.style.height = `${size}px`;
    actor.style.transform = `translate(${x}px, ${top}px) rotate(${rot}deg)`;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
