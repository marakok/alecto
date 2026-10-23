import './icons.js'; // first: the icon sprite has to be in the page before anything uses it
import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { prefersReducedMotion } from '../js/palette.js';
import { initRadius } from '../phase-2/concept-2/radius.js';
import { initReveal } from '../phase-2/concept-2/reveal.js';
import { initFront } from './front.js';
import { initJourney } from './journey.js';
import { initLight } from './light.js';
import { initStory } from './story.js';
import { initSwitcher } from './switcher.js';
import { initThemeVideos } from './theme-video.js';
import { initWords } from './words.js';
import { initStops } from './stops.js';
import { initRise } from './rise.js';

/**
 * Phase 3 · Story: the brand story told by the brand's elements, one line per chapter, at your own pace
 * (story.js, story.css). No page load and no travelling square: the journey's cards pin and swap as on the
 * other pages (journey.js), its drawings keeping their own squares.
 */
const reduce = prefersReducedMotion();
initRadius();
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false });
initStops(); // every title ends on the purple square
initReveal({ reduce });
initSwitcher();
initThemeVideos(); // the white clip in light mode, the black one in dark mode
initRise({ reduce }); // titles rise in word by word; the full stop lands last
initStory({ reduce });
initJourney({ reduce });
initLight({ reduce });
initWords({ reduce });
initFront({ reduce }); // the front: what the client sees, not the lawyer's platform
