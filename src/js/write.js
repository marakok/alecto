/**
 * Writing: the square as a cursor. It runs along each line of a heading, and the words appear just behind it
 * with a soft edge, from a faint ghost of themselves to full colour (after "Alecto · Motion Experiment v1").
 *
 * writeAt(words, k, opts) places the cursor at progress k (0..1) and paints the words: words is the list of
 * word spans (inline-block), opts.size the square's size, opts.end the full stop ({ x, y } in px, fixed) when
 * the cursor should end there, opts.below how far under the baseline it runs. Returns { x, y } for the
 * square's top left, in px (fixed). Lines are found from the words' boxes, so it follows any wrap. Each word gets --x: how far the cursor is past its left edge; CSS
 * turns that into a mask (.writing in phase3.css).
 */
const JUMP = 120; // a line break counts as this many px of travel

export function writeAt(words, k, { size, end, below = 0 }) {
  const rs = words.map((w) => w.getBoundingClientRect());
  const lines = [];
  rs.forEach((r, i) => {
    const L = lines[lines.length - 1];
    if (L && Math.abs(r.top - L.top) < r.height / 2) { L.x1 = r.right; L.ids.push(i); } else lines.push({ top: r.top, h: r.height, x0: r.left, x1: r.right, ids: [i] });
  });
  const last = lines[lines.length - 1];
  // the baseline: from the full stop when there is one, else about a fifth up from the bottom of the line
  const off = end ? last.top + last.h - (end.y + size) : null;
  const y = (l) => l.top + l.h - (off ?? l.h * 0.2) - size + below;
  lines.forEach((l) => { l.x1 += 4; });
  if (end) last.x1 = end.x;

  const lens = lines.map((l) => Math.max(1, l.x1 - l.x0));
  const total = lens.reduce((a, b) => a + b, 0) + JUMP * (lines.length - 1);
  let s = Math.min(1, Math.max(0, k)) * total;
  let li = 0;
  while (li < lines.length - 1 && s > lens[li] + JUMP) { s -= lens[li] + JUMP; li++; }

  let x;
  let top;
  let done = li; // lines before this one are written in full
  if (s <= lens[li]) {
    x = lines[li].x0 + s;
    top = y(lines[li]);
  } else { // between two lines: a quick hop from the end of this one to the start of the next
    const j = (s - lens[li]) / JUMP;
    const e = j < 0.5 ? 2 * j * j : 1 - Math.pow(-2 * j + 2, 2) / 2;
    const a = lines[li];
    const b = lines[li + 1];
    x = a.x1 + (b.x0 - a.x1) * e;
    top = y(a) + (y(b) - y(a)) * e - Math.sin(Math.PI * j) * 24;
    done = li + 1;
  }

  lines.forEach((l, n) => l.ids.forEach((i) => {
    const v = n < done ? 99999 : n > li || n >= done + 1 ? -99999 : x - rs[i].left;
    words[i].style.setProperty('--x', `${Math.round(v)}px`);
  }));
  return { x, y: top };
}
