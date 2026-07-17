# SDD-011: Content engine — recurring-issues source + anti-AI editorial standard

-   **Status**: Investigation / design (2026-07-17) — **no code changed**. Defines the net-new
    pieces on top of SDD-006; implementation deferred.
-   **Builds on**: [006](006-trending-content-radar.md) (weekly trending radar + editorial loop —
    do **not** duplicate it). **Uses**: [010](010-content-audit-opportunity.md) (authority surface +
    existing-topic dedupe) and [003](003-adsense-content-remediation.md) (low-value guardrail).

## Why this spec exists (the gap in SDD-006)

SDD-006 already mines trends (Hacker News, dev.to, Reddit, GitHub **repositories** by stars, own
GSC) and enforces an anti-scaled-content guardrail. Two things the owner asked for are **not**
covered by it:

1. **Recurring GitHub _issues_ of the stack** — not trending repos, but the evergreen, high-
   engagement *problems* people keep hitting in the exact tech we already rank for.
2. **A real "sounds human, not AI" editorial standard** — SDD-006 has a value bar; it does not have
   a reusable voice/structure/screenshot checklist. This is the owner's core requirement
   ("mi lenguaje, capturas, sin sonar a IA").

SDD-010 makes the case that this is the right bet: the site already ranks (positions 5–15) for
problem/error intent and converts almost nothing — **deep problem→solution content in our stack is
the proven lane**, and recurring issues are a direct pipeline of that intent.

## Part A — Recurring-issues source (new radar input)

### Signal (validated live, 2026-07-17)

Query `api.github.com/search/issues?q=repo:<owner/repo>+type:issue+state:open+sort:comments-desc`
(and `sort:reactions-+1-desc`) on stack repos returns exactly the evergreen pain we want. Sample
from `vercel/next.js`:

| comments | 👍  | issue                                                          |
| -------: | --: | ------------------------------------------------------------- |
| 176      | 149 | Next.js development high memory usage                         |
| 142      | 328 | App Router + Framer Motion shared layout animations           |
| 104      | 69  | Inconsistent CSS resolution order with App Router             |
| 83       | 115 | RSC and CDN interaction inefficient for high-load projects    |
| 26       | 152 | TypeScript cannot find module with `moduleResolution=nodenext`|

These are real, durable, high-intent topics — the kind that earn links and rank for years.

### Design

-   **Repo set** = the SDD-010 authority surface, expressed as concrete repos: `vercel/next.js`,
    `facebook/react`, `microsoft/TypeScript`, `nodejs/node`, `jestjs/jest`, `storybookjs/storybook`,
    `microsoft/playwright`, plus 1–2 the owner actually uses. Config-driven, not hard-coded in logic.
-   **Score** = `(comments + reactions) × recency-activity × (1 + profile-keyword matches)`, dropping
    issues that are pure bug-triage noise (heuristics: has `question`/`discussion` signals, or a
    "how do I / why does" title shape) and issues whose topic **already maps to an existing post**
    (dedupe against the SDD-010 inventory).
-   **Cross-filter with demand**: an issue topic that *also* appears in GSC rising queries or the
    SDD-006 trend set is boosted — that's the sweet spot (recurring pain ∩ real search demand ∩ our
    authority).
-   **Output**: folds into the existing SDD-006 weekly issue as a new "Recurring problems in your
    stack" section — same briefing format, same no-auto-publish rule. It is one more scored input,
    not a second pipeline.

### The intersection model (the answer to "what's worth talking about")

```
publish-worthy = search demand (GSC / SDD-006 trends)
               ∩ recurring real pain (GitHub issues, Part A)
               ∩ demonstrated first-hand experience (owner filter, Part B)
               − already-covered topics (SDD-010 inventory)
```

A topic that misses the experience axis is dropped, however hot — that axis is the moat and the
AdSense-safety valve.

## Part B — Anti-AI editorial standard (the checklist)

Purpose: every published post must read as a practitioner's account, not generated filler. Applied
by the owner during the SDD-006 editorial loop; encoded as a repo doc (e.g.
`docs/editorial-standard.md`) and referenced by the drafting prompt.

**Experience (E-E-A-T) — at least 3 of:**
-   A first-person account of doing/breaking/measuring the thing ("I hit this on…", "what I tried").
-   Real artifacts: code from the owner's own repos, a config, a benchmark, a failure story.
-   Original screenshots (terminal, DevTools, dashboard) — not stock, not redrawn.
-   Concrete versions/dates ("on Next.js 15.5, July 2026") so the post is falsifiable and current.
-   A non-obvious takeaway the docs/StackOverflow don't state.

**Voice — sounds like the owner, not a model:**
-   Direct, concise, opinionated; short paragraphs; contractions; occasional dry aside. No
    "In today's fast-paced world", no "Let's dive in", no hedging throat-clearing.
-   Spanish drafting note: primary voice is the owner's; en/gl locales hand-reviewed (never raw MT).
-   Ban the AI-tells: symmetric "Firstly/Secondly/Finally" scaffolding, "It's worth noting", empty
    conclusions that restate the intro, bulleted lists where prose is clearer, fake enthusiasm.

**Structure — problem→solution, matching the proven format (SDD-010):**
-   Title/meta are benefit-led and human (SDD-010 D1), the raw error string lives in an H2/body.
-   Lead with the symptom the reader pasted; give the fix fast; then explain the *why*; end with the
    edge cases and a real repro. ≥ 800 words original prose (SDD-006 bar).

**Provenance / honesty:**
-   AI is a drafting assistant; the owner edits and is accountable for every claim.
-   Every command/output shown must have been run — no invented terminal output (mirrors the repo's
    "no claims without evidence" rule).

## Guardrail (unchanged from SDD-006)

The engine **never publishes**. Output is a briefing. Cadence stays ~2 substantive posts/month, not
one per signal — scaled AI content is exactly what got the site flagged (SDD-003).

## Decisions

-   **D1 (recommended)** — Add the recurring-issues miner as a **new source inside the existing
    SDD-006 radar**, not a separate tool. Reuses scoring, delivery (weekly issue), tests, and the
    no-publish guarantee.
-   **D2** — Ship the editorial standard as `docs/editorial-standard.md` and wire it into the
    SDD-006 per-topic drafting prompt so every brief carries the checklist.
-   **D3** — Keep the repo set config-driven and small; expand only to repos the owner can speak to
    first-hand (the experience axis must stay satisfiable).

## Acceptance criteria (for implementation)

-   `npm run trending` gains a recurring-issues section: ≥5 scored issue-topics across the stack
    repos, deduped against existing posts, degrading gracefully on API/rate-limit failure (no
    non-zero exit), with unit tests for scoring/dedupe/noise-filtering.
-   The weekly issue shows the new section with a drafting prompt that embeds the Part B checklist.
-   `docs/editorial-standard.md` exists and is linked from the radar briefs.
-   No automated path from engine to published post (assert in tests, as SDD-006 does).

## Owner follow-ups

-   Confirm the final repo set (which stack repos you can speak to first-hand).
-   Add GSC Actions secrets (from SDD-006) so the rising-queries cross-filter is active.
