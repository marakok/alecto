/**
 * Phase 3 · Home 2 and Lines 2: titles rise into place instead of being written by the dot. Minimal and quick:
 * each word comes up out of its own mask, from a soft blur into focus, a few hundredths of a second after the one before (rise.css).
 *  - the hero headline: on load
 *  - section headings (h2, split into words by motion.js): as they scroll into view (motion.js adds .in)
 *  - the story's last line: when its chapter arrives (story.js with { write: false })
 * Reduced motion: everything is simply there.
 */
function split(el) {
  let i = 0;
  const walk = (node) => [...node.childNodes].forEach((child) => {
    if (child.nodeType === 1) { if (!child.classList.contains('period')) walk(child); return; }
    const frag = document.createDocumentFragment();
    child.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(part); return; }
      const w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span');
      s.style.setProperty('--i', i++);
      s.textContent = part;
      w.append(s);
      frag.append(w);
    });
    child.replaceWith(frag);
  });
  if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  walk(el);
  el.style.setProperty('--n', i);
}

export function initRise({ reduce }) {
  document.querySelectorAll('.story-title .w > span').forEach((s, i) => s.style.setProperty('--i', i));
  document.querySelectorAll('.story-title').forEach((t) => t.classList.add('rise'));
  if (reduce) { document.documentElement.classList.add('rise-still'); return; }
  const h1 = document.querySelector('.hero-home h1');
  if (!h1) return;
  split(h1);
  h1.classList.add('rise');
  requestAnimationFrame(() => setTimeout(() => h1.classList.add('in'), 250));
}
