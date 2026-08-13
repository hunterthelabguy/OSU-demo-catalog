# Physics Demonstration Catalog: Proof-of-Concept Spec

**Version:** 0.1 (proof of concept)
**Author / maintainer:** hunterthelabguy
**Status:** ready to hand to Claude Code
**Goal of this build:** a credible, deployable artifact to show faculty and win support for the full curation effort. Not a production stockroom management system.

> Archival note: this is the specification as ruled on 2026-08-12, reproduced
> without edit. Amendments made after that date are recorded in
> [build-plan.md](build-plan.md) under "Amendments to the spec" rather than by
> rewriting this file. The decisions log in §8 is the part worth preserving
> most carefully: it records what was considered and rejected, which is
> expensive to reconstruct and easy to relitigate.

---

## 1. Scope

### In scope for v1

- Static site, one page per demonstration, built from Markdown files in a git repo.
- Faceted browse plus free-text search, running entirely client-side.
- Honest rendering of incomplete records (a partially documented demo looks partial, not broken).
- Printable one-page view per demo (CSS print stylesheet, no PDF generation).
- A config-gated "Request this demo" button, dark by default (see §5).

### Explicitly out of scope for v1

- Any database, CMS, authentication, or server-side code.
- The request workflow itself. It stays in Google Forms + Sheets + Calendar + Apps Script, untouched.
- Scheduling logic, availability checks, conflict detection, inventory decrement.
- Multi-demo request carts.
- Analytics beyond whatever the existing Google Form already records.

### Content target for launch

8 to 12 demos at `verified` depth, including prediction prompts. Breadth is not the point; depth is what makes the concept legible to a colleague clicking through.

---

## 2. Architecture

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro | Content collections give schema validation on frontmatter at build time, so a malformed demo fails the build instead of rendering blank. Ships near-zero JS by default. |
| Content | Markdown + YAML frontmatter, one file per demo | Agents edit files well and spreadsheet cells badly. A 250-word setup note is miserable in a cell. Git gives diffs, review, and rollback for free. |
| Images | Committed JPG/PNG, co-located with the demo file | Astro's image pipeline emits responsive WebP/AVIF. |
| Search | Pagefind | Build-time index, static, no service. At 300 demos the index is roughly 100 KB gzipped. |
| Hosting | Vercel, git-push deploy | No build secrets, so the repo is forkable and redeployable by anyone. |
| Requests | Existing Google Form, prefilled URL | Works today, IT already permits it, survives the author. |

### Repo layout

```
/src/content/demos/
    rotating-stool-dumbbells/
        index.md
        stool-01.jpg
        stool-02.jpg
    bed-of-nails/
        index.md
        ...
/src/content/config.ts      # zod schema, single source of truth
/src/pages/                 # index, demo/[slug], about
/scripts/ingest-photo.sh    # HEIC to JPG, resize, strip EXIF
/data/pira-dcs.json         # cached PIRA classification list
README.md                   # runbook for a successor, not notes to self
LICENSE                     # CC BY-SA content, MIT code
```

---

## 3. Data model

Frontmatter, validated by a zod schema in `src/content/config.ts`. Required fields are marked; everything else is optional so a stub still builds.

```yaml
# --- identity ---
title: "Rotating Stool and Dumbbells"        # required
slug: rotating-stool-dumbbells               # required, stable, never renamed
status: verified                             # required: stub | drafted | verified
condition: good                              # good | needs_repair | out_of_service

# --- classification ---
pira_dcs: "1Q40.10"                          # nullable
pira_verified: false                         # true only after human check against the list
topics: [rotational inertia, angular momentum conservation]   # required, min 1
course_tags: [PHYS201, PHYS211]              # which courses actually use it
typical_units: [rotation]                    # coarse curricular unit, not week number

# --- logistics ---
setup_minutes: 5
teardown_minutes: 5
setup_difficulty: easy                       # easy | moderate | involved
transportable: true                          # false = lives permanently in one room
quantity: 1
location:
  room: "Stockroom B"
  shelf: "R3-04"
room_requirements: []                        # needs_dark, needs_water, needs_ceiling_hook,
                                             # needs_compressed_air, high_ceiling, no_stairs,
                                             # needs_120v_outlet, needs_projector
hazards: []                                  # high_voltage, cryogen, laser, projectile,
                                             # open_flame, pressurized, heavy_lift
consumables: []                              # free text, e.g. "liquid nitrogen, ~2 L"

# --- pedagogy ---
prediction_prompt: >
  A student sits on a freely rotating stool holding a dumbbell in each outstretched
  hand, spinning slowly. She pulls the dumbbells in to her chest. What happens to
  her rate of spin, and why?
target_misconceptions:
  - "Pulling the masses inward requires no work, so nothing about the motion changes."
  - "Angular momentum and angular velocity are interchangeable."

# --- media ---
images:
  - src: ./stool-01.jpg
    alt: "A seated student on a rotating stool holds a dumbbell in each outstretched hand."   # required per image
    caption: "Starting configuration, arms extended."

# --- curator notes ---
notes: >
  Staging area for anything that does not yet fit a structured field or a body
  heading. Deliberately unstructured. See the promotion rule below.
maintenance_log:                             # append-only, newest last
  - date: 2025-03-14
    note: "Bearing seized. Disassembled, cleaned, regreased."
  - date: 2026-08-01
    note: "Spins freely for ~40 s unloaded. Dumbbells both present."

# --- provenance (always last) ---
last_verified: 2026-08-01                    # date the physical apparatus was checked
last_updated: 2026-08-01                     # date this record was edited
```

Markdown body, fixed heading order so pages are scannable and printable:

```markdown
## Physics
## Setup
## Procedure
## Quirks and caveats
## Pedagogical notes
## References
```

### Design notes on the schema

- **`typical_units`, not `typical_week`.** Week 9 differs by course, instructor, and term, so a week number goes stale immediately and is wrong across sections. The UI can still surface "what do people run around rotation" without pretending to know your colleague's calendar.
- **`pira_verified` is separate from `pira_dcs`.** Do not let an agent freehand DCS codes; it will generate plausible fakes. Populate from the cached list, human-review, then flip the flag. Roughly one hour for 50 demos.
- **`alt` is required per image.** Costs nothing at authoring time, and it is the single field that makes retrofitting accessibility unnecessary later.
- **`status` and `condition` are orthogonal.** A demo can be fully documented and physically broken, or working and undocumented. Conflating them loses information that matters to the person deciding what to run Tuesday.
- **`maintenance_log` carries provenance; `condition` carries state.** `condition: needs_repair` with no history is a dead end for a successor. The log is what tells them whether this apparatus has failed the same way three times.
- **`notes` is a staging area, and needs a promotion rule to stay useful.** Anything appearing in three different `notes` fields has earned a real field or a body heading. Write this rule into the README, because an unpoliced free-text field silently absorbs the structure the catalog was built to provide.
- **Frontmatter position is authoring ergonomics, not semantics.** `last_verified` sits in the provenance block at the bottom but remains a first-class filter, e.g. "show anything not physically checked in two years." Do not let file layout leak into the schema's meaning.

---

## 4. Search and browse

The design target is the query: *"rotational inertia, week 9, room 214, under 15 minutes."*

**Do not attempt to parse that sentence.** Natural-language query parsing is the classic place where a proof of concept burns a weekend and ships something worse than dropdowns. Decompose it into a free-text box plus facets, and get the same result in a tenth of the effort.

- **Free text** over title, topics, physics summary, and body. Pagefind full-text.
- **Facets**, all combinable, all reflected in the URL query string so a filtered view is linkable:
  - topic
  - course tag
  - setup time bucket (under 5 min / 5 to 15 / over 15)
  - room requirements (the "room 214" half of the query, expressed as constraints rather than a room name)
  - hazards present
  - status (default: hide stubs, with a toggle to show them)
  - condition (default: hide out of service)
- **Empty state** names the fix, not the failure: "No demos match all four filters. Try clearing 'needs darkness'."

A room-by-name lookup requires a room-capability table (which rooms have blackout blinds, water, ceiling hooks). That is genuinely useful and genuinely out of scope for v1. The `room_requirements` field is the hook for it later.

---

## 5. Request integration

The request system is deferred and will be purpose-built to fit this catalog. **v1 therefore ships no live request integration.** Building against a Google Form that is going to be replaced means writing the integration twice and inheriting Form field-ID constraints into a system the author controls.

Instead, one config file:

```ts
// src/config.ts
export const REQUEST_URL_TEMPLATE: string | null = null;
// e.g. "https://requests.example.edu/new?demo={slug}"
```

The "Request this demo" button renders only when the template is non-null, with `{slug}` substituted. Turning the feature on later is a one-line change in one file.

**The single durable requirement carried forward:** whatever request system gets built accepts `slug` as its demo identifier and stores it verbatim. That is what makes usage telemetry joinable to the catalog without a migration. Everything else about the request system is genuinely free to be designed later.

For the faculty demo, "how you'd request it" is a sentence you say out loud, not a feature that needs to exist.

---

## 6. Visual direction (proposal, override freely)

The subject's own world is laboratory apparatus: brass, ring stands, wooden bases, index cards taped to shelves. The design should read as a well-kept instrument catalog, not a SaaS landing page.

- **Palette:** off-white paper ground, near-black ink, one saturated accent used only for status and hazard chips. Avoid the warm-cream-plus-terracotta pairing, which currently reads as generated.
- **Type:** a grotesque or slab for headings with real character, a workhorse serif or humanist sans for body, and a mono for identifiers (slug, PIRA code, shelf location). The mono for IDs is doing real work, not decoration: it signals which strings are addresses rather than prose.
- **Signature element:** the demo card. Photograph first, then a dense metadata strip (PIRA code, setup time, location, hazard icons) rendered like a specimen label. That strip is the thing a colleague will remember, because it answers "can I actually run this Tuesday" before they read a word of prose.
- **Stub rendering:** a stub demo shows its photo and known fields plus an explicit "Not yet documented" band. It does not show empty headings. Gaps stated plainly build more trust than gaps concealed.
- **Quality floor, unannounced:** responsive to mobile, visible keyboard focus, filters operable without a mouse, reduced motion respected, contrast at WCAG AA.

---

## 7. Build order

0. Set git commit author to `hunterthelabguy` before the first commit. Everything else about account structure is a cheap reconfiguration later; commit authorship is not.
1. Schema in `src/content/config.ts`, plus two hand-written demo files (one `verified`, one `stub`) as fixtures.
2. Demo page template. Get one page genuinely good before building the index.
3. Index page with facets and Pagefind.
4. Photo ingest script.
5. Print stylesheet.
6. README runbook, LICENSE, deploy.
7. `REQUEST_URL_TEMPLATE` flipped on, whenever the request system exists.

Steps 1 through 3 are the proof of concept. Everything after is polish that can ship the following week.

---

## 8. Decisions log

| Considered | Decision | Reason |
|---|---|---|
| Single coupled app for catalog + requests | **Declined** | Catalog is read-mostly, public, near-zero writes. Requests are write-mostly, private, stateful, calendar-bound. They share exactly one thing: a demo ID. Coupling them is the main available mistake. |
| Google Form prefill as the v1 request path | **Declined** | Request system will be purpose-built to fit the catalog. Integrating with a Form slated for replacement means writing it twice and importing Form field-ID constraints into an owned system. Replaced with a null-by-default config constant. |
| Single free-text `comments` field | **Revised** | Split into `maintenance_log` (dated, append-only, provenance for `condition`) and `notes` (staging area, governed by a promotion rule). An unpoliced catch-all silently absorbs the structure the catalog exists to provide. |
| Google Sheet as content source | **Declined** | Two sources of truth (Sheet + Doc) is the current worst problem. Long prose in cells is unmaintainable and agent-hostile. Revisit only if student workers need a non-git editing path. |
| Hosted search (Algolia, Typesense) | **Declined** | Index is roughly 100 KB gzipped at 300 demos. A search service here is a dependency, a cost, and a bus-factor liability for no gain. |
| PIRA DCS as the primary search axis | **Declined** | No professor thinks in DCS codes. PIRA is the stable identifier and a secondary filter; topic and course are primary. |
| Natural-language query parsing | **Declined** | Free text plus facets reaches the same result for a tenth of the effort and fails legibly. |
| `typical_week` field | **Declined** | Week numbers vary by course, instructor, and term. Replaced with `typical_units`. |
| Headless CMS (Decap, Tina) | **Deferred** | Author is the sole publisher for v1. Add if student workers need to contribute without git. |
| Room-by-name filtering | **Deferred** | Needs a room-capability table. `room_requirements` is the forward hook. |
| Stubbing all 50 demos for launch | **Declined** | 12 deep records read as a real system; 50 thin ones read as a spreadsheet with CSS. |
| HEIC in repo | **Declined** | Chrome and Firefox cannot decode it; sharp needs libheif. Convert at ingest, or shoot JPEG. |

---

## 9. Resolved

1. **Accounts:** no org yet, but straightforward to create. Ruling: build and deploy under `hunterthelabguy` now. Repo transfer preserves history and sets up redirects, so migration is cheap. Do not circulate the URL beyond the faculty preview until it is on final infrastructure, since a propagated link is the expensive thing to change, not the repo.
2. **Attribution consistency:** the repo is public, so use `hunterthelabguy` uniformly across the spec, README, LICENSE, and git commit author. Mixed attribution across those surfaces is what creates a linkage, and rewriting commit authorship after the fact is the one genuinely tedious item on this list.
3. **Request system:** deferred, and will be purpose-built to fit this catalog. Ruling: no live integration in v1; config constant only; `slug` is the durable contract.
4. **Photo restrictions:** none known. Standing guidance anyway, since the repo is public: no identifiable student faces, and the ingest script strips EXIF.

---

## Pedagogical grounding

The `prediction_prompt` and `target_misconceptions` fields are not decoration. Crouch, Fagen, Callan & Mazur (2004), *American Journal of Physics* **72**(6), 835 to 838, found that students who passively watched demonstrations showed essentially no learning gain over students who never saw them; students who predicted the outcome first showed gains, and predicting plus discussion showed more. A catalog that ships only setup instructions optimizes the half of the artifact that does not produce learning.

Caveat worth stating plainly: this is a single-institution study in one introductory course, and the effect sizes are modest. It is a strong reason to include the fields, not proof that including them changes outcomes. Treat the prompts as a design hypothesis this catalog is well positioned to test later, since request telemetry keyed to demo IDs could eventually be joined to course-level assessment data.
