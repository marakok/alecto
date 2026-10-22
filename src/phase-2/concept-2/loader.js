import { clamp } from '../../js/palette.js';
import { writeAt } from '../../js/write.js';

/**
 * Page load, four ways. Each starts with the square alone in the middle of a blank screen (the veil) and
 * ends with it as the full stop of the headline, where the scroll journey picks it up.
 *
 *  drop:     the square pops up in the middle, the page fades in around it, and it hops onto "drama".
 *  curtain:  the square grows until it fills the screen (turning ink), then shrinks onto "drama",
 *            uncovering the page as it goes.
 *  count:    a counter runs to 100 while the square makes four quarter turns, then it hops onto "drama".
 *  wordmark: the wordmark builds around the square, the square goes up to the logo, then falls onto
 *            "drama" (the concept 2 drop).
 *  write:    the square pops up in the middle, hops to the start of the headline and writes it, line by
 *            line, like a cursor; the words appear behind it from a faint ghost (write.js). It ends as the
 *            full stop. Phase 3.
 *
 * place(now, target) says where the square is (fixed px: x, y, size, rotation, colour) until the intro is
 * done; main.js draws it. The intro clock starts when the headline is ready (fonts loaded and split).
 */
export function createIntro({ mode, prepared, navdot, onDone }) {
  const root = document.documentElement;
  const veil = document.querySelector('.veil');
  const count = veil.querySelector('.veil-count');
  const word = veil.querySelector('.veil-word');
  const slot = veil.querySelector('.veil-dot');

  let t0 = 0; // when the clock started (performance.now), 0 = not yet
  let words = 5;
  let revealed = false;
  let done = false;
  prepared.then((info) => {
    if (info) words = info.words;
    root.classList.add('veil-go');
    if (mode === 'wordmark') centreWord();
    t0 = performance.now();
  });
  if (mode === 'wordmark') navdot.classList.add('lent');

  // Lift the veil and start the hero (headline rises word by word).
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    root.classList.add('hero-go');
    root.classList.remove('veiled');
  };
  const finish = () => {
    if (done) return;
    reveal();
    done = true;
    root.classList.add('written'); // the headline in full, whatever the cursor had reached
    if (mode === 'wordmark') {
      navdot.classList.remove('lent');
      navdot.classList.add('ping');
      navdot.addEventListener('animationend', () => navdot.classList.remove('ping'), { once: true });
    }
    onDone?.();
  };

  // The wordmark sits so that its dot is the middle of the screen.
  function centreWord() {
    const d = slot.getBoundingClientRect();
    word.style.translate = `${innerWidth / 2 - (d.left + d.width / 2)}px ${innerHeight / 2 - (d.top + d.height / 2)}px`;
  }

  // Helpers, all 0..1.
  const io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outQuart = (t) => 1 - Math.pow(1 - t, 4);
  const inCubic = (t) => t * t * t;
  const back = (t) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const bounce = (t) => { // gravity with two small bounces
    const n = 7.5625;
    const d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  };
  const p = (t, from, ms) => clamp((t - from) / ms, 0, 1);
  const S0 = () => (innerWidth < 640 ? 22 : 28); // the square, alone on the screen
  const centre = (size) => ({ x: innerWidth / 2 - size / 2, y: innerHeight / 2 - size / 2, size });

  // From a box to the target in a hop: across with an ease, up and over in an arc, half a turn.
  const hop = (a, b, k) => {
    const e = io(k);
    const lift = Math.sin(Math.PI * k) * Math.min(140, Math.hypot(b.x - a.x, b.y - a.y) * 0.35);
    return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e - lift, size: a.size + (b.size - a.size) * e, rot: 180 * e };
  };
  // The hero headline needs this long after the reveal before its last word is up.
  const settle = () => 380 + words * 80;

  const place = (now, target) => {
    const T = { x: target.left, y: target.top, size: target.width };
    if (!t0) return { ...centre(0), rot: 0 };
    const t = now - t0;
    const pop = (from, ms = 480) => ({ ...centre(S0() * back(p(t, from, ms))), rot: 0 });

    if (mode === 'drop') {
      if (t < 800) return pop(0);
      reveal();
      const F = 800 + settle() - 250;
      const k = p(t, F, 1000);
      if (k >= 1) finish();
      return hop(centre(S0()), T, k);
    }

    if (mode === 'write') {
      if (t < 700) return pop(0);
      reveal(); // the page fades in with the headline as a ghost
      const heading = [...document.querySelectorAll('.c2-hero h1 .w > span')];
      const size = T.size;
      const end = { x: T.x, y: T.y };
      if (t < 1250) return hop(centre(S0()), { ...writeAt(heading, 0, { size, end, below: size * 1.2 }), size }, p(t, 700, 550));
      const k = p(t, 1250, clamp(500 + heading.length * 260, 1400, 2600));
      const e = 0.5 - Math.cos(Math.PI * k) / 2; // calm in, calm out
      // it runs just under the baseline, and rises into the full stop's place at the very end
      const below = size * 1.2 * (1 - clamp((k - 0.86) / 0.14, 0, 1));
      const at = writeAt(heading, e, { size, end, below });
      if (k >= 1) finish();
      return { x: at.x, y: at.y, size, rot: 0 };
    }

    if (mode === 'curtain') {
      const big = Math.hypot(innerWidth, innerHeight) * 1.04;
      if (t < 650) return pop(0, 450);
      if (t < 1250) { // grow to fill the screen, turning ink
        const k = inCubic(p(t, 650, 600));
        return { ...centre(S0() + (big - S0()) * k), rot: 0, ink: k };
      }
      reveal(); // hidden behind the square
      const k = p(t, 1300, 1050);
      if (k >= 1) finish();
      const e = outQuart(k);
      const a = centre(big);
      return {
        x: a.x + (T.x - a.x) * e, y: a.y + (T.y - a.y) * e, size: a.size + (T.size - a.size) * e,
        rot: 90 * io(k), ink: 1 - clamp(k * 1.6, 0, 1),
      };
    }

    if (mode === 'count') {
      if (t < 300) return pop(0, 300);
      const k = p(t, 300, 1600);
      count.textContent = String(Math.round(100 * io(k)));
      const q = k * 4;
      const i = Math.min(3, Math.floor(q));
      const turn = 90 * (i + back(clamp((q - i - 0.6) / 0.4, 0, 1)));
      if (t < 2100) return { ...centre(S0()), rot: k >= 1 ? 360 : turn };
      reveal();
      const F = 2100 + settle() - 300;
      const h = p(t, F, 1000);
      if (h >= 1) finish();
      return hop(centre(S0()), T, h);
    }

    // wordmark
    const d = slot.getBoundingClientRect();
    const home = { x: d.left, y: d.top, size: d.width };
    if (t < 1500) {
      const s = home.size * back(p(t, 0, 480));
      return { x: home.x + (home.size - s) / 2, y: home.y + (home.size - s) / 2, size: s, rot: 0 };
    }
    root.classList.add('veil-out');
    if (t > 1700) reveal();
    const n = navdot.getBoundingClientRect();
    const N = { x: n.left, y: n.top, size: n.width };
    if (t < 2400) { // up to the logo
      const e = io(p(t, 1500, 800));
      return { x: home.x + (N.x - home.x) * e, y: home.y + (N.y - home.y) * e, size: home.size + (N.size - home.size) * e, rot: 90 * e };
    }
    const F = Math.max(2600, 1700 + settle());
    if (t < F) return { ...N, rot: 0 };
    const k = p(t, F, 1100); // fall onto "drama", across first while it falls
    if (k >= 1) finish();
    const sx = io(clamp(k * 1.6, 0, 1));
    return {
      x: N.x + (T.x - N.x) * sx, y: N.y + (T.y - N.y) * bounce(k),
      size: N.size + (T.size - N.size) * clamp(k * 1.4, 0, 1), rot: 180 * io(clamp(k * 1.25, 0, 1)),
    };
  };

  return { place, finish, get done() { return done; } };
}
