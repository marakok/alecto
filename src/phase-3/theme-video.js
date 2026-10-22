/**
 * Background clips that follow the theme: <video data-src-light="…" data-src-dark="…">. The white clip in light
 * mode, the black one in dark mode, swapped the moment the theme changes (the toggle sets html[data-theme]; without
 * it the OS setting decides). Clips keep their playback rate (data-rate, e.g. 0.333) across a swap.
 */
import { smoothVideo } from './smooth-video.js';

const dark = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
};

export function initThemeVideos() {
  // slowed clips glide instead of stepping (smooth-video.js)
  document.querySelectorAll('video.hero-video, video.story-video, video.cta-video').forEach(smoothVideo);
  const videos = [...document.querySelectorAll('video[data-src-light][data-src-dark]')];
  if (!videos.length) return;
  const pick = () => videos.forEach((v) => {
    const src = dark() ? v.dataset.srcDark : v.dataset.srcLight;
    if (v.getAttribute('src') === src) return;
    const playing = !v.paused || v.autoplay;
    v.setAttribute('src', src);
    v.load();
    const rate = Number(v.dataset.rate) || 1;
    v.addEventListener('loadedmetadata', () => { v.playbackRate = rate; if (playing) v.play().catch(() => {}); }, { once: true });
  });
  pick();
  new MutationObserver(pick).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', pick);
}
