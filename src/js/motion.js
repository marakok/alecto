import Lenis from 'lenis';
import { clamp } from './palette.js';

/**
 * Scroll motion. One vocabulary, borrowed from the logo: things are blocks that drop into place.
 *  - smooth scrolling (Lenis)
 *  - headings rise word by word, then their square drops in like a full stop
 *  - cards and rows slide up into their slot (clip reveal)
 *  - stage stacks and the CTA skyline are built block by block when they enter
 *  - the dashboard panel opens up and lifts as you scroll to it
 *  - stats count up, the hero copy drifts away, the footer wordmark builds letter by letter
 * Everything is skipped with prefers-reduced-motion; without JavaScript all content is simply visible.
 */
export function initMotion({ reduce, cursor = true }) {
  const root = document.documentElement;
  initHeader();
  initProgress();
  if (reduce) return null;

  root.classList.add('motion');

  const lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: { offset: -80 } });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  splitText('h2', 'word');
  splitText('.mega', 'char');
  markReveals();
  observe();
  initCounters();
  initScrollLinked();
  if (cursor) initCursor();
  return lenis;
}

/* ---------- header: solid after scrolling, hides on the way down, returns on the way up ---------- */
function initHeader() {
  const head = document.querySelector('.site-head');
  if (!head) return;
  let last = scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY;
    head.classList.toggle('scrolled', y > 8);
    if (Math.abs(y - last) > 6) {
      head.classList.toggle('hide', y > last && y > 240 && !head.contains(document.activeElement));
      last = y;
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

/* ---------- reading progress: a thin accent line along the top ---------- */
function initProgress() {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------- split headings into masked words (or characters) ---------- */
function splitText(selector, mode) {
  document.querySelectorAll(selector).forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = mode;
    const label = el.textContent.trim();
    let i = 0;
    const frag = document.createDocumentFragment();
    [...el.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) {
        if (node.classList?.contains('period') || node.tagName === 'I') node.style.setProperty('--i', i);
        frag.appendChild(node);
        return;
      }
      const parts = mode === 'char' ? [...node.textContent] : node.textContent.split(/(\s+)/);
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const outer = document.createElement('span');
        outer.className = 'w';
        outer.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.textContent = part;
        inner.style.setProperty('--i', i++);
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
    });
    el.textContent = '';
    el.appendChild(frag);
    el.style.setProperty('--n', i);
    if (!el.hasAttribute('aria-label') && mode === 'word') el.setAttribute('aria-label', label);
  });
}

/* ---------- tag elements for reveal, with a stagger inside each group ---------- */
function markReveals() {
  const fade = ['.sec-head .eyebrow', '.faq-side .eyebrow', '.sec-head .lede', '.faq-side .lede', '.faq-side .btn', '.cta > p', '.cta > .ctas', '.fgrid > div:first-child'];
  document.querySelectorAll(fade.join(',')).forEach((el) => { el.dataset.reveal = 'fade'; });

  // Tiles are clipped while hidden, and a fully clipped element never reports as intersecting,
  // so we observe the (unclipped) group and reveal its children together, staggered.
  const groups = ['.cards', '.reviews', '.hsteps', '.stats', '.faq > div:last-child', '.fcols'];
  groups.forEach((sel) => {
    document.querySelectorAll(sel).forEach((group) => {
      group.dataset.revealGroup = '';
      [...group.children].forEach((el, i) => {
        el.dataset.reveal = 'tile';
        el.style.setProperty('--d', `${i * 90}ms`);
      });
    });
  });
}

/* ---------- one observer for everything that animates on entry ---------- */
function observe() {
  const targets = document.querySelectorAll('[data-reveal="fade"], [data-reveal-group], h2[data-split], .mega, #skyline');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      io.unobserve(el);
      el.classList.add('in');
      if (el.hasAttribute('data-reveal-group')) [...el.children].forEach((c) => c.classList.add('in'));
      if (el.classList.contains('hsteps')) el.querySelectorAll('.stack').forEach((st, i) => dropStack(st, i));
      if (el.id === 'skyline') dropSkyline(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  targets.forEach((t) => io.observe(t));
}

/* ---------- blocks falling into place (same motion as the loader) ---------- */
function drop(el, delay, height = 180) {
  el.animate(
    [
      { transform: `translateY(-${height}px) rotate(${(Math.random() - 0.5) * 24}deg)`, opacity: 0 },
      { opacity: 1, offset: 0.25 },
      { transform: 'translateY(0) rotate(0deg)', opacity: 1, offset: 0.78 },
      { transform: 'translateY(-4px)', offset: 0.9 },
      { transform: 'translateY(0)', opacity: 1 },
    ],
    { duration: 620, delay, easing: 'cubic-bezier(.55,0,.75,.4)', fill: 'backwards' },
  );
}

function dropStack(stack, i) {
  stack.classList.add('built');
  [...stack.children].forEach((sp, k) => drop(sp, 350 + i * 160 + k * 110));
}

function dropSkyline(sky) {
  sky.classList.add('built');
  [...sky.children].forEach((col, c) => [...col.children].forEach((sp, k) => drop(sp, c * 35 + k * 120, 240)));
}

/* ---------- stats count up ---------- */
function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const b = e.target;
      const m = b.textContent.match(/^(\D*)([\d,]+)(.*)$/);
      if (!m) return;
      const [, pre, num, post] = m;
      const end = parseInt(num.replace(/,/g, ''), 10);
      const fmt = (v) => (num.includes(',') ? v.toLocaleString('en-GB') : String(v));
      const t0 = performance.now();
      const dur = end > 10 ? 1600 : 700;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(2, -10 * p);
        b.textContent = pre + fmt(Math.round(end * (p === 1 ? 1 : eased))) + post;
        if (p < 1) requestAnimationFrame(step);
      };
      b.textContent = pre + fmt(0) + post;
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stats b').forEach((b) => io.observe(b));
}

/* ---------- scroll-linked: hero drift + dashboard panel opening ---------- */
function initScrollLinked() {
  const hero = document.querySelector('.hero');
  const copy = hero?.querySelector('.copy');
  const panel = document.querySelector('.panel');
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    if (copy) {
      const y = clamp(scrollY, 0, vh);
      copy.style.setProperty('--hy', y.toFixed(1));
    }
    if (panel) {
      const r = panel.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.85), 0, 1);
      panel.style.setProperty('--p', p.toFixed(3));
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------- cursor: the brand square follows the pointer (fine pointers only) ---------- */
function initCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.createElement('div');
  dot.className = 'cursor';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  let x = -100; let y = -100; let cx = -100; let cy = -100;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.classList.add('on'); }, { passive: true });
  document.addEventListener('pointerleave', () => dot.classList.remove('on'));
  document.addEventListener('pointerover', (e) => {
    dot.classList.toggle('big', !!e.target.closest('a, button, summary, label'));
  });
  const loop = () => {
    cx += (x - cx) * 0.2;
    cy += (y - cy) * 0.2;
    dot.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
