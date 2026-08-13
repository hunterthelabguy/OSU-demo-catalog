# Extraction triage: stockroom demo library document, August 2026

Source: the working document "Physics Demo Library" maintained in the demo
room (a .docx; images and embedded equations did not survive extraction and
must be re-shot or re-derived at the apparatus). This file records how each
section of that document was triaged into the catalog on 2026-08-13, and every
physics correction applied on the way in. When a stub below gets drafted, start
from the source document plus the correction listed here.

Rulings that shaped the pass, made by the owner in session:

- **Top 12 deepest sections became `drafted` records** with corrections
  applied. Everything else became a `stub` record that points back here, per
  the depth-first rule (twelve deep records read as a real system).
- **Accessibility guidance was promoted to a schema field** (`accessibility`,
  per-sense levels plus a notes string). The source document carried it on
  seven demos, past the notes promotion threshold.
- **Names stay off for now.** The source document names staff and a contact
  email. None of that is committed to this public repository; roles are
  referenced instead ("demo staff", "course staff").
- **Nothing is `verified`.** Every record from this pass is `drafted` or
  `stub`. Verification requires a physical check at the shelf, which no
  extraction can supply. Locations were copied only where the document stated
  them; a location the document marked with a question mark stayed out of the
  structured field.

---

## Physics corrections applied during extraction

The source document is a working draft and contains several explanations that
would teach the wrong model. Each was corrected in the drafted record; the
list is kept here so the corrections survive even where a section only became
a stub.

1. **Driven Spring Resonator.** The document states "the resonant frequency of
   most of those springs occurs around ~20V supplied to the motor." Resonance
   is a frequency, not a voltage; supply voltage sets motor speed, which sets
   the drive frequency, so 20 V is at best an observed operating point for the
   particular springs in the drawer and that motor, valid only for that
   pairing. The document also claims the spring oscillates "in-phase" at
   resonance: the steady-state response is in phase well below resonance, lags
   the drive by a quarter cycle at resonance, and approaches antiphase above
   it. A reference to "the graphs below" from an LRC lab (resonance near 8
   kHz) pointed at a stripped image from an electrical experiment and was
   dropped. The warning against sustained driving at resonance survives as an
   amplitude caution: large amplitude can take a spring past its elastic
   limit.

2. **Interlaced Books.** The document attributes the enormous pull-out force
   to paper's coefficient of friction alone. Under their own weight the pages
   could not come close to the measured forces; the mechanism is geometric
   self-amplification, in which interleaving forces the pages to splay at a
   small angle, so the pulling tension itself generates the normal forces that
   scale the friction up (Alarcon et al., Physical Review Letters 116, 015502,
   2016). The drafted record teaches the amplification mechanism.

3. **Rolling Wheels.** "Torque is proportional to distance from the center of
   mass, so it takes more energy to get the wheel to rotate" is a muddled
   account. The correct one: both wheels convert the same potential energy,
   but the hoop's larger moment of inertia puts a larger fraction of that
   energy into rotation, leaving less for translation, so it arrives later.
   Apply this when drafting the stub.

4. **Light-Up Spinning Tennis Racket.** "If it rotated about any other point,
   the center of mass would accelerate, which is not allowed by conservation
   of momentum" is wrong: the center of mass accelerates the entire flight,
   under gravity. The correct claim is that free rotation is about the center
   of mass, and the center of mass follows the projectile trajectory
   regardless of the tumbling. Corrected in the drafted record.

5. **Pendulum Stand.** "Wait long enough, and they will synchronize back
   together" holds only when the pendulum lengths are tuned so the frequencies
   are commensurate (the classic pendulum-wave design). Winding each string
   "slightly longer" than its neighbor does not guarantee a clean rephasing.
   Apply when drafting.

6. **Faraday Cage.** The document's statement of Gauss's law ("the electric
   flux through a surface is proportional to the amount of electric flux
   contained by the surface") garbles charge enclosed into flux. Beyond the
   typo, the electrostatic shielding argument does not by itself explain the
   screening of radio waves, which is the conductor's dynamic response; the
   document's own mesh-size-versus-wavelength paragraph is the good part and
   was kept. Corrected in the drafted record.

7. **Wood Induced Dipole.** The document explains the wood's attraction via
   free charges, framed as "no perfect insulator exists." The standard and
   sufficient mechanism is dielectric polarization of bound charges, the same
   physics that lifts paper scraps to a charged comb. The torque-amplification
   discussion (long lever arm, tiny force, balanced pivot) is excellent and
   was kept. Corrected in the drafted record.

8. **Standing Waves.** Node and antinode definitions were garbled ("antinodes
   (tall ends) and nodes (points in the middle)"), and the wavelength
   condition lost its equation in export. Corrected: nodes are points of zero
   amplitude, antinodes of maximum amplitude, and a string fixed at both ends
   supports wavelengths of 2L/n. "Pitch is proportional to frequency" was
   softened: pitch rises with frequency but is a perception, not a
   proportionality.

9. **Spinning Chair.** "Angular momentum describes the object's tendency to
   revolve around its rotational axis unless acted upon by an external force"
   needs torque, not force, and angular momentum is a conserved quantity, not
   a tendency. Folded into the existing rotating-stool-dumbbells record.

10. **Torque Gun.** "Why galaxies are flat" overreaches; disk galaxies form
    through dissipative collapse, and plenty of rotating systems are not
    flat. The honest transfer case is the equatorial bulge of a spinning
    planet. Apply when drafting.

11. **Jumping Rings.** The document's two "(verify?)" markers on alternating
    current are resolved: the coil runs on mains AC, which is also what keeps
    a held ring levitating (the flux keeps changing even in a static hold).

12. **Euler's Disk.** "The oscillations get faster as it gets closer to the
    mirror, and this is due to conservation of angular momentum" is loose;
    the spin-up of the precession involves energy dissipation with the
    dynamics constrained by angular momentum. Hedge when drafting.

Smaller fixes: "magnetic breaking" reads braking; "Van De Graff" reads Van de
Graaff; the Newton's cradle discussion of partial pressure-wave transmission
was kept, since it is both correct and a nice touch.

---

## Section-by-section disposition

**Drafted this pass (the twelve deepest):** interlaced-books, ballistic-cart,
gravity-in-vacuum, spinning-tennis-racket, driven-spring-resonator,
standing-waves, faraday-cage, wood-induced-dipole, jumping-rings, magnet-drop,
multiplicity-dice, and the merge of "Spinning Chair + Wheel" into the existing
rotating-stool-dumbbells record.

**Stubbed, substantive source text exists (draft these next):** friction-block
(good how-to and tips), falling-duck-shot (full narrative; string currently
detached), newtons-cradle, centripetal-motion-marbles (rewrite the "path 1, 2,
3" reference, which points at a stripped figure; the answer is the tangent),
rolling-wheels (correction 3), pendulum-stand (correction 5),
magnetic-braking-discs, magdeburg-hemispheres, balloon-chamber,
doppler-football, leaf-blower-hovercraft, resonant-water-glasses,
stringed-cups, torque-gun (correction 10), static-repulsion,
induced-current-coil, attracting-currents, cathode-ray-tube,
slit-interference (fourth-floor optics lab, laser, Cornell plate with single
and multiple slit configurations plus a red and green pen laser).

**Stubbed, header-only in the source (need authoring from scratch):**
ballistic-pendulum ("instructions are included in the box"), ball-ramps,
mass-carts, friction-plank, unit-circle, cartesian-coordinate-arrows,
physics-toys (shelf grab bag: Euler's disk, rolling-uphill illusion, slinky,
tops and gyroscopes, UV beads), physics-of-music-demos (PH 20X equipment,
including a Ruben's tube; ask course staff), van-de-graaff-generators,
tesla-gun (lamp broken), tesla-coil (dangerous, staff only),
inductive-jump-ropes, current-generating-cranks, thermal-expansion,
poisson-spot, holograms.

**Stubbed equipment (not demonstrations, included by ruling):**
strong-rare-earth-magnets, large-magnets, large-capacitors, metal-filings,
voltmeters-and-ammeters, wire-rings.

**Not carried into records:**

- The vacuum pump (machine shop, WNGR 208) and bell jar (storeroom, WNGR 204)
  pointer, including the note that water was successfully boiled at room
  temperature. Equipment pointer, lives here until someone drafts a
  boiling-at-room-temperature record.
- The bluetooth-speaker-on-a-rope Doppler variant: the document itself says
  the equipment does not exist yet.
- The general survey findings (Spring 2026 student survey: make the invisible
  visible, predict first, visibility problems in Weniger 151, demo cam
  limits). These belong in an instructor-facing page, not a record; parked
  here until one exists.
- Contact instructions and staff names, per the names-off ruling.

## Open questions carried out of the document

- Where is the vacuum grease for the Magdeburg hemispheres kept? The document
  asks and does not answer.
- Water glasses location is "Shelf F?" with the question mark in the source.
- The document's "demo cam" workflow (which demos fit under it, angles) needs
  its own note once the visibility fix the document alludes to lands.
