import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { prefersReducedMotion } from '../js/palette.js';
import { initPageBuild, initHouse } from '../js/build.js';

/**
 * Concept 3: Square by square.
 * No loader: the page builds itself. Every block appears tile by tile as it enters the screen,
 * and in the pinned "build" section ~170 squares fly in from all sides to build a house, one stage
 * at a time. The headline full stop is the first square: it lifts off and becomes the foundation.
 * Everything is scrubbed by scroll, so scrolling back takes the house apart again.
 */

const reduce = prefersReducedMotion();
const root = document.documentElement;
root.classList.add('pbjs'); // JS is running: the CSS safety reveal can stand down
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false, reveals: false });

const live = root.classList.contains('bl') && !reduce;
// Wait briefly for the web fonts, so the covers match the final text size.
Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 400))]).then(() => initPageBuild({ live }));
initHouse({ live });
