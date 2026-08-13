---
# --- identity ---
title: "Multiplicity Dice Activity"
slug: multiplicity-dice
status: drafted

# --- classification ---
topics: [entropy, statistical mechanics]
course_tags: [PH423]
typical_units: [thermodynamics]

# --- logistics ---
transportable: true
consumables: []

# --- pedagogy ---
prediction_prompt: >
  Every student is a molecule and every die is a unit of energy. If one group
  starts with far more dice than everyone else and we let random passing run
  for a while, what happens to each group's average, and can the pile ever
  come back?
target_misconceptions:
  - "Thermal equilibrium means the exchange of energy stops."
  - "Systems spread energy out because something forces them to, not because spread-out arrangements vastly outnumber concentrated ones."

# --- curator notes ---
notes: >
  Extracted from the stockroom demo library document, 2026-08-13. A whole-class
  participation activity rather than shelf apparatus; previously used in
  PH 423 (Energy and Entropy), and course staff may have a handout with a
  worked version. The source document gives no storage location for the dice.
  Not yet physically verified.

# --- provenance (always last) ---
last_updated: 2026-08-13
---

## Physics

Each student is a molecule; each die is one unit of energy. The number on a
die is deliberately meaningless, a point worth stating twice, since the dice
are random-number generators for the passing rule, not energy values.
Temperature in this model is average energy per molecule: a group's dice
count divided by its head count. A macrostate is the set of group totals; a
microstate is the full assignment of which student holds which dice.

Two results emerge from nothing but counting. First, groups in equilibrium
still exchange energy constantly; their temperatures wander around a stable
value because exchange is random, not because it has stopped. Second, a
deliberately concentrated pile of energy spreads and does not return: not
because any rule forbids it, but because the microstates where energy is
spread out overwhelmingly outnumber those where it is concentrated. That
counting is multiplicity, and its logarithm is entropy.

## Setup

Hand each student a small number of dice (two is fine). Divide the seated
room into blocks of deliberately unequal size, and prepare a passing chart
that maps die rolls to neighbor directions, plus a board table for group
temperatures per round.

## Procedure

1. Brief the room: you are a molecule, each die is a unit of energy, the
   numbers on the dice mean nothing. Have each group compute its temperature
   and describe its macrostate, and ask for examples of microstates and for
   a guess at the group's entropy.
2. Run a round: everyone rolls, passes dice per the chart (students at an
   edge pass back inward on an invalid roll), then groups recompute their
   temperature. Record each group's value and repeat several rounds.
3. Discuss the recorded table: temperatures wandered but stayed near their
   starting values. That is thermal equilibrium with ongoing random exchange.
4. Now have every student donate one die to a single chosen group. Ask
   whether the room is in a low or high entropy state. Run several more
   rounds and watch the concentration dissolve back toward equilibrium.

## Pedagogical notes

The activity's power is that nothing is simulated: the students are the
ensemble, and irreversibility appears with no law imposed beyond a random
passing rule. The productive closing question is why the dice never
re-concentrate, which lets "improbable" replace "impossible" in students'
language. Keep group sizes unequal on purpose so equal temperature does not
mean equal dice count, forcing the average rather than the total.
