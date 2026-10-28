import './lines-page.js'; // Lines, minimal
import { prefersReducedMotion } from '../js/palette.js';
import { initMeet } from './meet.js';
import { mountCurtain } from './curtain.js';

/**
 * Phase 3 · Home 3 (Option 3, home3.css): the same page as Home 2 and Lines 2, with the curtain made instead of
 * filmed in the header (curtain.js): it sways on its own and moves where the cursor pushes it. The closing section
 * keeps the clip under quiet tiles.
 */
const curtain = document.querySelector('canvas[data-curtain]');
if (curtain) mountCurtain(curtain, { target: curtain.closest('section') });
initMeet({ reduce: prefersReducedMotion() }); // the AI: four line squares meet, the star lights
