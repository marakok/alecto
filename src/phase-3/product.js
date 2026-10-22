import './icons.js'; // first: the icon sprite has to be in the page before anything uses it
import { initApps } from './app.js';
import '../phase-2/concept-2/page.js'; // the page load: the square lands as the headline's full stop
import { prefersReducedMotion } from '../js/palette.js';
import { initAlloc } from './demo.js';
import { initFeatures } from './features.js';
import { initSwitcher } from './switcher.js';
import { initHeadings } from './headings.js';
import { initWords } from './words.js';

/**
 * Phase 3 · Platform: the product page. Product screens (app.js), the feature tabs (features.js), the living
 * case allocation demo (demo.js), how the AI and the people split the work, and trust.
 */
const reduce = prefersReducedMotion();
initSwitcher();
initApps();
initFeatures({ reduce });
initAlloc({ reduce });
initWords({ reduce });
initHeadings({ reduce });
