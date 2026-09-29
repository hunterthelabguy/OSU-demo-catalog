// The theme contract has teeth: every foreground/background pair the
// templates actually use must clear WCAG AA (4.5:1) in every scheme,
// asserted against the real token values parsed out of theme.css. The
// design pass that introduced --panel and --accent-tint also found the
// original filled hazard chip at 4.0:1, which is exactly the class of
// regression this file exists to stop.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('../src/styles/theme.css', import.meta.url)),
  'utf8',
);

// theme.css is three token blocks in a fixed order: light :root, the dark
// prefers-color-scheme override, the print override. Parse by segmenting on
// the @media headers rather than with a CSS parser; the file is ours.
const segments = {
  light: css.slice(0, css.indexOf('@media (prefers-color-scheme: dark)')),
  dark: css.slice(
    css.indexOf('@media (prefers-color-scheme: dark)'),
    css.indexOf('@media print'),
  ),
  print: css.slice(css.indexOf('@media print')),
};

type Tokens = Record<string, string>;
const parseTokens = (segment: string): Tokens => {
  const tokens: Tokens = {};
  for (const match of segment.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
};

const schemes = Object.fromEntries(
  Object.entries(segments).map(([name, segment]) => [name, parseTokens(segment)]),
) as Record<keyof typeof segments, Tokens>;

// WCAG 2.x relative luminance over sRGB.
const luminance = (hex: string): number => {
  const channel = (i: number): number => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
};

const contrast = (fg: string, bg: string): number => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};

// Foreground on background, as the templates use them. Additions here are
// cheap; removals mean a template stopped using the pair.
const PAIRS: [fg: string, bg: string, where: string][] = [
  ['ink', 'paper', 'all reading text on the page, cards, panels, inputs'],
  ['muted', 'paper', 'secondary text'],
  ['on-accent', 'accent', 'hazard band, hazard badge, alert chip, checked course chip (bold)'],
  ['paper', 'ink', 'inverted status chip'],
];

describe('theme contrast', () => {
  it('defines every token this test depends on, in every scheme', () => {
    const names = [...new Set(PAIRS.flatMap(([fg, bg]) => [fg, bg]))];
    for (const [scheme, tokens] of Object.entries(schemes)) {
      for (const name of names) {
        expect(tokens[name], `${scheme} is missing --${name}`).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });

  for (const [scheme, tokens] of Object.entries(schemes)) {
    describe(scheme, () => {
      for (const [fg, bg, where] of PAIRS) {
        it(`--${fg} on --${bg} clears AA (${where})`, () => {
          const ratio = contrast(tokens[fg], tokens[bg]);
          expect(
            ratio,
            `--${fg} ${tokens[fg]} on --${bg} ${tokens[bg]} is ${ratio.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(4.5);
        });
      }
    });
  }
});
