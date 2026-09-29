import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { z } from 'astro/zod';
import {
  BODY_HEADINGS,
  CATEGORIES,
  CATEGORY_PIRA_PREFIXES,
  SUBTOPICS,
  buildDemoSchema,
} from '../src/lib/demo-schema';

// Invariants over the real records in src/content/demos/, the ones the build
// itself cannot see. Astro validates frontmatter against the schema; it does
// not know that the directory name, the slug, and the entry id are supposed
// to be the same string, or that body headings have a fixed order.

const DEMOS_DIR = join(__dirname, '..', 'src', 'content', 'demos');

interface DemoFile {
  dirname: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

const loadDemoFiles = (): DemoFile[] =>
  readdirSync(DEMOS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const raw = readFileSync(join(DEMOS_DIR, entry.name, 'index.md'), 'utf-8').replace(
        /\r\n/g,
        '\n',
      );
      const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
      if (!match) throw new Error(`${entry.name}/index.md has no frontmatter block`);
      return {
        dirname: entry.name,
        frontmatter: parseYaml(match[1]!) as Record<string, unknown>,
        body: match[2] ?? '',
      };
    });

const demoFiles = loadDemoFiles();

test('both rendering paths stay exercised: at least one stub and one non-stub', () => {
  // Originally this demanded one `verified` fixture, but the 2026-08
  // extraction pass replaced the fixture's invented logistics with real
  // content that no one has physically checked, and a record must not claim
  // verification it does not have. The rendering split the test protects is
  // stub band versus full body, which drafted exercises identically.
  const statuses = demoFiles.map((d) => d.frontmatter['status']);
  expect(statuses).toContain('stub');
  expect(statuses.some((s) => s === 'drafted' || s === 'verified')).toBe(true);
});

test('slug always equals the directory name', () => {
  // The frontmatter slug overrides the glob loader's path-derived entry id,
  // so slug === dirname makes id, slug, directory, and URL one string. The
  // slug is also the durable contract with the future request system; a
  // drifted one is a join that silently fails years from now.
  for (const demo of demoFiles) {
    expect(demo.frontmatter['slug'], `${demo.dirname}/index.md`).toBe(demo.dirname);
  }
});

test('every record validates against the schema outside the build too', () => {
  // Belt to astro build's suspenders: schema breakage surfaces in the unit
  // suite even when nobody has run a build.
  const schema = buildDemoSchema(() => z.string().min(1));
  for (const demo of demoFiles) {
    const result = schema.safeParse(demo.frontmatter);
    expect(
      result.success,
      `${demo.dirname}/index.md: ${result.success ? '' : result.error.message}`,
    ).toBe(true);
  }
});

test('every record carries a category from the closed list', () => {
  // The schema keeps `category` optional so a minimal stub still parses;
  // this repo requires it anyway, the same way slug must equal dirname.
  // Without a category a record's subtopics would be reachable from the
  // browse UI while the record itself matches no category selection.
  const known: readonly string[] = CATEGORIES;
  for (const demo of demoFiles) {
    expect(
      known.includes(demo.frontmatter['category'] as string),
      `${demo.dirname}/index.md: category missing or not in CATEGORIES`,
    ).toBe(true);
  }
});

test('every topic is a known subtopic slug', () => {
  // Redundant with the schema check above, but this one names the file and
  // the offending value when a remap goes stale.
  for (const demo of demoFiles) {
    for (const topic of (demo.frontmatter['topics'] as string[]) ?? []) {
      expect(
        topic in SUBTOPICS,
        `${demo.dirname}/index.md: "${topic}" is not in SUBTOPICS`,
      ).toBe(true);
    }
  }
});

test('a record PIRA code agrees with its category', () => {
  // The comPADRE vocabulary maps every subject to a PIRA prefix, so a code
  // and a category can be checked against each other rather than both being
  // taken on trust. A 5-series code on a mechanics record is a
  // copy-paste error from the neighboring row of a source table, which is
  // exactly the mistake that survives proofreading.
  for (const demo of demoFiles) {
    const code = demo.frontmatter['pira_dcs'] as string | null | undefined;
    if (typeof code !== 'string' || code.length === 0) continue;
    const category = demo.frontmatter['category'] as keyof typeof CATEGORY_PIRA_PREFIXES;
    const allowed: readonly string[] = CATEGORY_PIRA_PREFIXES[category] ?? [];
    expect(
      allowed.includes(code.slice(0, 2)),
      `${demo.dirname}/index.md: PIRA ${code} does not belong to category ` +
        `"${category}" (expected one of ${allowed.join(', ')})`,
    ).toBe(true);
  }
});

test('body H2 headings appear in the fixed order, with omissions allowed', () => {
  const canonical: readonly string[] = BODY_HEADINGS;
  for (const demo of demoFiles) {
    const headings = [...demo.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]!.trim());
    let cursor = -1;
    for (const heading of headings) {
      const index = canonical.indexOf(heading);
      expect(index, `${demo.dirname}: unknown H2 "${heading}"`).toBeGreaterThanOrEqual(0);
      expect(index, `${demo.dirname}: "${heading}" is out of order`).toBeGreaterThan(cursor);
      cursor = index;
    }
  }
});

test('every drafted or verified record carries a summary (amendment 16)', () => {
  const missing = demoFiles
    .filter((d) => d.frontmatter['status'] !== 'stub' && !d.frontmatter['summary'])
    .map((d) => d.dirname);
  expect(missing, `records without a summary: ${missing.join(', ')}`).toEqual([]);
});
