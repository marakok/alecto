import './icons.js'; // first: the icon sprite has to be in the page before anything uses it
import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { prefersReducedMotion } from '../js/palette.js';
import { initRadius } from '../phase-2/concept-2/radius.js';
import { initReveal } from '../phase-2/concept-2/reveal.js';
import { initFront } from './front.js';
import { initHeadings } from './headings.js';
import { initJourney } from './journey.js';
import { initLight } from './light.js';
import { initLines } from './lines.js';
import { initLines3 } from './lines3.js';
import { initSwitcher } from './switcher.js';
import { initWords } from './words.js';

/**
 * Phase 3 · Home, minimal (minimal.css): a calm hero (the light with the leaves, moving), how it works (the six steps,
 * each with the person doing it), the figures in the midday sun, the AI as a story (the tiles and the star,
 * lines3.js), Proactive on ink, reviews, FAQ and the evening. No page load, no travelling square and no line through the page.
 */
const reduce = prefersReducedMotion();
initRadius();
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false });
initReveal({ reduce });
initSwitcher();
initLight({ reduce });
initJourney({ reduce });
initLines({ reduce });
initLines3({ reduce });
initFront({ reduce });
initWords({ reduce });
initHeadings({ reduce });
