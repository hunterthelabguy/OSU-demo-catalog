---
description: Reflect on this session and update the repo's agent infrastructure (CLAUDE.md, docs/build-plan.md) so the next session is more efficient.
argument-hint: "[optional focus, e.g. 'search gotchas' or 'just CLAUDE.md']"
---

You are running an active-learning reflection pass on the session so far. The goal is to
capture knowledge that was re-derived during this session so a future agent does not pay
that cost again.

Optional focus from the user: $ARGUMENTS

## 1. Review the session for friction

Scan the conversation above for moments where effort was spent learning something that
should have been known up front. Look specifically for:

- **Re-derived knowledge**: a fact about how this repo works that you had to discover by
  reading code, running commands, or trial and error (file locations, the schema, the
  verify recipe, how search testing works, which doc rules what).
- **Gotchas and dead ends**: a command that failed, a wrong assumption, an environment
  quirk (the SSH-alias remote, search needing a built site, Windows shell differences),
  anything you would warn the next agent about.
- **Corrections from the user**: explicit feedback on how to work in this repo.
- **Repeated multi-step procedures**: a sequence you executed that could be a documented
  command.

If nothing in this session is worth capturing, say so plainly and stop. Do not invent
findings or make cosmetic edits.

## 2. Decide where each finding belongs

- **Repo-wide operational knowledge** (commands, gotchas, where things live, the verify
  recipe, the PR ceremony) goes to `CLAUDE.md` at the repo root; create it if missing.
  Keep it tight; it loads every session. Point to deeper docs rather than duplicating.
- **Project state** goes to `STATE.md`, rewritten in place to current truth.
- **Rulings and design amendments** go to `docs/build-plan.md`, the ledger, as
  numbered, dated, add-only entries. **Never edit `docs/spec-v0.1.md`**; it is the
  archival record, and its own header says amendments land in build-plan.md instead.
- **The destination** lives in `VISION.md` and changes only by the owner's ruling;
  propose, never edit.
- **Successor-facing knowledge** (how to add a demo, field semantics, the notes promotion
  rule, photo policy) goes to `README.md`, which is a runbook, not notes to self.
- **A repeatable procedure** becomes a proposed `.claude/commands/<name>.md`, but do not
  create it without confirming with the user first.
- **Knowledge specific to you or the user, not the repo** (working-style preferences,
  cross-repo facts, anything a collaborator would not want committed) goes to your agent
  memory, never the repo.

## 3. Propose, then apply

List the findings and where each one goes as a short bullet list. For straightforward
additions to `CLAUDE.md` or `docs/build-plan.md`, apply them directly. For anything larger
(a new command, a structural doc change, anything touching an owner ruling), confirm with
the user before writing.

## 4. Respect repo conventions

- No em dashes in demo summaries; `tests/content-invariants.test.ts` enforces it
  (amendment 16).
- A repo must not lie about its verification: never document a command, badge, or claim
  that is not real and tested.
- Do not duplicate what the README, spec, or build-plan already record; link instead.
- Keep edits minimal and high-signal. This pass should make future sessions shorter, not
  add noise.
