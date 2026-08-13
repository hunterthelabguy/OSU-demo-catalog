---
# --- identity ---
title: "Jumping Rings"
slug: jumping-rings
status: drafted

# --- classification ---
topics: [electromagnetic induction]
typical_units: [induction]

# --- logistics ---
transportable: true
room_requirements: [needs_120v_outlet]
hazards: [projectile]

# --- pedagogy ---
prediction_prompt: >
  A stack of different rings sits by an electromagnet's vertical core: solid
  aluminum, aluminum with a cut through it, and wood. When the switch flips,
  which rings jump, which stay, and why?
target_misconceptions:
  - "The rings jump because the electromagnet attracts or magnetizes them, like iron to a magnet."
  - "A ring with a thin cut in it behaves the same as a solid ring."
  - "Once the field is on and steady, nothing more can be induced."

# --- curator notes ---
notes: >
  Extracted from the stockroom demo library document, 2026-08-13; the
  document's two "(verify?)" markers on alternating current are resolved,
  since the coil runs on mains AC (see docs/triage-demo-library-2026-08.md).
  The source document gives no shelf location. Not yet physically verified.

# --- provenance (always last) ---
last_updated: 2026-08-13
---

## Physics

The apparatus is an electromagnet: a large coil wrapped around a metal core
that extends upward. Mains alternating current through the coil produces a
magnetic field along the core (Ampere's law), and the ferromagnetic core
amplifies it, its magnetic domains aligning with the coil's field.

Flip the switch with a conductive ring on the core and the magnetic flux
through the ring changes rapidly. By Faraday's and Lenz's laws, the changing
flux induces a current in the ring whose own magnetic field opposes the
change, making the ring a magnetic dipole oriented against the coil's field.
The ring is repelled and shoots into the air. The variations carry the
lesson: a ring with a cut cannot carry a circulating current and does not
budge, and a wooden ring is an insulator and does the same.

A ring held partway up the core when the switch is already on levitates in
place. There is no trick reconciling this with "induction needs changing
flux": the current is alternating, so the flux through the ring never stops
changing, and current keeps being induced as long as the device is on.

## Setup

Plug the device in and place it where observers can stand back a few feet
with clear air above the core.

## Procedure

1. Show the rings, pose the prediction prompt, and collect predictions per
   ring.
2. Flip the switch with the solid ring on the core; catch the ring as it
   falls so it hits no one.
3. Repeat with the cut ring and the wooden ring.
4. Hold a solid ring partway up the core with the device on and let it
   levitate, then ask why induction continues with the switch already on.

## Quirks and caveats

The device is safe to touch, but the rings heat fast: a ring held in place
carries a large induced current and will quickly get hot enough to burn
fingers. Do not let participants pin a ring down, and let each ring cool
before it is handled again. Participants may choose and place rings only with
the current off. Use ordinary caution with children around the device.

## Pedagogical notes

Prediction per ring is what makes this land; the cut ring is the cleanest
possible test between "the magnet pulls on metal" and "the changing flux
drives a current." The levitating hold is the second act for a class that has
seen Faraday's law formally. Induction cooktops and metal detectors are the
transfer cases.
