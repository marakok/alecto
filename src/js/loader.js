import { mix, rand } from './palette.js';

const SEEN_KEY = 'alecto-intro-seen';

/**
 * Intro loader: 16 blocks fall into a 4x4 square, collapse into the brand dot,
 * and the dot flies into the headline full stop (#period).
 * Only runs when the head script added `html.intro`. Resolves when the hero can start.
 */
export function runLoader({ period }) {
  const root = document.documentElement;
  const overlay = document.getElementById('loader');
  const dot = document.getElementById('ldot');
  const pile = document.getElementById('pile');
  const pct = document.getElementById('lpct');

  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      overlay?.remove();
      dot?.remove();
      root.classList.remove('intro');
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* ignore */ }
      resolve();
    };

    if (!root.classList.contains('intro') || !overlay || document.hidden) { finish(); return; }
    setTimeout(finish, 7000); // safety net

    const N = 4;
    const order = [];
    for (let r = 0; r < N; r++) {
      [0, 1, 2, 3].sort(() => Math.random() - 0.5).forEach((c) => order.push([r, c]));
    }

    const FALL = 560;
    const STEP = 70;
    const cells = order.map(([r, c], i) => {
      const el = document.createElement('div');
      el.className = 'cell';
      el.style.gridRow = String(N - r);
      el.style.gridColumn = String(c + 1);
      el.style.setProperty('--c', mix((c + r) / (2 * N - 2)));
      pile.appendChild(el);
      const rot = (Math.random() < 0.5 ? -1 : 1) * rand(8, 22);
      el.animate(
        [
          { transform: `translateY(-60vh) rotate(${rot}deg)` },
          { transform: 'translateY(0) rotate(0deg)', offset: 0.78 },
          { transform: 'translateY(-5px)', offset: 0.9 },
          { transform: 'translateY(0)' },
        ],
        { duration: FALL, delay: i * STEP, easing: 'cubic-bezier(.55,0,.75,.4)', fill: 'backwards' },
      );
      setTimeout(() => { pct.textContent = Math.round(((i + 1) / order.length) * 100); }, i * STEP + FALL * 0.78);
      return el;
    });

    const landed = order.length * STEP + FALL + 260;
    setTimeout(() => {
      // Collapse the square into one dot.
      const pr = pile.getBoundingClientRect();
      const cx = pr.left + pr.width / 2;
      const cy = pr.top + pr.height / 2;
      cells.forEach((el) => {
        const r = el.getBoundingClientRect();
        el.animate(
          [
            { transform: 'none', opacity: 1 },
            { transform: `translate(${cx - (r.left + r.width / 2)}px, ${cy - (r.top + r.height / 2)}px) scale(.3)`, opacity: 0 },
          ],
          { duration: 380, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' },
        );
      });
      dot.style.left = `${cx - 11}px`;
      dot.style.top = `${cy - 11}px`;
      dot.animate(
        [{ transform: 'scale(0)' }, { transform: 'scale(1.25)', offset: 0.7 }, { transform: 'scale(1)' }],
        { duration: 420, delay: 240, easing: 'ease-out', fill: 'forwards' },
      );

      // Reveal the page and fly the dot into the headline.
      setTimeout(() => {
        overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease', fill: 'forwards' });
        const to = period.getBoundingClientRect();
        const fly = dot.animate(
          [
            { left: `${cx - 11}px`, top: `${cy - 11}px`, width: '22px', height: '22px', transform: 'scale(1)' },
            { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, transform: 'scale(1)' },
          ],
          { duration: 850, delay: 150, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' },
        );
        fly.onfinish = finish;
      }, 720);
    }, landed);
  });
}
