import { clamp } from '../js/palette.js';

/**
 * The six-step journey as on the other pages, without the travelling square: the step cards pin in place and
 * swap one by one as you scroll, the line drawings draw themselves, the ticks, read lines and the lit window
 * come on as you pass them, and the 01 / 06 counter and bar run along. The drawings keep their own squares
 * (story.css). Needs html.jl, set in <head> when motion is allowed. Used by Phase 3 · Story.
 * The steps' conversations (.st-chat) play when their step comes up: typing dots, then the person's bubbles pop in
 * one after another, then your reply, then "Seen". Where the steps don't pin, when the chat scrolls into view.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function initChats(reduce) {
  const chats = [...document.querySelectorAll('.st-chat')];
  chats.forEach((chat) => {
    const list = chat.querySelector('.fr-msgs');
    if (!list || reduce) return;
    const typing = document.createElement('div');
    typing.className = 'st-typing';
    typing.setAttribute('aria-hidden', 'true');
    typing.innerHTML = '<i></i><i></i><i></i>';
    typing.hidden = true;
    list.prepend(typing);
    const seen = document.createElement('span');
    seen.className = 'st-seen';
    seen.setAttribute('aria-hidden', 'true');
    seen.textContent = 'Seen';
    list.append(seen);
    chat.classList.add('anim');
    let run = 0;
    chat.play = async () => {
      const id = ++run;
      const msgs = [...list.querySelectorAll('.fr-msg')];
      msgs.forEach((m) => m.classList.remove('shown'));
      seen.classList.remove('shown');
      typing.hidden = false;
      await sleep(750);
      if (id !== run) return;
      typing.hidden = true;
      for (const m of msgs) {
        if (id !== run) return;
        if (m.classList.contains('out')) await sleep(650);
        m.classList.add('shown');
        await sleep(420);
      }
      if (id === run) seen.classList.add('shown');
    };
  });
  return chats.filter((c) => c.play);
}

export function initJourney({ reduce }) {
  const chats = initChats(reduce);
  const journey = document.getElementById('journey');
  const track = document.getElementById('track');
  if (reduce || !journey || !track || !document.documentElement.classList.contains('jl')) {
    // not pinned: each conversation plays once it scrolls into view
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.play();
    }), { threshold: 0.6 });
    chats.forEach((c) => io.observe(c));
    return;
  }
  const steps = [...journey.querySelectorAll('.step')];
  const arts = [...journey.querySelectorAll('.art')];
  const count = document.getElementById('jcount');
  const bar = document.getElementById('jbar');
  const N = steps.length;
  const pad = (n) => String(n).padStart(2, '0');
  journey.querySelectorAll('.ink, .faint').forEach((el) => el.setAttribute('pathLength', '1'));

  // where things are reached, in steps (0.5 = the middle of step 1), as on the other pages
  const READ = { read1: 1.22, read2: 1.5, read3: 1.78 };
  const WINDOW = 4.42;
  const ticks = [...journey.querySelectorAll('.tick')];
  const readLines = [...journey.querySelectorAll('.rl')];
  const homeArt = journey.querySelector('[data-art="home"]');

  let J = 0;
  let seg = 1;
  const measure = () => {
    J = track.getBoundingClientRect().top + scrollY;
    seg = (track.offsetHeight - innerHeight) / N;
  };
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  new ResizeObserver(measure).observe(document.body);

  let active = -1;
  const frame = () => {
    const pj = (scrollY - J) / seg;
    const ch = clamp(Math.floor(pj), 0, N - 1);
    if (ch !== active) {
      active = ch;
      steps.forEach((s, i) => s.classList.toggle('on', i === ch));
      steps[ch].querySelector('.st-chat')?.play?.(); // the step's conversation plays as it comes up
      arts.forEach((a, i) => a.classList.toggle('on', i === ch));
      count.textContent = `${pad(ch + 1)} / ${pad(N)}`;
    }
    bar.style.transform = `scaleX(${clamp(pj / N, 0, 1)})`;
    ticks.forEach((t) => t.classList.toggle('lit', pj >= Number(t.dataset.tick)));
    readLines.forEach((l) => l.classList.toggle('lit', pj >= (READ[l.dataset.read] ?? 99) + 0.05));
    homeArt?.classList.toggle('hit-window', pj >= WINDOW);
  };
  addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });
  frame();
}
