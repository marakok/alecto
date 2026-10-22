import './icons.js'; // first: the icon sprite has to be in the page before anything uses it
import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { prefersReducedMotion } from '../js/palette.js';
import { initRadius } from '../phase-2/concept-2/radius.js';
import { initReveal } from '../phase-2/concept-2/reveal.js';
import { initFront } from './front.js';
import { initHeadings } from './headings.js';
import { initJourney } from './journey.js';
import { initMark } from './mark.js';
import { initSwitcher } from './switcher.js';
import { initWords } from './words.js';

/**
 * Phase 3 · Mark: the logo's own geometry, the dot, as the whole visual language (mark.js, mark.css): a giant
 * cropped corner that zooms out to "alecto.", four squares that meet around the AI star, figures on solid squares.
 * Then the front blocks, the journey, the team, reviews and the evening, as on Story.
 */
const reduce = prefersReducedMotion();
initRadius();
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false });
initReveal({ reduce });
initSwitcher();
initMark({ reduce });
initJourney({ reduce });
initWords({ reduce });
initHeadings({ reduce });
initFront({ reduce });
