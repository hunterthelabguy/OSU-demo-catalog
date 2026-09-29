---
# --- identity ---
title: "Standing Waves"
summary: "A string driven at one end forms clean standing waves only at special frequencies. Fixed ends must be nodes, so only certain wavelengths fit: the fundamental and its harmonics."
slug: standing-waves
status: drafted

# --- classification ---
category: waves
topics: [wave_properties, standing_waves_and_resonance]
course_tags: [PH212]
typical_units: [waves]

# --- logistics ---
transportable: true
location:
  shelf: "F"

# --- pedagogy ---
prediction_prompt: >
  We shake one end of a stretched string faster and faster. Most shaking
  frequencies just make a mess. What happens at certain special frequencies,
  and what sets which frequencies are special?
target_misconceptions:
  - "Any driving frequency produces a clean wave pattern on the string."
  - "A standing wave is a wave that has stopped carrying any motion at all."

# --- curator notes ---
notes: >
  Extracted from the stockroom demo library document, 2026-08-13; node and
  antinode definitions and the wavelength condition were corrected during
  extraction, and the equations lost in export were re-derived (see
  docs/triage-demo-library-2026-08.md). Not yet physically verified.

# --- provenance (always last) ---
last_updated: 2026-08-13
---

## Physics

Driving a stretched string sends traveling waves down it, which reflect from
the far end and interfere with the waves still arriving. At most driving
frequencies the interference is a jumble. At the right frequencies the
reflected and incoming waves reinforce into a standing wave: a pattern that
oscillates in place instead of visibly traveling. Nodes are the points that
never move; antinodes are the points of maximum swing.

For a string of length L fixed at both ends, the pattern must have a node at
each end, which admits only wavelengths of 2L/n for whole numbers n. A free
end instead demands an antinode there, shifting the allowed set. The longest
allowed wavelength, hence the lowest frequency, is the fundamental mode; the
rest are the harmonics.

Standing waves are the physics of musical instruments. Plucking a guitar
string excites a mix of the fundamental and its harmonics, and that recipe of
harmonic amplitudes is what makes a guitar sound unlike a violin playing the
same note. Fretting the string shortens L and shifts every mode up; tightening
the string raises the wave speed and does the same. Pitch rises with the
fundamental frequency, though pitch itself is a perception, not a physical
quantity proportional to anything.

## Procedure

1. Pose the prediction prompt, then sweep the driving frequency slowly.
2. Park on the fundamental, then find the second and third modes; have
   students count nodes and antinodes aloud at each.
3. Change the string tension or length and show the special frequencies move.

## Pedagogical notes

The productive question is why only these frequencies work, which pushes
students from "the machine makes the shape" toward the boundary conditions.
Connecting the mode count to fret positions on a real guitar, if one is
available, is the transfer case that sticks.
