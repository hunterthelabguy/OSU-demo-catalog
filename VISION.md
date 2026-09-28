# Vision

Where this catalog is going and what counts as arriving. Changes only by the
owner's ruling. What exists today is in [STATE.md](STATE.md); how decisions
were reached is in [docs/build-plan.md](docs/build-plan.md), the ledger.

> **Draft, 2026-09-28, awaiting the owner's line-by-line ruling.** Assembled
> from the README, the archival spec, and the ledger. It can only restate
> what the record already says; where the destination has moved, the record
> has not caught up yet. Ruled in part on 2026-09-28 (the question, the
> launch gate, success, crawlers); lines still marked *(proposed)* are
> Claude's, with no source in the record: rule them in or strike them.

## Who it serves

Faculty and instructors deciding whether to run a demonstration in lecture,
first in the introductory sequence (PH 211, 212, 213), and the demo staff who
prepare it. *(proposed)* Students are not the audience, though every page
is written so a student could follow it.

## The question it answers

*I have class tomorrow and I'm covering this topic: what demonstrations do
we have for it?* Monday evening, an instructor arrives with a topic or a
course and needs, for each candidate, three things fast: **what it is, where
it lives, and what topic it covers.** Discovery by topic comes first.

Once a demonstration is chosen, the record answers the second question,
*can I actually run it on Tuesday?*, with demonstration time, setup, room
needs, hazards, and the apparatus's condition. A faculty member who already
knows the physics reads the summary and the logistics and is done; the rest
of the page is there for whoever needs it.

## What makes it more than an inventory

Every record carries a prediction prompt and the misconceptions it
confronts, because demonstrations watched passively produce essentially no
learning gain over no demonstration, while predicting first does (Crouch,
Fagen, Callan and Mazur, 2004; single institution, modest effects, so a
design hypothesis this catalog can test, not settled proof).

## Launch

Launch means the faculty showing: the catalog is shown to colleagues to win
support for the full curation effort. The gate is content, not engineering:

- **Every currently catalogued demonstration at `verified` depth**,
  prediction prompts included. `verified` means the record's content is
  reviewed (physics, procedure, prediction prompt, misconceptions,
  summary); the physical check of the apparatus is tracked separately, by
  date, and a record without one says so plainly. No new location data is
  required: the
  stockroom is about to be cleaned, weeded, and reorganized, and locations
  will be collected over several physical walkthroughs after that, so
  today's locations are not permanent.
- **The website is not blocked by the physical work.** Records, design, and
  tooling are digital and proceed now; the walkthroughs feed locations in as
  they happen.
- **Depth before breadth.** No new demonstrations join before launch; the
  ones already catalogued go deep first.
- **Honest partial records.** A stub renders as a stub. Gaps stated plainly
  build more trust than gaps concealed.
- **Before launch:** the URL is not circulated beyond the preview, and the
  OSU palette values are verified against the university brand site.

## What success looks like after launch

- Faculty pick demonstrations from the catalog rather than by emailing "what demos do we have on this?"
- A successor can run the stockroom from it without extracting knowledge
  from anyone's head: records, provenance, and the ledger survive handover.
- Faculty can find demo equipment quickly by referencing the listed location.

## Standing commitments

- Public, OSU-branded, accessible: WCAG AA under test, per-sense
  accessibility guidance on records, alt text on every image.
- Static and portable: Markdown in git, no server, no accounts; the hosting
  provider is where it points today, not a dependency.
- Nothing invented: no fabricated codes, locations, dates, or history.
- No identifiable students, and no student data of any kind.
- The site politely asks crawlers to leave, and outright rejects them when
  possible, permanently: faculty reach it by link, never by search engine.

## Deliberately not

- Not a request or scheduling system. Requests stay in the existing form;
  a config-gated "Request this demo" link is the whole integration.
- Not a database or a CMS. Git supplies review, diffs, and rollback.
- Not a complete inventory before launch.
- No analytics beyond what the request form already records.

## Beyond launch (named, not scheduled)

- Embedded video and simulations, click-to-load, from an allowlisted set
  of hosts.
- An installable offline catalog for rooms without signal.
- Verified PIRA codes from the real list, human-reviewed.
