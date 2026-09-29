import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

// These tests guard rulings, not code. Each one is a failure mode this
// repository was specifically configured against, and the first two already
// bit (or nearly bit) during initial setup. See docs/build-plan.md.

const gitLines = (format: string): string[] =>
  execSync(`git log --format=${format}`, { encoding: 'utf-8' })
    .trim()
    .split('\n');

const read = (path: string): string =>
  readFileSync(path, 'utf-8').replace(/\r\n/g, '\n');

// Ruling (spec section 9): uniform attribution as hunterthelabguy. The
// machine this repository was created on carries a different global git
// identity; a single commit made without the repo-local override writes a
// personal address into public history, and rewriting authorship after the
// fact is the one genuinely tedious fix. CI runs this against full history
// (fetch-depth: 0), so a leaked identity fails the pull request that
// introduces it, which is the only cheap moment to catch it.
const ALLOWED_EMAILS = new Set([
  // repo-local config, set before the first commit existed
  '301055645+hunterthelabguy@users.noreply.github.com',
  // GitHub web-flow: committer on merge and squash commits, both identities
  // on synthetic pull request merge refs that CI checks out
  'noreply@github.com',
  // the account's own public address; squash-merge author when GitHub
  // falls back to the primary email
  'hunterthelabguy@proton.me',
]);
const ALLOWED_NAMES = new Set(['hunterthelabguy', 'GitHub']);

test('every commit is attributed to hunterthelabguy identities only', () => {
  for (const email of [...gitLines('%ae'), ...gitLines('%ce')]) {
    expect(ALLOWED_EMAILS.has(email), `unexpected commit email: ${email}`).toBe(
      true,
    );
  }
  for (const name of [...gitLines('%an'), ...gitLines('%cn')]) {
    expect(ALLOWED_NAMES.has(name), `unexpected commit name: ${name}`).toBe(
      true,
    );
  }
});

// Ruling: LICENSE holds the MIT text and nothing else. GitHub detects a
// license by matching the file body against known license texts; an appended
// scope note already broke that once (the API reported license: null). The
// scope prose lives in README.md and LICENSE-CONTENT instead.
const MIT_TEXT = `MIT License

Copyright (c) 2026 hunterthelabguy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

test('LICENSE is the pure MIT text GitHub can detect', () => {
  expect(read('LICENSE')).toBe(MIT_TEXT);
});

test('LICENSE-CONTENT carries the CC BY-SA scope and names its counterpart', () => {
  const text = read('LICENSE-CONTENT');
  expect(text).toContain('Attribution-ShareAlike 4.0');
  expect(text).toContain('src/content/');
  expect(text).toContain('MIT');
  expect(text).toContain('src/assets/brand/');
  expect(text).toContain('trademark');
});
