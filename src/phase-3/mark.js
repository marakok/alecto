import { clamp } from '../js/palette.js';

/**
 * Phase 3 · Mark: the logo's own geometry as the whole visual language (as Verve did for Miro with the slanted
 * strokes of its M). Alecto's DNA is the dot: a rounded square, the full stop of "alecto.". Used enormous and
 * cropped, in flat periwinkle and ink on warm paper, with one movement at a time.
 *
 *  - The hero ([data-mark="hero"], pinned): a single giant rounded corner of periwinkle glides in and settles, with
 *    window light moving through it (duotone) and a glimpse of what you see on a card.
 *    As you scroll, it zooms out until you see what it is: the full stop of "alecto." The letters fade in as it
 *    shrinks, the light and the card fade out. The headline ends on the same square, small.
 *  - The aha ([data-mark="meet"], pinned): four solid squares slide in from the corners and meet; the gap between
 *    their corners is the AI star, and it lights up.
 *  - [data-mark-in]: squares that carry content slide into place when they come into view.
 *  - The travelling square: once the hero lets go, the full stop of "alecto." breaks loose and travels down the page
 *    through every [data-dot]: into the middle of the four squares (where it turns into the star), into the first
 *    figure, then from chapter to chapter, filling each mark it reaches. A [data-dot][data-hold] keeps it until its
 *    pinned section lets go.
 * Reduced motion: everything in its final place.
 */
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, k) => a + (b - a) * k;
const progress = (el) => {
  const r = el.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
};

export function initMark({ reduce }) {
  const root = document.documentElement;
  root.classList.toggle('mark-still', reduce);

  // squares that slide into place
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { threshold: 0.3 });
  document.querySelectorAll('[data-mark-in]').forEach((el) => (reduce ? el.classList.add('in') : io.observe(el)));
  if (reduce) return;

  const hero = document.querySelector('[data-mark="hero"]');
  const logo = hero?.querySelector('.mk-logo');
  const dot = logo?.querySelector('.mk-dot');
  const meet = document.querySelector('[data-mark="meet"]');
  const stage = hero?.querySelector('.mk-stage');
  const inside = hero?.querySelector('.mk-inside');
  const copy = hero ? hero.querySelectorAll('.mk-copy h1, .mk-copy .sub') : [];
  const ctas = hero?.querySelector('.mk-copy .ctas');


  // the travelling square: one fixed square, always between two [data-dot] anchors (or resting on one)
  const anchors = [...document.querySelectorAll('[data-dot]')];
  const traveller = document.createElement('i');
  traveller.className = 'mk-traveller';
  traveller.setAttribute('aria-hidden', 'true');
  document.body.append(traveller);
  const box = (el) => {
    const r = el.getBoundingClientRect();
    const cr = getComputedStyle(el).borderTopLeftRadius;
    const rad = cr.endsWith('%') ? (parseFloat(cr) / 100) * r.width : parseFloat(cr) || 0;
    return { x: r.left, y: r.top, w: r.width, h: r.height, c: r.top + r.height / 2, rad };
  };
  const held = (el) => el.hasAttribute('data-hold') && progress(el.closest('[data-mark]')) < 1;
  const travel = () => {
    const line = innerHeight * 0.55; // an anchor is reached when its middle passes this line
    const boxes = anchors.map(box);
    let j = -1;
    if (hero?.classList.contains('revealed') || progress(hero) >= 1) {
      boxes.forEach((b, i) => { if (b.c <= line) j = i; });
      j = Math.max(j, 0);
    }
    // a held anchor (still pinned) keeps it, and the one after it isn't reached yet either
    const hold = j >= 0 && held(anchors[j]);
    anchors.forEach((a, i) => a.classList.toggle('reached', i <= j));
    let t = 0;
    if (j >= 0 && j < boxes.length - 1 && !hold) {
      const a = boxes[j];
      const b = boxes[j + 1];
      t = clamp((line - a.c) / Math.max(1, b.c - a.c), 0, 1);
    }
    dot?.classList.toggle('left', j > 0 || t > 0.001); // the full stop has broken loose
    // resting on an anchor, the anchor itself shows (filled); only in the middle of the four, before they meet, does
    // the square wait on its own, and then it becomes the star
    const waiting = j >= 0 && anchors[j].classList.contains('mk-slot') && !meet?.classList.contains('met');
    traveller.classList.toggle('on', j >= 0 && (t > 0.001 || waiting));
    if (j < 0) return;
    const a = boxes[j];
    const b = boxes[Math.min(j + 1, boxes.length - 1)];
    const e = ease(t);
    traveller.style.transform = `translate(${lerp(a.x, b.x, e).toFixed(1)}px, ${lerp(a.y, b.y, e).toFixed(1)}px)`;
    traveller.style.width = `${lerp(a.w, b.w, e).toFixed(1)}px`;
    traveller.style.height = `${lerp(a.h, b.h, e).toFixed(1)}px`;
    traveller.style.borderRadius = `${lerp(a.rad, b.rad, e).toFixed(1)}px`;
  };

  const frame = () => {
    if (hero && logo && dot) {
      const p = progress(hero);
      const k = ease(clamp(p / 0.85, 0, 1));
      // where the dot sits when the logo is at rest (its own box, without the transform)
      logo.style.transform = 'none';
      const lr = logo.getBoundingClientRect();
      const dr = dot.getBoundingClientRect();
      const W = innerWidth;
      const H = innerHeight;
      const big = Math.max(W, H) * 1.5; // the dot at the start: far bigger than the screen
      const s0 = big / dr.width;
      const s = Math.exp(lerp(Math.log(s0), 0, k)); // zoom evenly
      // the dot's top left corner: just clear of the headline (only one corner shows), or below the buttons on a
      // phone, to its place in the word
      const copyRight = Math.max(...[...copy].map((el) => el.getBoundingClientRect().right));
      const start = W < 720
        ? [W * 0.14, Math.min(H * 0.7, ctas.getBoundingClientRect().bottom + 40)]
        : [Math.max(W * 0.5, copyRight + 48), H * 0.2];
      const tx = lerp(start[0], dr.left, k);
      const ty = lerp(start[1], dr.top, k);
      const ox = dr.left - lr.left;
      const oy = dr.top - lr.top;
      logo.style.transform = `translate(${(tx - lr.left - s * ox).toFixed(2)}px, ${(ty - lr.top - s * oy).toFixed(2)}px) scale(${s.toFixed(4)})`;
      hero.style.setProperty('--k', k.toFixed(3));
      hero.classList.toggle('revealed', k > 0.96);
      // the light and the card ride on the dot (in the stage's own coordinates)
      if (inside) {
        const d = dot.getBoundingClientRect();
        const st = stage.getBoundingClientRect();
        inside.style.transform = `translate(${(d.left - st.left).toFixed(1)}px, ${(d.top - st.top).toFixed(1)}px)`;
        inside.style.width = `${d.width.toFixed(1)}px`;
        inside.style.height = `${d.height.toFixed(1)}px`;
        inside.style.borderRadius = `${(d.width * 0.06).toFixed(1)}px`;
      }
    }
    if (meet) {
      const p = progress(meet);
      const k = ease(clamp((p - 0.05) / 0.6, 0, 1));
      meet.style.setProperty('--m', k.toFixed(3));
      meet.classList.toggle('met', k > 0.99);
      // the statement fills in, word by word, as you scroll on once the squares have met
      const words = meet.querySelectorAll('.mk-meet-copy .wd');
      const n = Math.round(clamp((p - 0.45) / 0.35, 0, 1) * words.length); // complete by 80%, before the section lets go
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    travel();
  };
  addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });
  addEventListener('resize', frame);
  document.fonts?.ready.then(frame);
  addEventListener('load', frame);
  // the headline settles after the veil lifts; place the corner again once it has
  if (hero) new ResizeObserver(frame).observe(hero.querySelector('.mk-copy'));
  [400, 1200].forEach((t) => setTimeout(frame, t));
  frame();
}
