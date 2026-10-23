import './icons.js'; // first: the icon sprite has to be in the page before anything uses it
import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { prefersReducedMotion } from '../js/palette.js';
import { initRadius } from '../phase-2/concept-2/radius.js';
import { initReveal } from '../phase-2/concept-2/reveal.js';
import { initFront } from './front.js';
import { initJourney } from './journey.js';
import { initMark } from './mark.js';
import { initSwitcher } from './switcher.js';
import { initThemeVideos } from './theme-video.js';
import { initWords } from './words.js';
import { initStops } from './stops.js';
import { initRise } from './rise.js';

/**
 * Phase 3 · Mark: the logo's own geometry, the dot, as the whole visual language (mark.js, mark.css): a giant
 * cropped corner that zooms out to "alecto.", four squares that meet around the AI star, figures on solid squares.
 * Then the front blocks, the journey, the team, reviews and the evening, as on Story.
 */
const reduce = prefersReducedMotion();
initRadius();
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false });
initStops(); // every title ends on the purple square
initRise({ reduce }); // titles rise in word by word; the full stop lands last
initReveal({ reduce });
initSwitcher();
initThemeVideos(); // the light inside the corner: white clip in light mode, black in dark
initMark({ reduce });
initJourney({ reduce });
initWords({ reduce });
initFront({ reduce });
