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
