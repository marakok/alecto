/**
 * The concept switcher's type options (?f=geist|instrument|inter). The head script reads ?f= (or the last
 * choice, localStorage "alecto-font") into html[data-f] before first paint; here each "Aa" becomes a link
 * to this same page in that type, and the current one is marked.
 */
export function initSwitcher() {
  const f = document.documentElement.dataset.f;
  document.querySelectorAll('.concepts a[data-f]').forEach((a) => {
    a.href = `${location.pathname}?f=${a.dataset.f}${location.hash}`;
    if (a.dataset.f === f) a.setAttribute('aria-current', 'true');
  });
}
