# Editorial standard — how posts get written here (SDD-011)

This is the bar every post on xabierlameiro.com must clear. AI (Claude) is a **drafting
assistant**; the owner edits every draft and is accountable for every claim. The goal is
content that reads as a practitioner's account, not generated filler — because Google flagged
this site for _low value content_ and its spam policy targets scaled AI content with little
added value (see SDD-003).

Use this as a checklist during the SDD-006 editorial loop. The trending/issue radar briefs link
here, and their drafting prompt embeds it.

## 1. Experience (E-E-A-T) — include at least 3

- [ ] A first-person account of doing / breaking / measuring the thing ("I hit this on…", "what I tried").
- [ ] Real artifacts: code from the owner's own repos, a config, a benchmark, a failure story.
- [ ] Original screenshots (terminal, DevTools, dashboard) — not stock, not redrawn. If none are
      available, use an **original diagram/figure** (e.g. an SVG rasterized via
      `scripts/generate-post-posters.mjs` / a hand-authored SVG), never a faked screenshot.
- [ ] Concrete versions and dates ("on Next.js 15.5, July 2026") so the post is falsifiable and current.
- [ ] A non-obvious takeaway the official docs or StackOverflow don't state.

## 2. Voice — sounds like the owner, not a model

- Direct, concise, opinionated. Short paragraphs, contractions, the occasional dry aside.
- **Ban the AI tells:** "In today's fast-paced world", "Let's dive in", "It's worth noting",
  symmetric "Firstly / Secondly / Finally" scaffolding, empty conclusions that restate the intro,
  fake enthusiasm, and bulleted lists where prose is clearer.
- Spanish is the primary drafting voice; **en** and **gl** locales are hand-reviewed, never raw
  machine translation. Galician especially needs a native pass.
- Keep product names correct (Storybook, not "libro de contos"); fix typos before shipping.

## 3. Structure — problem → solution (the format that already ranks)

- Title and meta description are **benefit-led and human** (SDD-010): the raw error string lives in
  an H2 or the body, not the title. Title ≈ 60 chars, description ≈ 155, distinct from the excerpt.
- Lead with the symptom the reader pasted → give the fix fast → then explain the _why_ → end with
  edge cases and a real repro.
- ≥ 800 words of original prose (beyond code). Add a `faq:` block for rich results when it fits.
- No page headings rely on auto-generated anchor IDs (this MDX pipeline has no `rehype-slug`) — refer
  to sections by name, not `#fragment` links.

## 4. Provenance & honesty

- Every command and its output shown must have actually been run — **no invented terminal output**.
- AI drafts; the owner verifies and owns every claim. If the owner can't stand behind a first-hand
  statement, cut it rather than inventing one.
- Cite external sources; keep quotes short and attributed.

## 5. GEO — write so LLM engines can cite you (SDD-013)

AI answer engines (ChatGPT Search, Perplexity, Gemini, Claude) now answer a meaningful share of
the exact error/how-to queries this blog targets. They extract and cite **self-contained
passages**, so structure for extraction (research-measured lifts: quotations ≈ +41%, statistics
≈ +32%, citations ≈ +30% visibility in generative engines):

- Open with a **"Quick answer" / TL;DR block** that fully answers the query in 2–4 sentences —
  extractable without the rest of the page.
- Each H2 section should stand alone: state the claim, then the evidence. Declarative sentences;
  avoid "I think / we believe" filler around factual statements (keep first-person for the
  *experience* parts, which is what differentiates us).
- Include **concrete numbers, versions and dates**, and cite external sources by name/link —
  cited passages get picked.
- Keep the `faq:` block — Q&A pairs map 1:1 to how these engines retrieve.
- On substantive updates, set **`updated: 'YYYY-MM-DD'`** in the frontmatter — it feeds
  `dateModified`, `article:modified_time` and the sitemap `lastmod` (freshness matters,
  especially for Perplexity).

## 6. Cadence (unchanged from SDD-006)

- ~2 substantive posts per month — **not** one per radar signal. Depth over volume is what removes
  the low-value signal.
- The radar and the recurring-issues source (SDD-011) never auto-publish; their output is a briefing.

---

### Reviewer checklist (paste into the PR)

```
[ ] ≥3 E-E-A-T signals present (first-hand / artifact / original figure / versions / non-obvious takeaway)
[ ] No AI-tell phrases; reads in the owner's voice
[ ] en/es/gl all hand-reviewed (gl by a native pass)
[ ] Benefit-led title + distinct meta description; error string in-body
[ ] ≥800 words original prose; problem→solution order; real repro
[ ] Every shown command/output was actually run; claims are owner-verified
```
