import { z } from 'astro/zod';

// Single source of truth for the demo record shape, transcribed from
// docs/spec-v0.1.md section 3. Lives here rather than inside
// src/content.config.ts so that vitest can import it: the config file pulls
// from 'astro:content', a virtual module that only resolves inside Astro's
// build, while this module depends on nothing virtual.
//
// The controlled vocabularies are exported as consts because phase 4's facet
// UI renders chips from these exact lists. One list, two consumers.

export const DEMO_STATUSES = ['stub', 'drafted', 'verified'] as const;
export const CONDITIONS = ['good', 'needs_repair', 'out_of_service'] as const;
export const SETUP_DIFFICULTIES = ['easy', 'moderate', 'involved'] as const;

export const ROOM_REQUIREMENTS = [
  'needs_dark',
  'needs_water',
  'needs_ceiling_hook',
  'needs_compressed_air',
  'high_ceiling',
  'no_stairs',
  'needs_120v_outlet',
  'needs_projector',
] as const;

// Classification vocabulary, adapted from the comPADRE faceted schema
// (compadre.org, The Physics Front) and the Physics and Equity portal
// (physicsandequity.org), which builds on the comPADRE vocabulary. Ruled
// 2026-08-13 (build-plan amendment 10): the Physics and Equity seven top
// levels with four deviations (oscillations subarea added, fluids standalone,
// optics split from waves, measurement added), plain "Energy" naming, and a
// local `equipment` extension neither portal has. Enum order is render
// order; do not sort it.
export const CATEGORIES = [
  'measurement',
  'mechanics',
  'fluids',
  'energy',
  'waves',
  'thermodynamics',
  'electricity_and_magnetism',
  'optics',
  'modern_physics',
  'astronomy',
  'equipment',
] as const;
export type Category = (typeof CATEGORIES)[number];

// Subtopics are the second classification level. Each has one home category,
// which is where the browse UI lists it; records may carry subtopics homed
// in other categories (a rotation demo can carry conservation_of_energy).
// A subtopic no record carries simply does not render, so the list is
// seeded generously. Specificity beyond this vocabulary belongs in `tags`.
export const SUBTOPICS = {
  // measurement
  units_and_measurement: { category: 'measurement' },
  estimation: { category: 'measurement' },
  mathematical_tools: { category: 'measurement' },
  // mechanics
  kinematics: { category: 'mechanics' },
  forces: { category: 'mechanics' },
  friction: { category: 'mechanics' },
  momentum: { category: 'mechanics' },
  rotation: { category: 'mechanics' },
  gravity_and_orbits: { category: 'mechanics' },
  // fluids
  pressure: { category: 'fluids' },
  buoyancy: { category: 'fluids' },
  fluid_dynamics: { category: 'fluids' },
  // energy
  conservation_of_energy: { category: 'energy' },
  energy_transfer: { category: 'energy' },
  energy_forms: { category: 'energy' },
  energy_transformation: { category: 'energy' },
  energy_generation: { category: 'energy' },
  // waves
  oscillations: { category: 'waves' },
  wave_properties: { category: 'waves' },
  standing_waves_and_resonance: { category: 'waves' },
  sound: { category: 'waves' },
  // thermodynamics
  thermal_properties_of_matter: { category: 'thermodynamics' },
  heat_and_energy_transfer: { category: 'thermodynamics' },
  ideal_gas: { category: 'thermodynamics' },
  heat_engines: { category: 'thermodynamics' },
  entropy_and_statistical_mechanics: { category: 'thermodynamics' },
  // electricity and magnetism
  electrostatics: { category: 'electricity_and_magnetism' },
  circuits: { category: 'electricity_and_magnetism' },
  magnetism: { category: 'electricity_and_magnetism' },
  electromagnetism: { category: 'electricity_and_magnetism' },
  electromagnetic_induction: { category: 'electricity_and_magnetism' },
  // optics
  ray_optics: { category: 'optics' },
  wave_optics: { category: 'optics' },
  color_and_spectrum: { category: 'optics' },
  // modern physics
  quantum_phenomena: { category: 'modern_physics' },
  relativity: { category: 'modern_physics' },
  // astronomy
  solar_system: { category: 'astronomy' },
  stars: { category: 'astronomy' },
  galaxies: { category: 'astronomy' },
  cosmology: { category: 'astronomy' },
  // equipment homes no subtopics of its own: equipment records carry
  // subtopics from the categories their contents serve.
} as const satisfies Record<string, { category: Category }>;

export type Subtopic = keyof typeof SUBTOPICS;
export const SUBTOPIC_KEYS = Object.keys(SUBTOPICS) as [Subtopic, ...Subtopic[]];

// Accessibility levels, per sense. `with_support` means the demonstration
// works for the student given an accommodation the record describes in
// accessibility.notes (a verbal description, a tactile pass before class).
// Promoted from free-text notes in the 2026-08 extraction pass: the source
// document carried this guidance on more than three records, which is the
// threshold the notes promotion rule sets.
export const ACCESS_LEVELS = ['accessible', 'with_support', 'inaccessible'] as const;

export const HAZARDS = [
  'high_voltage',
  'cryogen',
  'laser',
  'projectile',
  'open_flame',
  'pressurized',
  'heavy_lift',
] as const;

// Fixed body heading order (spec section 3). Headings may be omitted, never
// reordered, and no H2 outside this list is allowed: anything that does not
// fit belongs in `notes` until the promotion rule gives it a home.
export const BODY_HEADINGS = [
  'Physics',
  'Setup',
  'Procedure',
  'Quirks and caveats',
  'Pedagogical notes',
  'References',
] as const;

// Kebab-case, URL-safe, and the durable identifier a future request system
// stores verbatim. Never renamed once published.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// PIRA DCS codes look like 1Q40.10. An optional trailing lowercase letter
// admits local sub-variants without opening the field to free text.
const PIRA_PATTERN = /^\d[A-Z]\d{2}\.\d{2}[a-z]?$/;

const maintenanceEntry = z
  .object({
    date: z.coerce.date(),
    note: z.string().min(1),
  })
  .strict();

/**
 * Builds the frontmatter schema. The `image` parameter is Astro's image()
 * helper when called from src/content.config.ts, which validates that the
 * path resolves to a real file and imports it through the asset pipeline.
 * Tests pass a plain string schema instead, because image() only exists
 * inside Astro's runtime. Generic so the real call site keeps ImageMetadata
 * typing in the generated collection types.
 *
 * The top-level object is strict: an unknown key is a build failure, not a
 * silently ignored typo. `hazard:` instead of `hazards:` must not produce a
 * record that quietly claims to be hazard-free.
 */
export const buildDemoSchema = <ImageSchema extends z.ZodTypeAny>(
  image: () => ImageSchema,
) =>
  z
    .object({
      // --- identity ---
      title: z.string().min(1),
      slug: z
        .string()
        .regex(
          SLUG_PATTERN,
          'slug must be kebab-case: lowercase letters, digits, single hyphens',
        ),
      status: z.enum(DEMO_STATUSES),
      condition: z.enum(CONDITIONS).optional(),

      // --- classification ---
      pira_dcs: z
        .string()
        .regex(PIRA_PATTERN, 'PIRA DCS codes look like 1Q40.10')
        .nullable()
        .optional(),
      pira_verified: z.boolean().default(false),
      // Optional at schema level so the minimal-stub contract holds; a
      // content-invariants test requires it on every record in this repo.
      category: z.enum(CATEGORIES).optional(),
      // Closed vocabulary since the 2026-08-13 facet redesign; free-text
      // specificity lives in `tags`.
      topics: z.array(z.enum(SUBTOPIC_KEYS)).min(1),
      // Free-text tags: rendered and searchable, never a facet.
      tags: z.array(z.string().min(1)).default([]),
      course_tags: z.array(z.string().min(1)).default([]),
      typical_units: z.array(z.string().min(1)).default([]),

      // --- logistics ---
      // Demonstration time: what the demo takes in class, the instructor-
      // facing number and the only filterable time. A range because run time
      // depends on how much discussion the instructor builds in.
      demo_minutes: z
        .object({
          min: z.number().int().nonnegative(),
          max: z.number().int().nonnegative(),
        })
        .strict()
        .refine((r) => r.min <= r.max, {
          message: 'demo_minutes: min must be <= max',
        })
        .optional(),
      // Prep descriptors: kept on the record and the page, deliberately not
      // filterable. Instructors choose by demonstration time; prep is staff-
      // supported (feedback ruling, 2026-08-13).
      setup_minutes: z.number().int().nonnegative().optional(),
      teardown_minutes: z.number().int().nonnegative().optional(),
      setup_difficulty: z.enum(SETUP_DIFFICULTIES).optional(),
      transportable: z.boolean().optional(),
      quantity: z.number().int().positive().optional(),
      location: z
        .object({
          room: z.string().min(1).optional(),
          shelf: z.string().min(1).optional(),
        })
        .strict()
        .optional(),
      room_requirements: z.array(z.enum(ROOM_REQUIREMENTS)).default([]),
      hazards: z.array(z.enum(HAZARDS)).default([]),
      consumables: z.array(z.string().min(1)).default([]),

      // --- pedagogy ---
      prediction_prompt: z.string().min(1).optional(),
      target_misconceptions: z.array(z.string().min(1)).default([]),

      // --- accessibility ---
      // Per-sense levels answer "can every student in the room experience
      // this"; notes carry the accommodation itself. All optional: absence
      // means nobody has assessed it yet, which is different from a claim.
      accessibility: z
        .object({
          hearing: z.enum(ACCESS_LEVELS).optional(),
          vision: z.enum(ACCESS_LEVELS).optional(),
          notes: z.string().min(1).optional(),
        })
        .strict()
        .optional(),

      // --- media ---
      images: z
        .array(
          z
            .object({
              src: image(),
              // Required per image, spec section 3: the one field that makes
              // retrofitting accessibility unnecessary later.
              alt: z.string().min(1, 'every image requires non-empty alt text'),
              caption: z.string().min(1).optional(),
            })
            .strict(),
        )
        .default([]),

      // --- curator notes ---
      notes: z.string().optional(),
      maintenance_log: z.array(maintenanceEntry).default([]),

      // --- provenance ---
      last_verified: z.coerce.date().optional(),
      last_updated: z.coerce.date().optional(),
    })
    .strict()
    .refine(
      (d) =>
        !d.pira_verified ||
        (typeof d.pira_dcs === 'string' && d.pira_dcs.length > 0),
      {
        message:
          'pira_verified: true requires a pira_dcs code; the flag means a human checked that code against the list',
        path: ['pira_verified'],
      },
    )
    .refine(
      (d) => {
        const times = d.maintenance_log.map((e) => e.date.getTime());
        return times.every((t, i) => i === 0 || t >= times[i - 1]!);
      },
      {
        message: 'maintenance_log is append-only: entries in date order, newest last',
        path: ['maintenance_log'],
      },
    );
