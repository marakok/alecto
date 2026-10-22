/**
 * The platform page's feature component: a list of features on the left picks the product screen on the
 * right. Tabs follow the ARIA pattern (arrow keys move between them). While on screen it moves on by itself
 * every few seconds, the active tab's bar filling up as it goes; any click or key stops that for good.
 * In the document review screen, pointing at a flag lights up its passage in the lease.
 */
const DWELL = 7000;

export function initFeatures({ reduce }) {
  const feat = document.querySelector('[data-feat]');
  if (!feat) return;
  const tabs = [...feat.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  let cur = 0;
  let auto = !reduce;
  let timer = 0;

  const show = (i, focus) => {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === cur));
      t.tabIndex = k === cur ? 0 : -1;
    });
    panels.forEach((p, k) => { p.hidden = k !== cur; });
    if (focus) tabs[cur].focus();
    feat.style.setProperty('--dwell', `${DWELL}ms`);
    feat.classList.remove('ticking');
    if (auto) { void feat.offsetWidth; feat.classList.add('ticking'); }
  };
  const stop = () => { auto = false; clearInterval(timer); feat.classList.remove('ticking'); };

  tabs.forEach((t, i) => t.addEventListener('click', () => { stop(); show(i); }));
  feat.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    stop();
    show(cur + d, true);
  });
  show(0);

  if (auto) {
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (!auto) return;
      if (e.isIntersecting) { show(cur); timer = setInterval(() => show(cur + 1), DWELL); } else feat.classList.remove('ticking');
    }, { threshold: 0.4 }).observe(feat);
  }

  // document review: a flag and its passage light up together
  const docs = feat.querySelector('.docs');
  docs?.querySelectorAll('.flag').forEach((f) => {
    const mark = docs.querySelector(`mark[data-flag="${f.dataset.flag}"]`);
    f.addEventListener('pointerenter', () => { docs.querySelectorAll('.hi').forEach((x) => x.classList.remove('hi')); f.classList.add('hi'); mark.classList.add('hi'); });
  });
  docs?.querySelector('mark[data-flag="1"]').classList.add('hi');
}
