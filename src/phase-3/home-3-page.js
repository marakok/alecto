import './lines-page.js'; // Lines, minimal
import { prefersReducedMotion } from '../js/palette.js';
import { initMeet } from './meet.js';

/**
 * Phase 3 · Home 3 (Option 3, home3.css): the same page as Home 2 and Lines 2, with the curtain clip full in the
 * header and the closing section, and the grid of tiles laid quietly over it.
 */
initMeet({ reduce: prefersReducedMotion() }); // the AI: four line squares meet, the star lights
