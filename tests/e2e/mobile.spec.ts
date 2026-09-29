// The mobile contract, asserted at 375x812 against the built site.
//
// Phase 4 claimed "375px with no horizontal overflow" on the strength of
// one manual look, in the same voice as the tested claims around it
// (build-plan amendment 11). This file is what turns that sentence into a
// gate. Every assertion here is either a rule amendment 11 ruled or a
// defect the design survey found in the pre-redesign layout.
import { expect, test, type Locator, type Page } from '@playwright/test';

// Apple's 44px floor, which subsumes WCAG 2.2 Target Size (Minimum).
// Sub-pixel layout means a 2.75rem box can measure 43.99; allow that
// without allowing a genuinely small target.
const TOUCH_FLOOR = 43.5;

const MATH_RECORD = '/demos/rotating-stool-dumbbells/';

const hasHorizontalOverflow = (page: Page): Promise<boolean> =>
  page.evaluate(() => {
    const doc = document.documentElement;
    // Round: fractional layout widths differ by hairlines that no reader
    // can scroll to.
    return Math.round(doc.scrollWidth) > Math.round(doc.clientWidth);
  });

const boxHeight = async (locator: Locator): Promise<number> =>
  (await locator.boundingBox())?.height ?? 0;

test.describe('index at 375px', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('does not scroll horizontally', async ({ page }) => {
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test('opens with the facet panel closed and a result already on screen', async ({ page }) => {
    // The whole point of the disclosure: content before controls.
    await expect(page.locator('#facet-panel')).not.toHaveAttribute('open', /.*/);

    const firstCard = page.locator('.card:not([hidden])').first();
    const box = await firstCard.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(812);
  });

  test('keeps search and the live count visible while scrolling', async ({ page }) => {
    const band = page.locator('.search-band');
    // Starts below the masthead, which is not sticky and scrolls away.
    expect((await band.boundingBox())!.y).toBeGreaterThan(0);

    await page.mouse.wheel(0, 1500);
    await page.waitForFunction(() => window.scrollY > 400);

    // Pinned to the top, with the live count riding along: 54 cards in one
    // column is a long way back to the search box.
    expect((await band.boundingBox())!.y).toBeLessThanOrEqual(1);
    await expect(page.locator('#count')).toBeInViewport();
    await expect(page.locator('#q')).toBeInViewport();
  });

  test('renders the search input at 16px or larger, so iOS does not zoom', async ({ page }) => {
    const fontSize = await page
      .locator('#q')
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  test('gives every facet control at least a 44px hit area', async ({ page }) => {
    await page.locator('.facet-summary').click();
    await expect(page.locator('#facet-panel')).toHaveAttribute('open', /.*/);

    expect(await boxHeight(page.locator('.facet-summary'))).toBeGreaterThanOrEqual(TOUCH_FLOOR);

    const labels = page.locator('.facet-body label');
    const count = await labels.count();
    expect(count).toBeGreaterThan(20);
    for (let i = 0; i < count; i += 1) {
      const label = labels.nth(i);
      if (!(await label.isVisible())) continue;
      expect(
        await boxHeight(label),
        `facet label ${i} ("${(await label.innerText()).trim()}") is under the touch floor`,
      ).toBeGreaterThanOrEqual(TOUCH_FLOOR);
    }

    const courseChips = page.locator('.course-chip span');
    for (let i = 0; i < (await courseChips.count()); i += 1) {
      expect(await boxHeight(courseChips.nth(i))).toBeGreaterThanOrEqual(TOUCH_FLOOR);
    }
  });

  test('tracks the active-filter count in the summary, in both name and text', async ({ page }) => {
    const summary = page.locator('.facet-summary');
    await expect(page.locator('#filter-count')).toBeHidden();

    // Course is pinned outside the panel, and still counts (amendment 13).
    await page.locator('.course-chip input').first().check();
    // Sighted readers get the parenthetical; the accessible name spells
    // out what it abbreviates, and the disclosure role supplies collapsed.
    await expect(page.locator('#filter-count')).toHaveText('(1)');
    await expect(summary).toContainText('Filters (1)');
    expect(await summary.evaluate((el) => el.textContent)).toContain(', 1 selected');

    // Closed, the panel must still say it is filtering.
    await expect(page.locator('#facet-panel')).toHaveClass(/has-active/);
  });

  test('keeps the course rail usable without opening the panel', async ({ page }) => {
    await expect(page.locator('#facet-panel')).not.toHaveAttribute('open', /.*/);
    const chip = page.locator('.course-chip').first();
    await expect(chip).toBeVisible();
    await chip.click();
    await expect(page.locator('.active-chip')).toHaveCount(1);
    await expect(page.locator('#count')).toContainText('of 54 demonstrations');
  });

  test('makes the whole card a link target, named by the title alone', async ({ page }) => {
    const card = page.locator('.card:not([hidden])').first();
    const title = await card.locator('h2 a').innerText();
    expect(await boxHeight(card)).toBeGreaterThanOrEqual(TOUCH_FLOOR);
    // One link per card in the accessibility tree, and it says the title.
    await expect(card.getByRole('link')).toHaveCount(1);
    await expect(card.getByRole('link')).toHaveAccessibleName(title);

    // A tap in the card's dead space still navigates.
    const box = (await card.boundingBox())!;
    await page.mouse.click(box.x + box.width - 12, box.y + box.height - 10);
    await page.waitForURL(/\/demos\/[^/]+\/$/);
  });

  // Amendment 21: the phone badge is the icon alone, with the full names as
  // its accessible label, and it floats, so a hazard never grows the card.
  test('hazard badge is icon only, labelled, and does not change card height', async ({ page }) => {
    const card = page.locator('.card:not([data-hazards=""])').first();
    await expect(card.locator('.hazard-names')).toBeHidden();
    await expect(card.locator('.hazard-badge')).toHaveAccessibleName(/Hazard/);
    expect(await card.locator('.hazard-badge').evaluate((el) => getComputedStyle(el).position)).toBe('absolute');

    const withBadge = await boxHeight(card);
    await card.locator('.hazard-badge').evaluate((el) => {
      (el as HTMLElement).style.display = 'none';
    });
    const withoutBadge = await boxHeight(card);
    await card.locator('.hazard-badge').evaluate((el) => {
      (el as HTMLElement).style.display = '';
    });
    expect(withoutBadge).toBe(withBadge);
  });

  test('compact cards carry location and no status or room chips', async ({ page }) => {
    const card = page.locator('.card:not([hidden])').first();
    await expect(card.locator('.card-footer')).toBeVisible();
    await expect(card.locator('.chip-stamp, .chip-stamp-muted, .chip-neutral')).toHaveCount(0);
    // Amendment 16's compact exclusion: a card that has a summary hides it.
    await expect(page.locator('.card:has(.summary)').first().locator('.summary')).toBeHidden();
  });

  // Amendment 21: a phone stub shows no marker. Stubs are hidden by default,
  // so the check reveals one first.
  test('a stub card shows no stub marker on phone', async ({ page }) => {
    const stub = page.locator('.card:has(.stub-line)').first();
    await stub.evaluate((el) => el.removeAttribute('hidden'));
    await expect(stub.locator('.stub-line')).toHaveCount(1);
    await expect(stub.locator('.stub-line')).toBeHidden();
  });
});

test.describe('demo page at 375px', () => {
  test('does not scroll horizontally, display math included', async ({ page }) => {
    await page.goto(MATH_RECORD);
    await expect(page.locator('.katex-display').first()).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test('scrolls wide display math inside its own box', async ({ page }) => {
    await page.goto(MATH_RECORD);
    const overflowX = await page
      .locator('.katex-display')
      .first()
      .evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflowX).toBe('auto');
  });

  test('gives the masthead print button a 44px hit area', async ({ page }) => {
    await page.goto('/demos/ballistic-cart/');
    const button = page.locator('.print-button');
    await expect(button).toBeVisible();
    expect(await boxHeight(button)).toBeGreaterThanOrEqual(TOUCH_FLOOR);
  });

  test('lays the logistics strip out as label and value rows', async ({ page }) => {
    await page.goto('/demos/ballistic-cart/');
    const display = await page
      .locator('.strip dl')
      .evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('block');
  });
});

test.describe('masthead mark', () => {
  test('shows the light mark on the light scheme, and only that one', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('.logo-light')).toBeVisible();
    await expect(page.locator('.logo-dark')).toBeHidden();
    await expect(page.getByRole('img', { name: 'Oregon State University' })).toHaveCount(1);
  });

  test('swaps to the dark mark on the dark scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/demos/ballistic-cart/');
    await expect(page.locator('.logo-dark')).toBeVisible();
    await expect(page.locator('.logo-light')).toBeHidden();
  });

  test('prints the light mark even from a dark-scheme browser', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', media: 'print' });
    await page.goto('/demos/ballistic-cart/');
    await expect(page.locator('.logo-light')).toBeVisible();
    await expect(page.locator('.logo-dark')).toBeHidden();
  });
});

test.describe('summary block', () => {
  test('sits after the hazard band and before the prediction callout', async ({ page }) => {
    await page.goto('/demos/ballistic-cart/');
    const order = await page.evaluate(() => {
      const pos = (sel: string) =>
        [...document.querySelectorAll('article *')].indexOf(document.querySelector(sel)!);
      return [pos('.hazard-band'), pos('.summary-block'), pos('.prediction')];
    });
    expect(order[0]).toBeLessThan(order[1]);
    expect(order[1]).toBeLessThan(order[2]);
    await expect(page.locator('.summary-block h2')).toHaveText('Summary');
  });

  test('feeds the meta description', async ({ page }) => {
    await page.goto('/demos/ballistic-cart/');
    const meta = await page.locator('meta[name="description"]').getAttribute('content');
    const text = await page.locator('.summary-block p').innerText();
    expect(meta).toBe(text);
  });
});

test.describe('amendment 22', () => {
  test('says once, near search, that locations are provisional', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.location-note')).toHaveCount(1);
    await expect(page.locator('.location-note')).toContainText('provisional');
  });

  test('refuses crawlers in robots.txt and in every page head', async ({ page, request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    const body = await robots.text();
    expect(body).toMatch(/^User-agent:\s*\*\s*\r?\nDisallow:\s*\/\s*$/m);
    expect(body).not.toMatch(/^\s*Allow:/im);
    await page.goto('/demos/ballistic-cart/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });
});
