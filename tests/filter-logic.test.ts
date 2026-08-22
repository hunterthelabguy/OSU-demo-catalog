import { expect, test } from 'vitest';
import type { CardFacets, FilterState } from '../src/lib/filter-logic';
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
  ...overrides,
});

const all = (overrides: Partial<FilterState> = {}): FilterState => ({
  ...emptyState(),
  mode: 'all',
  ...overrides,
});

test('default state shows a healthy verified record, matching any', () => {
  expect(emptyState().mode).toBe('any');
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

test('within a group selections are OR in both modes', () => {
  for (const state of [{ ...emptyState(), topics: ['pressure', 'rotation'] }, all({ topics: ['pressure', 'rotation'] })]) {
    expect(cardVisible(card(), state, null)).toBe(true);
    expect(cardVisible(card({ topics: ['wave_optics'] }), state, null)).toBe(false);
  }
});

test('across topical groups, all is AND and any is OR', () => {
  // Topic matches, time bucket does not.
  const selection = { topics: ['rotation'], times: ['under5'] };
  expect(cardVisible(card(), all(selection), null)).toBe(false);
  expect(cardVisible(card({ timeBuckets: ['under5'] }), all(selection), null)).toBe(true);
  expect(cardVisible(card(), { ...emptyState(), ...selection }, null)).toBe(true);
  // Matching neither group hides the card under any as well.
  expect(cardVisible(card({ topics: ['friction'] }), { ...emptyState(), ...selection }, null)).toBe(
    false,
  );
});

test('category and subtopic are independent groups, combined by mode', () => {
  // A subtopic homed under Energy still matches a mechanics record carrying
  // it, in either mode.
  const energyTopic = { topics: ['conservation_of_energy'] };
  expect(cardVisible(card(), { ...emptyState(), ...energyTopic }, null)).toBe(true);
  expect(cardVisible(card(), all(energyTopic), null)).toBe(true);
  // The case the first outside feedback hit: a category plus a subtopic
  // homed elsewhere. Under all it narrows to the record's own home and can
  // legitimately empty; under any both sets show.
  const foreign = { categories: ['optics'], topics: ['rotation'] };
  expect(cardVisible(card(), all(foreign), null)).toBe(false);
  expect(cardVisible(card(), { ...emptyState(), ...foreign }, null)).toBe(true);
  expect(cardVisible(card({ categories: ['optics'], topics: ['wave_optics'] }), { ...emptyState(), ...foreign }, null)).toBe(true);
  expect(cardVisible(card(), { ...emptyState(), categories: ['mechanics'] }, null)).toBe(true);
  // A record with no category (none exist in this repo, by invariant) never
  // matches a category selection but is fine otherwise.
  expect(cardVisible(card({ categories: [] }), { ...emptyState(), categories: ['optics'] }, null)).toBe(false);
  expect(cardVisible(card({ categories: [] }), emptyState(), null)).toBe(true);
});

test('course is scope: it narrows in both modes and never joins the OR', () => {
  const ph213 = { courses: ['PH213'] };
  expect(cardVisible(card(), { ...emptyState(), ...ph213 }, null)).toBe(false);
  expect(cardVisible(card(), all(ph213), null)).toBe(false);
  // A matching topic cannot rescue a record outside the course under any.
  const withTopic = { ...ph213, topics: ['rotation'] };
  expect(cardVisible(card(), { ...emptyState(), ...withTopic }, null)).toBe(false);
  expect(cardVisible(card({ courses: ['PH211', 'PH213'] }), { ...emptyState(), ...withTopic }, null)).toBe(true);
  // Two courses checked is still OR within the course group.
  expect(cardVisible(card(), { ...emptyState(), courses: ['PH211', 'PH213'] }, null)).toBe(true);
});

test('an empty topical band imposes no constraint under any', () => {
  expect(cardVisible(card(), { ...emptyState(), courses: ['PH211'] }, null)).toBe(true);
  expect(cardVisible(card(), { ...emptyState(), showStubs: true }, null)).toBe(true);
});

test('a multi-bucket time range matches a selection of any overlapped bucket', () => {
  const spanning = card({ timeBuckets: ['5to15', 'over15'] });
  expect(cardVisible(spanning, { ...emptyState(), times: ['over15'] }, null)).toBe(true);
  expect(cardVisible(spanning, { ...emptyState(), times: ['under5'] }, null)).toBe(false);
});

test('search intersects with facets in both modes rather than replacing them', () => {
  const found = new Set(['rotating-stool-dumbbells']);
  expect(cardVisible(card(), emptyState(), found)).toBe(true);
  expect(cardVisible(card({ slug: 'bed-of-nails', status: 'verified' }), emptyState(), found)).toBe(
    false,
  );
  const miss = { topics: ['wave_optics'] };
  expect(cardVisible(card(), all(miss), found)).toBe(false);
  expect(cardVisible(card(), { ...emptyState(), ...miss }, found)).toBe(false);
  // A facet hit cannot rescue a record the search did not find.
  expect(cardVisible(card({ slug: 'bed-of-nails' }), { ...emptyState(), topics: ['rotation'] }, found)).toBe(false);
});

test('an untimed record only vanishes when a time filter is active', () => {
  const untimed = card({ timeBuckets: [] });
  expect(cardVisible(untimed, emptyState(), null)).toBe(true);
  expect(cardVisible(untimed, { ...emptyState(), times: ['under5'] }, null)).toBe(false);
  expect(cardVisible(untimed, all({ times: ['under5'] }), null)).toBe(false);
});

test('matchesFacets ignores the default-hidden gate, for the empty-state hint', () => {
  const stub = card({ status: 'stub', topics: ['pressure'] });
  const state = { ...emptyState(), topics: ['pressure'] };
  expect(matchesFacets(stub, state, null)).toBe(true);
  expect(isDefaultHidden(stub, state)).toBe(true);
  expect(cardVisible(stub, state, null)).toBe(false);
});

test('filter state round-trips through the URL query string', () => {
  const state: FilterState = {
    q: 'angular momentum',
    mode: 'all',
    categories: ['mechanics'],
    topics: ['rotation'],
    courses: ['PH211', 'PH212'],
    times: ['5to15'],
    rooms: ['needs_dark'],
    showStubs: true,
    showOutOfService: false,
  };
  const query = serializeState(state);
  expect(parseState(query)).toEqual(state);
  expect(query).toContain('match=all');
  expect(query).toContain('cat=');
  expect(query).toContain('time=');
  // The pre-redesign `setup` param and the hazard facet are gone from the
  // contract entirely; an old hazard link simply stops narrowing.
  expect(query).not.toContain('setup=');
  expect(parseState('?hazard=laser')).toEqual(emptyState());
  // The default mode leaves the URL clean, and anything but `all` is any.
  expect(serializeState({ ...state, mode: 'any' })).not.toContain('match=');
  expect(parseState('?match=any').mode).toBe('any');
  expect(parseState('?match=nonsense').mode).toBe('any');
  expect(parseState('')).toEqual(emptyState());
  expect(serializeState(emptyState())).toBe('');
});

test('activeSelections lists every checked facet in group order, never the query or mode', () => {
  expect(activeSelections(emptyState())).toEqual([]);
  expect(activeSelections(all())).toEqual([]);
  const state = {
    ...emptyState(),
    q: 'induction',
    mode: 'all' as const,
    categories: ['mechanics'],
    topics: ['rotation', 'friction'],
    courses: ['PH211'],
    rooms: ['needs_dark'],
  };
  expect(activeSelections(state)).toEqual([
    { param: 'cat', value: 'mechanics' },
    { param: 'topic', value: 'rotation' },
    { param: 'topic', value: 'friction' },
    { param: 'course', value: 'PH211' },
    { param: 'room', value: 'needs_dark' },
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
