// Amendment 21 at 1280x800: one card per row, 160px photo beside prose.
import { expect, test } from '@playwright/test';

test('cards stack one per row at full width', async ({ page }) => {
  await page.goto('/');
  const boxes = await page.locator('.card:not([hidden])').evaluateAll((els) =>
    els.slice(0, 3).map((el) => el.getBoundingClientRect().left),
  );
  expect(new Set(boxes.map(Math.round)).size).toBe(1);
});

test('the photo column is 160px and the summary is visible', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.card:has(.summary)').first();
  const media = card.locator('.thumb, .no-photo').first();
  expect(Math.round((await media.boundingBox())!.width)).toBe(160);
  await expect(card.locator('.summary')).toBeVisible();
});

test('the hazard badge names the hazard and never covers the title', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.card:not([data-hazards=""])').first();
  await expect(card.locator('.hazard-names')).toBeVisible();
  const badge = (await card.locator('.hazard-badge').boundingBox())!;
  const title = (await card.locator('h2').boundingBox())!;
  expect(badge.x >= title.x + title.width || badge.y >= title.y + title.height).toBe(true);
});

// Amendment 21: a desktop stub without a summary shows the muted stub line
// where the summary would be. Stubs are hidden by default, so reveal one.
test('a stub card shows its stub line', async ({ page }) => {
  await page.goto('/');
  const stub = page.locator('.card:has(.stub-line)').first();
  await stub.evaluate((el) => el.removeAttribute('hidden'));
  await expect(stub.locator('.summary')).toHaveCount(0);
  await expect(stub.locator('.stub-line')).toBeVisible();
  await expect(stub.locator('.stub-line')).toHaveText('Stub record: not yet documented.');
});

// Amendment 16: a long summary causes no horizontal overflow. The twelve
// real summaries are on the index; no fixture summary is invented.
test('the index does not scroll horizontally', async ({ page }) => {
  await page.goto('/');
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(fits).toBe(true);
});
