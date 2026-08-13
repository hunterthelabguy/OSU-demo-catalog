---
# --- identity ---
title: "Wood Induced Dipole"
slug: wood-induced-dipole
status: drafted

# --- classification ---
category: electricity_and_magnetism
topics: [electrostatics]
tags: [polarization]
course_tags: [PH213]
typical_units: [electrostatics]

# --- logistics ---
setup_difficulty: moderate
transportable: true

# --- pedagogy ---
prediction_prompt: >
  A plastic rod is charged by rubbing it with fur. Held near a metal can, the
  can rolls toward it. Wood is an insulator: if we balance a long wooden board
  on a point and hold the same rod near one end, does the board move?
target_misconceptions:
  - "Insulators are completely inert to charged objects; only conductors respond."
  - "If a charged rod attracts something, that something must have been charged already."

# --- curator notes ---
notes: >
  Extracted from the stockroom demo library document, 2026-08-13; the
  mechanism was corrected from free-charge conduction to dielectric
  polarization (see docs/triage-demo-library-2026-08.md). The source document
  gives no shelf location. Not yet physically verified.

# --- provenance (always last) ---
last_updated: 2026-08-13
---

## Physics

Rubbing the plastic pipe with rabbit fur transfers electrons to the plastic,
charging it negative. Near the metal can, the story is conduction: free
electrons in the metal retreat from the rod, the near side of the can is left
positive, and since the positive side is closer, the net force is attractive.
The can rolls.

Wood has essentially no free charge to move, and it still responds, because
it is a dielectric. The rod's field polarizes the wood's molecules, aligning
bound charge so that the surface facing the rod carries a slight opposite
charge. This is the same physics that lets a charged comb lift paper scraps;
no conduction is required. The induced polarization is far weaker than the
can's conduction response, which is where the demonstration's geometry earns
its keep: torque is force times lever arm, so a tiny force applied at the end
of a long board balanced on a point can still rotate it. Balancing on a
single small point also minimizes the friction the torque must overcome.

## Setup

Balance a long, thin wooden board (a 2 x 4 reads best; a ruler or marker
works) on a small point at its center of mass so neither end touches
anything. Clear space around it and have the rabbit fur and plastic pipe at
hand. Reference pictures exist in the source document; re-shoot them for this
record.

## Procedure

1. Part one, the can: ask whether metal conducts, then charge the rod by
   rubbing with fur for 10 to 20 seconds, collect predictions, and hold the
   rod about an inch from the can without touching, near the top of the can.
   The can rolls toward the rod; nudge it gently to break static friction if
   needed.
2. Part two, the wood: ask whether wood conducts, rebalance the board, ask
   observers to step back, recharge the rod, and collect predictions.
3. Hold the rod about an inch from one end of the board, perpendicular to its
   long side. The board slowly rotates toward the rod.

## Quirks and caveats

The wood effect is small. It fails if the board is not balanced on a truly
small point, if the rod is allowed to touch, or if the rod was not freshly
charged. Recharge between attempts and keep the room's air currents down.

## Pedagogical notes

Run the can first so the conductor case is established, then let the wood
break the "insulators are inert" model. The follow-up that lands: the comb
and paper scraps trick is this same demonstration at a smaller scale, and
static cling is the household transfer case. For students tracking the
mechanism, the distinction worth drawing is induced polarization of bound
charge versus redistribution of free charge; both produce attraction, and
only one needs a conductor.
