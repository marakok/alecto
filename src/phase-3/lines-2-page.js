import './lines-page.js'; // Lines, minimal
import { prefersReducedMotion } from '../js/palette.js';
import { initMeet } from './meet.js';
import { initWindows } from './windows.js';

/**
 * Phase 3 · Lines 2: the same page as Home 2, with its own header: the grid of tiles (no hover) with the curtain clip
 * showing through a few of them (windows.js).
 */
initWindows({ reduce: prefersReducedMotion() });
initMeet({ reduce: prefersReducedMotion() }); // the AI: four line squares meet, the star lights
