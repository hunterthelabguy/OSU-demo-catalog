# OSU-demo-catalog: agent runbook

Static Astro catalog of physics lecture demonstrations. Read
[STATE.md](STATE.md) for what exists and the ordered queue,
[VISION.md](VISION.md) for the destination (owner-ruled; propose, never
edit), [docs/build-plan.md](docs/build-plan.md) for the ledger of rulings and
amendments, [README.md](README.md) for the content model and authoring rules,
and [docs/spec-v0.1.md](docs/spec-v0.1.md) as the archival design record.
Where spec and ledger differ, the ledger wins; never edit the spec file.

## Verify

- `npm run verify` is the whole gate: `astro check`, vitest, `astro build`
  (which also generates the Pagefind index), then `npm run test:e2e`, the
  Playwright mobile-layout suite against the built site. Green locally
  means green in CI. First run needs `npx playwright install chromium`.
- **On Windows the e2e step needs the preview server started first.** Astro
  7.2.1 backgrounds `astro preview` here instead of holding the foreground,
  so Playwright's `webServer` sees its command exit immediately and reports
  "Process from config.webServer exited early", which reads like a test
  failure and is not one. Run `npx astro preview --background --host`, then
  `npm run test:e2e`; `--host` matters because the default bind is IPv6 only
  while Playwright probes 127.0.0.1, so `reuseExistingServer` misses it.
  `npx astro preview stop` when done. CI is ubuntu and unaffected.
- `tests/e2e/` is Playwright and needs a built site; everything else in
  `tests/` is vitest and pure. `vitest.config.ts` excludes the e2e
  directory so the two gates cannot swallow each other.
- Search only works against a built site: `npm run build && npm run preview`.
  Under `astro dev` the search box degrades with a note; facets still work.
- Browser checks: `.claude/launch.json` has `dev` and `preview` configs for
  the preview pane. Screenshots need the pane actually displayed; when it
  is not, assert through `read_page` and `javascript_tool` instead of
  reporting a screenshot you could not take. A throwaway mock opened as a
  `file://` URL renders as a static snapshot the page tools cannot touch;
  serve its folder over localhost (`python -m http.server <port> --bind
  127.0.0.1`, backgrounded) so viewport and color-scheme emulation work.
- Node one-offs that import `sharp` must run from the repo root: ESM
  resolves packages from the script's own directory, so a script in the
  scratchpad cannot find `node_modules/sharp`.
- Chrome restores a `<details>` open state across same-tab navigation, so
  the facet panel can read as closed on a desktop viewport when the script
  never closed it. Reload with a fresh query string before concluding the
  disclosure logic is wrong.

## Shipping (machine-enforced)

The `main-protection` ruleset rejects every direct push to `main`, docs
included, and requires a green `verify` check. Always:

1. Branch **from current `origin/main`**, commit, push, `gh pr create`.
2. Sleep ~20 s after creating the PR, then `gh pr checks <n> --watch`. The
   watch exits immediately with "no checks reported" if you race check
   startup, and merging before `verify` reports is refused by the ruleset;
   the refusal is correct behavior.
3. `gh pr merge <n> --rebase --delete-branch`, then checkout main and pull.
4. Vercel deploys `main` to production automatically; PRs get preview URLs.

Three failure modes in that tail, all of which look like other problems:

- **No CI run at all means the PR is unmergeable, not that Actions is
  broken.** GitHub does not dispatch workflows for a PR whose mergeable
  state is `CONFLICTING`, and it reports this nowhere obvious: the Vercel
  checks still pass, so the PR looks half-alive. The usual cause is
  stacking a branch on a not-yet-merged branch, because `--rebase` merges
  rewrite the SHA and the old commit then conflicts with its own rebased
  twin. Check `gh pr view <n> --json mergeable` **first**, before
  suspecting Actions permissions, billing, or workflow YAML;
  `git rebase origin/main` fixes it and CI fires within seconds. Git skips
  the duplicate commit on its own ("skipped previously applied commit").
- **`gh pr merge` reports `fatal: 'main' is already used by worktree`.**
  The merge itself succeeded on GitHub; only gh's local checkout step
  failed, because `main` is checked out in the primary worktree. Confirm
  with `gh pr view <n> --json state`, then fast-forward the primary
  checkout directly: `git -C <primary-worktree> merge --ff-only
  origin/main`. Do not re-run the merge. `git fetch --prune` has to come
  first: the failed step never fetched, so `origin/main` is still the old
  SHA and the merge reports "Already up to date." while the checkout sits
  a commit behind.
- **Stale `claude/*` branches accumulate locally** even though
  `--delete-branch` removes them from the remote, because that step runs
  in the same failed local checkout. `git fetch --prune` plus
  `git branch -D` on the merged ones, as part of the handoff.

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
  `grep -P "\x{2014}"` fails on this machine's Git Bash ("character
  value in \x{} is too large": the pattern is not in UTF-8 mode). What
  works is the raw bytes: `git diff | grep $'\xe2\x80\x94'`.
- **No invented record data.** Never fabricate PIRA codes, shelf locations,
  maintenance history, or dates. Fixture placeholders are marked in `notes`.
- **Filter semantics live in `src/lib/filter-logic.ts`**, never in the
  index page script, which stays DOM glue. Since amendment 15 there are
  two bands: scope (course, search) always ANDs, and the panel facets
  combine by the Match any / Match all mode. A new facet group goes in
  `topicalPairs` and nowhere else; both modes read that one list.
- **Theme contract**: all fonts and colors live in `src/styles/theme.css`,
  both schemes. `--accent` is fills-only; `--accent-text` is the AA-safe
  accent for small text. Do not hardcode colors in templates; the dark
  scheme depends on it. Every foreground/background pair the templates use
  is asserted at WCAG AA by `tests/theme-contrast.test.ts`; extend the
  pair list when you introduce a new combination.
- **A repo must not lie about its verification.** Never document a command
  or badge scope that is not real and tested.
- Every page carries `noindex`, permanently (amendment 22): the catalog is
  reached by link, never by search engine. Never remove it.
- `slug` equals directory name equals entry id, by test. Never rename a
  published slug.

## Commands

- `/reflect`: mid-session knowledge capture: operational facts here, state
  to STATE.md, rulings to the build-plan ledger, VISION.md never.
- `/handoff`: end-of-session ship plus fresh-session handoff block.
