---
# --- identity ---
title: "Faraday Cage"
summary: "A metal mesh cage lowered over a playing radio turns the music to static; plastic would not. Free electrons in the metal cancel the wave inside, and holes far smaller than the wavelength do not leak."
slug: faraday-cage
status: drafted

# --- classification ---
category: electricity_and_magnetism
topics: [electromagnetism]
tags: [shielding]
course_tags: [PH213]
typical_units: [electrostatics]

# --- logistics ---
transportable: true
location:
  shelf: "D"

# --- pedagogy ---
prediction_prompt: >
  A radio is playing on the table. We lower a metal mesh cage over it,
  touching nothing else. What happens to the music, and what would happen if
  the cage were plastic instead?
target_misconceptions:
  - "A barrier has to be solid to block a wave; a mesh full of holes cannot stop anything."
  - "The cage blocks radio because metal absorbs sound."

# --- accessibility ---
accessibility:
  hearing: with_support
  vision: accessible
  notes: >
    The effect is audible (music turning to static); for hard of hearing
    students, pair it with a visible signal meter or narrate the change
    clearly, per the source document's general guidance on auditory demos.

# --- curator notes ---
notes: >
  Extracted from the stockroom demo library document, 2026-08-13; the Gauss's
  law statement was corrected and the electrostatic argument separated from
  the radio-wave screening (see docs/triage-demo-library-2026-08.md). Not yet
  physically verified.

# --- provenance (always last) ---
last_updated: 2026-08-13
---

## Physics

Metal is a conductor: its electrons move freely. Put a conductor in an
external electric field and the electrons redistribute until the field inside
the conductor cancels. For static fields this is the classic shielding result,
consistent with Gauss's law, which relates the electric flux through a closed
surface to the charge enclosed by it. The charges do not "know" to arrange
themselves this way; any leftover interior field would keep pushing them until
it is gone.

A radio wave is not a static field, but the same free electrons respond fast
enough to cancel the oscillating field of an incoming wave, driving currents
in the mesh that re-radiate and cancel the wave inside. The antenna inside the
cage then has nothing to receive. A plastic enclosure changes nothing: its
charges are bound, they cannot redistribute, and the wave passes through.

The mesh does not need to be solid. Screening works when the holes are much
smaller than the wavelength. FM radio waves are meters long and AM waves
hundreds of meters, while the holes in this cage are a couple of millimeters,
so the mesh looks solid to the wave.

## Procedure

1. Turn on the radio and let it play; establish that the antenna is receiving
   waves that fill the room.
2. Pose the prediction prompt, including the plastic variant.
3. Lower the cage over the radio. The music turns to static.
4. Lift it off, and ask the room why a cage full of holes worked.

## Pedagogical notes

The plastic counterfactual is where the learning is; without it, students
file the cage away as "metal blocks stuff." The hole-size question is the
second layer: cell phone signals (centimeter wavelengths) can leak through a
coarse cage that kills AM radio, which is a nice prediction to send students
home with. Elevator dead zones and microwave oven door mesh are the transfer
cases.
