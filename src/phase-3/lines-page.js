import './icons.js'; // first: the icon sprite has to be in the page before anything uses it
import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { prefersReducedMotion } from '../js/palette.js';
import { initRadius } from '../phase-2/concept-2/radius.js';
import { initReveal } from '../phase-2/concept-2/reveal.js';
import { initFront } from './front.js';
import { initJourney } from './journey.js';
import { initLight } from './light.js';
import { initLines } from './lines.js';
import { initSwitcher } from './switcher.js';
import { initThemeVideos } from './theme-video.js';
import { initWords } from './words.js';
import { initStops } from './stops.js';
import { initRise } from './rise.js';

/**
 * Phase 3 · Lines, minimal (lines.js, lines.css, minimal.css): the grid and its tiles over the slowed clip in the
 * hero, one story, the figures as tiles, then the six steps with the person doing each one. No page load, no
 * travelling square and no line through the page. Lines 2 and Lines 3 build on this.
 */
const reduce = prefersReducedMotion();
initRadius();
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false });
initStops(); // every title ends on the purple square
initRise({ reduce }); // titles rise in word by word; the full stop lands last
initReveal({ reduce });
initSwitcher();
initThemeVideos(); // the clips: white in light mode, black in dark mode
initLight({ reduce });
initLines({ reduce });
initJourney({ reduce });
initWords({ reduce });
initFront({ reduce }); // Proactive, where a version has it (Lines 3)

// the background clips play slowly: each at its own data-rate (the hero at a sixth), else a third
document.querySelectorAll('video.hero-video, video.cta-video').forEach((v) => {
  const rate = Number(v.dataset.rate) || 1 / 3;
  v.defaultPlaybackRate = rate;
  v.playbackRate = rate;
  v.addEventListener('loadedmetadata', () => { v.playbackRate = rate; });
});
