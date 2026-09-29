# State

What exists today, what is in flight, and what comes next. A snapshot,
rewritten in place at every `/handoff`. Where the catalog is going is in
[VISION.md](VISION.md); why each decision went the way it did is in
[docs/build-plan.md](docs/build-plan.md), the ledger.

Last updated: 2026-09-28

## What exists

- **v0.1 proof of concept, complete**: validated records, demonstration
  pages with a print stylesheet, and the index with faceted browse (Match
  any / Match all, course as scope) and Pagefind search. Desktop and mobile
  designs shipped (amendments 12, 13, 15). Build-time LaTeX via KaTeX.
- **Content: 54 records**, 12 `drafted` and 42 `stub`, none `verified`.
  On `main`, no record has a photograph yet. On `claude/legacy-images`
  (unmerged PR, pending review), 44 records carry at least one photograph:
  51 JPEGs, 8,285,610 bytes, from the legacy export through
  `scripts/ingest-legacy-batch.mjs`, including one Wikimedia Commons image
  (CC BY-SA 4.0, MikeRun) standing in on `physics-of-music-demos`. Mapping
  and alt text: `docs/legacy-images-2026-09.json`. The twelve drafted
  records carry a `summary`, for owner review.
- **Brand pass** (amendment 18), shipped 2026-09-28: six theme tokens, every color a
  listed OSU palette value on pure white and black grounds, held by
  `tests/brand-palette.test.ts`; the official two-color mark swapped by
  color scheme, replacing the orange masthead band, and printing with the
  page; the mark carved out of the content license as a university
  trademark.
- **Summary, row cards, ingest tool** (amendments 16, 17, 21, 22), shipped
  2026-09-28: the optional `summary` field (200 characters or fewer, plain
  text, required by test on drafted and verified records) leading the detail
  page after the hazard band, feeding the meta description, weighted in
  search; row cards at every width with a hazard corner badge;
  `scripts/ingest-photo.mjs` with its unit test and a repo-wide image
  invariant; the unchecked-apparatus note, the provisional-locations line
  near search, and `public/robots.txt` refusing all crawlers.
- **Verification**: on `claude/legacy-images` (pending merge), 132 vitest
  tests in 11 files plus 29 Playwright tests (23 at 375x812, 6 at
  1280x800), observed 2026-09-28; `main` carries fewer vitest tests until
  the PR merges. `npm run verify` is the gate; CI runs it on
  every PR.
- **Production** tracks `main` at https://osu-demo-catalog.vercel.app,
  `noindex` site-wide, permanently (amendment 22).

## In flight

Parts A (brand pass) and B (summary field, row cards, ingest tool) shipped
2026-09-28. Part C is on `claude/legacy-images` in an unmerged PR awaiting
owner review (amendment 23); the build is planned in
`docs/plans/2026-09-28-brand-summary-images.md`. Amendments 16 to 22 merged
2026-09-28 in PR #22.

## Queue, in order

1. **Legacy images and the racket redraft** (amendment 17; Part C, built,
   PR unmerged for owner review, amendment 23): merge after review.
2. **Legacy equations in KaTeX** (amendment 19).
3. **Named, not scheduled**: embedded video and simulations; the installable
   offline catalog (phase 7); the cached PIRA list (phase 5).

The launch gate is content, not this queue: every currently catalogued
record at `verified` depth, prediction prompts included, with no new
location data required (VISION.md). Locations come later, from walkthroughs
after the stockroom reorganization; the website work is not blocked by it.

## Awaiting the owner

- The one line in `VISION.md` still marked proposed ("students are not the
  audience"): rule it in or strike it.
- Enable host-level bot blocking in the Vercel dashboard (amendment 22).
- Review the twelve summaries (Part B, merged, reviewed afterward).
- Review of Part C's PR (amendment 23), unmerged: the mapping and all alt
  text; the racket redraft (single-LED rebuild); the byte total (8,285,610
  across 51 JPEGs); and nine images held for a ruling, none ingested:
  - image9, image29, image40, image31: each shows a hand.
  - image16, image13: possible photographer reflection.
  - image24: possible shoe.
  - image58, image61: LRC data plots, source unknown.
- The user-level OSU addendum still names `docs/build-plan.md` as this
  repo's living plan; state now lives in STATE.md.

## Reshoot list

Computed 2026-09-28 on `claude/legacy-images` from the records and files
themselves.

- **Representative photo, not the OSU apparatus**: `physics-of-music-demos`
  carries the Commons Rubens tube image.
- **Under 400 px on the long edge**: `holograms` (`holograms-01.jpg`,
  320x240); `driven-spring-resonator` (`driven-spring-resonator-01.jpg`,
  240x320). No other ingested image is under 400 px.
- **Sideways with no EXIF tag**: `wire-rings` (`wire-rings-01.jpg`, from
  legacy image21); needs rotation or a reshoot.
- **No photo (10 records)**: ball-ramps, balloon-chamber, bed-of-nails,
  current-generating-cranks, friction-block, inductive-jump-ropes,
  leaf-blower-hovercraft, magdeburg-hemispheres, slit-interference,
  tesla-gun. Records held out by the faces pass are among them.

## Watch items

- The OSU palette values are unverified against the university brand site;
  verify before launch.
- Do not circulate the production URL beyond the faculty preview.
- The legacy export lives outside the repo in the owner's reference folder
  and stays there; the mapping file records provenance.
