import './lines-page.js'; // Lines, minimal
import { prefersReducedMotion } from '../js/palette.js';
import { initMeet } from './meet.js';
import { initRise } from './rise.js';
import { initWindows } from './windows.js';

/**
 * Phase 3 · Lines 2: the same page as Home 2, with its own header: the grid of tiles (no hover) with the curtain clip
 * showing through a few of them (windows.js). Titles rise in on scroll (rise.js).
 */
initWindows({ reduce: prefersReducedMotion() });
initRise({ reduce: prefersReducedMotion() }); // titles rise in, no dot writing (rise.css)
initMeet({ reduce: prefersReducedMotion() }); // the AI: four line squares meet, the star lights
