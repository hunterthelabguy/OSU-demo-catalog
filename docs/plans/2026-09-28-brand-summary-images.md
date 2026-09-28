# Brand, Summary, Row Cards, and Legacy Images: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship amendments 16, 17, 18, and 21 as three PRs in order: the strict OSU brand pass (Part A), the Summary field plus row cards plus the photo ingest tool (Part B), and the legacy image batch plus the tennis racket redraft (Part C).

**Architecture:** Static Astro 7 site. All colors and fonts live in `src/styles/theme.css`, asserted by vitest; the card is one component (`src/components/DemoCard.astro`) rendered by `src/pages/index.astro`; records are Markdown under `src/content/demos/<slug>/index.md`, validated by `src/lib/demo-schema.ts`. The ingest tool is a Node ES module using `sharp`. Layout contracts are asserted by Playwright against the built site.

**Tech Stack:** Astro 7.2, TypeScript strict, vitest 4, Playwright 1.62, sharp 0.35, Pagefind 1.5.

**Spec:** the ledger, `docs/build-plan.md`, amendments 16 (Summary), 17 (ingest tool and legacy batch), 18 (strict palette and the mark), 21 (row cards), 22 (verified split from the physical check, provisional locations, crawlers refused). Read all five before starting any part. Amendment 20 (discovery by topic first) is the why behind 16 and 21. `VISION.md` and `STATE.md` give the destination and the queue.

## Global Constraints

- Every change lands via PR with green `verify`; branch from current `origin/main`. Follow CLAUDE.md "Shipping" exactly, including its three failure modes.
- Commits authored `hunterthelabguy` with the noreply email (check `git config user.name` and `user.email` before the first commit). **No Co-Authored-By trailer.** Commit subjects 72 characters or fewer, house form (imperative, no type prefix), the story in the body.
- **No em dashes anywhere.** Before every commit: `git diff --cached | grep -c $'\xe2\x80\x94'` must print `0`.
- **No invented record data**: no fabricated locations, dates, codes, or history. Summaries and alt text are drafts the owner reviews before merge; say so in the PR body.
- Windows e2e: `npm run build`, then `npx astro preview --background --host`, then `npm run test:e2e`, then `npx astro preview stop`. CI (ubuntu) runs `npm run verify` unaided.
- Only palette values from `C:\Users\reavesh\src\OSU-branding\OSU-style-guide.md` may appear as colors (amendment 18). Copy from the brand kit only the two logo files amendment 18 names.
- The legacy export is at `C:\Users\reavesh\src\Old Reference Material\Legacy Demo Catalog\Physics Demo Library\` and stays there. Never copy it into the repo wholesale.
- Parts ship in order A, B, C. Do not stack a branch on an unmerged branch (CLAUDE.md explains why CI then never fires).

---

# Part A: brand pass (amendment 18)

Branch: `claude/brand-pass` from `origin/main`.

**Token outcome.** `theme.css` ends with six color tokens, each a palette value:

| Token | Light | Dark | Print | Role |
|---|---|---|---|---|
| `--paper` | `#FFFFFF` | `#000000` | `#FFFFFF` | page, card, panel, input ground |
| `--ink` | `#000000` | `#FFFFFF` | `#000000` | all reading text, including former accent text |
| `--muted` | `#7A6855` (High Desert) | `#B7A99A` (Till) | `#7A6855` | secondary text |
| `--rule` | `#8E9089` (Crater) | `#A7ACA2` (Coastline) | `#8E9089` | 1 px rules and borders |
| `--accent` | `#D73F09` | `#D73F09` | `#D73F09` | fills, borders, focus rings, large text |
| `--on-accent` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | bold text on an accent fill |

`--surface`, `--panel`, `--panel-2`, `--accent-text`, and `--accent-tint` are deleted.

### Task A1: palette test, then the new tokens

**Files:**
- Create: `tests/brand-palette.test.ts`
- Modify: `src/styles/theme.css` (whole token section and header comment)
- Modify: `tests/theme-contrast.test.ts` (the `PAIRS` list only)

**Interfaces:**
- Produces: the six tokens above; every later task uses only these names.

- [ ] **Step 1: Write the failing palette test**

```ts
// tests/brand-palette.test.ts
// Amendment 18: every color the site renders is a listed OSU palette
// value, black and white included. This test holds that line one token
// and one template at a time, beside the contrast test.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Copied from OSU-style-guide.md (owner's brand kit, 2026-09-19). Electric
// Beav is print-only with no values supplied, so it is absent by design.
const PALETTE = new Set(
  [
    '#D73F09', '#000000', '#FFFFFF', // Beaver Orange, Paddletail Black, Bucktooth White
    '#4A773C', '#00859B', '#FFB500', '#006A8E', '#C4D6A4', '#B8DDE1',
    '#FDD26E', '#C6DAE7', '#AA9D2E', '#0D5257', '#D3832B', '#003B5C',
    '#B7A99A', '#A7ACA2', '#7A6855', '#8E9089',
  ].map((h) => h.toUpperCase()),
);

const normalize = (hex: string): string => {
  const h = hex.toUpperCase();
  return h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
};

const root = fileURLToPath(new URL('..', import.meta.url));
const hexes = (text: string): string[] =>
  [...text.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)].map((m) => normalize(m[0]));

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

describe('OSU palette', () => {
  it('theme.css uses only palette values', () => {
    const css = readFileSync(join(root, 'src/styles/theme.css'), 'utf8');
    const found = hexes(css);
    expect(found.length).toBeGreaterThan(0);
    for (const hex of found) expect(PALETTE.has(hex), `${hex} is not an OSU palette value`).toBe(true);
  });

  it('no template or stylesheet hardcodes a non-palette color', () => {
    const files = walk(join(root, 'src')).filter((f) => /\.(astro|css|ts)$/.test(f));
    for (const file of files) {
      for (const hex of hexes(readFileSync(file, 'utf8'))) {
        expect(PALETTE.has(hex), `${hex} in ${file} is not an OSU palette value`).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run tests/brand-palette.test.ts`
Expected: FAIL, first message like `#F7F4EE is not an OSU palette value`.

- [ ] **Step 3: Replace the token blocks in `src/styles/theme.css`**

Keep the two `@import` lines and the KaTeX comment. Replace the three `:root` blocks with:

```css
:root {
  color-scheme: light dark;

  --paper: #ffffff;
  --ink: #000000;
  --muted: #7a6855;
  --rule: #8e9089;
  --accent: #d73f09;
  --on-accent: #ffffff;

  --font-display: 'Atkinson Hyperlegible Next Variable', 'Helvetica Neue',
    Arial, sans-serif;
  --font-body: 'Atkinson Hyperlegible Next Variable', 'Helvetica Neue', Arial,
    sans-serif;
  --font-mono: 'Atkinson Hyperlegible Mono Variable', ui-monospace,
    'Cascadia Mono', Consolas, monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #000000;
    --ink: #ffffff;
    --muted: #b7a99a;
    --rule: #a7aca2;
    --accent: #d73f09;
    --on-accent: #ffffff;
  }
}

@media print {
  :root {
    --paper: #ffffff;
    --ink: #000000;
    --muted: #7a6855;
    --rule: #8e9089;
    --accent: #d73f09;
    --on-accent: #ffffff;
  }
}
```

Rewrite the header comment's accent and neutrals paragraphs to say: the palette is strict by amendment 18 (listed OSU values only, `tests/brand-palette.test.ts` enforces it); Beaver Orange is for fills, borders, focus rings, and large text, never small text (4.56:1 on white); all reading text is `--ink`; `--muted` is High Desert on white and Till on black; `--rule` is Crater and Coastline, decorative so exempt from text contrast; `--on-accent` is always bold on an accent fill. Keep the "THE RE-RULE FILE" opening and the print paragraph.

- [ ] **Step 4: Replace `PAIRS` in `tests/theme-contrast.test.ts`**

```ts
const PAIRS: [fg: string, bg: string, where: string][] = [
  ['ink', 'paper', 'all reading text on the page, cards, panels, inputs'],
  ['muted', 'paper', 'secondary text'],
  ['on-accent', 'accent', 'hazard band, hazard badge, alert chip, checked course chip (bold)'],
  ['paper', 'ink', 'inverted status chip'],
];
```

- [ ] **Step 5: Run both tests; the contrast test passes, the palette test still fails on templates**

Run: `npx vitest run tests/brand-palette.test.ts tests/theme-contrast.test.ts`
Expected: contrast PASS (on-accent on accent is 4.56:1). Palette test: theme.css PASS; the template test may pass already (the only template hex is `#000` at `src/pages/demos/[slug].astro:694`, which is Paddletail Black). Either way continue to Task A2; `astro check` will fail until the deleted tokens are gone from templates.

- [ ] **Step 6: Commit**

```bash
git add tests/brand-palette.test.ts tests/theme-contrast.test.ts src/styles/theme.css
git commit -m "Hold the theme to the OSU palette, strictly"
```

### Task A2: retire the deleted tokens from every template

**Files:**
- Modify: `src/components/Chip.astro:45-60`
- Modify: `src/components/DemoCard.astro` (`.card` 122, `.photo` stripes 140-141, stamp 172, `.hazard-band` 181-192)
- Modify: `src/layouts/Base.astro:131` (focus ring)
- Modify: `src/pages/demos/[slug].astro` (326, 353-362, 392, 404, 444, 488, 541-542)
- Modify: `src/pages/index.astro` (568, 620, 671, 724, 805-813, 848, 856, 866, 959, 965)

**Interfaces:**
- Consumes: the six tokens from Task A1.

Mapping rule, applied at each line listed above (find them with `grep -rn -E "var\(--(accent-text|accent-tint|panel-2|surface|panel)\)" src`):

| Old usage | New |
|---|---|
| `--accent-text` as a text `color` | `var(--ink)` |
| `--accent-text` as `border`, `outline`, `accent-color`, `border-color` | `var(--accent)` |
| `--accent-text` as a `background` fill (course chip checked, card status stamp) | course chip: `background: var(--accent); color: var(--on-accent); font-weight: 700`; status stamp: `background: var(--ink); color: var(--paper)` |
| `--accent-tint` background (hazard band on card and detail page, `.chip-alert`) | `background: var(--accent); color: var(--on-accent); font-weight: 700`, border `var(--accent)` |
| `--panel`, `--surface` backgrounds | `var(--paper)` |
| `--panel-2` (active filter chip ground) | `background: var(--paper); border: 1px solid var(--accent)` |
| Striped placeholders (`repeating-linear-gradient(... --panel-2 ... --surface ...)`) on the card photo and the detail page | `background: var(--paper)` flat; keep the "No photograph yet" text |

- [ ] **Step 1: Confirm the failure the mapping fixes**

Run: `grep -rn -E "var\(--(accent-text|accent-tint|panel-2|surface|panel)\)" src | wc -l`
Expected: about 30 lines.

- [ ] **Step 2: Apply the mapping line by line** (the table above is the whole rule; read each selector's comment before editing, and update any comment that names a deleted token).

- [ ] **Step 3: Confirm nothing references a deleted token**

Run: `grep -rn -E "var\(--(accent-text|accent-tint|panel-2|surface|panel)\)" src`
Expected: no output.

- [ ] **Step 4: Run the gate pieces**

Run: `npm run check && npx vitest run`
Expected: `astro check` 0 errors; all vitest PASS.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "Retire the tinted tokens: ink for text, orange for fills"
```

### Task A3: the official mark replaces the masthead band

**Files:**
- Create: `src/assets/brand/osu-horizontal-2c-o-over-b.png`, `src/assets/brand/osu-horizontal-2c-o-over-w.png`
- Modify: `src/layouts/Base.astro` (header comment lines 4-7, both masthead variants at 38-60, masthead CSS 145-240)
- Test: `tests/e2e/mobile.spec.ts` (new `describe`)

**Interfaces:**
- Produces: `.masthead` keeps its class names (`masthead-full`, `masthead-slim`, `.print-button`) so existing e2e selectors hold.

- [ ] **Step 1: Write the failing e2e tests** (append to `tests/e2e/mobile.spec.ts`)

```ts
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
```

- [ ] **Step 2: Build, serve, run; confirm FAIL** (`.logo-light` not found)

- [ ] **Step 3: Create the two assets** (the only brand-kit files amendment 18 names), resized to 144 px tall (3x the 48 px display):

```bash
node --input-type=module -e "
import sharp from 'sharp';
const d='C:/Users/reavesh/src/OSU-branding/PNG RGB for digital and Microsoft Office/PNG RGB for digital and Microsoft Office/';
for (const [src,dst] of [['OSU_horizontal_2C_O_over_B.png','osu-horizontal-2c-o-over-b.png'],['OSU_horizontal_2C_O_over_W.png','osu-horizontal-2c-o-over-w.png']])
  await sharp(d+src).resize({height:144}).png({compressionLevel:9}).toFile('src/assets/brand/'+dst);
"
```

(Create `src/assets/brand/` first. Run from the repo root so `sharp` resolves from `node_modules`.)

- [ ] **Step 4: Replace both masthead variants in `Base.astro`**

Frontmatter additions:

```astro
import { Image } from 'astro:assets';
import markLight from '../assets/brand/osu-horizontal-2c-o-over-b.png';
import markDark from '../assets/brand/osu-horizontal-2c-o-over-w.png';
```

Markup (full variant; the slim variant is the same with `class="masthead masthead-slim"`, the mark at `height={32}`, the site title as `<a href="/">`, no kicker, and the existing print button kept):

```astro
<header class="masthead masthead-full">
  <div class="masthead-inner">
    <p class="lockup">
      <Image src={markLight} alt="Oregon State University" height={48} class="mark logo-light" loading="eager" />
      <Image src={markDark} alt="Oregon State University" height={48} class="mark logo-dark" loading="eager" />
      <span class="site-title">Physics Demonstration Catalog</span>
    </p>
    {mastheadMeta && <p class="masthead-meta">{mastheadMeta}</p>}
  </div>
</header>
```

CSS: `.masthead { background: var(--paper); color: var(--ink); border-bottom: 1px solid var(--rule); }`; delete the `.masthead :focus-visible` override; `.lockup { display: flex; align-items: center; gap: 1rem; }`; `.site-title { border-left: 1px solid var(--rule); padding-left: 1rem; }`; `.mark { width: auto; display: block; }`; the print button gets `color: var(--ink); border-color: var(--ink)`. The scheme swap, in this order so print wins:

```css
.logo-dark { display: none; }
@media (prefers-color-scheme: dark) {
  .logo-light { display: none; }
  .logo-dark { display: block; }
}
@media print {
  .logo-light { display: block; }
  .logo-dark { display: none; }
}
```

Below the compact breakpoint (48rem) the full variant's mark drops to `height: 32px` via CSS. Rewrite the header comment (lines 4-7) to cite amendment 18 instead of the band.

- [ ] **Step 5: Build, serve, run e2e; confirm PASS, including the existing 12**

- [ ] **Step 6: Commit**

```bash
git add src/assets/brand src/layouts/Base.astro tests/e2e/mobile.spec.ts
git commit -m "Wear the official OSU mark in place of the orange band"
```

### Task A4: carve the mark out of the content license

**Files:**
- Modify: `LICENSE-CONTENT` (THIRD-PARTY MATERIAL section)
- Modify: `README.md` (Licensing section, after the two-part list)
- Test: `tests/repo-invariants.test.ts:80-85`

- [ ] **Step 1: Extend the existing license test** (add inside the `LICENSE-CONTENT carries...` test)

```ts
  expect(text).toContain('src/assets/brand/');
  expect(text).toContain('trademark');
```

- [ ] **Step 2: Run; confirm FAIL** (`npx vitest run tests/repo-invariants.test.ts`)

- [ ] **Step 3: Add to LICENSE-CONTENT, after the PIRA paragraph**

```
The Oregon State University logo files in `src/assets/brand/` are
trademarks of Oregon State University. They appear here as the site's
identification only. They are not covered by the license above or by the
MIT license, and no right to use them is granted.
```

Add one matching sentence to README's Licensing section. `LICENSE` itself stays untouched (its test pins the pure MIT text).

- [ ] **Step 4: Run; confirm PASS**

- [ ] **Step 5: Commit**

```bash
git add LICENSE-CONTENT README.md tests/repo-invariants.test.ts
git commit -m "Carve the OSU mark out of the content license"
```

### Task A5: docs, verify, ship Part A

- [ ] Update `CLAUDE.md` "Theme contract" bullet: six tokens, strict palette by amendment 18, `tests/brand-palette.test.ts` beside the contrast test; delete the `--accent-text` sentence.
- [ ] Full gate (Windows recipe in Global Constraints). Expected: check clean, all vitest PASS, build OK, e2e 15 PASS.
- [ ] Browser check through the preview pane, light and dark (`resize_window` `colorScheme`), index and `/demos/ballistic-cart/`: no leftover cream, orange only on fills, rules, and the mark. If screenshots fail, assert computed colors with `javascript_tool`.
- [ ] Em dash check, commit docs, push, `gh pr create`, CI, merge per CLAUDE.md. PR body: amendment 18, the token table, "palette values are unverified against the university brand site (watch item)".
- [ ] Update `STATE.md` (brand pass shipped, queue advances) in the same PR before merging.

---

# Part B: Summary, row cards, ingest tool (amendments 16, 21, 22, 17 tool half)

Branch: `claude/summary-rows-ingest` from `origin/main` after Part A merges.

### Task B1: the `summary` field

**Files:**
- Modify: `src/lib/demo-schema.ts` (after `title` at line 233)
- Modify: `README.md` (frontmatter table, Identity group: a `summary` row; the "Markdown body" section: the detail page leads with hazards, then Summary, then the prediction callout)
- Test: `tests/demo-schema.test.ts`

**Interfaces:**
- Produces: `d.summary: string | undefined` on every entry's data.

- [ ] **Step 1: Failing tests** (append to `tests/demo-schema.test.ts`; `schema` and `validRecord` already exist in that file)

```ts
test('summary is optional plain text up to 200 characters', () => {
  expect(schema.safeParse({ ...validRecord, summary: 'A short summary.' }).success).toBe(true);
  expect(schema.safeParse({ ...validRecord, summary: 'x'.repeat(200) }).success).toBe(true);
  const { summary: _omit, ...withoutSummary } = { ...validRecord, summary: '' };
  expect(schema.safeParse(withoutSummary).success).toBe(true);
});

test('summary rejects empty and over-length text', () => {
  expect(schema.safeParse({ ...validRecord, summary: '' }).success).toBe(false);
  expect(schema.safeParse({ ...validRecord, summary: 'x'.repeat(201) }).success).toBe(false);
});
```

- [ ] **Step 2: Run; confirm the strict schema rejects `summary` as an unknown key (FAIL)**

- [ ] **Step 3: Add the field** directly after `title: z.string().min(1),`:

```ts
      // Amendment 16: the lead block on the detail page, the meta
      // description, and the full card's second line. Plain text; two
      // sentences at most.
      summary: z.string().min(1).max(200).optional(),
```

- [ ] **Step 4: Run; PASS. Commit** `Add an optional summary of 200 characters or fewer`

### Task B2: twelve summaries and the content invariant

**Files:**
- Test: `tests/content-invariants.test.ts`
- Modify: `src/content/demos/{interlaced-books,ballistic-cart,gravity-in-vacuum,spinning-tennis-racket,driven-spring-resonator,standing-waves,faraday-cage,wood-induced-dipole,jumping-rings,magnet-drop,multiplicity-dice,rotating-stool-dumbbells}/index.md`

- [ ] **Step 1: Failing invariant**

```ts
test('every drafted or verified record carries a summary (amendment 16)', () => {
  const missing = demoFiles
    .filter((d) => d.frontmatter['status'] !== 'stub' && !d.frontmatter['summary'])
    .map((d) => d.dirname);
  expect(missing, `records without a summary: ${missing.join(', ')}`).toEqual([]);
});
```

- [ ] **Step 2: Run; FAIL listing the twelve**

- [ ] **Step 3: Write each summary** as a `summary:` line directly after `title:`, drafted **only from that record's own corrected body**, never from the legacy export: what the demonstration shows and the one physical idea, two sentences at most, 200 characters or fewer, plain text (no `$` math, no Markdown). For `spinning-tennis-racket`, describe a single LED at the center of mass (the current build per amendment 17), not a string of lights.

- [ ] **Step 4: Run; PASS. Commit** `Draft summaries for the twelve drafted records`. PR body lists all twelve for owner review.

### Task B3: Summary block on the detail page, meta, search weight

**Files:**
- Modify: `src/pages/demos/[slug].astro` (the `<Base>` call at line 73; insert after the hazard band block, before the stub band)
- Test: `tests/e2e/mobile.spec.ts`

- [ ] **Step 1: Failing e2e**

```ts
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
```

- [ ] **Step 2: Build, serve, run; FAIL**

- [ ] **Step 3: Implement.** `<Base ... description={d.summary ?? d.topics.join(', ')}>`. After the hazard band block:

```astro
{
  d.summary && (
    <section class="summary-block" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Summary</h2>
      <p data-pagefind-weight="5">{d.summary}</p>
    </section>
  )
}
```

Style: `border-left: 4px solid var(--accent); padding: 0.75rem 1rem; background: var(--paper); color: var(--ink);` heading in the same small-caps label style as the prediction callout's heading; text 1.05rem. Prints (no print hiding). Update the page's header comment (lines 1-6) to name the order: hazard band, Summary, prediction (amendments 12, 16).

- [ ] **Step 4: Build, serve, run; PASS. Commit** `Lead the demo page with its summary, after hazards`

### Task B4: row cards (amendment 21)

**Files:**
- Modify: `src/components/DemoCard.astro` (markup and styles; keep every `data-*` attribute and the `.card` class, which the index script reads at `src/pages/index.astro:276`)
- Modify: `src/pages/index.astro:877-880, 1030-1031, 1057-1058` (`.grid` becomes a single column list; keep `id="grid"` and `class="grid"`)
- Modify: `playwright.config.ts` (add a desktop project for one new spec)
- Create: `tests/e2e/desktop.spec.ts`
- Modify: `tests/e2e/mobile.spec.ts`

**Interfaces:**
- Consumes: `d.summary` (B1), tokens (A1).
- Produces: card markup `.card > .thumb | .no-photo`, `.card-body > h2 > a`, `.summary`, `.stub-line`, `.class-line`, `.card-footer`, and `.hazard-badge` with `.hazard-names` inside.

- [ ] **Step 1: Desktop project and failing desktop spec.** In `playwright.config.ts` add to `projects`, and give the existing mobile project `testIgnore: /desktop\.spec\.ts/`:

```ts
    {
      name: 'desktop-chromium',
      testMatch: /desktop\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
```

```ts
// tests/e2e/desktop.spec.ts
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
```

- [ ] **Step 2: Failing mobile additions** (append to the `index at 375px` describe in `tests/e2e/mobile.spec.ts`)

```ts
  test('hazard badge is icon only, labelled, and does not change card height', async ({ page }) => {
    const card = page.locator('.card:not([data-hazards=""])').first();
    await expect(card.locator('.hazard-names')).toBeHidden();
    await expect(card.locator('.hazard-badge')).toHaveAccessibleName(/Hazard/);
    expect(await card.locator('.hazard-badge').evaluate((el) => getComputedStyle(el).position)).toBe('absolute');
  });

  test('compact cards carry location and no status or room chips', async ({ page }) => {
    const card = page.locator('.card:not([hidden])').first();
    await expect(card.locator('.card-footer')).toBeVisible();
    await expect(card.locator('.chip-stamp, .chip-stamp-muted')).toHaveCount(0);
    await expect(card.locator('.summary')).toBeHidden();
  });
```

(Class names confirmed in `src/components/Chip.astro`: `chip-stamp`, `chip-stamp-muted`, `chip-alert`, `chip-neutral`.)

- [ ] **Step 3: Build, serve, run all e2e; the new ones FAIL**

- [ ] **Step 4: Rebuild `DemoCard.astro`.** Structure (frontmatter keeps `classLine`, `locationText`, `courses`, `photo`; add `hazardNames = d.hazards.map(humanize).join(' · ')`):

```astro
<article class={`card ${d.hazards.length > 0 ? 'has-hazard' : ''}`} data-slug={demo.id} ...>
  {
    photo ? (
      <Image class="thumb" src={photo.src} alt={photo.alt} width={160} height={160} widths={[64, 128, 160, 320]} sizes="(max-width: 48rem) 64px, 160px" />
    ) : (
      <p class="no-photo">No photograph yet</p>
    )
  }
  {
    d.hazards.length > 0 && (
      <p class="hazard-badge" role="img" aria-label={`Hazard: ${hazardNames}`}>
        <span aria-hidden="true">▲</span>
        <span class="hazard-names" aria-hidden="true">{hazardNames}</span>
      </p>
    )
  }
  <div class="card-body">
    <h2><a href={`/demos/${demo.id}/`}>{d.title}</a></h2>
    {d.summary && <p class="summary">{d.summary}</p>}
    {!d.summary && d.status === 'stub' && <p class="stub-line">Stub record: not yet documented.</p>}
    {d.condition && d.condition !== 'good' && <p class="chips"><Chip label={humanize(d.condition)} tone="alert" /></p>}
    {classLine && <p class="class-line">{classLine}</p>}
    <p class="card-footer">
      <span>{locationText ?? 'location not recorded'}</span>
      {courses.length > 0 && <span>{courses.join(' · ')}</span>}
    </p>
  </div>
</article>
```

(`...` stands for every existing `data-*` attribute, copied unchanged from the current component.) The room-requirement chips, the status chip, the photo stamp, the full-width hazard band, and the `compact-only` machinery are deleted. Styles, desktop: `.card { display: grid; grid-template-columns: 160px 1fr; position: relative; border: 1px solid var(--rule); background: var(--paper); }`; `.thumb, .no-photo { width: 160px; height: 160px; object-fit: cover; border-right: 1px solid var(--rule); }`; `.summary { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }`; `.hazard-badge { position: absolute; top: 0.75rem; right: 0.75rem; background: var(--accent); color: var(--on-accent); font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 2px; margin: 0; }`; `.has-hazard h2 { padding-right: 12rem; }` (measure the widest real badge, "High voltage", and set the reservation to fit it). Compact (`max-width: 48rem`): `grid-template-columns: 64px 1fr`; `.thumb { width: 64px; height: 64px; margin: 0.75rem 0 0 0.75rem; }`; `.no-photo, .summary, .stub-line { display: none; }` (a photo-less card becomes a single text column: `.card:has(.no-photo) { grid-template-columns: 1fr; }`); `.hazard-names` visually hidden with the standard clip pattern, never `display: none` on the badge; `.has-hazard { border-left: 3px solid var(--accent); }`; `.has-hazard h2 { padding-right: 2rem; }`; keep the stretched-link `h2 a::after` whole-card target. Rewrite the component's header comment to cite amendment 21.

In `index.astro`, `.grid { display: flex; flex-direction: column; gap: 1rem; }` and delete the two compact `grid-template-columns: 1fr` overrides.

- [ ] **Step 5: Build, serve, run every e2e (mobile and desktop); PASS.** The existing "makes the whole card a link target" test must still pass: the badge must not add a second link.

- [ ] **Step 6: Browser check** at 1280x800 and 375x812, light and dark: three rows above the fold on desktop, no horizontal overflow, the badge clear of every title.

- [ ] **Step 7: Commit** `Rebuild cards as rows with a hazard corner badge`

### Task B5: `scripts/ingest-photo.mjs` and its two tests

**Files:**
- Create: `scripts/ingest-photo.mjs`
- Create: `tests/ingest-photo.test.ts`, `tests/image-invariants.test.ts`
- Modify: `package.json` (`sharp` devDependency), `README.md` (Photographs section), `docs/build-plan.md` (phase 5 line: mark shipped with date)

**Interfaces:**
- Produces: `ingestPhoto({ input, outDir, slug, index, force? }): Promise<{ output: string; width: number; height: number; bytes: number }>`; CLI `node scripts/ingest-photo.mjs <input> <slug> <index> [--force]` writing to `src/content/demos/<slug>/<slug>-NN.jpg`. Part C imports `ingestPhoto`.

- [ ] **Step 1: Pin sharp** to the version Astro already ships: `npm install -D sharp@0.35.3`; confirm `npm ls sharp` shows one version.

- [ ] **Step 2: Failing unit test**

```ts
// tests/ingest-photo.test.ts
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { ingestPhoto } from '../scripts/ingest-photo.mjs';

const makeFixture = async (dir: string): Promise<string> => {
  const input = join(dir, 'phone.jpg');
  // 3000x2000 stored landscape, tagged orientation 6 (display rotated 90
  // degrees), carrying EXIF the tool must strip.
  await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#D73F09' } })
    .withMetadata({ orientation: 6 })
    .withExif({ IFD0: { Artist: 'fixture', Copyright: 'fixture' } })
    .jpeg()
    .toFile(input);
  return input;
};

describe('ingestPhoto', () => {
  it('bakes orientation, caps the long edge at 1600, and strips all metadata', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ingest-'));
    const input = await makeFixture(dir);
    const before = await sharp(input).metadata();
    expect(before.exif, 'fixture must carry EXIF or this test proves nothing').toBeDefined();
    expect(before.orientation).toBe(6);

    const result = await ingestPhoto({ input, outDir: dir, slug: 'demo', index: 1 });
    expect(result.output).toBe(join(dir, 'demo-01.jpg'));

    const after = await sharp(result.output).metadata();
    expect(after.exif).toBeUndefined();
    expect(after.orientation).toBeUndefined();
    expect(after.width).toBe(1067);
    expect(after.height).toBe(1600);
  });

  it('never enlarges a small image', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ingest-'));
    const input = join(dir, 'small.png');
    await sharp({ create: { width: 320, height: 240, channels: 4, background: '#FFFFFF' } }).png().toFile(input);
    const result = await ingestPhoto({ input, outDir: dir, slug: 'demo', index: 2 });
    expect([result.width, result.height]).toEqual([320, 240]);
  });

  it('refuses HEIC with a message', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ingest-'));
    const input = join(dir, 'photo.heic');
    writeFileSync(input, 'not really heic');
    await expect(ingestPhoto({ input, outDir: dir, slug: 'demo', index: 1 })).rejects.toThrow(/HEIC/);
  });

  it('refuses to overwrite without force', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ingest-'));
    const input = await makeFixture(dir);
    await ingestPhoto({ input, outDir: dir, slug: 'demo', index: 1 });
    await expect(ingestPhoto({ input, outDir: dir, slug: 'demo', index: 1 })).rejects.toThrow(/--force/);
    await expect(ingestPhoto({ input, outDir: dir, slug: 'demo', index: 1, force: true })).resolves.toBeDefined();
  });
});
```

If `withExif` is unavailable in the pinned sharp, use `.withMetadata({ orientation: 6 })` alone and keep the `before.exif` precondition: sharp writes an EXIF block for the orientation tag, so the precondition still holds. Confirm by running Step 3.

- [ ] **Step 3: Run; FAIL** (module not found)

- [ ] **Step 4: Implement**

```js
// scripts/ingest-photo.mjs
// Amendment 17: the one door a photograph comes through. Order matters:
// orientation is baked into the pixels before metadata is dropped, or a
// phone photo lands sideways; the long edge is capped at 1600px, never
// enlarged; JPEG at quality 82; nothing survives from the camera. HEIC is
// refused rather than claimed: prebuilt sharp cannot decode HEVC-coded HEIC.
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

export const MAX_EDGE = 1600;

export async function ingestPhoto({ input, outDir, slug, index, force = false }) {
  if (/\.(heic|heif)$/i.test(input)) {
    throw new Error(`HEIC is not supported: convert ${input} to JPG first`);
  }
  const output = join(outDir, `${slug}-${String(index).padStart(2, '0')}.jpg`);
  if (!force && existsSync(output)) {
    throw new Error(`${output} exists; pass --force to overwrite`);
  }
  mkdirSync(outDir, { recursive: true });
  const info = await sharp(input)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#FFFFFF' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(output);
  return { output, width: info.width, height: info.height, bytes: info.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const [input, slug, index] = args.filter((a) => a !== '--force');
  if (!input || !slug || !index) {
    console.error('usage: node scripts/ingest-photo.mjs <input> <slug> <index> [--force]');
    process.exit(2);
  }
  const outDir = join('src', 'content', 'demos', slug);
  const r = await ingestPhoto({ input, outDir, slug, index: Number(index), force });
  console.log(`${r.output} ${r.width}x${r.height} ${r.bytes} bytes`);
}
```

- [ ] **Step 5: Type declaration, then run; PASS.** `tsconfig.json` includes `**/*`, so `astro check` typechecks the test's `.mjs` import. Create `scripts/ingest-photo.d.mts`:

```ts
export declare const MAX_EDGE: number;
export declare function ingestPhoto(options: {
  input: string;
  outDir: string;
  slug: string;
  index: number;
  force?: boolean;
}): Promise<{ output: string; width: number; height: number; bytes: number }>;
```

Run `npx vitest run tests/ingest-photo.test.ts` and `npm run check`; both clean.

- [ ] **Step 6: The invariant test**

```ts
// tests/image-invariants.test.ts
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
```

- [ ] **Step 7: Run; PASS.** Update README "Photographs": the tool exists, its command, what it does, HEIC refused (convert first), the invariant test. Mark phase 5's ingest line shipped with the date.

- [ ] **Step 8: Commit** `Add the photo ingest tool, tested at the tool and the repo`

### Task B6: amendment 22 (unchecked apparatus note, provisional locations, crawlers)

**Files:**
- Modify: `src/lib/format.ts`, `tests/format.test.ts`
- Modify: `src/pages/demos/[slug].astro` (beside the status chip in `.title-row`)
- Modify: `src/pages/index.astro` (the search band)
- Create: `public/robots.txt`
- Modify: `src/layouts/Base.astro:29-33` (the noindex comment)
- Test: `tests/e2e/mobile.spec.ts`

**Interfaces:**
- Produces: `physicalCheckNote(status: 'stub' | 'drafted' | 'verified', lastVerified: Date | undefined): string | null`

- [ ] **Step 1: Failing unit test** (append to `tests/format.test.ts`, importing `physicalCheckNote` from `../src/lib/format`)

```ts
test('a verified record without a physical check says so (amendment 22)', () => {
  expect(physicalCheckNote('verified', undefined)).toBe(
    'Content reviewed. Apparatus not yet checked in person.',
  );
  expect(physicalCheckNote('verified', new Date('2026-10-15'))).toBeNull();
  expect(physicalCheckNote('drafted', undefined)).toBeNull();
  expect(physicalCheckNote('stub', undefined)).toBeNull();
});
```

- [ ] **Step 2: Run; FAIL. Implement in `src/lib/format.ts`:**

```ts
// Amendment 22: `verified` means the record's content is reviewed; the
// physical check is `last_verified`. The gap between them is disclosed.
export const physicalCheckNote = (
  status: 'stub' | 'drafted' | 'verified',
  lastVerified: Date | undefined,
): string | null =>
  status === 'verified' && lastVerified === undefined
    ? 'Content reviewed. Apparatus not yet checked in person.'
    : null;
```

- [ ] **Step 3: Render it** on the detail page directly under `.title-row`: `{note && <p class="check-note">{note}</p>}` with `const note = physicalCheckNote(d.status, d.last_verified);` in the frontmatter; style `color: var(--muted); font-size: 0.9rem;`. No e2e for this line yet: no record is `verified` today, and a fixture record would be invented content.

- [ ] **Step 4: Failing e2e** (new describe in `tests/e2e/mobile.spec.ts`)

```ts
test.describe('amendment 22', () => {
  test('says once, near search, that locations are provisional', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.location-note')).toHaveCount(1);
    await expect(page.locator('.location-note')).toContainText('provisional');
  });

  test('refuses crawlers in robots.txt and in every page head', async ({ page, request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toMatch(/User-agent: \*\s+Disallow: \//);
    await page.goto('/demos/ballistic-cart/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });
});
```

- [ ] **Step 5: Implement.** `public/robots.txt`:

```
User-agent: *
Disallow: /
```

In the index search band, one line: `<p class="location-note">Locations are provisional while the stockroom is reorganized.</p>`, styled `--muted`, small. In `Base.astro`, rewrite the noindex comment: permanent by amendment 22, never remove. Host-level bot blocking is a dashboard setting: list it in the PR body under "Owner action", do not attempt it.

- [ ] **Step 6: Build, serve, run all tests; PASS. Commit** `Disclose unchecked apparatus, provisional locations; refuse crawlers`

### Task B7: verify, ship Part B

- [ ] Full gate. Browser check as in B4 Step 6.
- [ ] Update `STATE.md` (Part B shipped, test counts recounted, queue advances; add "enable host bot protection" to Awaiting the owner), em dash check, commit, push, PR, CI, merge. PR body: amendments 16, 21, 22, 17 (tool half); the twelve summaries listed for owner review.

---

# Part C: legacy images and the racket redraft (amendment 17 batch half)

Branch: `claude/legacy-images` from `origin/main` after Part B merges.

**Section to record mapping**, from the export's heading order (`PhysicsDemoLibrary.html`); images in document order:

| Section in the export | Images | Record(s) |
|---|---|---|
| Interlaced Books | 23 | interlaced-books |
| Friction Block | 31 | friction-block |
| Ballistic Cart | 26, 9, 29 | ballistic-cart |
| Newton's Cradle | 50 | newtons-cradle |
| Ballistic Pendulum | 34 | ballistic-pendulum |
| Ball Ramps | 24 | ball-ramps |
| Falling Duck Shot | 17 | falling-duck-shot |
| Mass Carts | 45 | mass-carts |
| Friction Plank | 55 | friction-plank |
| Gravity in Vacuum | 59 | gravity-in-vacuum |
| Unit Circle | 32 | unit-circle |
| Cartesian Coordinate Arrows | 38 | cartesian-coordinate-arrows |
| Centripetal Motion Marbles | 57 | centripetal-motion-marbles |
| Light-Up Spinning Tennis Racket | 6 (owner replacement, .jpg) | spinning-tennis-racket |
| Rolling Wheels | 39 | rolling-wheels |
| Physics Toys | 47 | physics-toys |
| Pendulum Stand | 12 | pendulum-stand |
| Spinning Chair + Wheel | 44 | rotating-stool-dumbbells (merged by the 2026-08 triage) |
| Torque Gun | 22 | torque-gun |
| Pressure Vessels | 13 | magdeburg-hemispheres **and** balloon-chamber (shared, amendment 17) |
| Doppler Football | 25 | doppler-football |
| Driven Spring Resonator | 48, 58, 61 | driven-spring-resonator |
| Resonant Frequency Water Glasses | 11 | resonant-water-glasses |
| Stringed Cups | 7 | stringed-cups |
| Standing Waves | 42 (1 and 2 excluded: equation fragments) | standing-waves |
| PH 20X "Physics of Rock n Roll" Demos | 5 | physics-of-music-demos |
| Rubens' Tube | 19 excluded (unlicensed vendor image); Commons photo instead | physics-of-music-demos |
| Faraday Cage | 51 | faraday-cage |
| Wood Induced Dipole | 41, 27, 60, 62 | wood-induced-dipole |
| Jumping Rings | 20 | jumping-rings |
| Magnet Drop | 15, 40 | magnet-drop |
| Magnetic Braking Discs | 33 | magnetic-braking-discs |
| Induced Current Coil | 37 | induced-current-coil |
| Attracting Currents | 3 | attracting-currents |
| Van De Graff Generators | 16, 35 | van-de-graaff-generators |
| Tesla Coil + Large Capacitor | 54 | tesla-coil (see the open question below) |
| Static Repulsion | 53 | static-repulsion |
| Cathode Ray Tube | 52, 10, 36 | cathode-ray-tube |
| Thermal Expansion | 43 | thermal-expansion |
| Multiplicity Dice Activity | 4 | multiplicity-dice |
| Poisson Spot | 18 | poisson-spot |
| Holograms | 28 (320x240, reshoot) | holograms |
| Strong Rare Earth Magnets | 14 | strong-rare-earth-magnets |
| Large Magnets | 8 | large-magnets |
| Large Capacitors | 56 | large-capacitors |
| Metal Filings | 46 | metal-filings |
| Voltmeters and Ammeters | 30 | voltmeters-and-ammeters |
| Wire Rings | 21 | wire-rings |

**Open question for the owner before Task C1 finishes:** amendment 17 sends image54 to both `tesla-coil` and `large-capacitors`, but the `tesla-coil` record's title is "Tesla Coil and Large Capacitor" and `large-capacitors` has its own photo (image56). Ask whether the gray can in image54 is the same apparatus as the `large-capacitors` record. If not, image54 goes to `tesla-coil` only, recorded as a correcting ledger entry.

### Task C1: faces pass and the mapping file

**Files:**
- Create: `docs/legacy-images-2026-09.json`

- [ ] **Step 1: View every image** in the export's `images/` folder with the Read tool. Hold out any image showing a person (list it for the owner; do not crop or blur). Flag any image under 200 px on its long edge as a non-photo (equation fragment or icon) and exclude it with a reason.
- [ ] **Step 2: Write the mapping**, shaped:

```json
{
  "source": "Old Reference Material/Legacy Demo Catalog/Physics Demo Library (Google Docs HTML export)",
  "note": "Descriptions in the export are reference only (owner ruling 2026-09-28). image6 and image19 were replaced by the owner on 2026-09-28 before ingest.",
  "entries": [
    {
      "image": "image6",
      "section": "Light-Up Spinning Tennis Racket",
      "targets": [
        { "slug": "spinning-tennis-racket", "alt": "Blue tennis racket lying on a concrete floor, with a single red LED taped at the throat where the frame meets the handle." }
      ]
    }
  ],
  "commons": [
    {
      "url": "https://commons.wikimedia.org/wiki/File:Flame-tube-resonance.jpg",
      "slug": "physics-of-music-demos",
      "alt": "A long Rubens tube on a bench beside a signal generator, its flames rising in five evenly spaced peaks along the tube.",
      "caption": "Representative photo, not the OSU apparatus. Photo: MikeRun, CC BY-SA 4.0, via Wikimedia Commons."
    }
  ],
  "excluded": [
    { "image": "image1", "reason": "Equation fragment, 8 by 18 px (amendment 19)" },
    { "image": "image2", "reason": "Equation fragment, 23 by 18 px (amendment 19)" },
    { "image": "image19", "reason": "Reposted vendor image with no license; replaced by the Commons photo" }
  ],
  "held": []
}
```

Alt text: describe the apparatus as a stockroom photo shows it, per record (a shared photo gets different alt text on each record, naming what that record cares about). Never describe a person. One sentence, no "image of".

- [ ] **Step 3: STOP for owner review** of the mapping (all alt text, anything held, the image54 question). Do not run the batch until the owner approves. Commit the approved mapping: `Map the legacy export's photographs to records`.

### Task C2: the batch script

**Files:**
- Create: `scripts/ingest-legacy-batch.mjs`, `scripts/ingest-legacy-batch.d.mts` (declares `insertImagesBlock` with the signature below), `tests/ingest-legacy-batch.test.ts`

**Interfaces:**
- Consumes: `ingestPhoto` from B5.
- Produces: `insertImagesBlock(markdown: string, images: {src: string; alt: string; caption?: string}[]): string`, pure and exported.

- [ ] **Step 1: Failing test for the pure insertion**

```ts
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { insertImagesBlock } from '../scripts/ingest-legacy-batch.mjs';

const record = `---
title: "Demo"
slug: demo
status: stub
topics: [rotation]

# --- curator notes ---
notes: >
  A note.
---

## Physics
`;

describe('insertImagesBlock', () => {
  it('adds a media block before the curator notes and keeps the body', () => {
    const out = insertImagesBlock(record, [{ src: './demo-01.jpg', alt: 'A demo.', caption: 'Shot "here".' }]);
    const fm = parse(out.split('---')[1]!);
    expect(fm.images).toEqual([{ src: './demo-01.jpg', alt: 'A demo.', caption: 'Shot "here".' }]);
    expect(out.indexOf('# --- media ---')).toBeLessThan(out.indexOf('# --- curator notes ---'));
    expect(out.endsWith('## Physics\n')).toBe(true);
  });

  it('refuses a record that already has images', () => {
    const once = insertImagesBlock(record, [{ src: './demo-01.jpg', alt: 'A demo.' }]);
    expect(() => insertImagesBlock(once, [{ src: './demo-02.jpg', alt: 'Again.' }])).toThrow(/already has images/);
  });
});
```

- [ ] **Step 2: Run; FAIL**

- [ ] **Step 3: Implement** `insertImagesBlock`: throw `already has images` if the frontmatter has a top-level `images:` key; build the block with `yaml`'s `stringify` for each entry (so quotes escape correctly), indented as a list under `images:`, prefixed `# --- media ---\n`; insert it before the first of `# --- curator notes ---` or `# --- provenance`, else before the closing `---`. The CLI (`node scripts/ingest-legacy-batch.mjs <export-images-dir> [--dry-run]`) reads `docs/legacy-images-2026-09.json`, resolves each `image` by basename with any extension, calls `ingestPhoto` per target with a per-slug running index, collects images per slug, then rewrites each record once with `insertImagesBlock`. `--dry-run` prints the plan and the projected files without writing. The Commons entry is ingested from a local file path given with `--commons <path>`.

- [ ] **Step 4: Run; PASS. Commit** `Add the legacy batch ingest, refusing double runs`

### Task C3: run the batch

- [ ] **Step 1: The Commons photo.** Confirm the license on the file page (CC BY-SA 4.0, author MikeRun). **Ask the owner before downloading** (filename, source, size). Save it to the session scratchpad, not the repo.
- [ ] **Step 2:** `node scripts/ingest-legacy-batch.mjs "<export>/images" --commons <scratchpad path> --dry-run`; review.
- [ ] **Step 3:** Run for real. Report the byte total (`du -ch src/content/demos/*/*.jpg | tail -1`) to the owner **before committing**.
- [ ] **Step 4:** Full gate: the invariant test now walks every new image; `astro build` resolves every `images[].src`.
- [ ] **Step 5: Commit** `Bring the legacy photographs in, stripped and resized`

### Task C4: tennis racket redraft

**Files:**
- Modify: `src/content/demos/spinning-tennis-racket/index.md`

- [ ] Rewrite `prediction_prompt`, `## Physics`, `## Setup`, `## Procedure`, and `## Quirks and caveats` for the single-LED build (no white lights, no battery-pack switch; the LED is on until its tape-down connection is broken or the cell runs down). Keep the corrected physics (the LED marks the center of mass and follows the projectile path while the racket rotates about it). Update `summary` if B2's wording no longer fits.
- [ ] Add, exactly:

```yaml
maintenance_log:
  - date: 2026-09-25
    note: >
      Rebuilt the light. The old build, a string of LED lights bundled
      around the racket with a battery pack wedged in the throat, shifted
      the center of mass and gave no single point of light. Now one LED on
      a CR2032 3 V lithium cell through a 50 ohm resistor, taped in place;
      the cell lasts a few hours. Planned: a 3D-printed clip-on housing to
      hold the LED at the center of mass, and a switch.
```

- [ ] Set `last_updated` to the commit date. Nothing here is `verified`: status stays `drafted`.
- [ ] Commit `Redraft the tennis racket record for its single-LED rebuild`

### Task C5: reshoot list, docs, ship Part C

- [ ] Add a **Reshoot list** section to `STATE.md`: `physics-of-music-demos` (representative Commons photo), every image under 400 px on its long edge (at least image48 and image28), and every record still without a photo (compute it: records whose frontmatter has no `images`).
- [ ] If the image54 answer changed amendment 17, add the correcting ledger entry.
- [ ] Full gate, browser check (desktop rows now show photos; phone thumbnails), em dash check, push, PR, CI, merge. PR body: byte total, the racket redraft for owner review, the reshoot list.

---

## After Part C

Amendment 19 (legacy equations in KaTeX) is next in `STATE.md`; it is not part of this plan.
