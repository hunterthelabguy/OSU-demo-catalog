import { expect, test } from 'vitest';
import type { CardFacets } from '../src/lib/filter-logic';
import {
  cardVisible,
  emptyState,
  isDefaultHidden,
  matchesFacets,
  parseState,
  serializeState,
} from '../src/lib/filter-logic';

const card = (overrides: Partial<CardFacets> = {}): CardFacets => ({
  slug: 'rotating-stool-dumbbells',
  status: 'verified',
  condition: 'good',
  topics: ['rotational inertia', 'angular momentum conservation'],
  courses: ['PHYS201'],
  setupBucket: '5to15',
  rooms: [],
  hazards: [],
  ...overrides,
});

test('default state shows a healthy verified record', () => {
  expect(cardVisible(card(), emptyState(), null)).toBe(true);
});

test('stubs and out-of-service records are hidden by default, shown by toggle', () => {
  const stub = card({ status: 'stub' });
  const broken = card({ condition: 'out_of_service' });
  expect(cardVisible(stub, emptyState(), null)).toBe(false);
  expect(cardVisible(broken, emptyState(), null)).toBe(false);
  expect(cardVisible(stub, { ...emptyState(), showStubs: true }, null)).toBe(true);
  expect(cardVisible(broken, { ...emptyState(), showOutOfService: true }, null)).toBe(true);
  // needs_repair is visible by default: it is exactly the record a colleague
  // deciding what to run Tuesday needs to see.
  expect(cardVisible(card({ condition: 'needs_repair' }), emptyState(), null)).toBe(true);
});

test('within a group selections are OR', () => {
  const state = { ...emptyState(), topics: ['pressure', 'rotational inertia'] };
  expect(cardVisible(card(), state, null)).toBe(true);
  expect(cardVisible(card({ topics: ['optics'] }), state, null)).toBe(false);
});

test('across groups selections are AND', () => {
  const state = { ...emptyState(), topics: ['rotational inertia'], setup: ['under5'] };
  // Topic matches, bucket does not: hidden.
  expect(cardVisible(card(), state, null)).toBe(false);
  expect(cardVisible(card({ setupBucket: 'under5' }), state, null)).toBe(true);
});

test('search intersects with facets rather than replacing them', () => {
  const found = new Set(['rotating-stool-dumbbells']);
  expect(cardVisible(card(), emptyState(), found)).toBe(true);
  expect(cardVisible(card({ slug: 'bed-of-nails', status: 'verified' }), emptyState(), found)).toBe(
    false,
  );
  const state = { ...emptyState(), topics: ['optics'] };
  expect(cardVisible(card(), state, found)).toBe(false);
});

test('unknown setup bucket only vanishes when a bucket filter is active', () => {
  const unknown = card({ setupBucket: 'unknown' });
  expect(cardVisible(unknown, emptyState(), null)).toBe(true);
  expect(cardVisible(unknown, { ...emptyState(), setup: ['under5'] }, null)).toBe(false);
});

test('matchesFacets ignores the default-hidden gate, for the empty-state hint', () => {
  const stub = card({ status: 'stub', topics: ['pressure'] });
  const state = { ...emptyState(), topics: ['pressure'] };
  expect(matchesFacets(stub, state, null)).toBe(true);
  expect(isDefaultHidden(stub, state)).toBe(true);
  expect(cardVisible(stub, state, null)).toBe(false);
});

test('filter state round-trips through the URL query string', () => {
  const state = {
    q: 'angular momentum',
    topics: ['rotational inertia'],
    courses: ['PHYS201', 'PHYS211'],
    setup: ['5to15'],
    rooms: ['needs_dark'],
    hazards: ['laser'],
    showStubs: true,
    showOutOfService: false,
  };
  expect(parseState(serializeState(state))).toEqual(state);
  expect(parseState('')).toEqual(emptyState());
  expect(serializeState(emptyState())).toBe('');
});
