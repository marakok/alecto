import { icon } from './icons.js';

/**
 * The living demo: case allocation, playing itself. A new instruction comes in, three checks run against
 * the team (case type, room this week, then the introducer's preference or the lowest load), the people who
 * don't fit drop out with a reason, and one conveyancer is assigned; their load ticks up. Then the next one.
 * After the launch video "Case allocation". Everyone and everything here is illustrative.
 *
 * <div class="alloc" data-alloc="compact|full">: compact (homepage) shows four people, full (platform page)
 * shows the whole team. It plays while on screen, with pause and next buttons. With reduced motion it shows
 * each result straight away and moves on only when you press next.
 */
const TEAM = [
  { id: 'grace', name: 'Grace Adeyemi', role: 'Solicitor', load: 68.4, takes: ['purchase', 'sale', 'leasehold', 'newbuild'], pref: ['Northgate Homes'] },
  { id: 'ravi', name: 'Ravi Patel', role: 'Senior Conveyancer', load: 57.6, takes: ['purchase', 'sale', 'remortgage'], pref: [] },
  { id: 'sophie', name: 'Sophie Clarke', role: 'Licensed Conveyancer', load: 68.2, takes: ['purchase', 'sale', 'leasehold', 'shared', 'newbuild'], pref: ['Harbour Estates'] },
  { id: 'ruby', name: 'Ruby Chen', role: 'Solicitor', load: 42.1, takes: ['purchase', 'leasehold'], pref: [], away: 'On leave until Thu' },
  { id: 'freya', name: 'Freya Lambert', role: 'Conveyancer', load: 64.2, takes: ['purchase', 'sale', 'leasehold', 'remortgage'], pref: [] },
  { id: 'marcus', name: 'Marcus Bennett', role: 'Licensed Conveyancer', load: 118.5, takes: ['purchase', 'sale', 'remortgage', 'leasehold', 'shared', 'newbuild'], pref: [] },
];
const COMPACT = ['grace', 'ravi', 'sophie', 'ruby'];

const CASES = [
  { title: 'Leasehold purchase', meta: 'Introduced by Northgate Homes', where: 'Flat 3, 22 Harbour Street, Bristol', type: 'leasehold', typeText: 'Takes leasehold cases', by: 'Northgate Homes' },
  { title: 'Remortgage', meta: 'Direct client · Halifax', where: '8 Mill Lane, Bath', type: 'remortgage', typeText: 'Takes remortgages' },
  { title: 'Shared ownership purchase', meta: 'Introduced by Harbour Estates', where: '41 Quay Road, Cardiff', type: 'shared', typeText: 'Takes shared ownership', by: 'Harbour Estates' },
  { title: 'Sale and purchase', meta: 'Chain of three · direct client', where: '14 Elm Road, Leeds', type: 'sale', typeText: 'Takes sales and purchases' },
];

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const initials = (n) => n.split(' ').map((w) => w[0]).join('');

export function initAlloc({ reduce }) {
  document.querySelectorAll('[data-alloc]').forEach((el) => run(el, reduce));
}

function run(el, reduce) {
  const team = TEAM.filter((p) => el.dataset.alloc === 'full' || COMPACT.includes(p.id)).map((p) => ({ ...p, start: p.load }));
  el.innerHTML = `
    <div class="alloc-head">
      <span class="alloc-title"><span class="live-dot" aria-hidden="true"></span>Case allocation<small class="mono">Live</small></span>
      <span class="alloc-count mono" aria-live="polite"></span>
      <span class="alloc-ctrl">
        <button type="button" class="a-btn" data-act="pause" aria-label="Pause the demo">${icon('pause')}</button>
        <button type="button" class="a-btn" data-act="next" aria-label="Next instruction">${icon('next')}</button>
      </span>
    </div>
    <div class="alloc-flow">
      <div class="a-card a-in"><small class="mono">New instruction</small><b class="a-case"></b><span class="a-meta"></span><span class="a-where"></span></div>
      <ol class="a-checks">${[0, 1, 2].map(() => `<li><span class="a-tick">${icon('check')}</span><span class="a-text"></span></li>`).join('')}</ol>
      <div class="a-card a-out"><span class="pill">Assigned</span><span class="av lg"></span><b class="a-name"></b><span class="a-role"></span></div>
    </div>
    <div class="alloc-team" role="list">${team.map((p) => `
      <div class="a-row" role="listitem" data-id="${p.id}">
        <span class="av">${initials(p.name)}</span>
        <span class="a-who"><b>${p.name}</b><small>${p.role}</small></span>
        <span class="a-why"></span>
        <span class="a-load"><span class="lbar"><i></i></span><small class="pct"></small></span>
      </div>`).join('')}
    </div>`;

  const $ = (s) => el.querySelector(s);
  const checks = [...el.querySelectorAll('.a-checks li')];
  const rows = Object.fromEntries(team.map((p) => [p.id, el.querySelector(`.a-row[data-id="${p.id}"]`)]));
  const pauseBtn = $('[data-act="pause"]');

  const paint = (p) => {
    const r = rows[p.id];
    r.querySelector('.lbar i').style.setProperty('--w', `${Math.min(p.load, 100)}%`);
    r.querySelector('.lbar').classList.toggle('over', p.load > 100);
    r.querySelector('.pct').textContent = `${p.load.toFixed(1)}%`;
  };
  team.forEach(paint);

  let n = 0;
  let token = 0; // bumps on "next", so a running scenario stops where it is
  let paused = reduce;
  let visible = false;
  let wake = null;

  // wait ms, holding while paused or off screen; resolves false if the scenario was skipped
  const wait = async (ms, my) => {
    const step = 50;
    for (let t = 0; t < ms;) {
      if (my !== token) return false;
      if (!paused && visible) t += step;
      await new Promise((r) => { wake = r; setTimeout(r, step); });
    }
    return my === token;
  };

  async function play(my) {
    const c = CASES[n % CASES.length];
    if (n % CASES.length === 0) team.forEach((p) => { p.load = p.start; paint(p); }); // a fresh week each loop
    $('.alloc-count').textContent = `Instruction ${String((n % CASES.length) + 1).padStart(2, '0')} / ${String(CASES.length).padStart(2, '0')}`;
    el.classList.remove('done');
    el.querySelectorAll('.a-row').forEach((r) => { r.classList.remove('out', 'win', 'look'); r.querySelector('.a-why').textContent = ''; });
    checks.forEach((li) => { li.className = ''; li.querySelector('.a-text').textContent = ''; });
    $('.a-case').textContent = c.title;
    $('.a-meta').textContent = c.meta;
    $('.a-where').textContent = c.where;
    el.classList.add('fresh');
    void el.offsetWidth; // restart the card's entrance
    el.classList.remove('fresh');

    // the three checks: who drops out at each, and why
    let left = team.slice();
    const drop = (who, why) => {
      who.forEach((p) => { rows[p.id].classList.add('out'); rows[p.id].querySelector('.a-why').textContent = why(p); });
      left = left.filter((p) => !who.includes(p));
    };
    const steps = [
      { text: c.typeText, run: () => drop(left.filter((p) => !p.takes.includes(c.type)), () => 'Doesn’t take these') },
      { text: 'Has room this week', run: () => drop(left.filter((p) => p.away || p.load > 100), (p) => p.away || 'Over capacity') },
      {
        text: '',
        run: () => {
          const pref = c.by && left.filter((p) => p.pref.includes(c.by));
          if (!left.length) return;
          const pool = pref && pref.length ? pref : left;
          const best = pool.reduce((a, b) => (b.load < a.load ? b : a));
          checks[2].querySelector('.a-text').textContent = pref && pref.length
            ? `Preferred by ${c.by} · at ${Math.round(best.load)}% of capacity`
            : `Most room: at ${Math.round(best.load)}% of capacity`;
          drop(left.filter((p) => p !== best), () => (pref && pref.length ? 'Not preferred' : 'Busier'));
        },
      },
    ];

    if (!(await wait(reduce ? 0 : 1400, my))) return;
    for (let i = 0; i < steps.length; i++) {
      const li = checks[i];
      if (steps[i].text) li.querySelector('.a-text').textContent = steps[i].text;
      li.className = 'run';
      left.forEach((p) => rows[p.id].classList.add('look'));
      if (!(await wait(reduce ? 0 : 1100, my))) return;
      steps[i].run();
      li.className = 'ok';
      el.querySelectorAll('.a-row.look').forEach((r) => r.classList.remove('look'));
      if (!(await wait(reduce ? 0 : 900, my))) return;
    }

    const win = left[0];
    win.load += 2.5; // one more open case against a capacity of 40
    paint(win);
    rows[win.id].classList.add('win');
    $('.a-out .av').textContent = initials(win.name);
    $('.a-name').textContent = win.name;
    $('.a-role').textContent = win.role;
    el.classList.add('done');
    if (!(await wait(5200, my))) return;
    n++;
    play(token);
  }

  const next = () => {
    token++;
    n++;
    wake?.();
    play(token);
  };

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.innerHTML = icon(paused ? 'play' : 'pause');
    pauseBtn.setAttribute('aria-label', paused ? 'Play the demo' : 'Pause the demo');
  });
  $('[data-act="next"]').addEventListener('click', next);
  if (reduce) { pauseBtn.innerHTML = icon('play'); pauseBtn.setAttribute('aria-label', 'Play the demo'); }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.25 }).observe(el);
  play(token);
}
