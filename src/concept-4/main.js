import { initTheme } from '../js/theme.js';
import { initMotion } from '../js/motion.js';
import { prefersReducedMotion } from '../js/palette.js';
import { initPageBuild, initHouse } from '../js/build.js';

/**
 * Concept 4: Your person, step by step.
 * Concept 3's build-up (the page assembles itself, a house is built square by square as you scroll),
 * with the human side up front: the conveyancer introduces herself in the hero, messages you at every
 * stage of the build, and the team who handle the move get their own section.
 * People, names and messages are illustrative; replace them with the real Alecto team.
 */

// What your conveyancer says at each stage. "you" lines are the client's replies.
const MESSAGES = [
  [{ text: 'Morning Sarah! Your ID is verified and your terms are ready to sign. It takes two minutes.' }, { you: true, text: 'Signed. That was easy.' }],
  [{ text: 'Searches are back and they look clean. One question on the boundary: I’ve already asked the seller’s side.' }],
  [{ text: 'We’ve exchanged! Completion is booked for Friday the 14th. This is real now.' }, { you: true, text: 'Can’t quite believe it. Thank you!' }],
  [{ text: 'Funds are through and completion is confirmed. Congratulations, it’s yours.' }],
  [{ text: 'Keys are waiting for you at the agent’s. Enjoy your first night in. I’ll finish the paperwork.' }, { you: true, text: 'We’re in. Thank you, Hannah.' }],
];

const reduce = prefersReducedMotion();
const root = document.documentElement;
root.classList.add('pbjs');
initTheme(document.getElementById('theme'));
initMotion({ reduce, cursor: false, reveals: false });

const live = root.classList.contains('bl') && !reduce;
const chat = createChat(document.getElementById('chat'), live);
Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 400))]).then(() => initPageBuild({ live }));
initHouse({ live, onStage: chat.show });

/**
 * A small message thread. Moving forward a stage, Hannah "types" and then her message lands;
 * moving back, the thread simply shows that stage. Only the latest few bubbles stay on screen.
 */
function createChat(log, animate) {
  if (!log) return { show() {} };
  let stage = -1;
  let timers = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const bubble = (m, instant) => {
    const b = document.createElement('p');
    b.className = `msg${m.you ? ' you' : ''}${instant ? '' : ' pop'}`;
    b.textContent = m.text;
    return b;
  };
  const trim = () => { while (log.children.length > 3) log.firstElementChild.remove(); };

  // Hold the first message until the thread is actually on screen, so you see Hannah type it.
  let seen = !animate;
  let pending = null;
  if (!seen) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      seen = true;
      if (pending !== null) show(pending);
    }, { threshold: 0.5 });
    io.observe(log.parentElement);
  }

  function show(next) {
    if (!seen) { pending = next; return; }
    const forward = next === stage + 1;
    stage = next;
    clear();
    log.querySelector('.typing')?.remove();
    const msgs = MESSAGES[next] || [];
    if (!animate || !forward) {
      // Jumped or scrolled back: show this stage's thread as it stands.
      log.textContent = '';
      const prev = MESSAGES[next - 1];
      if (prev) log.appendChild(bubble(prev[prev.length - 1], true)).classList.add('old');
      msgs.forEach((m) => log.appendChild(bubble(m, true)));
      trim();
      return;
    }
    [...log.children].forEach((c) => c.classList.add('old'));
    let t = 250;
    msgs.forEach((m) => {
      if (!m.you) {
        timers.push(setTimeout(() => {
          const typing = document.createElement('p');
          typing.className = 'msg typing';
          typing.setAttribute('aria-label', 'Hannah is typing');
          typing.innerHTML = '<i></i><i></i><i></i>';
          log.appendChild(typing);
          trim();
        }, t));
        t += 900;
      }
      timers.push(setTimeout(() => {
        log.querySelector('.typing')?.remove();
        log.appendChild(bubble(m));
        trim();
      }, t));
      t += m.you ? 700 : 900;
    });
  }
  return { show };
}
