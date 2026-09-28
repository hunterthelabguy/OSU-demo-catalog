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
`/handoff` agent commands, and the design round shipped in both halves:
desktop as amendment 12 (masthead band, facet sidebar with counts, filter
chips, predict-first detail page) and mobile as amendment 13 and phase 6
(collapsible facets behind a pinned course rail, sticky search, 44px touch
floor, photo-free compact cards). The theme's contrast pairs and the mobile
layout contract are both under test: 87 vitest tests plus 12 Playwright
assertions at 375x812. Filtering combines by a Match any / Match all
control with course as always-narrowing scope and hazards no longer a
facet (amendment 15, from the first outside feedback). `npm run verify` is the gate; production tracks
`main` at https://osu-demo-catalog.vercel.app.

Remaining engineering is phase 5 (photo ingest script, cached PIRA list) and
phase 7 (installable offline catalog), neither of them urgent. The gate on
the faculty showing is content: 8 to 12 records at `verified` depth, which
requires the owner, the stockroom, and a camera.

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
  category neither portal has (wrong: see amendment 14). New `category` field (optional in schema,
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

**13. Mobile ruled and built, 2026-08-15.**
The design round returned one mobile design in five views rather than five
options, so the decision was adopt-with-adjustments, not pick-one. Adopted
as drawn: sticky search carrying the live count, title underlined at rest
with accent-colored titles declined, the whole card tappable via a
stretched pseudo-element, hazard chips first and never truncated, and the
strip reflowed to label/value rows. Four things were re-ruled:

- **"Browse all 54" is dropped.** The mockup never defined it; the nearest
  reading duplicates the Records toggles with fuzzier semantics, and a
  large ambiguous target is the worst thing to put under a thumb.
- **Course is pinned outside the disclosure, which amends amendment 11.**
  The mockup drew the rail outside and a Course group inside, which is the
  same facet in two places and a desync waiting to happen. There is one
  course fieldset, pinned above the panel at every width. Course is the
  question an instructor actually arrives with, so it earns the position,
  and pinning it on desktop too keeps one layout rather than two.
- **Counts mean records everywhere.** The mockup put a subtopic count
  where the desktop sidebar puts a record count, in the same position. The
  subtopic count keeps its home in the disclosure summary text.
- **The compact breakpoint is 48rem, not the 40rem of amendment 11.**
  40rem was derived against the pre-redesign layout where the form sat
  full-width above the grid. With the sidebar of amendment 12, the
  "filters before results" problem starts exactly where the sidebar stops
  fitting beside the grid, at 48rem. The detail-page strip keeps a 40rem
  breakpoint of its own, because when auto-fit cells stop working is a
  different question from when a sidebar stops fitting. Two breakpoints,
  each derived from the content it fixes.

Also ruled while building: the summary count covers facet selections and
not the stub or out-of-service toggles, matching what the chip row and
Clear all already excluded; the compact card drops the photo area and the
hazard band entirely, because 54 striped placeholders down a phone is
noise, and their information moves to a chip row and a left accent edge;
and the masthead print button answers to the same 44px floor as the facet
controls, which it failed by 17px until the layout suite was pointed at
it.

**14. Vocabulary checked against comPADRE at the source, 2026-08-21.**
Amendment 10 adapted the classification vocabulary from a portal that builds
on comPADRE rather than from comPADRE itself. Reading the July 2023 workbook
directly (658 rows, 13 top subjects, 141 subareas, 504 details, both sheets
identical) settled three things.

- **One correction to the record.** Amendment 10 calls `equipment` a local
  category "neither portal has." comPADRE has it: General Physics >
  Equipment, PIRA 9, children Class Support 9A, Electronic Equipment 9B,
  Mechanical Equipment 9C. The deviation is promoting it from subarea to top
  level, which stands; the claim as written did not. The comment in
  `src/lib/demo-schema.ts` is corrected alongside this.
- **Structural divergences left alone.** comPADRE has no Energy top level
  (work and energy is Classical Mechanics 1M), splits modern physics,
  quantum, and relativity three ways, and gives mathematical tools a top
  level with 17 subareas. None of that is worth importing. A demonstration
  collection is not a resource library, and the coarser tree is the one
  worth browsing. comPADRE's finer splits below the second level are
  declined for the same reason: an unused subtopic costs the browse nothing
  because it does not render, but every one of them costs an author a
  decision at authoring time, and 14 electricity records do not need seven
  circuit buckets.
- **Eleven subtopics added**, 39 to 50, each one a comPADRE subarea with real
  demonstrations behind it and no catalog home: `statics_and_equilibrium`
  (1J), `properties_of_matter` (1R), `phase_transitions` (4C),
  `electromagnetic_radiation` (5N), `polarization` (6H),
  `vision_and_the_eye` (6J), `atomic_physics_and_spectra` (7B),
  `nuclear_physics` (7D), and comPADRE's equipment trio `class_support`,
  `electronic_equipment`, `mechanical_equipment` (9A-9C). No category
  changes, no slug renamed, no record invalidated; the additions are inert
  until the verification pass assigns them, because a subtopic no record
  carries does not render.

Two homing calls, both forced by the same absence: comPADRE's General
Physics catch-all has no counterpart here. `properties_of_matter` goes to
`mechanics` rather than the structurally-analogous `measurement`, because an
instructor hunting an elasticity demo looks under mechanics and
`measurement` is doing narrower work. The equipment trio goes under
`equipment`. `class_support` earns its place beyond fidelity: `topics`
requires at least one entry, so without it an AV record (demo camera,
USB-C to HDMI dongles, the streaming box that puts the demo camera on the
big screen) cannot be expressed at all. Specificity below that level is
`tags`.

Also landed: `CATEGORY_PIRA_PREFIXES`, transcribed from the workbook's PIRA
column, and a content invariant asserting that a record's `pira_dcs` prefix
agrees with its category. Only one record carries a code today, which is why
it was cheap to add now. Every prefix in the map is attested in the source
and none is inferred, so a real-but-unlisted code fails loudly and a human
adds it with the source in hand. Relativity carries no PIRA prefix anywhere
in the workbook, so `modern_physics` cannot accept one for it yet.

Process note carried forward: amendment 10's error came from citing a
standard by way of a portal's rendering of it. When a ruling cites an
external vocabulary, the vocabulary's own artifact gets pulled into the
repo's reach at ruling time. A ledger's authority is the authority of its
citations.

**15. Match any, course as scope, hazards demoted, 2026-08-22.**
The first outside feedback on the catalog reported that filtering "ANDs"
and empties the grid: one course checked, then mechanics and
electromagnetism, nothing. Reproduced against the built site before
touching semantics, because the literal report cannot happen: categories
already OR within their group, and `PH211 + Mechanics + E&M` returns five.
What does return zero is a category plus a subtopic homed elsewhere
(`?cat=mechanics&topic=electromagnetism`), the independence amendment 10
ruled on purpose, and the feedback's words fit that pairing. A second
empty pairing, `PH211 + E&M`, is empty because in today's content each
course maps to exactly one category; that one stays empty by the ruling
below. Three rulings:

- **A Match any / Match all control** over the facets inside the panel
  (category, subtopic, time, room), defaulting to any so a widening
  selection widens. Within a group selections were always OR; the control
  decides how groups combine. Radios, not a checkbox, because two named
  states beat an inverted boolean and the value serializes as itself:
  `match=all` in the URL, nothing for the default. `tests/filter-logic.test.ts`
  asserts the feedback case both ways.
- **Course is scope, not a facet.** It keeps narrowing in both modes and
  stays outside the panel, next to the stub and out-of-service toggles in
  spirit: an instructor arrives with a course, and inside a flat OR a
  course would widen instead. The sidebar says so under the legend.
  Declined: demoting course to a label beside the hazards, which was the
  first instinct. Course is the most-used entry point on the site and a
  label cannot be an entry point.
- **Hazards stop being filterable.** A hazard is a property of the
  apparatus nobody browses toward; it is a warning. The facet group, its
  counts, its chip, and the `hazard` URL param are gone (an old link simply
  stops narrowing; pre-launch, noindex, no shim). The data is untouched
  and still renders on the card band, the compact chip row, the compact
  accent edge, and the detail page.

Search stays an intersection in both modes: a query that grows the result
set as you type is not a search. Facet counts stay baked and
unconditional, which under Match any is exactly what they mean. Process
note: the report named a cause, and acting on the cause without
reproducing the symptom would have shipped a redesign with the original
empty grid still reachable.

**16. A summary leads the page, 2026-09-28.**
Colleague feedback: most faculty already know what a demonstration is for
and the physics behind it, and want a short description first, in its own
highlighted block, without the rest of the context. Rulings:

- **`summary` is a frontmatter field**, optional plain text, at most 200
  characters (about two sentences), placed in the identity block after
  `title`. A schema test asserts the cap. A content test requires it on
  every `drafted` and `verified` record; `stub` records are exempt, in
  keeping with partial rendered as partial. Declined: a `## Summary` body
  heading, which can only render inside the body and could not lead the
  page, feed a card, or feed the meta description.
- **Detail page order is now hazard band, Summary block, prediction
  callout**, then everything else unchanged. This amends amendment 12's
  predict-first lead: a warning still outranks a summary, and the
  prediction callout stays above all logistics. The block is labeled
  "Summary" (ruled over "In brief" and "TL;DR"), uses theme tokens only,
  and any new color pair joins `tests/theme-contrast.test.ts` at AA in
  both schemes. It prints. Declined: summary above the hazard band, which
  lets a hazard scroll off a phone screen.
- **The summary replaces the meta description**, falling back to the
  joined topics when absent.
- **Full cards show it, clamped to about three lines; compact cards do
  not.** The mobile e2e suite asserts a long summary causes no horizontal
  overflow.
- **Search weights it** (`data-pagefind-weight`) so a summary match ranks
  above a body match.
- **Drafted by Claude, reviewed by the owner.** The twelve `drafted`
  records get summaries written from their corrected text, never from the
  legacy source, and the owner reviews each before merge.

**17. Photo ingest tool and the legacy image batch, 2026-09-28.**
The stockroom demo library document (the source of the 2026-08-13 triage)
was exported from Google Docs as zipped HTML, which keeps every image as
its own file and places each `<img>` in document order under its section
heading, so image-to-record pairing needs no hand work. Its descriptions
are reference only, per the owner: many carry wrong physics, and the
records already hold the corrected text. Only images are ingested.
Rulings:

- **`scripts/ingest-photo.mjs` replaces the planned `ingest-photo.sh`**
  (phase 5). Node and `sharp`, added as a direct dev dependency rather
  than relied on through Astro. In order: bake EXIF orientation into the
  pixels (stripping first turns phone photos sideways), resize to a long
  edge of at most 1600 px without enlarging, encode JPEG at quality 82,
  strip all metadata. Output is `src/content/demos/<slug>/<slug>-NN.jpg`.
  It refuses to overwrite without `--force`. **HEIC is refused with a
  message**, not claimed: prebuilt `sharp` cannot decode HEVC-coded HEIC,
  and the README says to convert first.
- **Tests with teeth.** A unit test builds an image carrying GPS EXIF and
  a rotated orientation and asserts that no metadata survives, that the
  rotation was applied, and that the long edge is at most 1600. An
  invariant test walks every image committed under `src/content/demos/`
  and asserts the same two properties, which is what catches a photo
  committed by hand around the tool. Declined: the tool without tests,
  which leaves the privacy rule unchecked in a public repo.
- **The mapping file is the provenance record.**
  `docs/legacy-images-2026-09.json` lists each source image by base name
  (so an owner-swapped extension still resolves), its target slug or
  slugs, its order, per-slug alt text, and an optional caption. It stays
  in the repo beside the triage doc and is the owner's single review
  surface for alt text. `scripts/ingest-legacy-batch.mjs` reads it plus a
  source directory given as an argument (the export stays outside the
  repo) and writes `images:` into each record under a `# --- media ---`
  block, in document order, so the first image is the card image. Stubs
  get their images too.
- **A photo spanning two records goes on both**, each with alt text for
  what that record cares about (the pumps, hemispheres, and bell-jar photo
  on `magdeburg-hemispheres` and `balloon-chamber`; the coil and capacitor
  photo on `tesla-coil` and `large-capacitors`). Declined: one record
  only, and cropping, which is an editorial act on the photo.
- **People are held out.** Every source image is inspected before it
  enters the mapping; any image with a person is held and listed for the
  owner's ruling, not cropped, blurred, or judged unidentifiable by Claude.
- **A representative photo is allowed when the caption says so.** The
  legacy Rubens tube photo turned out to be a reposted vendor image with
  no license, so it is not ingested. `physics-of-music-demos` instead
  carries Wikimedia Commons "Flame-tube-resonance.jpg" by MikeRun,
  CC BY-SA 4.0 (the repository's own content license), captioned as
  representative, not the OSU apparatus, with the attribution the license
  requires. The existing `caption` field carries it; a structured
  `credit` or `representative` field waits for the notes promotion rule's
  third instance. Declined: our-apparatus-only, which leaves the tube
  most worth seeing without a photo.
- **Equation fragments are not photographs.** Google Docs exported the
  document's inline equations as tiny images (image1 at 8 by 18 px and
  image2 at 23 by 18 px, both in the Standing Waves text). They are
  excluded from the mapping and belong to amendment 19.
- **Owner replacements in the export are recorded as such.** Two source
  files were replaced by the owner on 2026-09-28 before ingest: image6
  (the tennis racket after its rebuild) and image19 (the Rubens tube, see
  above). The mapping file notes both.
- **The tennis racket record is redrafted for its rebuild**, maintenance
  logged 2026-09-25: the LED string and wedged battery pack shifted the
  center of mass and gave no single point of light; the new build is one
  LED on a CR2032 cell through a 50 ohm resistor, taped in place, good for
  a few hours of use. A 3D-printed clip-on housing and a switch are
  planned. The prediction prompt and body lose their multi-light framing.
- **Ships as two PRs.** The first carries the summary field, the ingest
  tool, both tests, the twelve summaries, README changes, and these two
  amendments; the second carries the images, the mapping file, the
  racket redraft, and a reshoot list (the representative Rubens tube
  photo, any legacy image too small to serve as a record photo, such as
  image48 at 240 by 320, and any record still without a photo). Code and content review separately, and an image problem cannot
  block the schema. The conversion's real byte total is measured and
  reported before the second PR commits it. Both PRs follow the brand
  pass (amendment 18).

**18. The OSU brand palette, strictly, and the official mark, 2026-09-28.**
The owner supplied an OSU color style guide and the official logo files
(kept outside this repo in the owner's brand kit folder). The guide
forbids tints and shades: no values other than those listed, with black
and white the only exceptions. Asked whether that covers only the
secondary colors, Beaver Orange too, or everything, the owner ruled
everything. This supersedes amendment 8's split accent and the neutral
scale, and amendment 12's masthead band. Rulings:

- **Every color the site renders is a listed palette value**, Paddletail
  Black and Bucktooth White included. The light ground is pure white, the
  dark ground pure black. `--accent-text` and `--accent-tint` (derived
  from Beaver Orange) and the cream, warm-gray, and panel neutrals go.
  Beaver Orange stays the accent, for fills, borders, and large text only,
  which is the guide's own advice given its 4.56:1 on white. A test
  asserts every color token in `theme.css` is a palette value, beside the
  contrast test, so the rule cannot erode one token at a time.
- **The masthead becomes the official two-color mark on the page ground**:
  `OSU_horizontal_2C_O_over_B.png` (orange "Oregon State" over black
  "University") on white in the light scheme, and
  `OSU_horizontal_2C_O_over_W.png` (orange over white) on black in the
  dark scheme, swapped by `prefers-color-scheme`; print uses the light
  one. These two files are the ones this ruling names for the repo,
  resized for the web. The orange band is gone: on a pure white or black
  page a full orange band would be the loudest thing on screen, and the
  mark now carries the orange. Declined: keeping the band with the
  one-color white mark (`1C_W`).
- **The mark is carved out of the content license.** It is OSU's
  trademark, not CC BY-SA material; `LICENSE-CONTENT` and the README say
  so explicitly.
- **Open, for the brand pass design:** the muted text color (on white only
  High Desert passes, at 5.33:1; on black, Till, Coastline, and Crater
  pass), the hazard band treatment without a tint (orange fill with bold
  white text, or black text with an orange rule), and the panel and
  chip grounds.
- **Watch item:** the guide says its values were not checked against the
  university brand site. Verify them before launch; the deploy is public
  already, though `noindex`.
- **Sequencing:** the brand pass ships first, then amendment 16 and 17's
  two PRs, so the Summary block is built once in palette colors, then
  amendment 19.

**19. Legacy equations re-derived in LaTeX, after the image ingest,
2026-09-28.**
The triage recorded that the legacy document's equations did not survive
extraction. The HTML export shows how they did survive: as tiny inline
images (amendment 17). Re-deriving them as KaTeX in the records they
belong to is deferred until both image PRs land. Each equation is derived
from the physics, not transcribed from the fragment, since the source's
explanations are reference only; the fragments serve as pointers to where
an equation stood.

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
  empty-state hints, keyboard focus, 375px with no horizontal overflow. That
  last one was a manual spot check when it was written; phase 6 turned it
  into an assertion in `tests/e2e/mobile.spec.ts`.

### Phase 5: supporting infrastructure

- `scripts/ingest-photo.sh`: HEIC to JPG, resize, strip EXIF. Superseded by
  amendment 17: `scripts/ingest-photo.mjs`, HEIC refused.
- `data/pira-dcs.json` derived from the CU Boulder DCS release, attributed.
- `src/config.ts` with `REQUEST_URL_TEMPLATE` null by default, and the durable
  contract (a request system stores `slug` verbatim) recorded in a comment at the
  point of use rather than only in the spec.
- Repository homepage field set once a deploy URL exists.

### Phase 6: mobile. Shipped 2026-08-15.

Ruled in amendment 11, adjusted in amendment 13 once the mockups landed.

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
  anchor, compact widths only, which makes the card tappable without adding
  a second link to the accessibility tree. It costs text selection inside
  the card, which desktop keeps because that is where selecting a shelf
  letter actually happens.
- The compact card drops the photo area and the hazard band; the status
  moves to an outlined chip and the hazard to a left accent edge plus a
  leading chip. The status therefore renders twice in the markup, once per
  treatment, with exactly one displayed at any width, so the accessibility
  tree never carries both.
- Search sticks below the compact breakpoint and carries the live count
  with it, which is what keeps the count visible through a 54-card scroll.
  Hidden entirely in print, along with the whole filter form.
- Compact chrome is deliberately cheap: trimming the masthead and dropping
  the sidebar's frame moved the first card from 480px down to 321px on a
  375x812 screen, which is four cards above the fold instead of two.
- Playwright: `tests/e2e/mobile.spec.ts`, Chromium at 375x812 against the
  built preview. Twelve assertions covering no horizontal overflow on the
  index and on the display-math record, the disclosure closed on load with
  a card already on screen, sticky search pinning at the top with the count
  in view, every facet label and course chip and the print button clearing
  44px, `#q` at 16px or larger, the summary count in both visible text and
  accessible name, the course rail working with the panel shut, one link
  per card named by its title with a dead-space tap navigating, math
  scrolling inside its own box, and the strip laid out as rows.
  `package.json` gains `test:e2e`; `verify` becomes check, test, build,
  e2e. `vitest.config.ts` excludes `tests/e2e` so the two gates cannot
  swallow each other. CI installs Chromium only.
- The suite was mutation-checked before being trusted: dropping the label
  min-height to 1rem fails the touch-floor assertion, and it caught a real
  defect on its first run, the masthead print button at 27px.

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
