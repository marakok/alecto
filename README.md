# Alecto web

Marketing site concepts for Alecto Conveyancing.

| Concept | URL | Idea |
| --- | --- | --- |
| 1 · Live | `/` | Many squares: a live tile skyline that builds per stage, intro loader, scroll motion |
| 2 · One square | `/concept-2/` | One square: it travels from the headline through the whole move and ends as the logo dot |
| 3 · Square by square | `/concept-3/` | No loader: the page builds itself tile by tile, and ~170 squares fly in to build a house as you scroll |
| 4 · Your person | `/concept-4/` | Concept 3's build-up with the human side up front: your conveyancer introduces herself, messages you at every stage, and the team gets a face |
Plain HTML, CSS and JavaScript, bundled with [Vite](https://vitejs.dev). No framework.

Design: Figma file "Alecto-web", page **Voorstel 2 — Live** (light and dark frames) for concept 1.

## Concept 4: Your person, step by step

`concept-4/index.html`, `src/concept-4/`. Built on concept 3 (it loads `src/concept-3/build.css` and the shared
`src/js/build.js`), after client feedback: keep the build-up, bring the human touch forward.

- **Hero:** a card where the conveyancer introduces herself, with a handwritten signature (Caveat) and "Online now".
- **Build:** while the house builds, she messages you at every stage (typing indicator, then her message, sometimes
  your reply). Messages live in `MESSAGES` in `src/concept-4/main.js`.
- **Your team:** four people with portrait, role and one personal line.
- **Placeholders:** names, words and portraits are illustrative. Swap the initials `<span>` inside `.portrait` for an
  `<img>` when Alecto supplies photos.

## Feedback round 2 (concept 2 leading, concept 4 calmer)

What sets Alecto apart: a real person helps you at every step. Concept 2 now shows that:

- **Brand element, "moving boxes":** two tilted squares, a big box with a smaller one on top, each with a strip of
  tape. They sit large in the background (hero, CTA) and small as a mark (news bar), and shift and tilt as you
  scroll (`src/styles/brand.css`, `src/js/boxes.js`). Markup: `<span class="boxes" data-boxes><i></i><i></i></span>`.
- **Human touch:** Hannah introduces herself in the hero, says what *she* does for you in every chapter of the
  journey, the team has its own section, and reviews have names and portraits. All dummy for now; portraits are
  photo slots with a silhouette (`src/styles/people.css`, shared with concept 4).
- **News bar** at the top with a (dummy) link to the press release.
- **Hero photo through the brand element:** on the right of the hero, the big moving box is a window onto a photo of
  Hannah helping a couple. The box tilts with scroll while the photo stays level; the small accent box sits on its
  corner, and Hannah's card (with her face cropped from the same photo) overlaps it. Dummy stock photo:
  [Vitaly Gariev on Unsplash](https://unsplash.com/photos/TB2UuDIQOR0) (Unsplash License), hotlinked from
  images.unsplash.com. Replace with a real, self-hosted photo of the Alecto team before launch.

Concept 4 is calmer: blocks fade up instead of tiling in, and the squares settle gently from above instead of flying,
spinning and glowing (`calm: true` in `src/js/build.js`). Hannah is "Hannah Reid" everywhere, matching concept 1.

## Concept 3: Square by square

`concept-3/index.html`, `src/concept-3/`, with the build engine in `src/js/build.js` (shared with concept 4). There is no loader: the page builds itself.

- **Page build:** every block marked `data-build` (optional value: delay in ms) is covered by page-coloured
  tiles that lift in a diagonal sweep, each flashing a brand colour. The hero builds on load, the rest as it
  scrolls in.
- **The house:** a pinned section scrubbed by scroll. The headline full stop lifts off and becomes the first
  foundation square, then ~170 squares fly in on curved, spinning paths to build a 15 × 16 pixel house, one
  stage per chapter: foundation (Instruct), walls (Investigate), roof (Exchange), lit windows and chimney
  (Complete), and an open, glowing front door (Keys). Scrolling back takes it apart again.
- With `prefers-reduced-motion` (no `html.bl`), the house is drawn complete and the chapters stack in normal flow.

## Concept 2: One square, one journey

`concept-2/index.html`, `src/concept-2/`. The only colour on the page is one accent square (the actor).
It starts as the full stop of the headline and, as you scroll through a pinned six-chapter story, becomes
the ticked checkbox (Instruct), a reading marker (Investigate), the seal between two contracts (Exchange),
the head of a key (Complete), the lit window of the house (Moving day) and finally the logo dot (Wrap up).

The actor is a fixed element that moves between anchor elements (`data-k`) inside the drawings; anchors
are measured every frame so it stays glued to them. Without JS or with reduced motion the chapters stack
normally and every drawing shows its own static square. Concept 2 reuses the shared scroll motion
without the square cursor, so there is only ever one square on screen.

## Run it

Uses [Bun](https://bun.sh) as package manager and runtime (Vite runs on Bun via `bunx --bun`).

```bash
bun install
bun run dev       # local dev server with hot reload
bun run build     # static build into dist/
bun run preview   # serve the build locally
```

`dist/` is a static site and can go to any host (Vercel, Netlify, Cloudflare Pages, S3).

## Structure

```
index.html              all page markup
public/favicon.svg
src/styles/tokens.css   brand colour tokens, light + dark (mirrors the Figma variables "Alecto / Brand")
src/styles/main.css     layout, components and sections
src/styles/motion.css   scroll motion, sticky header, cursor, footer wordmark
src/js/main.js          entry: wires everything up
src/js/loader.js        intro: blocks fall into a square, collapse into the dot, dot lands in the headline
src/js/hero.js          live hero: tile skyline per stage, live activity toasts, cursor lift
src/js/decor.js         stage stacks (How it works) and the CTA skyline
src/js/motion.js        scroll motion (Lenis smooth scroll, reveals, counters, scroll-linked panel)
src/js/theme.js         light / dark toggle
src/js/palette.js       brand gradient + small helpers
concept-2/index.html    concept 2 page
src/concept-2/          concept 2 styles and the travelling-square script
vite.config.js          builds both pages
```

## Design rules

- **Square, always.** Every corner is 0, matching the logo dot. Only avatars (people) are round.
- **The dot is the signature.** Section headings end in the accent square instead of a full stop.
- **Colour comes from tokens.** Change values in `tokens.css`, never in components. The tile gradient lives in `palette.js` (`STOPS`).
- **Dark mode** follows the OS setting by default. The toggle saves the choice in `localStorage` (`alecto-theme`).

## Scroll motion

One idea throughout, taken from the logo: things are blocks that drop into place.

- Smooth scrolling with [Lenis](https://github.com/darkroomengineering/lenis); anchor links scroll smoothly with a header offset.
- Section headings rise word by word from a mask, then the accent square drops in as the full stop.
- Cards, reviews, steps, stats and FAQ rows slide up into their slot one after another.
- The stage stacks (How it works) and the CTA skyline are built block by block when they come into view.
- The dashboard panel opens up and the app lifts into place, linked to scroll position.
- Stats count up; the hero copy drifts and fades as you leave it.
- Header turns solid after scrolling, hides when scrolling down and returns when scrolling up. A thin accent line shows reading progress.
- On desktop the brand square follows the cursor and becomes an outline over links and buttons.
- The footer ends with a full-width wordmark that builds letter by letter.

Hidden start states only apply when JavaScript adds `html.motion`, so without JS everything is visible. With reduced motion none of this runs.

## Intro loader

The loader plays once per browser session (`sessionStorage` key `alecto-intro-seen`).
Add `?intro` to the URL to force it, for example `http://localhost:5173/?intro`.
With reduced motion enabled the loader and build-up are skipped and the finished skyline is shown.

## Placeholder content to replace before launch

- Live activity in the hero (`EVENTS`, `CITIES`, the counters) is illustrative. To make it real, feed it anonymised case events from Alecto's case system.
- Dashboard mockup data (Hannah Reid, 14 Elm Road, dates) is invented.
- Reviews are paraphrased themes from real reviews, not the original wording.
- "5 wks", "replies within 2 hours" and "fixed quote in two minutes" need confirming with Alecto.
- Four FAQ answers say "Answer to be supplied by Alecto".
- Most links point to `#` until the routes exist.
