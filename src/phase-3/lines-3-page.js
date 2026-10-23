import './lines-page.js'; // Lines as it is
import { prefersReducedMotion } from '../js/palette.js';
import { initLines3 } from './lines3.js';

/**
 * Phase 3 · Lines 3: Lines with one rule. Squares are people and your move, the star appears only where they meet:
 * that's the AI (lines3.js, lines3.css). No clips: the star is the only thing that glows.
 */
initLines3({ reduce: prefersReducedMotion() });
