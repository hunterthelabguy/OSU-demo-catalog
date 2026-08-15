import { expect, test } from 'vitest';
import type { CardFacets } from '../src/lib/filter-logic';
import {
  activeSelections,
  cardVisible,
  emptyState,
  hiddenStubNote,
  isDefaultHidden,
  matchesFacets,
  parseState,
  serializeState,
} from '../src/lib/filter-logic';

const card = (overrides: Partial<CardFacets> = {}): CardFacets => ({
  slug: 'rotating-stool-dumbbells',
  status: 'verified',
  condition: 'good',
  categories: ['mechanics'],
  topics: ['rotation', 'conservation_of_energy'],
  courses: ['PH211'],
  timeBuckets: ['5to15'],
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
  const state = { ...emptyState(), topics: ['pressure', 'rotation'] };
  expect(cardVisible(card(), state, null)).toBe(true);
  expect(cardVisible(card({ topics: ['wave_optics'] }), state, null)).toBe(false);
});

test('across groups selections are AND', () => {
  const state = { ...emptyState(), topics: ['rotation'], times: ['under5'] };
  // Topic matches, time bucket does not: hidden.
  expect(cardVisible(card(), state, null)).toBe(false);
  expect(cardVisible(card({ timeBuckets: ['under5'] }), state, null)).toBe(true);
});

test('category and topic are independent AND-ed groups', () => {
  // A subtopic homed under Energy still matches a mechanics record carrying
  // it; adding a category selection then narrows by the record's own home.
  const energyTopic = { ...emptyState(), topics: ['conservation_of_energy'] };
  expect(cardVisible(card(), energyTopic, null)).toBe(true);
  const state = { ...emptyState(), categories: ['optics'], topics: ['rotation'] };
  expect(cardVisible(card(), state, null)).toBe(false);
  expect(cardVisible(card(), { ...emptyState(), categories: ['mechanics'] }, null)).toBe(true);
  // A record with no category (none exist in this repo, by invariant) never
  // matches a category selection but is fine otherwise.
  expect(cardVisible(card({ categories: [] }), { ...emptyState(), categories: ['optics'] }, null)).toBe(false);
  expect(cardVisible(card({ categories: [] }), emptyState(), null)).toBe(true);
});

test('a multi-bucket time range matches a selection of any overlapped bucket', () => {
  const spanning = card({ timeBuckets: ['5to15', 'over15'] });
  expect(cardVisible(spanning, { ...emptyState(), times: ['over15'] }, null)).toBe(true);
  expect(cardVisible(spanning, { ...emptyState(), times: ['under5'] }, null)).toBe(false);
});

test('search intersects with facets rather than replacing them', () => {
  const found = new Set(['rotating-stool-dumbbells']);
  expect(cardVisible(card(), emptyState(), found)).toBe(true);
  expect(cardVisible(card({ slug: 'bed-of-nails', status: 'verified' }), emptyState(), found)).toBe(
    false,
  );
  const state = { ...emptyState(), topics: ['wave_optics'] };
  expect(cardVisible(card(), state, found)).toBe(false);
});

test('an untimed record only vanishes when a time filter is active', () => {
  const untimed = card({ timeBuckets: [] });
  expect(cardVisible(untimed, emptyState(), null)).toBe(true);
  expect(cardVisible(untimed, { ...emptyState(), times: ['under5'] }, null)).toBe(false);
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
    categories: ['mechanics'],
    topics: ['rotation'],
    courses: ['PH211', 'PH212'],
    times: ['5to15'],
    rooms: ['needs_dark'],
    hazards: ['laser'],
    showStubs: true,
    showOutOfService: false,
  };
  const query = serializeState(state);
  expect(parseState(query)).toEqual(state);
  // The pre-redesign `setup` param is gone from the contract entirely.
  expect(query).toContain('cat=');
  expect(query).toContain('time=');
  expect(query).not.toContain('setup=');
  expect(parseState('')).toEqual(emptyState());
  expect(serializeState(emptyState())).toBe('');
});

test('activeSelections lists every checked facet in group order, never the query', () => {
  expect(activeSelections(emptyState())).toEqual([]);
  const state = {
    ...emptyState(),
    q: 'induction',
    categories: ['mechanics'],
    topics: ['rotation', 'friction'],
    courses: ['PH211'],
    hazards: ['laser'],
  };
  expect(activeSelections(state)).toEqual([
    { param: 'cat', value: 'mechanics' },
    { param: 'topic', value: 'rotation' },
    { param: 'topic', value: 'friction' },
    { param: 'course', value: 'PH211' },
    { param: 'hazard', value: 'laser' },
  ]);
});

test('hiddenStubNote counts, lists, and caps matching stub titles', () => {
  expect(hiddenStubNote([])).toBe('');
  expect(hiddenStubNote(['Wire Rings'])).toBe('1 stub record also matches: Wire Rings.');
  expect(hiddenStubNote(['Wire Rings', 'Ball Ramps'])).toBe(
    '2 stub records also match: Wire Rings, Ball Ramps.',
  );
  const many = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  expect(hiddenStubNote(many)).toBe(
    '10 stub records also match: A, B, C, D, E, F, G, H, and 2 more.',
  );
});
