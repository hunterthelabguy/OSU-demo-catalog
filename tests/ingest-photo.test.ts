import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { ingestPhoto } from '../scripts/ingest-photo.mjs';

const makeFixture = async (dir: string): Promise<string> => {
  const input = join(dir, 'phone.jpg');
  // 3000x2000 stored landscape, tagged orientation 6 (display rotated 90
  // degrees), carrying EXIF the tool must strip, including a GPS block.
  await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#D73F09' } })
    .withExif({
      IFD0: { Artist: 'fixture', Copyright: 'fixture' },
      IFD3: {
        GPSLatitudeRef: 'N',
        GPSLatitude: '44/1 33/1 0/1',
        GPSLongitudeRef: 'W',
        GPSLongitude: '123/1 16/1 0/1',
      },
    })
    .withMetadata({ orientation: 6 })
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
    expect(before.exif!.includes(Buffer.from('fixture')), 'fixture must carry IFD0 tags').toBe(true);
    // A GPS IFD is present when the EXIF block holds the GPS pointer tag 0x8825.
    const exif = before.exif!;
    const le = exif.subarray(6, 8).toString('latin1') === 'II';
    const ifd0 = le ? exif.readUInt32LE(10) : exif.readUInt32BE(10);
    const count = le ? exif.readUInt16LE(6 + ifd0) : exif.readUInt16BE(6 + ifd0);
    const tags: number[] = [];
    for (let i = 0; i < count; i++) {
      const at = 6 + ifd0 + 2 + i * 12;
      tags.push(le ? exif.readUInt16LE(at) : exif.readUInt16BE(at));
    }
    expect(tags, 'fixture must carry a GPS IFD pointer').toContain(0x8825);

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
