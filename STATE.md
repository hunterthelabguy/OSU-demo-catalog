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
  No record has a photograph yet.
- **Verification**: 87 vitest tests plus 12 Playwright assertions at
  375x812, counted 2026-09-28. `npm run verify` is the gate; CI runs it on
  every PR.
- **Production** tracks `main` at https://osu-demo-catalog.vercel.app,
  `noindex` site-wide, permanently (amendment 22).

## In flight

Nothing on a branch. The build is fully planned in
`docs/plans/2026-09-28-brand-summary-images.md` (Parts A, B, C, one PR
each, in order) and has not started. Amendments 16 to 22 merged 2026-09-28
in PR #22.

## Queue, in order

1. **Brand pass** (amendment 18): every color a listed OSU palette value,
   pure white and black grounds, the official two-color mark swapped by
   color scheme, a token test holding the palette, the mark carved out of
   the content license.
2. **Summary field, row cards, and ingest tool** (amendments 16, 17, 21,
   22; first PR): the `summary` field, page order, meta description, search
   weight; row cards at every width with the hazard corner badge; the
   unchecked-apparatus note, provisional-location line, and robots.txt;
   `scripts/ingest-photo.mjs` with its unit and invariant tests; twelve
   drafted summaries for owner review.
3. **Legacy images** (amendment 17; second PR): the mapping file with alt
   text for owner review, the batch ingest, the tennis racket redraft for
   its 2026-09-25 rebuild, the reshoot list. Byte total reported before
   commit.
4. **Legacy equations in KaTeX** (amendment 19).
5. **Named, not scheduled**: embedded video and simulations; the installable
   offline catalog (phase 7); the cached PIRA list (phase 5).

The launch gate is content, not this queue: every currently catalogued
record at `verified` depth, prediction prompts included, with no new
location data required (VISION.md). Locations come later, from walkthroughs
after the stockroom reorganization; the website work is not blocked by it.

## Awaiting the owner

- The one line in `VISION.md` still marked proposed ("students are not the
  audience"): rule it in or strike it.
- Part C: is the gray can capacitor in legacy image54 the same apparatus as
  the `large-capacitors` record? Decides whether image54 goes on one record
  or two (amendment 17 said two).
- Enable host-level bot blocking in the Vercel dashboard (amendment 22).
- Review, as each PR opens: the twelve summaries (Part B), the image alt
  text and anything held from the faces pass (Part C), the tennis racket
  redraft (Part C).
- The user-level OSU addendum still names `docs/build-plan.md` as this
  repo's living plan; state now lives in STATE.md.

## Watch items

- The OSU palette values are unverified against the university brand site;
  verify before launch.
- Do not circulate the production URL beyond the faculty preview.
- The legacy export lives outside the repo in the owner's reference folder
  and stays there; the mapping file records provenance.
