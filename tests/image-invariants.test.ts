// Amendment 17: the unit test proves the tool; this proves the repo. Any
// photo committed around the tool is caught here.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { expect, test } from 'vitest';

const DEMOS = join(__dirname, '..', 'src', 'content', 'demos');
const images = readdirSync(DEMOS).flatMap((slug) =>
  readdirSync(join(DEMOS, slug))
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .map((f) => join(DEMOS, slug, f)),
);

test('the walker sees the demos directory', () => {
  expect(statSync(DEMOS).isDirectory()).toBe(true);
});

test.each(images.length > 0 ? images : ['(no images yet)'])('%s has no metadata and a long edge of 1600 or less', async (path) => {
  if (path === '(no images yet)') return;
  const m = await sharp(path).metadata();
  expect(m.exif, 'EXIF must be stripped').toBeUndefined();
  expect(Math.max(m.width!, m.height!)).toBeLessThanOrEqual(1600);
});
