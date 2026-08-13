# Build plan and current state

Companion to [spec-v0.1.md](spec-v0.1.md). The spec says what is being built and
why. This file says what exists today, what is planned next, and which spec
decisions have been amended since it was written.

Last updated: 2026-08-12

---

## Current state

**Phase 1 complete: scaffold, verification gate, and CI.** Astro 7, TypeScript
strict, vitest, and a composite `npm run verify` (typecheck, tests, build) that
CI runs on every pull request and on `main`. The site itself is a placeholder
index page; the catalog (schema, records, pages, browse) begins at phase 2.

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

### Phase 2: schema and fixtures

- `src/content.config.ts`: glob loader over `**/index.md` under
  `src/content/demos`, plus the zod schema from spec §3.
- Two fixtures, one `verified` and one `stub`.
- Invariant tests, the point of which is that a bad record fails loudly:
  - malformed frontmatter fails validation
  - `entry.id`, `data.slug`, and the directory name all agree
  - body headings appear in the fixed order
  - `pira_verified: true` implies a non-null `pira_dcs`
  - every image carries non-empty `alt`

Fixture logistics fields (shelf location, quantity, maintenance history, PIRA
code, verification dates) are placeholders and marked as such. Inventing them
would put fabricated data into the record that the catalog exists to make
trustworthy.

### Phase 3: demo page

- `src/pages/demos/[slug].astro`.
- The specimen-label metadata strip from spec §6, which is the element a colleague
  is meant to remember.
- Stub rendering: photograph, known fields, an explicit "not yet documented" band,
  and no empty headings.
- Print stylesheet in the same pass.
- Accessibility floor, unannounced: visible focus, keyboard operability, reduced
  motion respected, WCAG AA contrast.

### Phase 4: index, facets, search

- Cards baked in at build time per amendment 3.
- Facets: topic, course tag, setup-time bucket, room requirements, hazards, status
  (stubs hidden by default), condition (out-of-service hidden by default).
- Filter state mirrored in the URL query string so a filtered view is linkable.
- Empty state names the fix rather than the failure.

### Phase 5: supporting infrastructure

- `scripts/ingest-photo.sh`: HEIC to JPG, resize, strip EXIF.
- `data/pira-dcs.json` derived from the CU Boulder DCS release, attributed.
- `src/config.ts` with `REQUEST_URL_TEMPLATE` null by default, and the durable
  contract (a request system stores `slug` verbatim) recorded in a comment at the
  point of use rather than only in the spec.
- Repository homepage field set once a deploy URL exists.

---

## Content, which is not an engineering phase

Launch target is 8 to 12 records at `verified` depth including prediction prompts.
That is authoring work requiring physical access to the apparatus, and it is the
gate on showing this to faculty. The engineering above is finished well before the
content is.
