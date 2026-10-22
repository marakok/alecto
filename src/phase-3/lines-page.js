import './home.js'; // the phase 3 home as it is: light, thread, writing, statements, demo
import { prefersReducedMotion } from '../js/palette.js';
import { initFront } from './front.js';
import { initLines } from './lines.js';

/**
 * Phase 3 · Lines: the home page with the square as a system of lines (lines.js, lines.css): the grid draws on
 * load, big tiles in the hero with your tile walking home and data along the lines, one grid through the page.
 */
initLines({ reduce: prefersReducedMotion() });
initFront({ reduce: prefersReducedMotion() }); // the front: what the client sees, not the lawyer's platform

// the spark moment draws when it comes into view
const spark = document.querySelector('.spark-art');
if (spark) {
  new IntersectionObserver(([e], io) => {
    if (!e.isIntersecting) return;
    spark.classList.add('in');
    io.disconnect();
  }, { threshold: 0.4 }).observe(spark);
}

// the background clips play slowly: each at its own data-rate (the hero at a sixth), else a third
document.querySelectorAll('.hero-video, .cta-video').forEach((v) => {
  const rate = Number(v.dataset.rate) || 1 / 3;
  v.defaultPlaybackRate = rate;
  v.playbackRate = rate;
  v.addEventListener('loadedmetadata', () => { v.playbackRate = rate; });
});
