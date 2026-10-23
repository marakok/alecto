/**
 * The concept switcher (<nav class="concepts">, review builds only), tucked into the header behind one small button
 * so it doesn't compete with the page: click it for the menu of versions and type options. Escape, a click outside
 * or picking a link closes it. Without the header (or without JS) the switcher stays where it is, at the bottom.
 */
export function tuckSwitcher() {
  const nav = document.querySelector('nav.concepts');
  const actions = document.querySelector('.site-head .actions');
  if (!nav || !actions || nav.closest('.versions')) return;

  nav.id ||= 'versions-menu';
  const box = document.createElement('div');
  box.className = 'versions';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'icon-btn versions-btn';
  btn.setAttribute('aria-label', 'Design versions');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', nav.id);
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="1.5" width="5" height="5" rx="1.2"/><rect x="1.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.2"/></svg>';
  box.append(btn, nav);
  actions.prepend(box);
  nav.hidden = true;

  const set = (open) => {
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (!open) return;
    // keep it on screen: on a narrow header the button sits far left, so shift the menu right if it would overflow
    nav.style.right = '';
    const left = nav.getBoundingClientRect().left;
    if (left < 12) nav.style.right = `${Math.round(left - 12)}px`;
  };
  btn.addEventListener('click', () => set(nav.hidden));
  document.addEventListener('click', (e) => { if (!box.contains(e.target)) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || nav.hidden) return;
    set(false);
    btn.focus();
  });
}
