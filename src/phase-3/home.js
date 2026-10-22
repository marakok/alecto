import './icons.js'; // first: the icon sprite has to be in the page before anything uses it
import '../phase-2/concept-2/main.js'; // 2a as it is: the load, the one square's journey, reveals
import { prefersReducedMotion } from '../js/palette.js';
import { initAlloc } from './demo.js';
import { initLight } from './light.js';
import { initThread } from './thread.js';
import { initHeadings } from './headings.js';
import { initWords } from './words.js';
import { initSwitcher } from './switcher.js';
import { initThemeVideos } from './theme-video.js';

/**
 * Phase 3 · Home: 2a with light through a window in place of the photo (light.js), lighter type (three options on the
 * switcher), icons instead of most squares, statements that fill in as you scroll (words.js), and a section on the
 * platform behind the people, with the living case allocation demo.
 */
const reduce = prefersReducedMotion();
initSwitcher();
initThemeVideos(); // the hero's clip: white in light mode, black in dark mode
initLight({ reduce });
initThread({ reduce });
initWords({ reduce });
initHeadings({ reduce });
initAlloc({ reduce });
