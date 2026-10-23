import './icons.js'; // first: the icon sprite has to be in the page before anything uses it
import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { prefersReducedMotion } from '../js/palette.js';
import { initRadius } from '../phase-2/concept-2/radius.js';
import { initReveal } from '../phase-2/concept-2/reveal.js';
import { initFront } from './front.js';
import { initHeadings } from './headings.js';
import { initLines } from './lines.js';
import { initLines3 } from './lines3.js';
import { initPrototype } from './prototype.js';
import { initSwitcher } from './switcher.js';
import { initWords } from './words.js';

/**
 * Phase 3 · Prototype: everything from the client's own prototype (its sections, copy and order), built in the
 * Lines 3 language (prototype.js, prototype.css): the grid, the purple dot, and the star only where squares meet.
 */
const reduce = prefersReducedMotion();
initRadius();
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false });
initReveal({ reduce });
initSwitcher();
initLines({ reduce });
initLines3({ reduce });
initPrototype({ reduce });
initWords({ reduce });
initHeadings({ reduce });
initFront({ reduce });
