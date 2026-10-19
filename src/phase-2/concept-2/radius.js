/**
 * Round every box like the logo dot: a corner radius of 6% of its shorter side (brand kit: rx 9 on a
 * 150 square). Squares do this in CSS (border-radius: 6%); on other shapes a percentage would make an
 * ellipse, so the radius is measured here into --r6 and kept up to date as boxes resize.
 * The list matches the rules that use var(--r6, var(--ui-r)) in phase2.css and pages.css.
 */
const ROUNDED = [
  // phase2.css
  '.c2 .btn', '.c2 .icon-btn', '.c2 .step', '.c2 .art', '.c2 .review', '.c2-cta', '.collage img', '.mate-tile',
  '.face-tile', '.c2 .announce-tag', '.clc-mark', '.clc.stamp', '.clc.badge', '.hannah-tile', '.hannah-card',
  '.strip img', '.strip-face', '.strip-me figcaption', '.photo-panel', '.c2 .cta-art img',
  // pages.css
  '.about-photos img', '.founder', '.value', '.regulated', '.roles-card', '.roles-card header .count', '.role .go',
  '.hire li',
];
const RATIO = 9 / 150; // 6%

export function initRadius() {
  const ro = new ResizeObserver((entries) => {
    entries.forEach(({ target, borderBoxSize: [box] }) => {
      const r = Math.min(box.inlineSize, box.blockSize) * RATIO;
      target.style.setProperty('--r6', `${r.toFixed(2)}px`);
    });
  });
  document.querySelectorAll(ROUNDED.join(',')).forEach((el) => ro.observe(el, { box: 'border-box' }));
}
