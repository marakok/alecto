import { icon } from './icons.js';

/**
 * Product UI mock-ups, drawn from data: Alecto's "Case allocation" screen as it appears in the launch video
 * (Admin › Settings › Case allocation). [data-app="allocation"] is the full screen with the sidebar (the
 * platform page hero); [data-app="allocation-mini"] is the table on its own (the feature tabs).
 * All people and numbers are illustrative.
 */
const TYPES = ['Purchase', 'Sale', 'Remortgage', 'Transfer of equity', 'Leasehold', 'Lease extension', 'New build',
  'Shared ownership', 'Right to buy', 'Building Safety Act', 'Auction', 'Unregistered land'];

// name, role, assigning on, load %, case types (1 = takes it, by TYPES), preferred by
const PEOPLE = [
  ['Grace Adeyemi', 'Solicitor', 1, 68.4, '111100101001', ['Northgate Homes', 'Eleanor Whitfield']],
  ['Ben Ashworth', 'Deputy Head of Legal Practice', 0, 49.9, '000011111101', []],
  ['Luke Barrow', 'Conveyancer', 0, 72.2, '111101111101', []],
  ['Marcus Bennett', 'Licensed Conveyancer', 1, 118.5, '111111111101', []],
  ['Ethan Brooks', 'Senior Conveyancer', 0, 4.8, '111100000000', []],
  ['Priya Chandran', 'Solicitor', 0, 4.8, '111100000000', []],
  ['Ruby Chen', 'Solicitor', 0, 178.2, '111100000001', []],
  ['Sophie Clarke', 'Licensed Conveyancer', 1, 68.2, '111101111101', ['Harbour Estates']],
  ['Harriet Cole', 'Conveyancer', 1, 135.9, '111101111101', []],
  ['Yusuf Demir', 'Conveyancer', 1, 181.8, '111100111000', []],
  ['Ravi Patel', 'Senior Conveyancer', 1, 57.6, '111100000000', []],
];

const SIDE = [
  ['', [['home', 'Dashboard'], ['inbox', 'Instructions'], ['pound', 'Quotes'], ['message', 'Communications']]],
  ['Directory', [['building', 'Organisations'], ['users', 'People']]],
  ['Settings', [['user', 'Alecto People'], ['route', 'Case allocation', true], ['calendar', 'Annual leave'], ['pound', 'Pricing']]],
];

const loadCls = (l) => (l > 100 ? 'over' : l >= 95 ? 'near' : '');

function row([name, role, on, load, types, pref], cols) {
  return `<tr class="${on ? '' : 'idle'}">
    <th scope="row"><b>${name}</b><small>${role}</small></th>
    <td><span class="toggle${on ? ' on' : ''}" role="img" aria-label="${on ? 'Assigning' : 'Not assigning'}"></span></td>
    <td><span class="lbar ${loadCls(load)}"><i style="--w:${Math.min(load, 100)}%"></i></span><small class="pct">${load.toFixed(1)}%</small></td>
    <td class="cap"><span>40</span></td>
    ${cols.map((i) => `<td class="tick-cell"><span class="cb${types[i] === '1' ? ' on' : ''}">${types[i] === '1' ? icon('check') : ''}</span></td>`).join('')}
    <td class="pref">${pref.length ? pref.map((p) => `<span class="chip">${icon(/Homes|Estates/.test(p) ? 'building' : 'user')}${p}</span>`).join('') : '<span class="none">None</span>'}</td>
  </tr>`;
}

function table(people, cols) {
  return `<div class="tbl-wrap"><table class="alloc-table">
    <thead><tr><th scope="col">Conveyancer</th><th scope="col">Assign</th><th scope="col">Load</th><th scope="col">Capacity</th>
    ${cols.map((i) => `<th scope="col" class="vert"><span>${TYPES[i]}</span></th>`).join('')}<th scope="col">Preferred by</th></tr></thead>
    <tbody>${people.map((p) => row(p, cols)).join('')}</tbody></table></div>`;
}

function full() {
  const nav = SIDE.map(([g, items]) => `${g ? `<p class="side-group">${g}</p>` : ''}${items.map(([ic, label, on]) => `<span class="side-link${on ? ' on' : ''}">${icon(ic)}${label}</span>`).join('')}`).join('');
  return `<div class="app-win">
    <aside class="app-side">
      <span class="app-logo"><svg class="wm" viewBox="0 -730 2700 746" aria-hidden="true"><use href="#alecto-letters"/></svg><i></i></span>
      <div class="side-nav">${nav}</div>
      <p class="side-me"><span class="av sm">SJ</span><span><b>Sarah</b><small>sarah.jones@alecto.legal</small></span></p>
    </aside>
    <div class="app-main">
      <h3>Case allocation</h3>
      <div class="app-tools"><span class="search">${icon('search')}Search by name or job title…</span><span class="chip">Taking new instructions</span><span class="chip push">${icon('sliders')}How cases count</span></div>
      <p class="app-note">13 of 36 take new instructions. Tick a box to let someone take that kind of case.</p>
      ${table(PEOPLE, TYPES.map((_, i) => i))}
    </div>
  </div>`;
}

function mini() {
  const pick = PEOPLE.filter((p) => p[2]).slice(0, 6);
  return `<div class="app-win solo"><div class="app-main">
    <div class="app-tools"><h3>Case allocation</h3><span class="chip push">${icon('sliders')}How cases count</span></div>
    ${table(pick, [0, 1, 2, 4, 7])}
  </div></div>`;
}

export function initApps() {
  document.querySelectorAll('[data-app]').forEach((el) => {
    el.innerHTML = el.dataset.app === 'allocation' ? full() : mini();
  });
}
