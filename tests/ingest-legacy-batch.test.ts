import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { insertImagesBlock, planBatch } from '../scripts/ingest-legacy-batch.mjs';

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

const frontmatter = (md: string) => parse(md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)![1]!);

describe('insertImagesBlock', () => {
  it('adds a media block before the curator notes and keeps the body', () => {
    const out = insertImagesBlock(record, [{ src: './demo-01.jpg', alt: 'A demo.', caption: 'Shot "here".' }]);
    const fm = frontmatter(out);
    expect(fm.images).toEqual([{ src: './demo-01.jpg', alt: 'A demo.', caption: 'Shot "here".' }]);
    expect(out.indexOf('# --- media ---')).toBeLessThan(out.indexOf('# --- curator notes ---'));
    expect(out.endsWith('## Physics\n')).toBe(true);
  });

  it('refuses a record that already has images', () => {
    const once = insertImagesBlock(record, [{ src: './demo-01.jpg', alt: 'A demo.' }]);
    expect(() => insertImagesBlock(once, [{ src: './demo-02.jpg', alt: 'Again.' }])).toThrow(/already has images/);
  });

  it('inserts before provenance, or before the closing fence when there are no markers', () => {
    const prov = record.replace('# --- curator notes ---\nnotes: >\n  A note.', '# --- provenance (always last) ---\nlast_updated: 2026-08-13');
    const a = insertImagesBlock(prov, [{ src: './demo-01.jpg', alt: 'A.' }]);
    expect(a.indexOf('# --- media ---')).toBeLessThan(a.indexOf('# --- provenance'));
    const bare = `---\ntitle: "Demo"\nslug: demo\n---\n\nBody\n`;
    const b = insertImagesBlock(bare, [{ src: './demo-01.jpg', alt: 'B.' }]);
    expect(frontmatter(b).images).toEqual([{ src: './demo-01.jpg', alt: 'B.' }]);
    expect(frontmatter(b).slug).toBe('demo');
    expect(b.endsWith('\nBody\n')).toBe(true);
  });

  it('preserves CRLF line endings', () => {
    const crlf = record.replace(/\n/g, '\r\n');
    const out = insertImagesBlock(crlf, [{ src: './demo-01.jpg', alt: 'A demo.' }]);
    expect(out.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
    expect(out.replace(/\r\n/g, '\n')).not.toContain('\r');
    expect(frontmatter(out).images).toHaveLength(1);
    expect(out.endsWith('## Physics\r\n')).toBe(true);
  });
});

describe('planBatch', () => {
  const mapping = {
    entries: [
      { image: 'a', targets: [{ slug: 'x', alt: 'A on x.' }] },
      { image: 'shared', targets: [{ slug: 'x', alt: 'Shared on x.' }, { slug: 'y', alt: 'Shared on y.', caption: 'Cap.' }] },
      { image: 'c', targets: [{ slug: 'y', alt: 'C on y.' }] },
    ],
    commons: [{ url: 'https://example.test/f', slug: 'y', alt: 'Commons.', caption: 'Credit.' }],
    excluded: [{ image: 'gone', targets: [{ slug: 'z', alt: 'no' }] }],
    held: [{ image: 'held', targets: [{ slug: 'z', alt: 'no' }] }],
  };

  it('never plans held or excluded entries', () => {
    const jobs = planBatch(mapping, { commonsPath: 'f.jpg' });
    expect(jobs.some((j) => j.slug === 'z' || j.image === 'held' || j.image === 'gone')).toBe(false);
  });

  it('gives a shared photo one job per slug with its own alt', () => {
    const shared = planBatch(mapping, { commonsPath: 'f.jpg' }).filter((j) => j.image === 'shared');
    expect(shared.map((j) => [j.slug, j.alt])).toEqual([['x', 'Shared on x.'], ['y', 'Shared on y.']]);
  });

  it('indexes per slug in mapping order, commons last on its slug', () => {
    const jobs = planBatch(mapping, { commonsPath: 'f.jpg' });
    expect(jobs.map((j) => `${j.slug}-${j.index}`)).toEqual(['x-1', 'x-2', 'y-1', 'y-2', 'y-3']);
    expect(jobs.at(-1)).toMatchObject({ kind: 'commons', slug: 'y', index: 3, input: 'f.jpg' });
  });

  it('marks commons as needing a path, or skips it on request', () => {
    expect(planBatch(mapping).at(-1)?.kind).toBe('needs-commons');
    expect(planBatch(mapping, { skipCommons: true }).some((j) => j.slug === 'y' && j.index === 3)).toBe(false);
  });
});
