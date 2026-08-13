---
# --- identity ---
title: "Driven Spring Resonator"
slug: driven-spring-resonator
status: drafted

# --- classification ---
topics: [resonance, oscillations]
typical_units: [oscillations]

# --- logistics ---
transportable: true
room_requirements: [needs_120v_outlet]

# --- pedagogy ---
prediction_prompt: >
  A motor shakes the top of a hanging spring-and-mass system. As we slowly
  turn the motor speed up from zero, what happens to how far the mass swings,
  and does swinging keep growing as the motor keeps speeding up?
target_misconceptions:
  - "More drive always means more response; amplitude keeps climbing with motor speed."
  - "Resonance is a property of the power supply, something measured in volts."
  - "At resonance the mass moves in step with the driver."

# --- curator notes ---
notes: >
  Extracted from the stockroom demo library document, 2026-08-13; the
  resonance and phase claims were corrected during extraction (see
  docs/triage-demo-library-2026-08.md). The source document gives no shelf
  location for the resonator itself; the spare springs are in the "Springs"
  drawer and the power supply in the far cabinet of the demo room. Not yet
  physically verified.

# --- provenance (always last) ---
last_updated: 2026-08-13
---

## Physics

The motor drives the spring-mass system at a frequency set by the motor's
rotation rate. Like every driven oscillator, the system has a resonant
frequency fixed by its own physical properties (for a spring-mass system, the
spring constant and the mass). Drive it near that frequency and the
steady-state amplitude grows dramatically; drive it well below or above and
the response is small. The phase tells the same story from another angle: far
below resonance the mass tracks the driver nearly in phase, at resonance it
lags by a quarter cycle, and far above it moves nearly opposite the driver.

One correction to the folklore that travels with this apparatus: resonance is
a frequency, not a voltage. The supply voltage sets the motor speed, which
sets the drive frequency, so a statement like "resonance happens near 20 V"
is shorthand for "with this motor and these springs, 20 V happens to spin the
motor near the resonant frequency." Change the spring, the mass, or the
motor, and the special voltage changes with it.

## Setup

1. Hook the two motor leads to a large power supply, found in the far cabinet
   of the demo room.
2. Pick a spring from the "Springs" drawer and hang the system.
3. Before class, sweep the voltage slowly to find where this spring resonates,
   and note the reading for yourself.

## Procedure

1. Pose the prediction prompt with the motor off.
2. Sweep the voltage up slowly from zero. Let the room watch the amplitude
   grow, peak, and then shrink again as the drive passes through resonance.
3. Park just below, at, and just above resonance and point out the phase
   between the motor arm and the mass in each regime.

## Quirks and caveats

Do not park the system at resonance for long. The amplitude gets large enough
to overstretch or snap a spring, which is an elastic-limit problem, not a
mystical property of resonance. The observation that many of the stocked
springs resonate somewhere near 20 V of drive is an operating note for this
particular motor and drawer of springs, nothing more; treat it as a starting
point for the pre-class sweep, not a number to teach.

## Pedagogical notes

The sweep is the lesson: amplitude through a peak, phase flipping from
in-step to opposite. Students who predicted "faster motor, bigger swing" get
the cleanest possible confrontation when the amplitude falls above resonance.
Pushing a playground swing at the right moments versus wiggling it frantically
is the transfer case that lands.
