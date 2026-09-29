---
# --- identity ---
title: "Magnet Drop"
summary: "A strong magnet falls slowly through a metal tube that does not attract it, while its twin drops quickly through plastic. Eddy currents induced in the metal oppose the magnet's motion."
slug: magnet-drop
status: drafted

# --- classification ---
category: electricity_and_magnetism
topics: [electromagnetic_induction, magnetism]
tags: [eddy currents]
course_tags: [PH213]
typical_units: [induction]

# --- logistics ---
transportable: true

# --- pedagogy ---
prediction_prompt: >
  Two identical strong magnets are dropped at the same moment, one down a
  plastic tube and one down a metal tube of the same length. The magnet does
  not stick to either tube. Which magnet comes out first, and by how much?
target_misconceptions:
  - "The magnet falls slowly because it is attracted to the metal tube."
  - "If a material is not attracted to a magnet, a magnet cannot interact with it at all."

# --- media ---
images:
  - src: ./magnet-drop-01.jpg
    alt: A copper pipe and a white plastic pipe of similar length clamped upright to a ring stand on a speckled floor.

# --- curator notes ---
notes: >
  Extracted from the stockroom demo library document, 2026-08-13. The source
  document gives no shelf location. It also mentions a smaller handheld
  variant (magnets sliding inside a short metal pipe), noted as less
  convincing because observers attribute the slow fall to friction. The
  magnets are strong; keep them away from cards and electronics. Not yet
  physically verified.

# --- provenance (always last) ---
last_updated: 2026-08-13
---

## Physics

The metal tube is not ferromagnetic: touch the magnet to it and nothing
sticks, which is worth showing before the drop. The slow fall is induction.
As the magnet approaches any region of the tube, the magnetic flux through
that region grows; by Faraday's and Lenz's laws the changing flux drives
circulating eddy currents in the tube wall, and their magnetic field opposes
the magnet's motion. Below the magnet the currents push back on its approach,
above it they pull back on its departure. The result is a velocity-dependent
drag, and the magnet drifts down the metal tube far behind its twin in the
plastic tube, where no significant current can be driven.

## Procedure

1. Touch the magnet to the metal tube to rule out attraction, then pose the
   prediction prompt.
2. Drop both magnets simultaneously; the plastic-tube magnet clatters out
   while the other is still descending.
3. Ask the room where the slowing force comes from if not attraction, and
   walk the flux argument through one section of tube.

## Pedagogical notes

Killing the attraction hypothesis first, publicly, is what gives the demo its
force. The follow-up question that separates models: what would happen with a
tube slit along its length? (The same cut-ring logic as the jumping rings
demonstration: no closed path, no eddy currents, fast fall.) Magnetic braking
in trains, roller coasters, and regenerative braking are the transfer cases.
