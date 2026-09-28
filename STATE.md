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
  `noindex` site-wide until launch.

## In flight

Draft PR #22, branch `claude/summary-and-image-ingest`: amendments 16 to 21, the implementation plan at `docs/plans/2026-09-28-brand-summary-images.md`, this file,
`VISION.md` (drafted, awaiting the owner's line-by-line ruling), and the
agent commands rerouted so state lands here. Docs only.

## Queue, in order

1. **Brand pass** (amendment 18): every color a listed OSU palette value,
   pure white and black grounds, the official two-color mark swapped by
   color scheme, a token test holding the palette, the mark carved out of
   the content license.
2. **Summary field, row cards, and ingest tool** (amendments 16, 17, 21;
   first PR): the `summary` field, page order, meta description, search
   weight; row cards at every width with the hazard corner badge;
   `scripts/ingest-photo.mjs` with its unit and invariant tests; twelve
   drafted summaries for owner review.
3. **Legacy images** (amendment 17; second PR): the mapping file with alt
   text for owner review, the batch ingest, the tennis racket redraft for
   its 2026-09-25 rebuild, the reshoot list. Byte total reported before
   commit.
4. **Legacy equations in KaTeX** (amendment 19).
5. **Named, not scheduled**: embedded video and simulations; the installable
   offline catalog (phase 7); the cached PIRA list (phase 5).

The launch gate is content, not this queue: 8 to 12 records at `verified`
depth, which takes the owner, the stockroom, and a camera.

## Awaiting the owner

- Line-by-line ruling on `VISION.md`, including the lines marked proposed.
- Review of the twelve summaries and the image alt text, as each PR opens.
- Any legacy image showing a person, once the faces pass runs.

## Watch items

- The OSU palette values are unverified against the university brand site;
  verify before launch.
- Do not circulate the production URL beyond the faculty preview.
- The legacy export lives outside the repo in the owner's reference folder
  and stays there; the mapping file records provenance.
