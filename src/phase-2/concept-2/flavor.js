/**
 * Keep a review in one flavor: links between the phase 2 pages carry ?v= along. Only 2a is shown now (the
 * page pins data-v to "a"), so this just keeps the links tidy.
 */
export function keepFlavor() {
  const v = document.documentElement.dataset.v;
  const HOME = '/phase-2/concept-2/';

  document.querySelectorAll(`a[href^="${HOME}"]`).forEach((a) => {
    const u = new URL(a.getAttribute('href'), location.origin);
    if (u.searchParams.has('v')) return;
    u.searchParams.set('v', v);
    a.setAttribute('href', u.pathname + u.search + u.hash);
  });
}
