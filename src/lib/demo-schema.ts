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
      topics: z.array(z.string().min(1)).min(1),
      course_tags: z.array(z.string().min(1)).default([]),
      typical_units: z.array(z.string().min(1)).default([]),

      // --- logistics ---
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
