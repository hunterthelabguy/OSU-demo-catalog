# Build plan and current state

Companion to [spec-v0.1.md](spec-v0.1.md). The spec says what is being built and
why. This file says what exists today, what is planned next, and which spec
decisions have been amended since it was written.

Last updated: 2026-08-15

---

## Current state

**The proof-of-concept trio is complete** (spec §7 steps 1 through 3):
validated records, demonstration pages with print stylesheet, and the faceted
index with Pagefind search. Since then: a dark scheme following
`prefers-color-scheme` with print forced light, the `/reflect` and
`/handoff` agent commands, and the desktop design pass ruled from the mockup
round (amendment 12): masthead band, facet sidebar with counts, filter
chips, and the predict-first detail page, with the theme's contrast pairs
under test. 84 tests; `npm run verify` is the gate; production tracks
`main` at https://osu-demo-catalog.vercel.app.

Remaining engineering is phase 5 (photo ingest script, cached PIRA list),
phase 6 (mobile, ruled 2026-08-15 in amendment 11; the desktop half of the
design round shipped as amendment 12, and the mobile half awaits the owner's
ruling), and phase 7 (installable offline catalog). The gate on the faculty
showing is content: 8 to 12 records at `verified` depth, which requires the
owner, the stockroom, and a camera.

The latent `target_misconceptions` edge is fixed (2026-08-15): the prediction
section now renders when either the prompt or the misconceptions exist, so
neither is silently dropped.

The documentation pass that preceded it settled the licensing split and the
commit-authorship discipline before any code existed, inverting spec §7, which
scheduled the README and LICENSE at step 6: those two decisions are the ones
that get expensive to change after the fact, and both were free to settle
first.

Deployed: the owner completed the Vercel import on 2026-08-12. Production
tracks `main` at https://osu-demo-catalog.vercel.app, pull requests get preview
URLs, and the repository homepage field points at production. Spec §9's caution
still stands: do not circulate the URL beyond the faculty preview until the
infrastructure is final, because a propagated link is the expensive thing to
change.

---

## Decisions settled after the spec was written

Ruled in session on 2026-08-12.

| Question | Ruling |
|---|---|
| Repository visibility | Originally private until the faculty preview. **Flipped public 2026-08-12**, before any deploy existed, to unlock branch rulesets on the free plan. Spec §9's caution still applies: the thing not to circulate early is a URL, and there is none yet. |
| Commit author identity | `hunterthelabguy` with the GitHub noreply address, set repo-local before the first commit existed. |
| Tests and CI | Full practice floor, planned below, deliberately not built in the documentation pass. |
| Index card rendering | Cards baked into the built HTML at build time. See amendment 3. |

### Branch protection: resolved

While the repository was private, rulesets were refused with HTTP 403 ("Upgrade
to GitHub Pro or make this repository public to enable this feature"), so the
first two documentation commits landed on `main` directly, protected by
convention only. The moment visibility flipped, the ruleset was applied:
`main-protection` (id 20779940), active, requiring a pull request and a passing
`verify` check, and forbidding deletion and force pushes. Also applied earlier:
topics, wiki and projects disabled, delete-branch-on-merge.

One consequence worth stating: rulesets cannot express "documentation may land
directly." **Every change now rides a pull request**, including docs. That is
more ceremony than the working agreement strictly requires, and it is accepted:
a docs PR costs a minute, and a protection rule with a human-judgment escape
hatch is not a protection rule.

---

## Amendments to the spec

The spec file itself is left unedited; these are the deltas. The first six were
raised in the initial review, the seventh at scaffold time.

**1. Commit-identity hazard was understated.**
Spec §7 step 0 is correct that authorship comes first, but the machine's global
git config pointed at a different identity and a personal Gmail address. A single
`git init` plus `git commit` would have written that address into history
permanently. Repo-local config now sits between init and the first commit, using
GitHub's noreply address rather than a real mailbox, since this history will
eventually be public and commit emails are scraped.

**2. Visibility.** Covered above. Spec §2's justification for Vercel ("forkable
and redeployable by anyone") and §9's "the repo is public" are both forward-looking
rather than currently true.

**3. Search plus facets is the riskiest integration, and the spec did not name it.**
Free-text search and combinable facets are two different mechanisms. Pagefind has
native filters, but leaning on them means index cards get constructed by client
JavaScript from `data-pagefind-meta` strings: stringly-typed, awkward for hazard
chip lists, and it moves card markup out of the template layer.

Ruled instead: **bake every demo card into the index HTML at build time, filter by
toggling `data-*` attributes, and use Pagefind only as a source of matching URLs
for free-text queries.** One source of card markup, facets that work before
anything is typed, and a full grid with live links when JavaScript is off. Both
approaches deploy as pure static files with no server; the difference is only
where the card markup comes from. Revisit if the index HTML becomes heavy, which
at a few hundred records it should not.

**4. The spec has no tests and no CI.** Added to the plan. See phase 1 and 2.

**5. `slug` is load-bearing, and the spec did not say so.**
Astro's content loader derives an entry id from the file path, so
`demos/rotating-stool-dumbbells/index.md` would become the id
`rotating-stool-dumbbells/index`. The frontmatter `slug` overrides that. It is
therefore not redundant with the directory name, and it is separately the durable
identifier a future request system stores verbatim (spec §5). Recorded in the
README field reference, and to be asserted by test rather than trusted to
convention.

**6. Print stylesheet moved earlier.** Spec §7 scheduled it at step 5, after the
index page. It is nearly free while the demo page template is already open and
tedious to retrofit. Folded into phase 3.

**7. Astro 7, not Astro 5.**
The spec and the original plan assumed Astro 5, which was current when they were
drafted. At scaffold time the current major was 7, and a fresh install of 5.x
reported eight high-severity advisories (an XSS batch, a Windows dev-server
file-read in esbuild, libvips CVEs in sharp), all resolved on 7. On a greenfield
repo the major-version choice is free, the spec's reasons for Astro (build-time
schema validation, near-zero client JS) are unchanged in 7, and the scaffold ran
green on 7.2.1 without modification. `npm audit` reports zero vulnerabilities.
A credibility artifact should not open with two highs in every install log.

**8. Type and accent re-ruled after review, 2026-08-12.**
The phase 3 defaults (Archivo, Source Serif 4, IBM Plex Mono, stamp crimson)
read wrong to the owner. Re-ruled: Atkinson Hyperlegible Next throughout with
its companion mono, chosen as the most friendly and accessible face available
(commissioned by the Braille Institute; unambiguous letterforms), and OSU
Beaver Orange as the default accent, split into two tokens because the raw
orange misses WCAG AA for small text on the paper ground. Spec §6's "avoid
warm-cream-plus-terracotta" is knowingly overridden for the accent: the
institution's actual brand color does not read as generated, it reads as the
institution. Everything a fork would re-rule now lives in
`src/styles/theme.css`, one file. Extended 2026-08-12 with a dark scheme:
`--accent-deep` became `--accent-text` (the AA-safe accent text color in each
scheme), a `--surface` token replaced the last hardcoded whites, and print
forces the light tokens so dark-mode users print catalog pages.

**9. Accessibility earned a frontmatter field, 2026-08-13.**
The extraction pass over the stockroom's demo library document found per-sense
accessibility guidance (hard of hearing, visually impaired) on more than three
records, which is the threshold the notes promotion rule sets. Added
`accessibility` to the schema: `hearing` and `vision` levels from a closed
vocabulary (`accessible`, `with_support`, `inaccessible`) plus a `notes` string
carrying the accommodation itself. Absence means unassessed, not accessible.
Rendered in the specimen strip. The same pass replaced the phase 2 fixture's
invented logistics on `rotating-stool-dumbbells` with document-sourced content
at `drafted` status, so the content-invariants fixture test now requires "one
stub and one non-stub" instead of naming `verified`. Triage of the full
document, including the physics corrections applied during extraction, lives in
[triage-demo-library-2026-08.md](triage-demo-library-2026-08.md).

**10. Facet redesign after instructor feedback, 2026-08-13.**
The extraction pass left the index with 44 flat topic checkboxes, and
feedback called for a scalable two-level browse, the PH 211/212/213 sequence
in the course filter, and demonstration time (not setup time) as the
instructor-facing, filterable time. Ruled and shipped:

- Classification vocabulary adapted from the comPADRE faceted schema
  (compadre.org, The Physics Front) and the Physics and Equity portal
  (physicsandequity.org): the portal's seven top levels with four ruled
  deviations (an oscillations subarea added, fluids standalone, optics split
  from waves, a measurement category added), plain "Energy" naming without
  the justice subareas until content exists, and a local `equipment`
  category neither portal has. New `category` field (optional in schema,
  required by content test); `topics` became closed subtopic slugs, each
  with a home category; new free-text `tags` field, rendered and searchable,
  never a facet. This organizes topics without reversing spec section 4's
  "no PIRA DCS as primary axis" ruling: topics remain the working values.
- Index UI: category rows with disclosure-revealed subtopic checkboxes
  (native details/summary, checkbox beside the summary, no tri-state
  logic). Category (`cat`) and topic are independent AND-ed facet groups.
  URL params are now q, cat, topic, course, time, room, hazard, stubs, oos;
  the old `setup` param died pre-launch without a shim.
- Demonstration time: new `demo_minutes` range field `{min, max}`; the time
  facet buckets keep the spec boundaries but a range overlaps every bucket
  it touches. `setup_minutes`/`teardown_minutes` survive as a merged Prep
  cell on the detail page with a standing note that prep is staff-supported,
  and are no longer filterable. The facet renders only for buckets some
  record actually overlaps, which also fixed a latent trap: the old setup
  facet rendered unconditionally while zero records carried the field, so
  any selection emptied the grid. No record carries `demo_minutes` yet;
  values arrive with the physical verification pass.
- Course facet: PH211, PH212, PH213 sort first in sequence order. All 54
  records backfilled with category, remapped topics, tags, and course tags
  derived category-to-course (fluids to PH212 and measurement to PH211
  flagged as judgment calls in the PR).

**11. Mobile is a stated target, not an unannounced floor, 2026-08-15.**
Spec section 6 filed "responsive to mobile" among the unannounced quality
floors, and phase 4 recorded a single manual spot check at 375px. Faculty will
browse this catalog on a phone, plausibly standing in the stockroom, so the
floor becomes a target with its own phase. Ruled, not yet built:

- **Compact-width contract.** Two named breakpoints, both in `index.astro`.
  The existing 32rem category-grid collapse stays. A new 40rem compact
  breakpoint governs the facet disclosure, the touch floor, and the detail
  page strip reflow. 40rem is the width below which the filter form exceeds
  half the viewport before a single result renders, so the breakpoint is
  derived from the content it fixes rather than from a device size.
- **Facet disclosure.** The facet fieldsets move inside a native `details`
  whose `summary` reads "Filters" or "Filters (n)", n being the count of
  checked boxes. The disclosure exists at every width; only its default open
  state depends on width. That avoids the rotation trap where a summary
  hidden above the breakpoint strands a closed panel with no way to reopen
  it. The markup ships `open`, so a script-less load shows every filter,
  which is today's behavior unchanged; the page script closes it on load
  below 40rem. The search input and the result count stay outside the
  disclosure: search is the primary action on a phone, and hiding the count
  would defeat the live region it sits in.
- **Touch floor.** Every interactive control presents at least a 44px hit
  area below the compact breakpoint, achieved by padding the `label` rather
  than inflating the checkbox, so the control keeps its size while the target
  grows. Today `fieldset label` is `inline-flex` with a 0.25rem bottom
  margin, which leaves roughly 4px between stacked topic checkboxes.
- **Hover independence.** No affordance may depend on `:hover`. Existing
  hover rules get an `@media (hover: hover)` guard and a non-hover
  equivalent, and `:active` states are added. The card title is the live
  case: it carries `text-decoration: none` until hovered, so on a touch
  device it never reads as a link at all.
- **Form controls at 1rem or larger.** iOS Safari zooms the viewport when a
  focused input renders below 16px. `#q` is 0.95rem today, so that zoom fires
  on every search made from an iPhone.
- **No pagination.** All 54 cards stay in the DOM. Filtering is show/hide
  over baked markup (amendment 3), and pagination would mean rebuilding that
  model to buy a scroll length 54 records do not justify. Revisit above
  roughly 150 records.
- **Verification gets teeth.** Phase 4's 375px claim was a manual spot check
  with nothing guarding it, and it is written in the same voice as the tested
  claims around it. Phase 6 converts it into a Playwright smoke inside
  `npm run verify`. Until that lands, read that phase 4 bullet as
  spot-checked, not tested.

**12. Desktop design ruled from the mockup round, 2026-08-15.**
The Claude Design session recreated the baseline from the repo, branded
three index directions and a detail page over it, and the owner ruled for
2a (sidebar facets, card grid) and 2d (predict-first, hazard-forward
detail page). 2b (pushed orange) and 2c (search-first dense list) were
declined as the primary browse, though 2c's hidden-stub note and its
"location not recorded" honesty were adopted into 2a's layout. Ruled and
shipped:

- Masthead: the accent band with the OSU lockup on the index and a slim
  one-line variant on record pages, which also carries a print button that
  exists only once JavaScript wires it. Band text is a new `--on-accent`
  token at 4.6:1, kept bold or large per the theme file's standing caution.
- Three more neutrals joined the theme: `--panel` (cards, sidebar,
  callouts), `--panel-2` (active chips, placeholder stripes), and
  `--accent-tint` (the wash behind hazard bands and alert chips, so hazard
  reads hotter than status). The mockups explored the dark scheme only;
  the light values were chosen in-session and every foreground/background
  pair the templates use is now asserted at WCAG AA by
  `tests/theme-contrast.test.ts`, both schemes plus print.
- That test exists because the design round's baseline recreation measured
  the filled hazard chip (`--paper` on `--accent` at 0.72rem) at 4.0:1,
  under AA, live since phase 3. Chips are outlined now: status stamps in
  accent-text, stub stamps in muted because a stub is not a claim, alert
  chips on the tint.
- Index: full-width search band; facet sidebar with build-time counts that
  describe the stockroom rather than the current view (stubs included, so
  "show stubs 42" and "mechanics 16" agree with the masthead's "54
  records"); course checkboxes wearing toggle-chip clothes; a removable
  active-filter chip row with Clear all; and a dashed note naming hidden
  stubs that match the active filters, capped at eight, with an Include
  stubs shortcut. The note renders only in filtered views, because
  unfiltered it would name all 42.
- Cards: status worn as a stamp on the photo area, hazard band above the
  body, topics-and-tags classification line replacing the topic pills,
  mono footer with location and courses. Records with courses but no
  location say "location not recorded" rather than omitting the row.
- Detail page: breadcrumb, hazard band ahead of everything, the prediction
  callout leading the prose, the strip boxed and titled "Can I run this
  Tuesday" with hazards moved out of it into the band, a striped photo
  placeholder for non-stub records, and provenance that now says
  "apparatus not yet checked" when `last_verified` is absent.
- Two amendment 11 items landed early because the rebuild touched those
  exact elements: hover-gated link affordances with underlines at rest on
  non-hover devices, and the search input at 1rem. The rest of phase 6
  stays blocked on the mobile mockups.
- New pure logic (`activeSelections`, `hiddenStubNote`) lives in
  `src/lib/filter-logic.ts` with tests; the page script stays DOM glue.

**Queued next (ruled 2026-08-13):**

1. **LaTeX math: shipped 2026-08-15.** remark-math plus rehype-katex in
   `astro.config.mjs`, rendered at build time; KaTeX CSS and fonts imported
   through `src/styles/theme.css` alongside the Fontsource imports, so
   everything stays self-hosted with zero client JavaScript. Exercised by
   real content in the rotating-stool-dumbbells physics section.
2. **Embedded video and simulations**, with the content pass that would use
   them: a constrained embed component (iframe with a fixed host allowlist
   for YouTube and PhET, lazy click-to-load placeholder so no third-party
   request fires without consent).

**Minor.** The spec's own example `alt` text describes a seated student, which
collides with §9's no-identifiable-faces rule. Fixture photographs will be
apparatus-only or absent. The PIRA DCS list is a PIRA and CU Boulder community
document; it is attributed in LICENSE-CONTENT rather than treated as public-domain
data.

---

## Phases

### Phase 1: scaffold and verification. Shipped 2026-08-12.

- Astro 7 (see amendment 7), TypeScript strict.
- Vitest; `astro check` for typecheck. The first tests guard repository
  invariants (commit attribution across full history, license file shape),
  because those are the rulings already in force; content invariants arrive
  with the schema in phase 2.
- Scripts: `dev`, `build`, `check`, `test`, and `verify` as the composite gate.
- `.github/workflows/ci.yml` running `npm ci && npm run verify` on every pull
  request and on `main`, with full fetch depth so the attribution test sees all
  of history. The README badge describes exactly that scope and nothing more.
- Vercel project: imported by the owner 2026-08-12; production tracks `main`.
  Vercel earns its place because per-pull-request preview URLs make review
  meaningful on a visual project, which is a real return rather than ceremony.
- README "Building and running" section replaced with commands that have
  actually been run.

### Phase 2: schema and fixtures. Shipped 2026-08-12.

- `src/content.config.ts`: glob loader over `**/index.md` under
  `src/content/demos`; schema in `src/lib/demo-schema.ts` so vitest can import
  it without Astro's virtual modules. Controlled vocabularies are exported
  consts, because phase 4's facet chips render from the same lists.
- Validation is strict beyond the spec's letter: unknown frontmatter keys fail
  the build. A typo like `hazard:` for `hazards:` must not produce a record
  that silently claims to be hazard-free.
- Two fixtures, one `verified` (the spec's own worked example, logistics
  values marked in `notes` as copied rather than checked) and one `stub`.
  Neither has photographs yet; records render honestly without them.
- Invariant tests at three layers: schema claims (18 assertions across
  required fields, closed vocabularies, alt text, the `pira_verified`
  contradiction, maintenance log order), real-content invariants (slug equals
  directory name, heading order, records validate outside the build), and the
  repository invariants from phase 1.
- The load-bearing claim was demonstrated by hand, once: corrupting a
  fixture's `status` made `astro build` fail with
  `InvalidContentEntryDataError` naming the entry, the field, and the allowed
  values. A malformed record fails the build; it does not render blank.

### Phase 3: demo page. Shipped 2026-08-12.

- `src/pages/demos/[slug].astro`, kept as glue: formatting in
  `src/lib/format.ts` (tested), chips in `src/components/Chip.astro`, tokens
  and fonts in `src/layouts/Base.astro`.
- Design defaults, ruled "defaults" in session: Archivo for headings, Source
  Serif 4 for body, IBM Plex Mono for identifiers, all self-hosted via
  Fontsource so the site makes no external requests. Accent is a stamp
  crimson (#a31621): inspection-stamp semantics for status chips, warning
  semantics for hazard chips, one saturated hue as the spec requires, and it
  appears nowhere else. All pairings meet WCAG AA. Chips always carry text
  and a border, so grayscale printing and color blindness lose nothing.
- The specimen-label strip renders only fields that exist: sparse record,
  sparse label, no blanks. The prediction block leads the pedagogy sections
  because predict-first is the half that produces learning.
- Stub rendering verified in the browser: explicit "not yet documented" band,
  no empty strip, no empty headings.
- Print stylesheet in the same pass: chrome hidden, strip and prediction kept
  unbroken, canonical URL printed in the footer.
- `src/config.ts` pulled forward from phase 5, since the request button gate
  belongs to this template. `REQUEST_URL_TEMPLATE` is null; the button renders
  nothing today.
- `noindex` on every page, removed at launch: spec §9 keeps the URL inside the
  faculty preview, and search indexing would circulate it first.
- Accessibility floor, unannounced: visible focus, semantic landmarks, reduced
  motion respected, WCAG AA contrast.

### Phase 4: index, facets, search. Shipped 2026-08-12.

- Cards baked in at build time per amendment 3; `DemoCard.astro` is the only
  source of card markup, and every facet value rides the card as `data-*`
  attributes.
- Filtering semantics live in `src/lib/filter-logic.ts` as pure tested
  functions (OR within a group, AND across groups, stubs and out-of-service
  hidden by default); the page script is DOM glue. Setup-time buckets carry
  the spec's boundaries in `src/lib/facets.ts`, asserted by test.
- Facet groups derive from the records at build time: a group with no values
  in any record does not render, so the UI grows with the content. Facet
  values present today: topics, courses, setup buckets.
- Search is Pagefind, run as part of `npm run build`, indexing only demo
  pages via `data-pagefind-body`. The index page script uses it purely as a
  slug-set oracle intersected with the facet verdict. Under `astro dev` the
  bundle does not exist; search degrades with a visible note and facets keep
  working. Test search against `npm run preview`.
- Filter state mirrors into the URL query string (`q`, `topic`, `course`,
  `setup`, `room`, `hazard`, `stubs`, `oos`), restored on load, so a filtered
  view is linkable.
- Empty state names the fix rather than the failure, including the case the
  spec did not anticipate: when hidden stubs or out-of-service records do
  match the active filters, the message says so and points at the toggles.
- One bug found by browser verification and fixed globally: author `display`
  styles silently defeat the `hidden` attribute, so the base stylesheet now
  carries `[hidden] { display: none !important }`.
- Verified in a built preview: full-text hit on body prose, URL round trip,
  empty-state hints, keyboard focus, 375px with no horizontal overflow.

### Phase 5: supporting infrastructure

- `scripts/ingest-photo.sh`: HEIC to JPG, resize, strip EXIF.
- `data/pira-dcs.json` derived from the CU Boulder DCS release, attributed.
- `src/config.ts` with `REQUEST_URL_TEMPLATE` null by default, and the durable
  contract (a request system stores `slug` verbatim) recorded in a comment at the
  point of use rather than only in the spec.
- Repository homepage field set once a deploy URL exists.

### Phase 6: mobile

Ruled in amendment 11, blocked on mockups rather than on engineering: the
interaction contract is settled, the visual treatments are not.

- Facet disclosure: markup change in `src/pages/index.astro`, a `matchMedia`
  close-on-load in the existing page script, and the active count folded into
  the current apply path rather than a new listener. The count itself is a
  pure function of `FilterState`, so it lands in `src/lib/filter-logic.ts`
  with a unit test and the page script stays DOM glue.
- Touch floor and hover gating across `index.astro`, `DemoCard.astro`,
  `Chip.astro`, `Base.astro`, and `demos/[slug].astro`.
- `#q` to 1rem.
- `.katex-display` gets `overflow-x: auto`. KaTeX ships it as a plain block,
  so display math overflows a 375px viewport; the live case is
  `rotating-stool-dumbbells`.
- The KaTeX stylesheet import moves out of `src/styles/theme.css` into the
  demo page, so the index stops paying for a stylesheet only demo pages can
  use. Small, and free.
- The specimen strip on `demos/[slug].astro` reflows to one column below the
  compact breakpoint. Its `dt` is 0.62rem with 0.11em letter-spacing, which
  at two columns of roughly 167px is under the legibility floor on a phone.
- Whole-card tap target via a stretched-link pseudo-element on the title
  anchor, which makes the card tappable without adding a second link to the
  accessibility tree. Pending mockup confirmation, because it costs text
  selection inside the card.
- Playwright smoke: one Chromium spec at 375x812 against the built preview,
  asserting no horizontal overflow on the index and on a demo page carrying
  display math, the facet disclosure closed on load with the first card
  visible, every checkbox label at least 44px tall, `#q` computed font size
  at least 16px, and the summary count tracking a checked box. `package.json`
  gains `test:e2e`, and `verify` becomes check, test, build, then e2e,
  because the e2e pass needs the built site and `verify` is documented as the
  whole gate. CI installs Chromium only. Roughly one minute of CI and one
  devDependency, paid so the responsive work cannot rot silently.
- Open for the mockup and not ruled here: whether the search row sticks on
  scroll, the visual treatment of the disclosure summary, and the card
  title's link affordance.

### Phase 7: installable offline catalog

The "make it a real app" question, answered. A manifest and a service worker
are cheap against a static site with no backend, no accounts, and 54 pages,
and the payoff is specific: browse and search in a building basement with no
signal.

- `manifest.webmanifest` with maskable icons and a `theme-color` per scheme;
  `Base.astro` gains the link and meta tags. Installability does not require
  lifting the site-wide `noindex`.
- A service worker precaching the built pages, `_astro/`, and the Pagefind
  index. Pagefind is the interesting part: its index is chunked and fetched
  on demand, so caching it is the difference between offline search working
  and offline search degrading to the no-script note.
- Caveat to record wherever this gets described: iOS evicts storage after
  roughly seven days without a visit, so a cold reopen re-fetches. Nothing
  should promise permanent offline.
- Caveat that keeps this out of phase 6: precaching a catalog whose records
  are still churning needs a cache-invalidation story settled first.
- Declined: Capacitor, or any native wrapper. The cost is not the code, it is
  the store account, the review cycle, and persuading faculty to install
  something when a URL is one tap away.

---

## Content, which is not an engineering phase

Launch target is 8 to 12 records at `verified` depth including prediction prompts.
That is authoring work requiring physical access to the apparatus, and it is the
gate on showing this to faculty. The engineering above is finished well before the
content is.
