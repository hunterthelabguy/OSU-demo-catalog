import { expect, test } from 'vitest';
import type { CollectionEntry } from 'astro:content';
import {
  joinValues,
  sortCourses,
  splitValues,
  subtopicsByCategory,
  timeBuckets,
} from '../src/lib/facets';

test('time buckets carry the spec section 4 boundaries', () => {
  // under 5 / 5 to 15 / over 15: the numbers are the spec's, so they get
  // asserted as the spec wrote them. Degenerate ranges must reproduce the
  // pre-redesign scalar bucketing exactly.
  expect(timeBuckets({ min: 0, max: 0 })).toEqual(['under5']);
  expect(timeBuckets({ min: 4, max: 4 })).toEqual(['under5']);
  expect(timeBuckets({ min: 5, max: 5 })).toEqual(['5to15']);
  expect(timeBuckets({ min: 15, max: 15 })).toEqual(['5to15']);
  expect(timeBuckets({ min: 16, max: 16 })).toEqual(['over15']);
});

test('a demonstration-time range overlaps every bucket it touches', () => {
  expect(timeBuckets({ min: 4, max: 5 })).toEqual(['under5', '5to15']);
  expect(timeBuckets({ min: 5, max: 15 })).toEqual(['5to15']);
  expect(timeBuckets({ min: 15, max: 16 })).toEqual(['5to15', 'over15']);
  expect(timeBuckets({ min: 2, max: 20 })).toEqual(['under5', '5to15', 'over15']);
  // No range means no buckets: the card never matches a time selection,
  // which is the old 'unknown' behavior without a sentinel.
  expect(timeBuckets(undefined)).toEqual([]);
});

test('the calculus-based sequence sorts first, in sequence order', () => {
  expect(sortCourses(['PH423', 'PH213', 'PH211', 'PH212'])).toEqual([
    'PH211',
    'PH212',
    'PH213',
    'PH423',
  ]);
  // Non-sequence courses stay alphabetical among themselves.
  expect(sortCourses(['PH535', 'PH423', 'PH212'])).toEqual(['PH212', 'PH423', 'PH535']);
  expect(sortCourses([])).toEqual([]);
});

// subtopicsByCategory consumes CollectionEntry records; the tests only need
// the data fields it reads, so fixtures are cast the same way the
// filter-logic tests cast theirs.
const demo = (data: {
  category?: string;
  topics: string[];
}): CollectionEntry<'demos'> => ({ data }) as unknown as CollectionEntry<'demos'>;

test('subtopics list under their home category, in vocabulary order', () => {
  const groups = subtopicsByCategory([
    demo({ category: 'optics', topics: ['wave_optics'] }),
    demo({ category: 'mechanics', topics: ['rotation', 'conservation_of_energy'] }),
    demo({ category: 'mechanics', topics: ['rotation', 'friction'] }),
  ]);
  // Categories keep CATEGORIES order (mechanics before optics), and the
  // cross-category subtopic surfaces under its home (energy), not under
  // the record's own category.
  expect(groups.map((g) => g.category)).toEqual(['mechanics', 'energy', 'optics']);
  expect(groups[0]!.subtopics).toEqual(['friction', 'rotation']);
  expect(groups[1]!.subtopics).toEqual(['conservation_of_energy']);
  expect(groups[1]!.hasRecords).toBe(false);
});

test('a category with records but no homed subtopics still renders', () => {
  // The equipment case: records carry subtopics homed elsewhere.
  const groups = subtopicsByCategory([demo({ category: 'equipment', topics: ['magnetism'] })]);
  const equipment = groups.find((g) => g.category === 'equipment');
  expect(equipment).toBeDefined();
  expect(equipment!.subtopics).toEqual([]);
  expect(equipment!.hasRecords).toBe(true);
});

test('card attribute values round-trip through join and split', () => {
  expect(splitValues(joinValues(['a', 'b c', 'd']))).toEqual(['a', 'b c', 'd']);
  expect(splitValues(joinValues([]))).toEqual([]);
  expect(splitValues('')).toEqual([]);
});
