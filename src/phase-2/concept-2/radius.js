/**
 * Round every box like the logo dot: a corner radius of 6% of its shorter side (brand kit: rx 9 on a
 * 150 square), never more than 12px, so big photos and panels stay crisp. Squares do this in CSS (border-radius: 6%); on other shapes a percentage would make an
 * ellipse, so the radius is measured here into --r6 and kept up to date as boxes resize.
 * The list matches the rules that use var(--r6, var(--ui-r)) in phase2.css and pages.css.
 */
const ROUNDED = [
  // phase2.css
  '.c2 .btn', '.c2 .icon-btn', '.c2 .step', '.c2 .art', '.c2 .review', '.c2-cta', '.mate-tile',
  '.face-tile', '.c2 .announce-tag', '.clc-mark', '.clc.stamp', '.hannah-tile', '.hannah-card',
  '.photo-panel', '.c2 .cta-art img', '.cta-square',
  // pages.css
  '.about-photos img', '.founder', '.value', '.regulated', '.roles-card', '.roles-card header .count', '.role .go',
  '.hire li',
];
const RATIO = 9 / 150; // 6%
const MAX = 12; // px, the cap (also --dot-r in phase2.css)

export function initRadius() {
  const ro = new ResizeObserver((entries) => {
    entries.forEach(({ target, borderBoxSize: [box] }) => {
      // whole pixels: a fractional radius puts the curve between pixels and softens it
      const r = Math.max(1, Math.round(Math.min(Math.min(box.inlineSize, box.blockSize) * RATIO, MAX)));
      target.style.setProperty('--r6', `${r}px`);
    });
  });
  document.querySelectorAll(ROUNDED.join(',')).forEach((el) => ro.observe(el, { box: 'border-box' }));
}
