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
  No record has a photograph yet. The twelve drafted records carry a
  `summary`, for owner review.
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
- **Verification**: 74 vitest tests in 10 files plus 29 Playwright
  tests (23 at 375x812, 6 at 1280x800), counted 2026-09-28. `npm run verify` is the gate; CI runs it on
  every PR.
- **Production** tracks `main` at https://osu-demo-catalog.vercel.app,
  `noindex` site-wide, permanently (amendment 22).

## In flight

Parts A (brand pass) and B (summary field, row cards, ingest tool) shipped
2026-09-28. Part C is next and will open its PR unmerged for owner review
(amendment 23); the build is planned in
`docs/plans/2026-09-28-brand-summary-images.md`. Amendments 16 to 22 merged
2026-09-28 in PR #22.

## Queue, in order

1. **Legacy images and the racket redraft** (amendment 17; Part C, PR left
   unmerged for owner review, amendment 23): the mapping file with alt text
   for owner review, the batch ingest, the tennis racket redraft for its
   2026-09-25 rebuild, the reshoot list. Byte total reported before commit.
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
- Part C's PR waits unmerged for review (amendment 23): the image alt text
  and anything held from the faces pass, and the tennis racket redraft.
- The user-level OSU addendum still names `docs/build-plan.md` as this
  repo's living plan; state now lives in STATE.md.

## Watch items

- The OSU palette values are unverified against the university brand site;
  verify before launch.
- Do not circulate the production URL beyond the faculty preview.
- The legacy export lives outside the repo in the owner's reference folder
  and stays there; the mapping file records provenance.
