/**
 * The front: what the client sees, never the lawyer's platform (feedback: show the "voorkant"). Two blocks after
 * the client's own prototype, in our style:
 *  - "Fast by default. Proactive by nature." ([data-front="tabs"]): Enquiries, Blockers and Paperwork beside a
 *    live "Your move" panel; the updates for the chosen one arrive one by one, calmly. It moves on by itself
 *    every eight seconds while on screen, until you choose one yourself.
 *  - "Meet your lawyer." ([data-front="accordion"]): three promises beside a chat with your lawyer; each promise
 *    shows its own short conversation.
 * With data-ai on the tabs block (Lines 3), the updates show who did what: the AI's work in the background marked
 * with the star, Hannah's with her square. data-lawyer="Jemima" puts another lawyer's name on the updates.
 * All updates, messages and times are illustrative. Reduced motion: everything is there at once, nothing moves
 * by itself.
 */
const UPDATES = {
  enquiries: [
    ['Your lender confirmed it’s happy', 'Hannah · Fri 09:40', 'Done'],
    ['Seller agreed to extend the lease before completion', 'Hannah · Tue 16:20', 'Done'],
    ['All 12 enquiries answered', 'Hannah · Wed 11:05', 'Done'],
  ],
  blockers: [
    ['Lease is under your lender’s 85-year minimum', 'Hannah · Tue 10:02', 'Spotted'],
    ['Lease extension agreed with the seller', 'Hannah · Thu 14:30', 'Done'],
    ['Lender happy with the new term', 'Hannah · Fri 09:12', 'Done'],
  ],
  paperwork: [
    ['Stamp Duty return filed', 'Hannah · Mon 10:15', 'Done'],
    ['Land Registry updated', 'Hannah · Wed 15:40', 'Done'],
    ['Your documents, all in one place', 'Hannah · Thu 09:00', 'Ready'],
  ],
};
// the same, with what the AI did in the background (Lines 3)
const UPDATES_AI = {
  enquiries: [
    ['Read the seller’s replies overnight, flagged one for Hannah', 'AI · Thu 02:14', 'Checked', 'ai'],
    ['Seller agreed to extend the lease before completion', 'Hannah · Thu 16:20', 'Done'],
    ['All 12 enquiries answered', 'Hannah · Fri 11:05', 'Done'],
  ],
  blockers: [
    ['Spotted the lease is under your lender’s 85-year minimum', 'AI · Tue 06:40', 'Spotted', 'ai'],
    ['Lease extension agreed with the seller', 'Hannah · Thu 14:30', 'Done'],
    ['Checked the new term against your lender’s rules', 'AI · Fri 07:12', 'Checked', 'ai'],
  ],
  paperwork: [
    ['Prepared your Stamp Duty return', 'AI · Mon 05:50', 'Ready', 'ai'],
    ['Stamp Duty return checked and filed', 'Hannah · Mon 10:15', 'Done'],
    ['Land Registry updated', 'Hannah · Wed 15:40', 'Done'],
  ],
};
const CHATS = {
  phone: [['in', 'Morning! I’ll call you at 10 about the survey. Still a good time?'], ['out', 'Perfect, speak then.']],
  first: [['in', 'Quick update: the seller’s lawyer has answered all three lease questions. Nothing needed from you.'], ['in', 'I’ve pencilled in exchange for Thursday. I’ll call you tomorrow to talk it through.'], ['out', 'Amazing, thank you!']],
  outcome: [['in', 'The keys are released. Congratulations, you’re home.'], ['out', 'We’re in! Thank you for everything.']],
};
const DWELL = 8000;

export function initFront({ reduce }) {
  tabs(reduce);
  accordion(reduce);
}

function stagger(list, items, reduce) {
  list.replaceChildren(...items);
  if (reduce) return;
  items.forEach((el, i) => {
    el.classList.add('pre');
    setTimeout(() => el.classList.remove('pre'), 250 + i * 650);
  });
}

function tabs(reduce) {
  const box = document.querySelector('[data-front="tabs"]');
  if (!box) return;
  const btns = [...box.querySelectorAll('.fr-tab')];
  const list = box.querySelector('.fr-updates');
  let cur = 0;
  let auto = !reduce;
  let timer = 0;
  const show = (i) => {
    cur = (i + btns.length) % btns.length;
    btns.forEach((b, k) => { b.setAttribute('aria-selected', String(k === cur)); b.tabIndex = k === cur ? 0 : -1; });
    const items = (box.dataset.ai !== undefined ? UPDATES_AI : UPDATES)[btns[cur].dataset.k].map(([t, by, st, who]) => {
      const li = document.createElement('li');
      const lawyer = box.dataset.lawyer || 'Hannah';
      const av = who === 'ai' ? '<span class="av sm ai"><svg class="icn" aria-hidden="true"><use href="#i-spark"/></svg></span>' : `<span class="av sm">${lawyer[0]}</span>`;
      if (who === 'ai') li.className = 'ai';
      li.innerHTML = `${av}<p><b>${t}</b><small>${by.replace('Hannah', lawyer)}</small></p><span class="fr-pill ${st.toLowerCase()}">${st}</span>`;
      return li;
    });
    stagger(list, items, reduce);
    box.style.setProperty('--dwell', `${DWELL}ms`);
    box.classList.remove('ticking');
    if (auto) { void box.offsetWidth; box.classList.add('ticking'); }
  };
  const stop = () => { auto = false; clearInterval(timer); box.classList.remove('ticking'); };
  btns.forEach((b, i) => b.addEventListener('click', () => { stop(); show(i); }));
  box.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    stop();
    show(cur + d);
    btns[cur].focus();
  });
  show(0);
  if (!auto) return;
  new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (!auto) return;
    if (e.isIntersecting) { show(cur); timer = setInterval(() => show(cur + 1), DWELL); } else box.classList.remove('ticking');
  }, { threshold: 0.4 }).observe(box);
}

function accordion(reduce) {
  const box = document.querySelector('[data-front="accordion"]');
  if (!box) return;
  const qs = [...box.querySelectorAll('.fr-q')];
  const msgs = box.querySelector('.fr-msgs');
  const open = (q) => {
    qs.forEach((x) => x.setAttribute('aria-expanded', String(x === q)));
    const items = CHATS[q.dataset.k].map(([side, text]) => {
      const p = document.createElement('p');
      p.className = `fr-msg ${side}`;
      p.textContent = text;
      return p;
    });
    stagger(msgs, items, reduce);
  };
  qs.forEach((q) => q.addEventListener('click', () => open(q)));
  open(qs[0]);
}
