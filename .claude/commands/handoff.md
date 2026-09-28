---
description: End-of-session ship. Reflect into the repo's agent infrastructure, update build-plan bookkeeping, land it through the PR gate, then emit a copy-paste handoff for a fresh session.
argument-hint: "[optional focus or next-task hint, e.g. 'next is phase 5' or 'skip ship']"
---

You are closing out a build session. Run the whole shipping tail in order: reflect the
session's re-derived knowledge into the repo, land the bookkeeping, ship it through the
pull-request gate, and write a fresh-session handoff.

Optional focus or next-task hint from the user: $ARGUMENTS

Do not invent work. `/handoff` ships what already exists and hardens what the session
already established. It never fabricates rulings, findings, or completed work. If the
session is not actually done (verify red, a PR open and unmerged), say so and stop rather
than shipping a half-pass.

## 1. Reflect (the /reflect pass, folded in)

Scan the session for knowledge that was re-derived and would cost the next agent again:
repo facts discovered by trial and error, gotchas and environment quirks, explicit user
corrections, repeated procedures. Route each finding and **apply it now**; this is end of
session, so do not defer to a confirmation round:

- **Repo-wide operational knowledge** (the verify recipe, the PR ceremony, where things
  live, environment gotchas) goes to `CLAUDE.md` at the repo root; create it if missing.
  Keep it tight and pointer-heavy; it loads every session.
- **Project state** goes to `STATE.md` at the repo root: rewrite it in place to
  current truth (what exists, in flight, the ordered queue, awaiting the owner, watch
  items) and bump its date. It is a snapshot, never an appended changelog.
- **Rulings and design changes** go to `docs/build-plan.md`, the ledger, as numbered,
  dated amendments; mark shipped phases with dates. Add-only: a wrong entry is
  corrected by a new one.
- **Never edit `VISION.md`** except on the owner's explicit ruling; propose changes
  instead.
- **Never edit `docs/spec-v0.1.md`.** It is the archival record; its header routes
  amendments to build-plan.md.
- **Successor-facing content knowledge** (authoring workflow, field semantics) goes to
  `README.md` if it is not already there.
- **Knowledge about you or the user, not the repo** goes to your agent memory
  (`MEMORY.md` index plus per-fact files), never committed.

If the session genuinely produced nothing worth capturing, say so and skip to the ship.

## 2. Verify green

Run `npm run verify` (typecheck, tests, build including the Pagefind index). If it is
red, STOP and report; do not ship a broken tree. Remember: search only works against a
built site (`npm run preview`), never under `astro dev`.

## 3. Ship through the gate

This repo machine-enforces its ceremony: the `main-protection` ruleset rejects every
direct push to `main`, documentation included, and requires a green `verify` check.
The shipping tail is therefore always:

1. Work on a branch. If you are on `main` with uncommitted changes, branch now.
2. Commit as **hunterthelabguy** (repo-local git config; verify with
   `git config user.email` if in doubt). House form: subject 72 chars or less, dense
   narrative body carrying the why. **No Co-Authored-By trailer**; this repo's history
   is uniformly attributed and the invariant test walks every commit.
3. Push. The remote must stay on the SSH alias
   (`git@github-hunterthelabguy:hunterthelabguy/OSU-demo-catalog.git`); the gh OAuth
   token cannot push workflow files over HTTPS.
4. `gh pr create` with a body that says what shipped and how it was verified.
5. `gh pr checks <n> --watch` until `verify` reports green. Do not attempt to merge
   before the check reports; the ruleset will refuse and the refusal is correct.
6. `gh pr merge <n> --rebase --delete-branch`, then `git checkout main && git pull`.
7. Confirm the production deploy picked it up if the change is user-visible.

If the user's hint says "skip ship", stop after committing and report the branch state.

## 4. Emit the handoff (in chat, for copy-paste)

Write a brief, token-optimized handoff as your final chat message: dense prose a fresh
session pastes in to continue. Not a file. No preamble. Draw from the reflection you just
did; do not re-summarize the whole conversation. Shape:

- **Header**: repo path, `main @ <commit>` (pushed and merged), commit-author note, the
  production URL.
- **Read first**: `CLAUDE.md`, then `STATE.md` (current truth and queue), `VISION.md`
  (the destination), `docs/build-plan.md` (the ledger of rulings), `README.md`, and
  `docs/spec-v0.1.md` only as archive (the ledger wins where they differ).
- **State**: which phases are shipped, test count, what production currently shows.
- **Your task**: the next piece of work, from $ARGUMENTS or the STATE.md queue, with the
  constraints that make it legitimate.
- **Awaiting owner word**: anything ruled "hold until go" or flagged for the owner's
  judgment; do not build on these until ruled.
- **Verify**: `npm run verify`; the preview-not-dev rule for search; the PR gate recipe
  above, compressed to a line.
- **Watch-items**: standing conventions that bite (no em dashes in repo prose, no
  invented record data, accent tokens and their contrast contract, the noindex-until-
  launch flag).

Keep it lean: a fresh agent should be able to act from the block alone without re-reading
the whole session.
