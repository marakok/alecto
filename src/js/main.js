import { prefersReducedMotion } from './palette.js';
import { initTheme } from './theme.js';
import { runLoader } from './loader.js';
import { createHero } from './hero.js';
import { initStageStacks, initSkyline } from './decor.js';

const reduce = prefersReducedMotion();

initTheme(document.getElementById('theme'));
initStageStacks();
initSkyline(document.getElementById('skyline'));

const hero = createHero({ reduce });

runLoader({ period: document.getElementById('period') }).then(() => {
  if (!hero) return;
  setTimeout(hero.intro, 550);
  hero.startLive(3400);
});
