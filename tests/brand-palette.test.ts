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
// 4- and 8-digit hex carry an alpha channel, which is a tint the brand guide
// forbids; they are returned as-is so the palette check fails on them.
const hexes = (text: string): string[] =>
  [...text.matchAll(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g)].map((m) =>
    m[0].length === 5 || m[0].length === 9 ? m[0].toUpperCase() : normalize(m[0]),
  );
const verdict = (hex: string): string =>
  hex.length === 5 || hex.length === 9
    ? `${hex} has an alpha channel (4 or 8 digits), which is a tint; use a listed palette value`
    : `${hex} is not an OSU palette value`;

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
    for (const hex of found) expect(PALETTE.has(hex), verdict(hex)).toBe(true);
  });

  it('no template, stylesheet, or public svg hardcodes a non-palette color', () => {
    const files = [
      ...walk(join(root, 'src')).filter((f) => /\.(astro|css|ts)$/.test(f)),
      ...walk(join(root, 'public')).filter((f) => /\.svg$/.test(f)),
    ];
    for (const file of files) {
      for (const hex of hexes(readFileSync(file, 'utf8'))) {
        expect(PALETTE.has(hex), `${verdict(hex)} (in ${file})`).toBe(true);
      }
    }
  });
});
