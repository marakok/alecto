import './icons.js'; // first: the icon sprite has to be in the page before anything uses it
import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { prefersReducedMotion } from '../js/palette.js';
import { initRadius } from '../phase-2/concept-2/radius.js';
import { initReveal } from '../phase-2/concept-2/reveal.js';
import { initFront } from './front.js';
import { initJourney } from './journey.js';
import { initLight } from './light.js';
import { initLines } from './lines.js';
import { initLines3 } from './lines3.js';
import { initRise } from './rise.js';
import { initSwitcher } from './switcher.js';
import { initThemeVideos } from './theme-video.js';
import { initWords } from './words.js';

/**
 * Phase 3 · Home 2 (home2.css): Home, to try things on. The titles rise in as you scroll instead of being written by
 * the dot (rise.js), and the hero plays a clip: a sheer curtain with the sun behind it. The rest is Home.
 */
const reduce = prefersReducedMotion();
initRadius();
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false });
initReveal({ reduce });
initSwitcher();
initThemeVideos(); // the hero's clip, drawn smoothly when slowed (smooth-video.js)
initRise({ reduce });
initLight({ reduce });
initJourney({ reduce });
initLines({ reduce });
initLines3({ reduce });
initFront({ reduce });
initWords({ reduce });
