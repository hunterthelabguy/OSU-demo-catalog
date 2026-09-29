// Amendment 17: the unit test proves the tool; this proves the repo. Any
// photo placed around the tool is caught here. The scan is recursive, covers
// every raster type a browser or Astro could serve, and fails on any file under
// src/content/demos/ that is neither a record (.md) nor a recognised image,
// so a stray .heic cannot slip in unexamined.
import { mkdirSync, mkdtempSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it, test } from 'vitest';

const DEMOS = join(__dirname, '..', 'src', 'content', 'demos');
const IMAGE = /\.(jpe?g|png|webp|avif|gif|tiff?)$/i;
const RECORD = /\.md$/i;
// Dotfiles and OS junk are not content; an untracked one must not fail locally.
const JUNK = /^(\..*|desktop\.ini|thumbs\.db)$/i;

interface Walk {
  images: string[];
  strays: string[];
}

export function walk(root: string): Walk {
  const out: Walk = { images: [], strays: [] };
  const visit = (dir: string, depth: number) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, e.name);
      if (e.isDirectory()) visit(path, depth + 1);
      else if (!e.isFile() || JUNK.test(e.name)) continue;
      else if (IMAGE.test(e.name)) out.images.push(path);
      else if (depth > 0 && !RECORD.test(e.name)) out.strays.push(path);
    }
  };
  visit(root, 0);
  return out;
}

export async function violations(path: string): Promise<string[]> {
  const m = await sharp(path).metadata();
  const bad: string[] = [];
  for (const k of ['exif', 'orientation', 'xmp', 'iptc', 'icc'] as const) {
    if (m[k] !== undefined) bad.push(`${k} present`);
  }
  if (Math.max(m.width ?? 0, m.height ?? 0) > 1600) bad.push(`long edge ${m.width}x${m.height} over 1600`);
  return bad;
}

const found = walk(DEMOS);

test('the walker sees the demos directory', () => {
  expect(statSync(DEMOS).isDirectory()).toBe(true);
});

test('no file under a slug directory is neither a record nor a recognised image', () => {
  const names = found.strays.map((p) => relative(DEMOS, p));
  expect(names, `unrecognised files: ${names.join(', ')}`).toEqual([]);
});

test.each(found.images.length > 0 ? found.images : ['(no images yet)'])(
  '%s carries no metadata and has a long edge of 1600 or less',
  async (path) => {
    if (path === '(no images yet)') return;
    expect(await violations(path), path).toEqual([]);
  },
);

describe('the guard itself has teeth', () => {
  it('flags EXIF, orientation, an oversize edge, nested images, and stray files', async () => {
    const root = mkdtempSync(join(tmpdir(), 'inv-'));
    mkdirSync(join(root, 'slug', 'nested'), { recursive: true });
    const dirty = join(root, 'slug', 'nested', 'x.WEBP');
    await sharp({ create: { width: 1700, height: 100, channels: 3, background: '#fff' } })
      .withExif({ IFD0: { Artist: 'fixture' } })
      .withMetadata({ orientation: 6 })
      .webp()
      .toFile(dirty);
    writeFileSync(join(root, 'slug', 'photo.heic'), 'x');
    writeFileSync(join(root, 'slug', 'index.md'), '');
    const w = walk(root);
    expect(w.images).toEqual([dirty]);
    expect(w.strays.map((p) => relative(root, p))).toEqual([join('slug', 'photo.heic')]);
    const v = await violations(dirty);
    expect(v).toContain('exif present');
    expect(v).toContain('orientation present');
    expect(v.some((s) => s.startsWith('long edge'))).toBe(true);
  });
});
