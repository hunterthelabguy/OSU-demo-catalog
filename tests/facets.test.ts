import { expect, test } from 'vitest';
import { joinValues, setupBucket, splitValues } from '../src/lib/facets';

test('setup buckets carry the spec section 4 boundaries', () => {
  // under 5 / 5 to 15 / over 15: the numbers are the spec's, so they get
  // asserted as the spec wrote them.
  expect(setupBucket(0)).toBe('under5');
  expect(setupBucket(4)).toBe('under5');
  expect(setupBucket(5)).toBe('5to15');
  expect(setupBucket(15)).toBe('5to15');
  expect(setupBucket(16)).toBe('over15');
  expect(setupBucket(undefined)).toBe('unknown');
});

test('card attribute values round-trip through join and split', () => {
  expect(splitValues(joinValues(['a', 'b c', 'd']))).toEqual(['a', 'b c', 'd']);
  expect(splitValues(joinValues([]))).toEqual([]);
  expect(splitValues('')).toEqual([]);
});
