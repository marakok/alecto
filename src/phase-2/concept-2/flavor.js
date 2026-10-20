/**
 * Keep a review in one flavor: links between the phase 2 pages carry ?v= along, and on the company and
 * careers pages the switcher's 2a–2c swap the flavor without leaving the page.
 */
export function keepFlavor() {
  const root = document.documentElement;
  const v = root.dataset.v;
  const here = location.pathname;
  const HOME = '/phase-2/concept-2/';

  document.querySelectorAll(`a[href^="${HOME}"]`).forEach((a) => {
    const u = new URL(a.getAttribute('href'), location.origin);
    if (a.closest('.concepts')) {
      // 2a–2c: same page, other flavor.
      const to = u.searchParams.get('v');
      if (to) {
        a.setAttribute('href', `${here}?v=${to}`);
        if (to === v) a.setAttribute('aria-current', 'page');
      }
      return;
    }
    if (u.searchParams.has('v')) return;
    u.searchParams.set('v', v);
    a.setAttribute('href', u.pathname + u.search + u.hash);
  });
}
