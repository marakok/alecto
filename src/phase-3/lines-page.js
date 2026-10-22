import './home.js'; // the phase 3 home as it is: light, thread, writing, statements, demo
import { prefersReducedMotion } from '../js/palette.js';
import { initLines } from './lines.js';

/**
 * Phase 3 · Lines: the home page with the square as a system of lines (lines.js, lines.css): the grid draws on
 * load, big tiles in the hero with your tile walking home and data along the lines, one grid through the page.
 */
initLines({ reduce: prefersReducedMotion() });

// the spark moment draws when it comes into view
const spark = document.querySelector('.spark-art');
if (spark) {
  new IntersectionObserver(([e], io) => {
    if (!e.isIntersecting) return;
    spark.classList.add('in');
    io.disconnect();
  }, { threshold: 0.4 }).observe(spark);
}

// the background clips play at a third of their speed: slower light, calmer
document.querySelectorAll('.hero-video, .cta-video').forEach((v) => {
  v.defaultPlaybackRate = 1 / 3;
  v.playbackRate = 1 / 3;
  v.addEventListener('loadedmetadata', () => { v.playbackRate = 1 / 3; });
});
