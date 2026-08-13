---
# --- identity ---
title: "Rotating Stool and Dumbbells"
slug: rotating-stool-dumbbells
status: verified
condition: good

# --- classification ---
pira_dcs: "1Q40.10"
pira_verified: false
topics: [rotational inertia, angular momentum conservation]
course_tags: [PHYS201, PHYS211]
typical_units: [rotation]

# --- logistics ---
setup_minutes: 5
teardown_minutes: 5
setup_difficulty: easy
transportable: true
quantity: 1
location:
  room: "Stockroom B"
  shelf: "R3-04"
room_requirements: []
hazards: []
consumables: []

# --- pedagogy ---
prediction_prompt: >
  A student sits on a freely rotating stool holding a dumbbell in each outstretched
  hand, spinning slowly. She pulls the dumbbells in to her chest. What happens to
  her rate of spin, and why?
target_misconceptions:
  - "Pulling the masses inward requires no work, so nothing about the motion changes."
  - "Angular momentum and angular velocity are interchangeable."

# --- curator notes ---
notes: >
  Fixture record, created in phase 2 to exercise the verified rendering path.
  Logistics values (location, quantity, maintenance log, dates) are copied from
  the worked example in docs/spec-v0.1.md, not from a fresh physical check.
  Replace with checked values during the launch content pass.
maintenance_log:
  - date: 2025-03-14
    note: "Bearing seized. Disassembled, cleaned, regreased."
  - date: 2026-08-01
    note: "Spins freely for ~40 s unloaded. Dumbbells both present."

# --- provenance (always last) ---
last_verified: 2026-08-01
last_updated: 2026-08-12
---

## Physics

With the stool's rotation axis vertical and bearing friction small over the
timescale of the demonstration, the student, stool, and dumbbells form a system
whose angular momentum about that axis is approximately conserved. Pulling the
dumbbells inward reduces the moment of inertia, so the angular velocity rises to
keep L = Iω constant. The rotational kinetic energy increases in the process:
the student does work pulling the masses inward, and that work is where the
extra energy comes from. Extending the arms slows the spin again, though bearing
friction makes the return imperfect.

## Setup

Place the stool on level floor, clear of benches by at least an arm-plus-dumbbell
radius in every direction. Use two dumbbells of equal mass; 2 to 4 kg each is
enough. Heavier reads better from the back of the hall but tires the volunteer.
Spin the empty stool before class to confirm the bearing is free.

## Procedure

1. Seat a volunteer with feet on the footrest, one dumbbell in each hand, arms
   fully extended.
2. Pose the prediction prompt and collect predictions before anything moves.
3. Spin the volunteer gently. A slow initial spin makes the change legible; a
   fast one just looks fast.
4. Have them pull the dumbbells in to their chest. The spin rate visibly rises.
5. Arms back out; the spin slows again.
6. Return to the predictions and discuss.

## Quirks and caveats

The bearing has a history; see the maintenance log. Volunteers instinctively
lower their arms rather than pulling straight in, which weakens the effect and
muddies the geometry. Coach the motion first. Have the volunteer stop by
extending their arms and waiting, not by grabbing a bench.

## Pedagogical notes

Run predict-first, per catalog convention. Both target misconceptions surface
reliably in discussion. The productive follow-up question is where the extra
kinetic energy came from, which separates students who are tracking angular
momentum from students who think some conservation law forbids any change at
all. The figure skater is the standard transfer case.

## References

- PIRA DCS 1Q40.10 (code not yet verified against the cached list).
- Crouch, C., Fagen, A. P., Callan, J. P., & Mazur, E. (2004). Classroom
  demonstrations: Learning tools or entertainment? *American Journal of
  Physics*, 72(6), 835 to 838.
