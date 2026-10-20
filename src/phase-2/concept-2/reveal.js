import { clamp } from '../../js/palette.js';

/**
 * The page below the hero comes in gracefully, in one vocabulary (one slow "expo" ease, reveal.css):
 *  - rise: text and blocks come up out of a soft blur, staggered within their group
 *  - mask: photos and tiles open from the bottom inside their rounded corners, the photo settling from a
 *          slight zoom
 *  - pop:  the brand squares (proof bullets, eyebrows) land with a small turn, after their text
 *  - figures count up (the facts), and photos drift a little against the scroll (parallax)
 * Nothing starts until the load screen has lifted, so the first screen never animates behind it.
 * motion.js already reveals headings (word by word), section intros, reviews, FAQ and footer; reveal.css
 * restyles those to the same ease, so the whole page moves the same way.
 * With reduced motion (no html.motion) everything is simply there.
 */
const GROUPS = [
  // [group, children, kind, stagger ms]
  ['.proof-row', ':scope > div', 'rise', 120],
  ['.facts', ':scope > div', 'rise', 120],
  ['.journey .jmeta', ':scope > *', 'rise', 90],
  ['.team', ':scope > .mate', 'mask', 110],
  ['.cta-copy', ':scope > p, :scope > .ctas', 'rise', 120],
  ['.cta-art', ':scope > img, :scope > .cta-square', 'mask', 140],
  // company and careers pages
  ['.about-photos', ':scope > img', 'mask', 140],
  ['.values, .perks', ':scope > *', 'rise', 90],
  ['.roles', ':scope > *', 'rise', 70],
];
const POPS = '.proof-row i, .c2 main .eyebrow i';
const PARALLAX = '.rphoto, .cta-art img, .cta-art .cta-square, .about-photos img';

export function initReveal({ reduce }) {
  const root = document.documentElement;
  if (reduce || !root.classList.contains('motion')) return;

  const groups = [];
  GROUPS.forEach(([sel, kids, kind, gap]) => {
    document.querySelectorAll(sel).forEach((g) => {
      if (g.closest('.c2-hero')) return;
      const items = [...g.querySelectorAll(kids)].filter((el) => !el.hasAttribute('data-reveal'));
      if (!items.length) return;
      items.forEach((el, i) => { el.dataset.r = kind; el.style.setProperty('--rd', `${i * gap}ms`); });
      groups.push(g);
    });
  });
  document.querySelectorAll(POPS).forEach((el) => { if (!el.closest('.c2-hero')) el.dataset.r = 'pop'; });
  root.classList.add('rv'); // hidden start states apply from here (reveal.css)

  afterIntro(() => setTimeout(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.add('r-in');
        if (e.target.matches('.facts')) e.target.querySelectorAll('b').forEach(countUp);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    groups.forEach((g) => io.observe(g));
    document.querySelectorAll('[data-r="pop"]').forEach((el) => io.observe(el.parentElement));
  }, 350));

  parallax();
}

// Run once the load screen lifts (loader.js adds html.hero-go). Pages without a load screen: right away.
export function afterIntro(fn) {
  const root = document.documentElement;
  if (root.classList.contains('hero-go') || !root.classList.contains('veiled')) return fn();
  const mo = new MutationObserver(() => {
    if (!root.classList.contains('hero-go')) return;
    mo.disconnect();
    fn();
  });
  mo.observe(root, { attributes: true, attributeFilter: ['class'] });
}

// "2,000+" counts up from 0, keeping what's around the number; words ("CLC regulated") stay as they are.
function countUp(b) {
  if (b.dataset.counted) return;
  b.dataset.counted = '1';
  const m = b.textContent.match(/^(\D*)([\d,.]+)(.*)$/);
  if (!m) return;
  const [, pre, num, post] = m;
  const end = parseFloat(num.replace(/,/g, ''));
  const fmt = (v) => (num.includes(',') ? Math.round(v).toLocaleString('en-GB') : String(Math.round(v)));
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / 1800);
    b.textContent = pre + fmt(end * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p))) + post;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Photos drift up to 24px against the scroll, on the `translate` property so their own transforms stay.
function parallax() {
  const els = [...document.querySelectorAll(PARALLAX)];
  if (!els.length) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = innerHeight;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const k = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
      el.style.translate = `0 ${(k * 24).toFixed(1)}px`;
    });
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', ask);
  update();
}
