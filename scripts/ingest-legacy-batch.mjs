// Part C: ingest the legacy stockroom photographs through the one door
// (scripts/ingest-photo.mjs), driven by docs/legacy-images-2026-09.json.
// Usage: node scripts/ingest-legacy-batch.mjs <export-images-dir>
//          [--commons <local-file>] [--skip-commons] [--dry-run]
// Held and excluded entries are never read. A slug that receives several
// images gets -01, -02, ... in mapping order; the Commons image takes the
// next index after that slug's legacy images. Each record is rewritten once,
// and a record that already has an `images:` key is refused before any file
// is written, so a second run cannot double-ingest.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { stringify } from 'yaml';
import { ingestPhoto } from './ingest-photo.mjs';

const FM = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

export function insertImagesBlock(markdown, images) {
  const m = markdown.match(FM);
  if (!m) throw new Error('record has no frontmatter');
  const eol = markdown.includes('\r\n') ? '\r\n' : '\n';
  const fm = m[1].replace(/\r\n/g, '\n');
  if (/^images:/m.test(fm)) throw new Error('record already has images');

  const entries = images.map((i) => {
    const o = { src: i.src, alt: i.alt };
    if (i.caption) o.caption = i.caption;
    return o;
  });
  const list = stringify(entries, { lineWidth: 0 })
    .trimEnd()
    .split('\n')
    .map((l) => `  ${l}`);
  const block = ['# --- media ---', 'images:', ...list];

  const marker = /^# --- (?:curator notes|provenance)/m.exec(fm);
  let out;
  if (marker) {
    out = fm.slice(0, marker.index) + block.join('\n') + '\n\n' + fm.slice(marker.index);
  } else {
    out = fm + '\n' + block.join('\n');
  }
  const head = '---' + eol + out.replace(/\n/g, eol) + eol + '---' + (m[0].endsWith('\n') ? eol : '');
  return head + markdown.slice(m[0].length);
}

function findSource(dir, name) {
  const hit = readdirSync(dir).find((f) => basename(f, extname(f)) === name);
  if (!hit) throw new Error(`no file for ${name} in ${dir}`);
  return join(dir, hit);
}

// Pure planning: which file becomes which slug-NN.jpg, in mapping order.
export function planBatch(mapping, { commonsPath, skipCommons } = {}) {
  const counts = new Map();
  const jobs = [];
  const next = (slug) => {
    const n = (counts.get(slug) ?? 0) + 1;
    counts.set(slug, n);
    return n;
  };
  for (const e of mapping.entries) {
    for (const t of e.targets) {
      jobs.push({ kind: 'legacy', image: e.image, slug: t.slug, index: next(t.slug), alt: t.alt, caption: t.caption });
    }
  }
  for (const c of mapping.commons ?? []) {
    if (skipCommons) continue;
    jobs.push({ kind: commonsPath ? 'commons' : 'needs-commons', input: commonsPath, slug: c.slug, index: next(c.slug), alt: c.alt, caption: c.caption, url: c.url });
  }
  return jobs;
}

async function main() {
  const args = process.argv.slice(2);
  const flag = (f) => args.includes(f);
  const value = (f) => {
    const i = args.indexOf(f);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const dryRun = flag('--dry-run');
  const skipCommons = flag('--skip-commons');
  const commonsPath = value('--commons');
  const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--commons');
  const dir = positional[0];
  const usage = 'usage: node scripts/ingest-legacy-batch.mjs <export-images-dir> [--commons <file>] [--skip-commons] [--dry-run]';
  if (!dir) {
    console.error(usage);
    process.exit(2);
  }
  const mapping = JSON.parse(readFileSync(join('docs', 'legacy-images-2026-09.json'), 'utf8'));
  const hasCommons = (mapping.commons ?? []).length > 0;
  if (hasCommons && !commonsPath && !skipCommons) {
    if (dryRun) console.warn('warning: mapping has a commons entry and no --commons path; a real run would refuse');
    else {
      console.error('error: mapping has a commons entry; pass --commons <local file> or --skip-commons');
      process.exit(2);
    }
  }
  const jobs = planBatch(mapping, { commonsPath, skipCommons });
  if (skipCommons && hasCommons) console.log('SKIPPED commons entries (--skip-commons): ' + mapping.commons.map((c) => c.slug).join(', '));

  // Preflight everything before writing anything: sources decode, no target
  // file exists, every record accepts its block. Then JPEGs first, records last.
  const bySlug = new Map();
  const pending = jobs.filter((j) => j.kind !== 'needs-commons');
  const needCommons = jobs.filter((j) => j.kind === 'needs-commons');
  for (const j of pending) {
    j.input ??= findSource(dir, j.image);
    if (!existsSync(j.input)) throw new Error(`missing input ${j.input}`);
    if (/\.(heic|heif)$/i.test(j.input)) throw new Error(`HEIC is not supported: convert ${j.input} to JPG first`);
    await sharp(j.input)
      .metadata()
      .catch((e) => {
        throw new Error(`cannot decode ${j.input}: ${e.message}`);
      });
    j.name = `${j.slug}-${String(j.index).padStart(2, '0')}.jpg`;
    j.outDir = join('src', 'content', 'demos', j.slug);
    if (existsSync(join(j.outDir, j.name))) throw new Error(`${join(j.outDir, j.name)} exists; refusing to run again`);
    if (!bySlug.has(j.slug)) bySlug.set(j.slug, []);
    bySlug.get(j.slug).push(j);
  }
  const plans = new Map();
  for (const [slug, list] of bySlug) {
    const file = join('src', 'content', 'demos', slug, 'index.md');
    if (!existsSync(file)) throw new Error(`no record for slug ${slug}: ${file}`);
    const text = readFileSync(file, 'utf8');
    const images = list.map((j) => ({ src: `./${j.name}`, alt: j.alt, ...(j.caption ? { caption: j.caption } : {}) }));
    plans.set(slug, { file, updated: insertImagesBlock(text, images) });
  }

  let totalBytes = 0;
  const written = [];
  try {
    for (const [slug, list] of bySlug) {
      console.log(`${slug}: ${list.length} image(s)`);
      for (const j of list) {
        if (dryRun) {
          console.log(`  would write ${join(j.outDir, j.name)} from ${j.input}`);
          continue;
        }
        const r = await ingestPhoto({ input: j.input, outDir: j.outDir, slug, index: j.index });
        written.push(r.output);
        totalBytes += r.bytes;
        console.log(`  ${r.output} ${r.width}x${r.height} ${r.bytes} bytes`);
      }
    }
  } catch (err) {
    for (const f of written) rmSync(f, { force: true });
    throw err;
  }
  for (const j of needCommons) console.log(`${j.slug}: would need --commons (${j.url})`);
  if (!dryRun) for (const p of plans.values()) writeFileSync(p.file, p.updated);
  const tail = needCommons.length ? `; ${needCommons.length} commons job(s) would need --commons` : '';
  console.log(
    `${dryRun ? 'planned' : 'ingested'} ${pending.length} image(s) across ${bySlug.size} record(s)` +
      (dryRun ? ' (dry run, nothing written)' : `, ${totalBytes} bytes`) +
      tail,
  );
}

const invoked = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href.toLowerCase() === import.meta.url.toLowerCase();
if (invoked) {
  main().catch((err) => {
    console.error(`error: ${err.message}`);
    process.exit(1);
  });
}
