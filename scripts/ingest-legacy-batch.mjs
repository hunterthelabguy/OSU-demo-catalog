// Part C: ingest the legacy stockroom photographs through the one door
// (scripts/ingest-photo.mjs), driven by docs/legacy-images-2026-09.json.
// Usage: node scripts/ingest-legacy-batch.mjs <export-images-dir>
//          [--commons <local-file>] [--skip-commons] [--dry-run]
// Held and excluded entries are never read. A slug that receives several
// images gets -01, -02, ... in mapping order; the Commons image takes the
// next index after that slug's legacy images. Each record is rewritten once,
// and a record that already has an `images:` key is refused before any file
// is written, so a second run cannot double-ingest.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
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
export function planBatch(mapping, { commonsPath, skipCommons }) {
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
    jobs.push({ kind: 'commons', input: commonsPath, slug: c.slug, index: next(c.slug), alt: c.alt, caption: c.caption, url: c.url });
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
  const jobs = planBatch(mapping, { commonsPath, skipCommons: skipCommons || (dryRun && !commonsPath) });
  if (skipCommons && hasCommons) console.log('SKIPPED commons entries (--skip-commons): ' + mapping.commons.map((c) => c.slug).join(', '));

  // Preflight everything before writing anything.
  const bySlug = new Map();
  for (const j of jobs) {
    j.input ??= findSource(dir, j.image);
    if (!existsSync(j.input)) throw new Error(`missing input ${j.input}`);
    if (!bySlug.has(j.slug)) bySlug.set(j.slug, []);
    bySlug.get(j.slug).push(j);
  }
  const records = new Map();
  for (const slug of bySlug.keys()) {
    const file = join('src', 'content', 'demos', slug, 'index.md');
    if (!existsSync(file)) throw new Error(`no record for slug ${slug}: ${file}`);
    const text = readFileSync(file, 'utf8');
    if (/^images:/m.test((text.match(FM)?.[1] ?? '').replace(/\r\n/g, '\n'))) {
      throw new Error(`${file} already has images; refusing to run again`);
    }
    records.set(slug, { file, text });
  }

  let totalBytes = 0;
  for (const [slug, list] of bySlug) {
    const outDir = join('src', 'content', 'demos', slug);
    const images = [];
    console.log(`${slug}: ${list.length} image(s)`);
    for (const j of list) {
      const name = `${slug}-${String(j.index).padStart(2, '0')}.jpg`;
      if (dryRun) {
        console.log(`  would write ${join(outDir, name)} from ${j.input}`);
      } else {
        const r = await ingestPhoto({ input: j.input, outDir, slug, index: j.index });
        totalBytes += r.bytes;
        console.log(`  ${r.output} ${r.width}x${r.height} ${r.bytes} bytes`);
      }
      images.push({ src: `./${name}`, alt: j.alt, ...(j.caption ? { caption: j.caption } : {}) });
    }
    const rec = records.get(slug);
    const updated = insertImagesBlock(rec.text, images);
    if (!dryRun) writeFileSync(rec.file, updated);
  }
  console.log(`${dryRun ? 'planned' : 'ingested'} ${jobs.length} image(s) across ${bySlug.size} record(s)` + (dryRun ? ' (dry run, nothing written)' : `, ${totalBytes} bytes`));
}

const invoked = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href.toLowerCase() === import.meta.url.toLowerCase();
if (invoked) {
  main().catch((err) => {
    console.error(`error: ${err.message}`);
    process.exit(1);
  });
}
