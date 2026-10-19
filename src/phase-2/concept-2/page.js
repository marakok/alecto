import { initTheme } from '../../js/theme.js';
import { initMotion } from '../../js/motion.js';
import { prefersReducedMotion } from '../../js/palette.js';
import { keepFlavor } from './flavor.js';
import { prepareHero } from './hero-intro.js';
import { createIntro } from './loader.js';
import { initRadius } from './radius.js';

/**
 * Phase 2 · Concept 2, the pages around the homepage (company, careers).
 * Same page load as the homepage (?l=, or the flavor's own): the square starts in the middle of the screen
 * and lands as the full stop of the headline. There is no journey below, so it stays there.
 */

const root = document.documentElement;
keepFlavor();
initRadius();

const reduce = prefersReducedMotion();
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false }); // the square cursor would compete with the one square
const prepared = prepareHero({ reduce });

if (root.classList.contains('jl') && !reduce) land();

function land() {
  const actor = document.getElementById('actor');
  const stop = document.getElementById('k0');
  actor.classList.add('intro'); // above the load screen until it lands
  const intro = createIntro({
    mode: root.dataset.l, prepared, navdot: document.getElementById('navdot'),
    onDone: () => root.classList.add('landed'), // the headline shows its own full stop from here on
  });

  const frame = () => {
    if (scrollY > innerHeight * 0.4) intro.finish(); // scrolled away mid-intro
    if (intro.done) return;
    const r = intro.place(performance.now(), stop.getBoundingClientRect());
    actor.style.width = `${r.size}px`;
    actor.style.height = `${r.size}px`;
    actor.style.transform = `translate(${r.x}px, ${r.y}px) rotate(${r.rot}deg)`;
    actor.style.background = r.ink ? `color-mix(in srgb, var(--fg) ${Math.round(r.ink * 100)}%, var(--accent))` : '';
    actor.classList.add('placed');
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
