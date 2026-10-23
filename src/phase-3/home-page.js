import './icons.js'; // first: the icon sprite has to be in the page before anything uses it
import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { prefersReducedMotion } from '../js/palette.js';
import { initRadius } from '../phase-2/concept-2/radius.js';
import { initReveal } from '../phase-2/concept-2/reveal.js';
import { initFront } from './front.js';
import { initHeadings } from './headings.js';
import { initJourney } from './journey.js';
import { initLight } from './light.js';
import { initMeet } from './meet.js';
import { initSwitcher } from './switcher.js';
import { initThemeVideos } from './theme-video.js';
import { initWords } from './words.js';
import { initStops } from './stops.js';

/**
 * Phase 3 · Home, minimal (minimal.css): a calm hero (the light with the leaves, moving), how it works (the six steps,
 * each with the person doing it), the figures in the midday sun, the AI where our people meet (meet.js), Proactive on
 * ink, reviews, FAQ and the evening. No page load, no travelling square and no line through the page.
 */
const reduce = prefersReducedMotion();
initRadius();
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false });
initStops(); // every title ends on the purple square
initReveal({ reduce });
initSwitcher();
initThemeVideos(); // the curtains in the closing section
initLight({ reduce });
initJourney({ reduce });
initMeet({ reduce }); // the AI: four line squares meet, the star lights
initFront({ reduce });
initWords({ reduce });
initHeadings({ reduce });
