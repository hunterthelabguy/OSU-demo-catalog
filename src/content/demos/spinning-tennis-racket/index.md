---
# --- identity ---
title: "Light-Up Spinning Tennis Racket"
summary: "A tennis racket with a single LED taped at its center of mass is thrown up tumbling. The LED follows a simple projectile path, since a tumbling body rotates about its center of mass."
slug: spinning-tennis-racket
status: drafted

# --- classification ---
category: mechanics
topics: [rotation]
tags: [center of mass]
course_tags: [PH211]
typical_units: [rotation]

# --- logistics ---
transportable: true
location:
  room: "Demo Room"
  shelf: "B"

# --- pedagogy ---
prediction_prompt: >
  A tennis racket with a single red LED taped at one particular spot is
  thrown up while tumbling end over end. What path does the LED trace while
  the racket turns around it, and what is special about where it sits?
target_misconceptions:
  - "A thrown object rotates about whatever point you held it by when you let go."
  - "When something tumbles, every point on it moves in an equally complicated way."

# --- accessibility ---
accessibility:
  hearing: accessible
  vision: with_support
  notes: >
    The effect is purely visual; describe the smooth path of the red LED
    while the rest of the racket tumbles around it, and let the student
    handle the racket and find its balance point by touch beforehand.

# --- media ---
images:
  - src: ./spinning-tennis-racket-01.jpg
    alt: A blue tennis racket lying on a gray floor, with a small red LED in a black taped package fixed at the throat just below the strings.

# --- curator notes ---
notes: >
  Extracted from the stockroom demo library document, 2026-08-13; the center
  of mass explanation was corrected during extraction (see
  docs/triage-demo-library-2026-08.md). Not yet physically verified.
maintenance_log:
  - date: 2026-09-25
    note: >
      Rebuilt the light. The old build, a string of LED lights bundled
      around the racket with a battery pack wedged in the throat, shifted
      the center of mass and gave no single point of light. Now one LED on
      a CR2032 3 V lithium cell through a 50 ohm resistor, taped in place;
      the cell lasts a few hours. Planned: a 3D-printed clip-on housing to
      hold the LED at the center of mass, and a switch.

# --- provenance (always last) ---
last_updated: 2026-09-28
---

## Physics

A freely tumbling rigid body rotates about its center of mass, and the center
of mass itself moves as a simple projectile: straight up and down if thrown
vertically, a parabola otherwise. Gravity accelerates the center of mass the
whole flight; what it cannot do, acting effectively at that point, is torque
the racket about it. A single red LED is taped at the racket's center of
mass, so while every other point on the frame loops around it, the LED
follows the clean thrown trajectory. The single point of light is the
design: the old build, a string of LED lights bundled around the racket with
a battery pack wedged in the throat, shifted the center of mass and gave no
single point of light to follow.

## Setup

1. Check that the LED is lit before class. It runs from a CR2032 3 V lithium
   cell through a 50 ohm resistor, taped in place, with no switch: it is on
   from the moment it is taped to its cell until that connection is broken
   or the cell runs down, and the cell lasts a few hours.
2. Find an open space where the racket cannot hit anything. Darkening the
   room makes the LED far easier to see, so practice the throw in the light
   first.
3. Balance the racket on a finger for the audience to prove the LED sits at
   the balance point.

## Procedure

1. Tell the audience what to watch: the LED is at the center of mass. Pose
   the prediction prompt.
2. Hold the racket by the handle with both hands, thin side facing you, and
   spin it upward so it rotates about the axis along the handle-to-head
   plane's thin direction. Throw it a decent height with plenty of spin.
3. Catch it if possible so the taped LED and cell are not knocked loose; a
   floor landing is survivable since it lands on the thin edge, and
   something soft on the ground lets you throw higher in comfort.
4. With no switch, the LED keeps drawing on the cell after class until its
   taped connection is broken.

## Quirks and caveats

Give observers the one-sentence setup before the first throw; without knowing
the LED marks the center of mass, the effect reads as decoration. The light
has no switch and the cell lasts only a few hours, so a racket left taped up
since the last use may be dark: check it before class. A 3D-printed clip-on
housing to hold the LED at the center of mass, and a switch, are planned but
not yet built. The demonstration video linked below shows the intended look.

## Pedagogical notes

The clean split between the LED's simple path and the frame tumbling around
it is the whole argument: complicated tumbling is simple motion of the
center of mass plus rotation about it. A good follow-up is to ask where the
"center of mass light" would go on a hammer, or on a wrench slid across ice.

## References

- Demonstration video: https://www.youtube.com/watch?v=Rh93qSDp55s
