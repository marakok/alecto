# Alecto web

Marketing site concepts for Alecto Conveyancing.

**Phase 2 · concept 2a leads.** `/` opens it (`index.html` redirects to `/phase-2/concept-2/?v=a`), and the concept
switcher only shows phase 2 (2a–2d). Concepts 1 to 4 are hidden from the switcher but still work at their URLs.

| Concept | URL | Idea |
| --- | --- | --- |
| 1 · Live | `/concept-1/` | Many squares: a live tile skyline that builds per stage, intro loader, scroll motion |
| 2 · One square | `/concept-2/` | One square: it travels from the headline through the whole move and ends as the logo dot |
| 3 · Square by square | `/concept-3/` | No loader: the page builds itself tile by tile, and ~170 squares fly in to build a house as you scroll |
| 4 · Your person | `/concept-4/` | Concept 3's build-up with the human side up front: your conveyancer introduces herself, messages you at every stage, and the team gets a face |
| Phase 2 · 2a–2d | `/phase-2/concept-2/?v=a` … `?v=d` | Concept 2 in four flavors: hero, page load and portraits vary, the one square stays |
| Phase 2 · Company | `/phase-2/concept-2/company/` | About Alecto, in the same family as 2a–2d |
| Phase 2 · Careers | `/phase-2/concept-2/careers/` | Careers, in the same family as 2a–2d |

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

## Phase 2

A second layer of concepts, shown as its own group ("Phase 2") on the concept switcher. Phase 2 pages live under
`phase-2/` with their code under `src/phase-2/`, so the phase 1 concepts stay as they were.

### Concept 2, four flavors

`phase-2/concept-2/index.html`, `src/phase-2/concept-2/`. Concept 2 with the one square journey unchanged, and on top:

- **Brand kit v1.0** (the "Alecto Design System" zip): periwinkle `#5E6AD2` on light, `#8290E8` only on dark (it
  was `#8290E8` everywhere, which reads paler). The logo uses the kit's true Switzer letters (an inline SVG), with the
  dot as an element so the square can take its place. The dot's corners are rounded (`rx 9` on 150, so 6%); every
  square follows (`--dot-r`), and buttons, cards and photos get a small radius (`--ui-r`, 4px). Favicon from the kit.
- **Calmer:** no "Property conveyancing · England & Wales" kicker, an ink news bar, no extra periwinkle blocks in
  the photos.
- **CLC regulated, up front:** in every hero, a different way per flavor.
- **Reviews with photos** of the people (stock dummies from `public/concept-2/`; swap for real clients' photos,
  with their permission).
- **No big periwinkle block behind the portraits:** each flavor tries another backdrop.
- **Page load:** the square starts alone in the middle of a blank screen, pops up, the page fades in and it hops
  onto "drama" as the headline's full stop (`drop`, from 2a, now for every flavor; `loader.js`).
- **The path photo** (`public/phase-2/move-path.jpg`, stock, high-res of `move-3.jpg`): two people carry boxes over
  square stepping stones, and the stones light up in periwinkle, one by one like footsteps, then a soft step runs
  along them (`stones.js`). The stone shapes come from one mask made from the photo
  (`public/phase-2/move-path-stones.png`), each stone clipped to its outline. Without JS or with reduced motion the
  stones are simply lit. A new photo needs a new mask and outlines: `scripts/stone-mask.py` makes both.

| Flavor | Hero | Portraits |
| --- | --- | --- |
| 2a · Calm | Concept 2's hero, decluttered; CLC as a stamp on the photos | warm neutral |
| 2b · Your person | The path photo is the picture, Hannah's promise on a card; CLC under the buttons | ink |
| 2c · Trust first | One centred column, a big CLC badge in the kicker's place, a straight photo strip with the path photo | fine line |
| 2d · Real life | The path photo full width with the headline on it; it pans from the people to the path as you scroll and the stones light as they come into view; CLC and Hannah in a bar | light periwinkle wash |

Mix and match: `?v=` picks the hero and portraits, `?l=` still tries the other page loads (`curtain`, `count`,
`wordmark`), for example `/phase-2/concept-2/?v=c&l=curtain`.

### Company and careers pages

`phase-2/concept-2/company/index.html` and `phase-2/concept-2/careers/index.html`, styled by `src/phase-2/concept-2/pages.css`
on top of `journey.css` and `phase2.css`, with `page.js` as the script. They are prototypes for the client review, to
show the homepage's family on other kinds of page. Every name, number, perk, role and quote on them is dummy (marked in
the markup).

- **Same family:** the same chrome, logo, tokens, rounded-dot squares and calmer news bar. Portraits follow the flavor's
  backdrop.
- **The one square:** the same page load as the homepage. The square lands as the headline's full stop and stays there,
  since there is no journey below it.
- **Company (About Alecto):** office photos with the CLC stamp, a numbers band, the founding story with William's quote,
  four promises, the team, a "Licensed, insured, accountable" block and a hiring CTA.
- **Careers:** open roles in a card next to the headline, why Alecto, a day with Tom on a timeline (the squares are
  the markers), the full roles list, how we hire, and a coffee CTA.
- **One flavor per review:** links between the phase 2 pages carry `?v=` along (`flavor.js`). On these two pages the
  switcher's 2a–2d swap the flavor without leaving the page. They are linked from the homepage nav (Company, Careers;
  Introducers and Lender panel now sit only in the footer) and from the footer's Company column.

## Feedback round 2 (concept 2 leading, concept 4 calmer)

What sets Alecto apart: a real person helps you at every step. Concept 2 now shows that:

- **Brand element, "moving boxes":** two tilted squares, a big box with a smaller one on top, each with a strip of
  tape. They sit large in the background (hero, CTA) and small as a mark (news bar), and shift and tilt as you
  scroll (`src/styles/brand.css`, `src/js/boxes.js`). Markup: `<span class="boxes" data-boxes><i></i><i></i></span>`.
- **Human touch:** Hannah introduces herself in the hero, says what *she* does for you in every chapter of the
  journey, the team has its own section, and reviews have names and portraits. All dummy for now; portraits are
  photo slots with a silhouette (`src/styles/people.css`, shared with concept 4).
- **News bar** at the top with a (dummy) link to the press release.

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

`concept-2/index.html`, `src/concept-2/`. Built from the Figma frame "Alecto · One square, human touched ·
desktop 1440 · Light v11" (file "Alecto web", node 101:6): a hero with a photo collage, three proofs, six step
cards with "Your call" moments, the team on periwinkle blocks, reviews, FAQ and a photo CTA on ink. Colour
tokens for this page (light and dark) sit at the top of `src/concept-2/journey.css`. Photos and cut-outs are
dummies in `public/concept-2/`.

One accent square (the actor) starts as the full stop of the headline and, as you scroll through the six step
cards (pinned on screen and swapping one by one, with a 01 / 06 counter), becomes the ticked checkbox (Instruct), a reading marker (Investigate), the seal between two contracts
(Exchange), the head of a key (Complete), the lit window of the house (Moving day) and finally the logo dot
(Wrap up).

The actor is a fixed element that moves between anchor elements (`data-k`) inside the drawings; anchors
are measured every frame so it stays glued to them. Without JS or with reduced motion the cards stack in
normal flow and every drawing shows its own static square. Concept 2 reuses the shared scroll motion without the square cursor.

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
index.html              redirects "/" to phase 2 · concept 2a
concept-1/index.html    concept 1 page markup
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
Add `?intro` to the URL to force it, for example `http://localhost:5173/concept-1/?intro`.
With reduced motion enabled the loader and build-up are skipped and the finished skyline is shown.

## Placeholder content to replace before launch

- Live activity in the hero (`EVENTS`, `CITIES`, the counters) is illustrative. To make it real, feed it anonymised case events from Alecto's case system.
- Dashboard mockup data (Hannah Reid, 14 Elm Road, dates) is invented.
- Reviews are paraphrased themes from real reviews, not the original wording.
- "5 wks", "replies within 2 hours" and "fixed quote in two minutes" need confirming with Alecto.
- Four FAQ answers say "Answer to be supplied by Alecto".
- Most links point to `#` until the routes exist.
