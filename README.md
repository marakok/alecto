# Alecto web

Marketing site concepts for Alecto Conveyancing.

| Concept | URL | Idea |
| --- | --- | --- |
| 1 · Live | `/` | Many squares: a live tile skyline that builds per stage, intro loader, scroll motion |
| 2 · One square | `/concept-2/` | One square: it travels from the headline through the whole move and ends as the logo dot |
Plain HTML, CSS and JavaScript, bundled with [Vite](https://vitejs.dev). No framework.

Design: Figma file "Alecto-web", page **Voorstel 2 — Live** (light and dark frames) for concept 1.

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
