import { expect, test } from 'vitest';
import { z } from 'astro/zod';
import { buildDemoSchema } from '../src/lib/demo-schema';

// Unit tests for the frontmatter schema: each one pins a claim the spec makes
// about what the build accepts and rejects. Astro's image() helper only
// exists inside the Astro runtime, so these tests substitute a plain string
// schema; the real path resolution is exercised by `astro build`.

const schema = buildDemoSchema(() => z.string().min(1));

// A maximal valid record, spec section 3's worked example in object form.
const validRecord = {
  title: 'Rotating Stool and Dumbbells',
  slug: 'rotating-stool-dumbbells',
  status: 'verified',
  condition: 'good',
  pira_dcs: '1Q40.10',
  pira_verified: false,
  category: 'mechanics',
  topics: ['rotation', 'conservation_of_energy'],
  tags: ['rotational inertia', 'angular momentum'],
  course_tags: ['PH211'],
  typical_units: ['rotation'],
  demo_minutes: { min: 5, max: 10 },
  setup_minutes: 5,
  teardown_minutes: 5,
  setup_difficulty: 'easy',
  transportable: true,
  quantity: 1,
  location: { room: 'Stockroom B', shelf: 'R3-04' },
  room_requirements: ['needs_dark'],
  hazards: ['projectile'],
  consumables: ['liquid nitrogen, ~2 L'],
  prediction_prompt: 'What happens to her rate of spin, and why?',
  target_misconceptions: ['Angular momentum and angular velocity are interchangeable.'],
  accessibility: {
    hearing: 'accessible',
    vision: 'with_support',
    notes: 'Narrate the spin rate change; let the student feel the stool bearing before class.',
  },
  images: [{ src: './stool-01.jpg', alt: 'Stool with dumbbells resting on the seat.' }],
  notes: 'staging area',
  maintenance_log: [
    { date: '2025-03-14', note: 'Bearing regreased.' },
    { date: '2026-08-01', note: 'Spins freely.' },
  ],
  last_verified: '2026-08-01',
  last_updated: '2026-08-12',
};

const parses = (record: unknown): boolean => schema.safeParse(record).success;

const withChanges = (changes: Record<string, unknown>): Record<string, unknown> => ({
  ...validRecord,
  ...changes,
});

test('the maximal record and the minimal stub both validate', () => {
  expect(parses(validRecord)).toBe(true);
  // A stub is required fields only: this is what "optional so a stub still
  // builds" means, and it must never regress. Note `category` is optional
  // at schema level; the repo-wide requirement is a content invariant.
  expect(
    parses({ title: 'Bed of Nails', slug: 'bed-of-nails', status: 'stub', topics: ['pressure'] }),
  ).toBe(true);
});

test('defaults fill the facet-bearing arrays so the UI never branches on undefined', () => {
  const parsed = schema.parse({
    title: 'Bed of Nails',
    slug: 'bed-of-nails',
    status: 'stub',
    topics: ['pressure'],
  });
  expect(parsed.hazards).toEqual([]);
  expect(parsed.room_requirements).toEqual([]);
  expect(parsed.images).toEqual([]);
  expect(parsed.maintenance_log).toEqual([]);
  expect(parsed.pira_verified).toBe(false);
});

test('each required field is actually required', () => {
  expect(parses(withChanges({ title: undefined }))).toBe(false);
  expect(parses(withChanges({ slug: undefined }))).toBe(false);
  expect(parses(withChanges({ status: undefined }))).toBe(false);
  expect(parses(withChanges({ topics: undefined }))).toBe(false);
  expect(parses(withChanges({ topics: [] }))).toBe(false);
});

test('unknown keys are a failure, not a silently dropped typo', () => {
  // hazard: instead of hazards: must not produce a record that quietly
  // claims to be hazard-free.
  expect(parses(withChanges({ hazard: ['laser'] }))).toBe(false);
  expect(parses(withChanges({ setup_minute: 5 }))).toBe(false);
});

test('controlled vocabularies are closed', () => {
  expect(parses(withChanges({ status: 'complete' }))).toBe(false);
  expect(parses(withChanges({ condition: 'broken' }))).toBe(false);
  expect(parses(withChanges({ hazards: ['sharp'] }))).toBe(false);
  expect(parses(withChanges({ room_requirements: ['room_214'] }))).toBe(false);
  expect(parses(withChanges({ setup_difficulty: 'hard' }))).toBe(false);
  // Since the comPADRE alignment, category and topics are closed too;
  // free-text specificity belongs in tags.
  expect(parses(withChanges({ category: 'astrology' }))).toBe(false);
  expect(parses(withChanges({ topics: ['rotational inertia'] }))).toBe(false);
});

test('demonstration time is a validated range', () => {
  expect(parses(withChanges({ demo_minutes: { min: 10, max: 5 } }))).toBe(false);
  expect(parses(withChanges({ demo_minutes: { min: 2.5, max: 5 } }))).toBe(false);
  expect(parses(withChanges({ demo_minutes: { min: -1, max: 5 } }))).toBe(false);
  // A typo key inside the range must fail, same as top level.
  expect(parses(withChanges({ demo_minutes: { min: 5, max: 10, typical: 7 } }))).toBe(false);
  expect(parses(withChanges({ demo_minutes: { min: 5, max: 5 } }))).toBe(true);
  expect(parses(withChanges({ demo_minutes: undefined }))).toBe(true);
});

test('slugs are kebab-case and URL-safe', () => {
  expect(parses(withChanges({ slug: 'Rotating-Stool' }))).toBe(false);
  expect(parses(withChanges({ slug: 'rotating stool' }))).toBe(false);
  expect(parses(withChanges({ slug: 'rotating--stool' }))).toBe(false);
  expect(parses(withChanges({ slug: 'stool/dumbbells' }))).toBe(false);
});

test('every image requires non-empty alt text', () => {
  expect(parses(withChanges({ images: [{ src: './a.jpg', alt: '' }] }))).toBe(false);
  expect(parses(withChanges({ images: [{ src: './a.jpg' }] }))).toBe(false);
});

test('pira_verified: true without a code is a contradiction and fails', () => {
  expect(parses(withChanges({ pira_verified: true, pira_dcs: null }))).toBe(false);
  expect(parses(withChanges({ pira_verified: true, pira_dcs: undefined }))).toBe(false);
  expect(parses(withChanges({ pira_verified: true, pira_dcs: '1Q40.10' }))).toBe(true);
});

test('pira codes must look like PIRA codes', () => {
  expect(parses(withChanges({ pira_dcs: 'rotation-1' }))).toBe(false);
  expect(parses(withChanges({ pira_dcs: '1q40.10' }))).toBe(false);
  expect(parses(withChanges({ pira_dcs: '1Q40.10a' }))).toBe(true);
  expect(parses(withChanges({ pira_dcs: null }))).toBe(true);
});

test('maintenance_log must be in date order, newest last', () => {
  expect(
    parses(
      withChanges({
        maintenance_log: [
          { date: '2026-08-01', note: 'newer first' },
          { date: '2025-03-14', note: 'older last' },
        ],
      }),
    ),
  ).toBe(false);
  // Same-day entries are legitimate.
  expect(
    parses(
      withChanges({
        maintenance_log: [
          { date: '2026-08-01', note: 'morning' },
          { date: '2026-08-01', note: 'afternoon' },
        ],
      }),
    ),
  ).toBe(true);
});

test('accessibility levels are a closed vocabulary and the object rejects typos', () => {
  // Absence is fine: it means unassessed, not a claim of accessibility.
  expect(parses(withChanges({ accessibility: undefined }))).toBe(true);
  expect(parses(withChanges({ accessibility: { hearing: 'accessible' } }))).toBe(true);
  expect(parses(withChanges({ accessibility: { vision: 'sort of' } }))).toBe(false);
  // vision: instead of visions: style typos must fail, same as hazards.
  expect(parses(withChanges({ accessibility: { visions: 'accessible' } }))).toBe(false);
  expect(parses(withChanges({ accessibility: { notes: '' } }))).toBe(false);
});

test('minutes and quantity reject nonsense', () => {
  expect(parses(withChanges({ setup_minutes: -5 }))).toBe(false);
  expect(parses(withChanges({ setup_minutes: 2.5 }))).toBe(false);
  expect(parses(withChanges({ quantity: 0 }))).toBe(false);
});
