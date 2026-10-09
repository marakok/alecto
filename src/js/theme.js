// Light / dark toggle. With no saved choice the page follows the OS setting (prefers-color-scheme).
const KEY = 'alecto-theme';

function current() {
  const set = document.documentElement.getAttribute('data-theme');
  if (set) return set;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function initTheme(button) {
  if (!button) return;
  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch (e) { /* storage blocked: theme still switches */ }
  });
}
