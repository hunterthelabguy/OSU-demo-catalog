---
# --- identity ---
title: "Interlaced Books"
summary: "Two books with interleaved pages resist being pulled apart far beyond what ordinary friction explains. Pulling tensions the angled pages and presses them together: friction self-amplifies."
slug: interlaced-books
status: drafted

# --- classification ---
category: mechanics
topics: [friction]
course_tags: [PH211]
typical_units: [forces]

# --- logistics ---
transportable: true
location:
  room: "Demo Room"
  shelf: "A"

# --- pedagogy ---
prediction_prompt: >
  Two textbooks have their pages interleaved one by one, like shuffled cards.
  Nothing holds them together but paper on paper. How hard is it to pull them
  apart: a firm tug, one strong person, two strong people, or something more?
target_misconceptions:
  - "The holding force is just many pages each contributing ordinary friction under the books' own weight."
  - "Friction is fixed by the materials alone, so interleaving cannot change how strongly paper grips paper."

# --- accessibility ---
accessibility:
  hearing: accessible
  vision: accessible

# --- curator notes ---
notes: >
  Extracted from the stockroom demo library document, 2026-08-13; the friction
  explanation was corrected during extraction (see
  docs/triage-demo-library-2026-08.md). Not yet physically verified.

# --- provenance (always last) ---
last_updated: 2026-08-13
---

## Physics

Interleaving alone does not explain the effect. If the pages pressed on each
other only under their own weight, the total friction would be modest and the
books would slide apart. The real mechanism is geometric self-amplification:
because each page enters the stack at a slight angle, pulling the books apart
puts tension along every page, and a component of that tension presses the
pages together. Harder pulling means larger normal forces, which means more
friction, which is why the assembly effectively locks. The effect was
quantified by Alarcon and coworkers (2016), who showed the holding force grows
dramatically with the number of interleaved pages and the overlap geometry.

Mythbusters popularized the demonstration with two interleaved phonebooks,
measuring roughly 8000 pounds of force (about 36 kN) before separation, which
took two military vehicles pulling in opposite directions.

## Procedure

1. Pose the prediction prompt and collect answers before anyone touches the
   books.
2. Invite one volunteer, then two, to pull the books apart. Let them brace and
   really try.
3. Ask what changed compared with two books simply stacked on each other, and
   steer discussion toward where the pressing force comes from.

## Pedagogical notes

The productive follow-up is the thought experiment from the source document:
imagine the same two books with pages made of a different material, ice or
rubber, and ballpark how the holding force changes. It separates students who
think friction is a material constant from students who track the normal
force. Note that the naive explanation (many pages, each with a bit of
friction) is itself the target misconception: without the self-amplification
geometry it underpredicts the measured forces by orders of magnitude.

## References

- Alarcon, H., Salez, T., Poulard, C., Bloch, J.-F., Raphael, E.,
  Dalnoki-Veress, K., & Restagno, F. (2016). Self-amplification of solid
  friction in interleaved assemblies. *Physical Review Letters*, 116, 015502.
- Mythbusters phonebook episode: https://www.youtube.com/watch?v=Y89MUYZKaME
  and the tank pull: https://www.youtube.com/watch?v=hOt-D_ee-JE
