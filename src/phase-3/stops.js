/**
 * Every title ends on the brand's own square: the purple full stop (.stop, minimal.css), as the headline does. A title
 * that ends with "." gives it up for the square; one that ends with "?" or "!" keeps its own. The square sits inside
 * the last word, so it rises in or is written with it. Run after motion.js has split the headings into words.
 */
export function initStops() {
  document.querySelectorAll('main h2').forEach((h) => {
    if (h.querySelector('.period, .stop')) return;
    const walk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    let last = null;
    while (walk.nextNode()) if (walk.currentNode.textContent.trim()) last = walk.currentNode;
    if (!last || /[?!]\s*$/.test(last.textContent)) return;
    last.textContent = last.textContent.replace(/\.(\s*)$/, '$1');
    const stop = document.createElement('i');
    stop.className = 'stop';
    stop.setAttribute('aria-hidden', 'true');
    last.parentElement.append(stop);
  });
}
