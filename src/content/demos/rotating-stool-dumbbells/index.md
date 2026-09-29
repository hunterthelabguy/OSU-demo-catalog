---
# --- identity ---
title: "Rotating Stool and Dumbbells"
summary: "A student on a rotating stool pulls dumbbells inward and spins faster. Angular momentum is approximately conserved, so a smaller moment of inertia means a higher angular velocity."
slug: rotating-stool-dumbbells
status: drafted

# --- classification ---
pira_dcs: "1Q40.10"
pira_verified: false
category: mechanics
topics: [rotation]
tags: [rotational inertia, angular momentum]
course_tags: [PH211]
typical_units: [rotation]

# --- logistics ---
setup_difficulty: easy
transportable: true
location:
  room: "Demo Room"
  shelf: "back of room"

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
  Merged with the "Spinning Chair + Wheel" section of the stockroom demo
  library document, 2026-08-13: the fixture logistics this record carried from
  the spec's worked example (location, quantity, maintenance history, dates)
  were invented for rendering tests and have been removed rather than
  perpetuated. Location now comes from the source document. The bicycle wheel
  used in the second procedure lives with the stool. Not yet physically
  verified.

# --- provenance (always last) ---
last_updated: 2026-08-15
---

## Physics

With the stool's rotation axis vertical and bearing friction small over the
timescale of the demonstration, the student, stool, and dumbbells form a system
whose angular momentum about that axis is approximately conserved. Pulling the
dumbbells inward reduces the moment of inertia, so the angular velocity rises to
keep $L = I\omega$ constant. The rotational kinetic energy increases in the
process: at fixed angular momentum,

$$
K = \frac{L^2}{2I},
$$

so a smaller $I$ means a larger $K$. The student does work pulling the masses
inward, and that work is where the extra energy comes from. Extending the arms
slows the spin again, though bearing friction makes the return imperfect.

The bicycle wheel variation demonstrates the same conservation law as a
transfer. A student on the stationary stool holds a spinning wheel with its
axis vertical. Flipping the wheel over reverses the wheel's angular momentum,
and since the total about the vertical axis is conserved, the student and
stool pick up the difference and begin to rotate. Flipping the wheel back
stops them again.

## Setup

Place the stool on level floor, clear of benches by at least an arm-plus-dumbbell
radius in every direction. Use two dumbbells of equal mass; 2 to 4 kg each is
enough. Heavier reads better from the back of the hall but tires the volunteer.
Spin the empty stool before class to confirm the bearing is free. For the wheel
variation, check the wheel spins freely and its handles are tight.

## Procedure

1. Seat a volunteer with feet on the footrest, one dumbbell in each hand, arms
   fully extended.
2. Pose the prediction prompt and collect predictions before anything moves.
3. Spin the volunteer gently. A slow initial spin makes the change legible; a
   fast one just looks fast.
4. Have them pull the dumbbells in to their chest. The spin rate visibly rises.
5. Arms back out; the spin slows again.
6. Return to the predictions and discuss.

Wheel variation: seat the volunteer holding the wheel by its handles, axis
vertical, and spin the wheel up fast. Have them flip the wheel over and watch
the stool start to rotate; flipping it back stops the rotation. Ask the room
to track where the angular momentum went at each step.

## Quirks and caveats

Volunteers instinctively lower their arms rather than pulling straight in,
which weakens the effect and muddies the geometry. Coach the motion first.
Have the volunteer stop by extending their arms and waiting, not by grabbing
a bench. In the wheel variation, tilting the wheel only partway transfers
only part of the angular momentum, which reads as a weak effect; coach a
full, confident flip.

## Pedagogical notes

Run predict-first, per catalog convention. Both target misconceptions surface
reliably in discussion. The productive follow-up question is where the extra
kinetic energy came from, which separates students who are tracking angular
momentum from students who think some conservation law forbids any change at
all. The figure skater is the standard transfer case. The wheel variation
extends the discussion to transfer between parts of a system, and pairs well
with asking why the stool rotates opposite to the wheel's new spin direction.

## References

- PIRA DCS 1Q40.10 (code not yet verified against the cached list).
- Crouch, C., Fagen, A. P., Callan, J. P., & Mazur, E. (2004). Classroom
  demonstrations: Learning tools or entertainment? *American Journal of
  Physics*, 72(6), 835 to 838.
