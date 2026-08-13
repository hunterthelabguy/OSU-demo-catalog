import { expect, test } from 'vitest';
import { formatDate, formatMinutes, formatMinutesRange, humanize } from '../src/lib/format';

test('vocabulary tokens humanize underscores', () => {
  expect(humanize('needs_ceiling_hook')).toBe('needs ceiling hook');
  expect(humanize('laser')).toBe('laser');
});

test('dates render as YYYY-MM-DD', () => {
  expect(formatDate(new Date('2026-08-01'))).toBe('2026-08-01');
});

test('durations carry their unit', () => {
  expect(formatMinutes(5)).toBe('5 min');
  expect(formatMinutes(0)).toBe('0 min');
});

test('demonstration-time ranges spell out, house style, no dashes', () => {
  expect(formatMinutesRange({ min: 5, max: 15 })).toBe('5 to 15 min');
  expect(formatMinutesRange({ min: 10, max: 10 })).toBe('10 min');
});
