import './lines-page.js'; // Lines, minimal
import { prefersReducedMotion } from '../js/palette.js';
import { initLines3 } from './lines3.js';
import { initStory } from './story.js';

/**
 * Phase 3 · Lines 3: Lines with one rule. Squares are people and your move, the star appears only where they meet:
 * that's the AI (lines3.js, lines3.css). No clips: the star is the only thing that glows.
 */
initLines3({ reduce: prefersReducedMotion() });
initStory({ reduce: prefersReducedMotion() }); // the brand story, after the hero
