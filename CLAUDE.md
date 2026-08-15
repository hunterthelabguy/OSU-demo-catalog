# OSU-demo-catalog: agent runbook

Static Astro catalog of physics lecture demonstrations. Read
[README.md](README.md) for the content model and authoring rules,
[docs/build-plan.md](docs/build-plan.md) for current state and amendments, and
[docs/spec-v0.1.md](docs/spec-v0.1.md) for the archival design record. Where
spec and build-plan differ, build-plan wins; never edit the spec file.

## Verify

- `npm run verify` is the whole gate: `astro check`, vitest, `astro build`
  (which also generates the Pagefind index), then `npm run test:e2e`, the
  Playwright mobile-layout suite against the built site. Green locally
  means green in CI. First run needs `npx playwright install chromium`.
- `tests/e2e/` is Playwright and needs a built site; everything else in
  `tests/` is vitest and pure. `vitest.config.ts` excludes the e2e
  directory so the two gates cannot swallow each other.
- Search only works against a built site: `npm run build && npm run preview`.
  Under `astro dev` the search box degrades with a note; facets still work.
- Browser checks: `.claude/launch.json` has `dev` and `preview` configs for
  the preview pane.

## Shipping (machine-enforced)

The `main-protection` ruleset rejects every direct push to `main`, docs
included, and requires a green `verify` check. Always:

1. Branch, commit, push, `gh pr create`.
2. Sleep ~20 s after creating the PR, then `gh pr checks <n> --watch`. The
   watch exits immediately with "no checks reported" if you race check
   startup, and merging before `verify` reports is refused by the ruleset;
   the refusal is correct behavior.
3. `gh pr merge <n> --rebase --delete-branch`, then checkout main and pull.
4. Vercel deploys `main` to production automatically; PRs get preview URLs.

Git identity and transport:

- Commits are authored `hunterthelabguy` via repo-local config. Never commit
  with the machine's global identity; a test walks every commit in history.
- **No Co-Authored-By trailer.** Uniform attribution is a ruled invariant.
- The remote must stay on the SSH alias
  `git@github-hunterthelabguy:hunterthelabguy/OSU-demo-catalog.git`. The gh
  OAuth token cannot push workflow files over HTTPS.

## Conventions that bite

- **No em dashes** in anything committed here. Grep before committing:
  the owner's rule for public prose covers every file in a public repo.
- **No invented record data.** Never fabricate PIRA codes, shelf locations,
  maintenance history, or dates. Fixture placeholders are marked in `notes`.
- **Theme contract**: all fonts and colors live in `src/styles/theme.css`,
  both schemes. `--accent` is fills-only; `--accent-text` is the AA-safe
  accent for small text. Do not hardcode colors in templates; the dark
  scheme depends on it. Every foreground/background pair the templates use
  is asserted at WCAG AA by `tests/theme-contrast.test.ts`; extend the
  pair list when you introduce a new combination.
- **A repo must not lie about its verification.** Never document a command
  or badge scope that is not real and tested.
- Every page carries `noindex` until launch (Base.astro); remove it only on
  the owner's word.
- `slug` equals directory name equals entry id, by test. Never rename a
  published slug.

## Commands

- `/reflect`: mid-session knowledge capture into this file and build-plan.
- `/handoff`: end-of-session ship plus fresh-session handoff block.
