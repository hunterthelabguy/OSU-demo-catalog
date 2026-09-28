# Physics Demonstration Catalog

[![CI](https://github.com/hunterthelabguy/OSU-demo-catalog/actions/workflows/ci.yml/badge.svg)](https://github.com/hunterthelabguy/OSU-demo-catalog/actions/workflows/ci.yml)

A browsable catalog of the physics lecture demonstrations held in the OSU
stockroom. One Markdown file per demonstration, validated at build time, rendered
as a static site with faceted browse and full-text search.

The badge claims exactly what CI checks: typecheck, the test suite, and a
production build. Nothing else is verified by it.

**Status: v0.1, proof of concept.** The proof-of-concept trio is complete:
validated records, demonstration pages (with print stylesheet), and an index
with faceted browse and full-text search. A malformed record fails the build
by construction. Remaining: the photo ingest script, the cached PIRA list,
and above all the launch content itself. See [STATE.md](STATE.md) for the
current state and queue, [VISION.md](VISION.md) for the destination, and
[docs/build-plan.md](docs/build-plan.md) for the ledger of decisions.

---

## What this is

A read-mostly reference built for the night before class: *I'm covering this
topic tomorrow; what demonstrations do we have for it?* Browse by topic or
course, and each record says what the demonstration is, what it shows, and
where the apparatus lives. Once one is chosen, the record answers the second
question, *can I actually run it on Tuesday?*, with setup time, room
requirements, hazards, and physical condition.

Each record also carries a **prediction prompt** and a list of **target
misconceptions**. These are not decoration. Crouch, Fagen, Callan and Mazur
(2004) found that students who passively watched demonstrations showed
essentially no learning gain over students who never saw them, while students who
predicted the outcome first did show gains. A catalog that ships only setup
instructions optimizes the half of the artifact that does not produce learning.
That study is single-institution with modest effect sizes, so treat the prompts as
a design hypothesis this catalog is well positioned to test later, not as settled
proof.

## What this deliberately is not

- **Not a database or a CMS.** Content is Markdown in git. Git supplies diffs,
  review, and rollback at no cost.
- **Not a request or scheduling system.** No availability checks, no conflict
  detection, no inventory decrement. A request system will be built separately
  and will link back here.
- **Not a complete inventory.** Twelve deep records read as a real system. Fifty
  thin ones read as a spreadsheet with CSS. Depth first.

A partially documented demonstration is expected and is rendered as partial, not
as broken. Gaps stated plainly build more trust than gaps concealed.

---

## Adding a demonstration

Each demonstration is a directory under `src/content/demos/` containing an
`index.md` plus its photographs:

```
src/content/demos/
    rotating-stool-dumbbells/
        index.md
        stool-01.jpg
        stool-02.jpg
```

The directory name, the `slug` field, and the published URL must all match; a
test enforces it.

Frontmatter is validated at build time against the schema in
[src/lib/demo-schema.ts](src/lib/demo-schema.ts). Validation is strict: an
unknown key is a build failure, not a silently dropped typo. Writing `hazard:`
instead of `hazards:` must not produce a record that quietly claims to be
hazard-free.

### Frontmatter fields

Only `title`, `slug`, `status`, and `topics` are required. Everything else is
optional, so a stub record still builds and still renders.

**Identity**

| Field | Notes |
|---|---|
| `title` | **Required.** Human-readable name. |
| `slug` | **Required.** Stable identifier. Never renamed. See the note below. |
| `status` | **Required.** `stub`, `drafted`, or `verified`. How complete the *record* is. |
| `condition` | `good`, `needs_repair`, or `out_of_service`. How the *apparatus* is. |

**Classification**

| Field | Notes |
|---|---|
| `pira_dcs` | PIRA DCS code, e.g. `1Q40.10`. Nullable. |
| `pira_verified` | `true` only after a human checked the code against the real list. |
| `category` | Top-level browse category, e.g. `mechanics`. Closed vocabulary adapted from the comPADRE schema and the Physics and Equity portal. Optional in the schema so a minimal stub parses; a content test requires it on every record here. |
| `topics` | **Required, at least one.** Controlled subtopic slugs (e.g. `rotation`, `electromagnetic_induction`) from the vocabulary in `demo-schema.ts`. Each subtopic has a home category, which is where the browse UI lists it; a record may carry subtopics homed elsewhere. |
| `tags` | Free-text specifics, e.g. `Doppler effect`, `eddy currents`. Rendered on the page and searchable, never a facet. |
| `course_tags` | Courses that actually use this, e.g. `[PH211]`. The PH 211/212/213 sequence sorts first in the course filter. |
| `typical_units` | Coarse curricular unit, e.g. `rotation`. Not a week number. |

**Logistics**

| Field | Notes |
|---|---|
| `demo_minutes` | Demonstration time as a range, `{min, max}` in minutes: how long the demo takes *in class*. The only time that filters. |
| `setup_minutes`, `teardown_minutes` | Integers. Prep descriptors, shown on the page, deliberately not filterable: prep is staff-supported, and instructors choose by demonstration time. |
| `setup_difficulty` | `easy`, `moderate`, or `involved`. |
| `transportable` | `false` means it lives permanently in one room. |
| `quantity` | How many exist. |
| `location` | `room` and `shelf`. |
| `room_requirements` | Constraints, not room names. `needs_dark`, `needs_water`, `needs_ceiling_hook`, `needs_compressed_air`, `high_ceiling`, `no_stairs`, `needs_120v_outlet`, `needs_projector`. |
| `hazards` | `high_voltage`, `cryogen`, `laser`, `projectile`, `open_flame`, `pressurized`, `heavy_lift`. Warnings, deliberately not filterable: nobody browses toward a hazard, and they lead the card and the page instead. |
| `consumables` | Free text, e.g. `"liquid nitrogen, ~2 L"`. |

**Pedagogy**

| Field | Notes |
|---|---|
| `prediction_prompt` | The question you pose *before* running it. |
| `target_misconceptions` | The specific wrong models this demonstration is meant to confront. |

**Accessibility**

| Field | Notes |
|---|---|
| `accessibility.hearing`, `accessibility.vision` | `accessible`, `with_support`, or `inaccessible`, per sense. Absence means nobody has assessed it, which is different from a claim. |
| `accessibility.notes` | The accommodation itself, e.g. "verbally describe the scale reading; let the student feel the surfaces before class". |

**Media**

| Field | Notes |
|---|---|
| `images[].src` | Path relative to `index.md`, e.g. `./stool-01.jpg`. |
| `images[].alt` | **Required per image.** See the note below. |
| `images[].caption` | Optional visible caption. |

**Curator notes and provenance**

| Field | Notes |
|---|---|
| `notes` | Unstructured staging area. Governed by the promotion rule below. |
| `maintenance_log` | Append-only list of `{date, note}`, newest last. |
| `last_verified` | Date the physical apparatus was checked. |
| `last_updated` | Date this record was edited. |

### Why the fields are shaped this way

These are the decisions most likely to look arbitrary to a successor and get
"cleaned up." They are not arbitrary.

- **`slug` is load-bearing, not derivable.** It looks redundant with the
  directory name, and it is not. Astro's content loader derives an entry id from
  the file path, so `demos/rotating-stool-dumbbells/index.md` would become the id
  `rotating-stool-dumbbells/index`. The frontmatter `slug` overrides that and is
  what produces a clean URL. Separately, `slug` is the identifier a future request
  system will store verbatim, which is what makes usage data joinable to this
  catalog without a migration. Do not remove this field and do not rename a value.

- **`typical_units`, not `typical_week`.** Week 9 differs by course, by
  instructor, and by term. A week number goes stale immediately and is wrong
  across sections. A curricular unit stays true.

- **`pira_verified` is separate from `pira_dcs`.** An agent asked to fill in DCS
  codes will generate plausible fakes. Populate from the real list, have a human
  review it, then flip the flag. Roughly one hour for fifty demonstrations.

- **`status` and `condition` are orthogonal.** A demonstration can be fully
  documented and physically broken, or working and undocumented. Conflating them
  loses the information that decides what you can run on Tuesday.

- **`maintenance_log` carries provenance; `condition` carries state.**
  `condition: needs_repair` with no history is a dead end. The log is what tells
  a successor whether this apparatus has failed the same way three times.

- **`alt` is required per image.** It costs nothing at authoring time and it is
  the single field that makes retrofitting accessibility unnecessary later.

- **Frontmatter position is ergonomics, not semantics.** `last_verified` sits in
  the provenance block at the bottom of the file, and it is still a first-class
  filter, as in "show me anything not physically checked in two years."

### The `notes` promotion rule

`notes` is a deliberate staging area for anything that does not yet fit a
structured field or a body heading.

> **Anything that appears in three different `notes` fields has earned a real
> field or a body heading. Promote it.**

This rule is not optional housekeeping. An unpoliced free-text field silently
absorbs the structure the catalog exists to provide, and it does so gradually
enough that nobody notices until the structured fields are decorative.

### Markdown body

Fixed heading order, so pages stay scannable and printable:

```markdown
## Physics
## Setup
## Procedure
## Quirks and caveats
## Pedagogical notes
## References
```

Omit a heading you have nothing to say under. A stub record shows its photograph
and its known fields plus an explicit "not yet documented" band. It does not show
a column of empty headings.

---

## Photographs

Two standing rules, both because this repository will be public:

1. **No identifiable student faces.** Photograph the apparatus. If a person is
   needed for scale or to show a hand position, frame so they are not
   identifiable.
2. **EXIF is stripped at ingest.** Camera metadata routinely carries GPS
   coordinates and device serial numbers.

Commit JPG or PNG only. HEIC is not committed: Chrome and Firefox cannot decode
it, and the image build pipeline needs libheif to touch it. Convert at ingest or
shoot JPEG.

An ingest script (`scripts/ingest-photo.sh`, converting HEIC to JPG, resizing, and
stripping EXIF) is planned but not yet written. Until it exists, strip metadata by
hand.

---

## Building and running

Developed and CI-verified on Node 24. Built on Astro 7.

```bash
npm ci             # install the locked dependency tree
npm run dev        # dev server at localhost:4321
npm run verify     # the whole gate: typecheck, tests, production build
```

`verify` is exactly what CI runs on every pull request and on `main`. If it is
green locally, CI will agree. The individual pieces are `npm run check`
(typecheck via `astro check`), `npm run test` (vitest), and `npm run build`
(static site into `dist/`, including the Pagefind search index).

Search only works against a built site, because the index is generated from
the built HTML: use `npm run preview` after a build. Under `npm run dev` the
search box says so and the facet filters keep working.

The test suite guards three layers: repository invariants (every commit in
history is attributed to `hunterthelabguy`; the license files keep the exact
shape GitHub's detection depends on), the schema's claims (required fields,
closed vocabularies, the `pira_verified` contradiction, alt text, maintenance
log order), and the real records (slug equals directory name, body headings in
the fixed order, every record validates outside the build too).

Deploys are automatic: every push to `main` goes to production at
[osu-demo-catalog.vercel.app](https://osu-demo-catalog.vercel.app), and every
pull request gets its own preview URL from Vercel. There are no build secrets
and no environment variables; a fork deploys the same way.

---

## Rebranding a fork

All fonts and every color token live in one file:
[src/styles/theme.css](src/styles/theme.css). Edit the tokens, swap the font
`@import` lines (installing the matching `@fontsource` package), and the whole
site follows. No template names a font or a color directly.

The defaults are Atkinson Hyperlegible Next (a typeface commissioned by the
Braille Institute for low-vision legibility) and OSU Beaver Orange. The orange
ships as two tokens because it misses WCAG AA for small text on the paper
ground: `--accent` for fills and large elements, `--accent-deep` for colored
text at reading sizes. If you swap the accent, keep or recompute that pair.

## Licensing

This repository is licensed in two parts.

- **Code** (build configuration, page templates, styles, scripts, schema) is MIT.
  See [LICENSE](LICENSE).
- **Content** (demonstration records under `src/content/` and their photographs)
  is CC BY-SA 4.0. See [LICENSE-CONTENT](LICENSE-CONTENT).

`LICENSE` holds the MIT text and nothing else, deliberately. GitHub detects a
license by matching the file against known license bodies, and any appended
scope note defeats that match, which costs the repository its license
designation in the sidebar, the API, and search. The scope of each license is
therefore stated here and in `LICENSE-CONTENT` instead. Do not add explanatory
text to `LICENSE`.

The PIRA Demonstration Classification Scheme is a community standard maintained
by the [Physics Instructional Resource Association](https://physicslearning.colorado.edu/)
and hosted by the University of Colorado Boulder. DCS codes and category titles
are not original to this work. The category and subtopic vocabulary is adapted
from the [comPADRE](https://www.compadre.org/) faceted classification schema
and the [Physics and Equity portal](https://www.physicsandequity.org/), with
local deviations recorded in `docs/build-plan.md`.

---

## Repository map

```
VISION.md                  Where the catalog is going; changes by owner ruling
STATE.md                   What exists, what is in flight, the ordered queue
docs/spec-v0.1.md          Archival design specification, including the decisions log
docs/build-plan.md         The ledger: numbered amendments and phase history
.github/workflows/ci.yml   The verify gate, run on every PR and on main
src/content.config.ts      Collection definition: glob loader plus schema
src/lib/demo-schema.ts     The record schema and controlled vocabularies
src/content/demos/         One directory per demonstration
src/pages/demos/           The per-demonstration page template
src/layouts/, src/components/   Base layout (fonts, tokens), chips
src/config.ts              Request-button gate, null until a request system exists
tests/                     Repo, schema, content, and formatting invariants
LICENSE                    MIT, covering code
LICENSE-CONTENT            CC BY-SA 4.0, covering catalog content
```

Read `docs/spec-v0.1.md` before making structural changes. It records not only
what was decided but what was considered and rejected, which is the part that is
expensive to reconstruct.

Maintainer: [hunterthelabguy](https://github.com/hunterthelabguy)
