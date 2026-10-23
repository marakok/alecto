import './lines-page.js'; // Lines, minimal
import { prefersReducedMotion } from '../js/palette.js';
import { initRise } from './rise.js';
import { initWindows } from './windows.js';

/**
 * Phase 3 · Lines 2: Lines, with the hero's clip (the sheer curtain) shown only through a few of the grid's tiles
 * (windows.js), and titles that rise in on scroll (rise.js).
 */
initWindows({ reduce: prefersReducedMotion() });
initRise({ reduce: prefersReducedMotion() }); // titles rise in, no dot writing (rise.css)
