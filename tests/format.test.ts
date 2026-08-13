import { expect, test } from 'vitest';
import { formatDate, formatMinutes, humanize } from '../src/lib/format';

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
