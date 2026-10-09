// Brand gradient used by every tile: cool blue at "Instruct" warming to orange at "Keys".
export const STOPS = ['#9CC0F7', '#7F9BF0', '#5E6AD0', '#8C6BE0', '#BE79E0', '#E085C6', '#F0A36A'];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Colour at position p (0..1) along the brand gradient, as an rgb() string. */
export function mix(p) {
  const s = p * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(s));
  const f = s - i;
  const a = hex(STOPS[i]);
  const b = hex(STOPS[i + 1]);
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',')})`;
}

export const rand = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
