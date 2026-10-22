import { clamp } from '../js/palette.js';

/**
 * The six-step journey as on the other pages, without the travelling square: the step cards pin in place and
 * swap one by one as you scroll, the line drawings draw themselves, the ticks, read lines and the lit window
 * come on as you pass them, and the 01 / 06 counter and bar run along. The drawings keep their own squares
 * (story.css). Needs html.jl, set in <head> when motion is allowed. Used by Phase 3 · Story.
 */
export function initJourney({ reduce }) {
  const journey = document.getElementById('journey');
  const track = document.getElementById('track');
  if (reduce || !journey || !track || !document.documentElement.classList.contains('jl')) return;
  const steps = [...journey.querySelectorAll('.step')];
  const arts = [...journey.querySelectorAll('.art')];
  const count = document.getElementById('jcount');
  const bar = document.getElementById('jbar');
  const N = steps.length;
  const pad = (n) => String(n).padStart(2, '0');
  journey.querySelectorAll('.ink, .faint').forEach((el) => el.setAttribute('pathLength', '1'));

  // where things are reached, in steps (0.5 = the middle of step 1), as on the other pages
  const READ = { read1: 1.22, read2: 1.5, read3: 1.78 };
  const WINDOW = 4.42;
  const ticks = [...journey.querySelectorAll('.tick')];
  const readLines = [...journey.querySelectorAll('.rl')];
  const homeArt = journey.querySelector('[data-art="home"]');

  let J = 0;
  let seg = 1;
  const measure = () => {
    J = track.getBoundingClientRect().top + scrollY;
    seg = (track.offsetHeight - innerHeight) / N;
  };
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  new ResizeObserver(measure).observe(document.body);

  let active = -1;
  const frame = () => {
    const pj = (scrollY - J) / seg;
    const ch = clamp(Math.floor(pj), 0, N - 1);
    if (ch !== active) {
      active = ch;
      steps.forEach((s, i) => s.classList.toggle('on', i === ch));
      arts.forEach((a, i) => a.classList.toggle('on', i === ch));
      count.textContent = `${pad(ch + 1)} / ${pad(N)}`;
    }
    bar.style.transform = `scaleX(${clamp(pj / N, 0, 1)})`;
    ticks.forEach((t) => t.classList.toggle('lit', pj >= Number(t.dataset.tick)));
    readLines.forEach((l) => l.classList.toggle('lit', pj >= (READ[l.dataset.read] ?? 99) + 0.05));
    homeArt?.classList.toggle('hit-window', pj >= WINDOW);
  };
  addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });
  frame();
}
