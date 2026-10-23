import './lines-page.js'; // Lines as it is
import { prefersReducedMotion } from '../js/palette.js';
import { initWindows } from './windows.js';

/**
 * Phase 3 · Lines 2: Lines, with the hero's clip shown only through a few of the grid's tiles (windows.js).
 */
initWindows({ reduce: prefersReducedMotion() });
