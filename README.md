# Alecto web

Marketing site concepts for Alecto Conveyancing.

**Phase 3 leads.** `/` opens it (`index.html` redirects to `/phase-3/`). The concept switcher is back (bottom right):
phase 2 · 2a, the phase 3 Home and Platform pages, and on phase 3 the three type options. Concepts 1 to 4 still work at their URLs.

| Concept | URL | Idea |
| --- | --- | --- |
| 1 · Live | `/concept-1/` | Many squares: a live tile skyline that builds per stage, intro loader, scroll motion |
| 2 · One square | `/concept-2/` | One square: it travels from the headline through the whole move and ends as the logo dot |
| 3 · Square by square | `/concept-3/` | No loader: the page builds itself tile by tile, and ~170 squares fly in to build a house as you scroll |
| 4 · Your person | `/concept-4/` | Concept 3's build-up with the human side up front: your conveyancer introduces herself, messages you at every stage, and the team gets a face |
| Phase 2 · 2a–2c | `/phase-2/concept-2/?v=a` … `?v=c` | Concept 2 in three flavors: the hero and portraits vary, the one square stays. 2a leads |
| Phase 2 · Company | `/phase-2/concept-2/company/` | About Alecto, in the same family as 2a–2c |
| Phase 2 · Careers | `/phase-2/concept-2/careers/` | Careers, in the same family as 2a–2c |
| Phase 3 · Home | `/phase-3/` | Minimal and strict: the light with the leaves, one story, the figures, six steps each with a real person and their message, reviews, FAQ |
| Phase 3 · Home 2 | `/phase-3/home-2/` | The pair with Lines 2: the same page, only the header differs (here a sheer curtain clip). Header, the promise, the figures, the six steps, the AI (no words), Proactive, reviews, FAQ, the evening; titles rise in on scroll (`home-2-page.js`, `home2.css`, `rise.js`, `rise.css`) |
| Phase 3 · Lines | `/phase-3/lines/` | Home as an extra iteration: the square as a system of lines. A grid that draws on load, big tiles with your tile walking home, one grid through the page |
| Phase 3 · Story | `/phase-3/story/` | Home as an extra iteration: the brand story told by the brand's elements, one line per chapter, at your own pace |
| Phase 3 · Lines 2 | `/phase-3/lines-2/` | Home 2's page with its own header: the grid of tiles (no hover) with the curtain clip through a few of them; one slowly closes as another opens. The lines styles (`.p3c`) are scoped to that header |
| Phase 3 · Home 3 | `/phase-3/home-3/` | Option 3: the curtain made instead of filmed in the header, a WebGL2 sheer that sways and moves where the cursor pushes it, no lines over it (`curtain.js`). The closing section keeps the clip under quiet tiles (`home-3-page.js`, `home3.css`) |
| Phase 3 · Lines 3 | `/phase-3/lines-3/` | Lines with one rule: squares are people and your move, the star appears only where squares meet, and that is the AI. Only the star is periwinkle |
| Phase 3 · Prototype | `/phase-3/prototype/` | Everything from the client's own prototype (sections, copy and order), built in the Lines 3 language |
| Phase 3 · Mark | `/phase-3/mark/` | Home as an extra iteration: the logo's own geometry (the dot) as the whole visual language, as Verve did for Miro. A giant cropped corner that zooms out to "alecto.", four squares that meet around the AI star, figures on solid squares |
| Phase 3 · Platform | `/phase-3/product/` | The product page: product screens, feature tabs, the living case allocation demo, AI and people, trust |

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

## Phase 3: the tech behind the people

The concept switcher (tucked into the header behind a small button, `src/js/versions.js`) shows Option 1 (Home 2,
`/phase-3/home-2/`), Option 2 (Lines 2, `/phase-3/lines-2/`), Option 3 (Home 3, `/phase-3/home-3/`) and Platform. Home, Lines, Lines 3, Story, Mark and
Prototype are hidden from it for now but still work by their URL.

`phase-3/index.html` (Home) and `phase-3/product/index.html` (Platform), with their code in `src/phase-3/`. Built on 2a:
they load the phase 2 styles and scripts, and add `phase3.css` and `platform.css` on top. Feedback round 3 (Bas, Will):
lighter type, fewer squares, start showing the AI behind the people and the product, calm, home and movement.

- **Minimal, on every version** (feedback round 6, `minimal.css`, `<body class="… p3min">`): Home is the base, and
  every version now has the same order: hero, one story, the figures, the six steps with real people, reviews, FAQ,
  the evening. The team band, the front blocks, the name note, the icon row, the line through the page (thread.js,
  removed) and the review stars are gone everywhere; Lines no longer builds on the old home (`home.js`, removed) and
  has no page load or travelling square. Each version keeps only its own idea: Lines the grid of tiles, Lines 2 the
  windows, Lines 3 the star (without the notes at every step), Story its story, Mark the corner and the four squares,
  Prototype their content (without the every step/cost/update cards). Purple only for the dot (and the AI star).
  The headline always sits on two lines ("Law that keeps / you moving."), on a phone too. A smaller type scale
  throughout ("modern sites set smaller type"): display sizes about three quarters (the headline 80px at most),
  text a step down (16px, small print 14px).
  **Dark mode is hidden for now:** every phase 3 page sets `data-theme="light"` and `data-theme-lock` in `<head>`, which
  hides the toggle (phase3.css).
- **The steps' conversations, cleaner** (minimal.css, journey.js): no frame of their own any more, straight on the step
  card beside the text. The person is one small line (round photo, name, role, time), the messages short bubbles
  (light with a hairline for them, ink for you, one sharper corner on the speaker's side). When a step comes up:
  typing dots, then the bubbles pop in one by one with a small overshoot, your reply, and "Seen".
- **The clips in the page's own colours** (`--cream-grade` in minimal.css): the curtains are olive green-grey, so a CSS
  grade takes out the green and warms them to the cream of the drawn light (greyscale, a little sepia, a touch
  lighter and softer). It runs on every clip: Home 2's header, the windows in the Lines headers, the closing sections.
- **Option 3 (Home 3), after the header vote:** the full picture of Option 1 with the lines of Option 2 laid over it,
  quietly: hairline grid, tile outlines at a fifth of the ink, the "+" marks and white stars where tiles meet. The words
  stand on the clip's own soft shade, not on Option 2's halo.
- **Option 2's curtain reads as a curtain** (`data-frame`, `data-cluster` in windows.js): the clip is fitted to the
  tiles' field instead of the whole header, so the panes show the whole curtain (folds, the sun behind it) rather than a
  strip; four windows open side by side, one window with the grid's lines as its panes, and a swap moves it a pane at a
  time. Through the panes the grade keeps more light and shadow.
- **Calm ground around Option 2's header text:** each text block hugs its text and carries a soft halo in the header's
  own colour, so the lines and tiles fade out behind the words instead of running through them.
- **Option 2's closing section with its header's brand elements** (Lines 2 only): the grid of tiles, the lines and the
  "+" marks, the curtains seen through a few tiles, one slowly closing as another opens. `windows.js` now handles any
  number of grids per page, each with its own clip (`--lw-clip`).
- **The closing section on the curtains** (Home, Home 2, Lines 2; `.cta-curtain` in minimal.css): the curtain clip
  from the header instead of the dark evening light, in light colours (ink text and button, a soft fade on the left),
  so the page ends in the same light it starts in.
- **No dot writes the text any more** (`headings.js` removed; `rise.js`, `rise.css` on every phase 3 page): the hero
  headline, the section titles and Story's last line rise in word by word, out of a mask and a soft blur. Every
  title ends on the purple square (`stops.js`, also on Platform), which lands last: small, soft, with a little give.
  A title ending in "." gives it up for the square. (Platform's page load still writes its hero headline.)
- **The AI, where our people meet** (`meet.js`, `meet.css`; Home, Home 2, Lines 2): Mark's moment in line squares.
  Pinned: four outlined squares come in from the corners as you scroll and meet, the space between their corners
  lights up as the AI star, the "+" marks appear where the lines cross, then "Where our people meet, our AI works."
  fills in beside them. The squares follow the scroll eased (every frame a step towards it), so it glides.
- **Feedback round 8 (Bas):** Home 2 and Lines 2 are one page with two headers, in the order from the huddle:
  header, the promise ("Moving home should feel calm."), the figures, the six steps, the AI, Proactive, reviews, FAQ,
  the evening. The Lines header has no hover (`data-hover="off"`). The AI component (on Lines 3: tiles centred with
  `data-center` in lines.js) has no words and moves about twice as fast; on Home, Home 2 and Lines 2 it is now the
  meeting squares below. Every drawn light (the figures, the evening)
  now moves like the hero's, so all the "video" components play.
- **Home and Lines 3, feedback round 6 checked point by point:** a calm header (purple only for the full stop; no
  lines: the window cross is gone from the light, and Lines 3 shows only its tiles and the star; no interactive line:
  Hannah's hello and the Lines 3 key are gone). The drawn light with the leaves won over the clips (no watermark,
  and it moves more now: a wider, quicker sway, a soft flutter, a faster drift). Then how it works, right after the
  hero (the six steps without "Your call" bars; no storytelling any more, feedback round 7, also on Home 2), the
  figures, the AI as a story (`.ai-story`: the words beside the four tiles, whose star fills them with what got done
  overnight), Proactive on ink (`.pro-band`) for a change of pace, reviews, FAQ, the evening.
- **Home, minimal** (feedback round 6: "strip everything, minimal and strict"; `home-page.js`, `minimal.css`):
  - Out: the line through the page with its times (thread.js), the hero clip (back to the light with the leaves,
    light.js), the icon row, the team band, the platform demo, the name note, the page load and the travelling
    square, the journey's drawings and its closing wordmark, and the review stars.
  - Order: hero, one story (the two-tone statement), the figures in the midday light, the six steps, reviews, FAQ,
    the evening.
  - **The steps, with real people:** each step shows who does it (Hannah, Tom, Owen) and their message to you, in
    the chat from the front blocks; your replies in ink.
  - **Less purple:** buttons, the news bar, chat replies, step numbers and small marks in ink; purple only for the
    logo dot and the headline's full stop.
- **One element, the square of light** (`light.js`, `light.css`; feedback round 4, after the client's own prototype
  with curtains and leaf shadows). The square is the brand's one element: the logo dot, the cursor that writes the
  headlines, the full stop, and, big, a square of sunlight on a wall at home with leaf shadows and a sheer curtain
  moving through it. Calm (soft light), home (a wall in your house), movement (shadows, and the day passing). The page
  is one day of a move: **07:42 · Offer accepted** (morning light in the hero), **12:10 · Searches back** (midday, the
  figures on a sunlit wall, like the client's leaf photo), **19:30 · Keys in hand** (evening, lamplight, "Let's get
  you *home*"). Drawn in code, so it works in dark mode (evening at home) and costs nothing to load; a real clip
  (for example a Pexels "window light shadows" video) can go behind it later. The accent word in a headline is
  Instrument Serif italic, as in the client's prototype ("keep you *moving*").
- **The thread: the square as a line** (`thread.js`). The light is the calm surface; underneath, the AI never stops
  (Alēktō: unceasing). From the headline's full stop a fine line runs past the light, down the left margin and into
  the evening at the end, drawing itself as you read. Small squares of data keep flowing along it. Where it passes a
  section ([data-thread="label|label"]) there is a node and a vertical label in the margin with what the AI just
  did, the times running on through the night ("03:12 · 3 things flagged for Hannah"); the labels take turns. The
  hero shows "In the background" with what it's working on now ([data-ticker]). Wide screens only. All activity is
  illustrative.
- **Lines, an extra iteration** (`/phase-3/lines/`, `lines.js`, `lines.css`): the square as a system of lines, used
  everywhere, the way Verve uses one shape for everything (Miro). One grid runs through the page: columns every
  `--cell`, measured from the content's right edge.
  - **Page load** (`?l=grid`, the default here): hairlines draw outward from the middle of the empty screen into the
    grid, the square appears, and as the screen lifts the grid carries on in the hero, line for line. Then the square
    writes the headline.
  - **Hero** (`[data-grid]`): big rounded tiles on the grid, bleeding off the right, lines running on to the edges,
    "+" where they cross. One periwinkle tile walks along `data-walk`, cell by cell, up the diagonal (your move,
    going home); small squares of data slide along the lines (the AI at work), in place of Home's single thread.
  - **The star:** where four rounded tiles meet, the space between their corners is a four-pointed star, the AI
    sparkle, made by the squares themselves (`star()` in `lines.js`: four corner arcs). The hero is a field of
    tiles (`data-fill`), so a faint star sits at every crossing; the four round your tile glow periwinkle as it
    walks: the AI working around your move. The platform section shows it slowly: four tiles draw, the star appears
    between them ("Where our people meet, the AI works"). The AI icon (`#i-spark`) is now that same gap shape.
    On hover (mouse only) the tile under the pointer and its four stars light up, then fade slowly: a soft trail.
  - **Update (example video):** the hero is dark, on a clip of window light moving across a wall
    (`public/phase-3/light-wall.mp4`), with thin white outline tiles stepping down the diagonal, periwinkle ones beside
    them (`data-accent`), lines running on and "+" marks at their corners. The evening has the light across a corner
    (`light-corner.mp4`). The hero clip plays at a sixth of its speed, the evening's at a third (`data-rate`). Both clips are watermarked iStock previews: replace them with the licensed files before
    launch. Lines is set in Geist throughout (the accent word leans in Geist instead of switching to the serif), and
    ignores a type choice remembered from another page (`?f=` still works).
  - **The rest of the page:** one paper, no grid in the body (only the hero's tiles react to hover); every section starts on a
    full-width line with a mark on each column; the figures are four cards with room between them, the review as the
    periwinkle one; icons, portraits and photos take the tile's shape; a small grid in the evening CTA, your tile home. More
    room between everything.
- **Story, an extra iteration** (`/phase-3/story/`, `story.js`, `story.css`): the brand story, told by the brand's
  own elements, one line per chapter. The hero is pinned on a dark, still stage while you scroll through seven
  chapters; only one thing happens at a time, and only as you scroll:
  1. "Alecto means 'never stops.'": one square, the dot, alone in the dark.
  2. "The square is data: every document, date and detail of your move.": it multiplies into a field of squares,
     a few labelled (Title register, Searches · 12 Mar, Lease p. 46, …).
  3. "The lines connect it, step by step.": a line draws through the field, square to square.
  4. "AI works quietly in the shadows, bringing light.": the window-light clip fades in behind the field.
  5. "It reads every square so nothing stays hidden.": a band of light sweeps across; every square it passes is read.
  6. "Our lawyer makes every decision together with you.": two squares come forward, the lawyer and you, one line
     between them.
  7. "Law that keeps you moving.": the dot writes the headline as you scroll; the buttons follow.
  Seven small squares at the bottom show where you are. No page load and no travelling square; the journey's
  cards still pin and swap as on the other pages (`journey.js`), its drawings keeping their own squares. Reduced motion: the chapters as a plain list.
- **Lines 2** (`/phase-3/lines-2/`, `windows.js`, `windows.css`): Lines with the hero clip clipped to rounded squares
  just inside a few of the grid's tiles (`data-windows`, `data-open`), the rest of the hero plain ground. Every few
  seconds one window shrinks shut while another opens elsewhere. Windows never open behind the headline, the buttons or
  Hannah's line, so on a phone, where the words fill the hero, they mostly stay shut.
- **Lines 3** (`/phase-3/lines-3/`, `lines3.js`, `lines3.css`): one rule, used everywhere. Squares are people and
  your move; the star only appears where squares meet, and that is where the AI works. No clips; ink lines on paper.
  Periwinkle is kept for the brand's own square (the logo dot, the full stop, the announcement bar) and the star, and
  only the star glows; buttons, avatars, review ratings and the "Your call" strip are ink.
  - **The hero** teaches the rule: the grid draws, four tiles slide together (`data-meet`) and the long lines fade
    away slowly, so the words stand on calm ground. The gap between their corners lights up as
    a big star (`data-r=".3"` on the grid: rounder corners, a bigger star), then it works (`data-work`): a small square
    of data runs from it along the line between two tiles, and that tile fills with what got done ("AI · 02:14,
    Searches ordered"), clockwise, one at a time, without end. On narrow screens the tiles sit below the words.
  - **A key** under the hero: a square for your lawyer and you, a star for the AI in the background.
  - **The star as a mark in the UI:** each journey step says what the AI did beside what Hannah does; the "Your move"
    panel (`data-ai`, front.js) shows the AI's work with the star and Hannah's with her square.
  - **The evening:** four tiles come home and meet round one last star.
- **Prototype** (`/phase-3/prototype/`, `prototype.js`, `prototype.css`): the client's own prototype, section for
  section and in their words (lawyer Jemima, their figures, reviews and FAQ), rebuilt in the Lines 3 language:
  - **Hero:** "Law, made to keep you moving." with the Lines 3 tiles meeting round the AI star; their promise and the key below.
  - **Proactive by default** (two-tone statement), then **the figures** as tiles, the quote on ink.
  - **The usual way, then the lights on** (pinned, `data-lights`): in the dark the cards hang crooked and say
    nothing useful; as you scroll the room lights up, the headline turns to "With Alecto, you see everything" and
    every card turns over to the Alecto way and squares up to the grid.
  - **Every step, every cost, every update** as three tiles (the step you're on is the purple square).
  - **The front blocks** (Proactive, Meet your lawyer) with Jemima (`data-lawyer` in `front.js`).
  - **For moves that should just happen** on an ink panel with the four tiles and the star, and the kinds of move.
  - **Your move, your price** (Buying and Selling), **Moves we've seen through** (their quotes on purple and ink,
    their stories in a row with arrows), **FAQ** and their **footer**: the wordmark, big, behind the ink card.
  Their curtain, leaf and plant footage is left out: the grid and the star carry the page.
- **Mark, an extra iteration** (`/phase-3/mark/`, `mark.js`, `mark.css`), after Verve's Miro rebrand: they took one
  piece of geometry from the logo (the slanted strokes of the M) and made it the whole visual language, cropped huge,
  in flat colour pairs, one movement at a time. Alecto's DNA is the dot, a rounded square. Flat periwinkle and ink on
  warm paper, no outlines or effects:
  - **The hero** (pinned): one giant periwinkle corner glides in from the right, just clear of the headline, and then
    holds still until you scroll. Window light moves through it (the theme clip in duotone: multiplied in light mode,
    screened in dark), with a glimpse of what you see on a card ("Your move · Live · Exchange this week"), and the
    headline ends on the same square, small. As you scroll it zooms out until you see what it is, the full stop of
    "alecto." (the light and the card fade), with "Everything comes down to one point: your move, done."
  - **The aha** (pinned): four solid squares (ink and soft periwinkle, like a chessboard) slide in from the corners and
    meet; the gap between their corners is the AI star, lit in periwinkle. "Where our people meet, our AI works."
    These four are rounder (30%) so the star reads.
  - **Squares that carry content:** the figures on solid squares in the brand colours, sliding into place.
  - **The travelling square:** once the hero lets go, the full stop of "alecto." breaks loose and travels down the page
    (one fixed square, `[data-dot]` anchors): into the middle of the four, where it waits and becomes the star, into
    the first figure (which it fills), then from chapter to chapter, filling the small square beside each eyebrow.
  - **The lower half in squares:** the journey stages and the front panels as flat soft-periwinkle squares, portraits
    cropped in the dot's rounded square, reviews on soft squares with square photos, the FAQ just type and hairlines.
  - **The evening:** the giant corner again, on ink, as a bookend.
- **The front, not the back (feedback):** show only what the client sees, not the lawyer's platform. On Story and
  Lines the case allocation demo (back office) is replaced by two blocks after the client's own prototype, in our
  style (`front.js`, `front.css`): "Fast by default. *Proactive* by nature." (Enquiries, Blockers and Paperwork
  beside a live "Your move" panel whose updates arrive one by one; it moves on every eight seconds until you choose)
  and "Meet your lawyer." (they pick up the phone, they move first, they own the outcome, each with its own short
  chat with your lawyer). Updates, messages and times are illustrative.
- **Slowed clips glide** (`smooth-video.js`): at a third or a sixth of their speed each frame stays up longer, so the
  light moved in small steps. Each clip is now drawn on a canvas in its place, and every new frame is crossfaded in
  over the time it is on screen, so the light glides. The video plays on, hidden, and stays in charge (source, speed,
  opacity). Browsers without `requestVideoFrameCallback` show the video as it is.
- **Clips follow the theme** (`theme-video.js`, `data-src-light` / `data-src-dark`): the white clip (light across a
  corner) in light mode, the black one (light across a dark wall) in dark mode, swapped the moment the theme
  changes. Home and Lines share the video hero (`video-hero.css`, `.hero-home.on-video`); on Home it replaces the
  drawn light behind the headline. The Lines and Home heroes and the Story stage are light in light mode and dark in dark mode; the evening is dark in
  both, on the black clip.
- **Quieter (feedback):** Home has no cycling status in the hero, a few slow data squares on the thread instead of a
  stream, station labels that stay put (`data-thread-swap` brings the turns back), and leaves that sway less and
  don't flutter. Lines has no data sliding along the grid (`data-bits` brings it back), your tile steps every five
  seconds, its stars glow steadily, and the hover patch in the page is fainter.
- **The square writes the text** (`src/js/write.js`, after "Alecto · Motion Experiment v1"): the page load is now
  `write` (`?l=write`, the default on phase 3; `?l=drop` still gives 2a's hop). The square pops up in the middle,
  hops to the start of the headline and writes it line by line, running just under the baseline like a cursor; the
  words go from a faint ghost to full colour just behind it, and it rises into place as the full stop. Section
  headings are written the same way as they scroll into view, by a small square that fades away at the end
  (`headings.js`).
- **Statements fill in as you read** (`words.js`): each word of a two-tone statement starts pale and takes its tone
  as it scrolls up the screen.
- **Type, three options** (`?f=geist|instrument|inter`, remembered in `localStorage` key `alecto-font`; the switcher's
  "Aa" buttons, each in its own face): **Geist** (leads, with Geist Mono for labels), **Instrument Sans**, and **Inter**
  as it was in 2a, to compare. Geist and Instrument Sans are lighter: headings 500 instead of 800.
- **Two-tone statements** (`.two-tone`): one paragraph, a dark lead sentence and a lighter rest, as in the reference.
- **Fewer squares:** icons instead of the brand squares as bullets (the three proofs, "Your call", eyebrows), sparks
  (the AI star) as review ratings, round status dots and avatars, pill buttons, softer cards, no brand squares in the hero and CTA. The one square
  stays where it means something: the logo dot and the headline's full stop that travels through the journey.
  Icons are a small inline sprite (`icons.js`, Lucide's shapes): `<svg class="icn"><use href="#i-user"/></svg>`.
- **The living demo** (`demo.js`, `<div class="alloc" data-alloc="compact|full">`): case allocation playing itself,
  after the launch video "Case allocation". A new instruction comes in, three checks run (case type, room this week,
  then the introducer's preference or the most room), people drop out with a reason, one conveyancer is assigned and
  their load ticks up. Plays while on screen, with pause and next; with reduced motion it waits for next.
- **Product screens** (`app.js`): the Case allocation screen from the video in HTML (sidebar, load, capacity, case
  types, preferred by). Feature tabs (`features.js`): allocation, annual leave (Humaans), document review with AI
  flags, client updates drafted for the conveyancer, and the client's live tracker.
- **Platform page:** hero with the product screen, a statement, the feature tabs, the live demo, "AI that makes room
  for people" (reads, matches and chases, explains, decides) and "Safe, secure and regulated".
- **Placeholders:** every person, case, number, certification (ISO 27001, Cyber Essentials Plus, UK hosting) and the
  three figures under the AI flow are illustrative until Alecto confirms them. Company and Careers still link to the
  phase 2 pages.

## Phase 2

A second layer of concepts, shown as its own group ("Phase 2") on the concept switcher. Phase 2 pages live under
`phase-2/` with their code under `src/phase-2/`, so the phase 1 concepts stay as they were.

### Concept 2, three flavors (for Will: 2a photo right, 2b photo full boxed, 2c photo full width)

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
  onto "drama" as the headline's full stop (`drop`, for every flavor; `loader.js`).
- **The path photo** (`public/phase-2/move-path.jpg`, stock, high-res of `move-3.jpg`): two people carry boxes over
  square stepping stones, and the stones light up in periwinkle, one by one like footsteps, then a soft step runs
  along them (`stones.js`). The stone shapes come from one mask made from the photo
  (`public/phase-2/move-path-stones.png`), each stone clipped to its outline (bump the `?v=` on the mask URL in `phase2.css` after a new mask, so browsers don't keep the old one). Without JS or with reduced motion the
  stones are simply lit. A new photo needs a new mask and outlines: `scripts/stone-mask.py` makes both.

| Flavor | Hero | Portraits |
| --- | --- | --- |
| 2a · Photo right (leads, the default) | The path photo is the picture, Hannah's promise on a card; CLC under the buttons | ink |
| 2b · Photo full, boxed | The path photo in a rounded frame with the headline on it; it pans from the people to the path as you scroll and the stones light as they come into view; CLC under the buttons, no bar | fine line |
| 2c · Photo full width | As 2b, edge to edge | light periwinkle wash |

Mix and match: `?v=` picks the hero and portraits, `?l=` still tries the other page loads (`curtain`, `count`,
`wordmark`), for example `/phase-2/concept-2/?v=b&l=curtain`.

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
- **One flavor:** links between the phase 2 pages carry `?v=` along (`flavor.js`); only 2a is shown. They are linked from the homepage nav (Company, Careers;
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

- `public/phase-3/curtain.mp4` (Home 2's and Lines 2's header, the closing section on Home, Home 2 and Lines 2) is a watermarked iStock preview: replace with the licensed clip.

- Live activity in the hero (`EVENTS`, `CITIES`, the counters) is illustrative. To make it real, feed it anonymised case events from Alecto's case system.
- Dashboard mockup data (Hannah Reid, 14 Elm Road, dates) is invented.
- Reviews are paraphrased themes from real reviews, not the original wording.
- "5 wks", "replies within 2 hours" and "fixed quote in two minutes" need confirming with Alecto.
- Four FAQ answers say "Answer to be supplied by Alecto".
- Most links point to `#` until the routes exist.
