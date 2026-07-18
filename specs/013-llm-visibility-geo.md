# SDD-013: LLM engine visibility (GEO)

- **Status**: Implemented 2026-07-18. One critical owner action pending (Bing Webmaster Tools).
- **Trigger**: owner decision — no syndication/distribution ("not organic"); instead, optimize for
  the engines that now answer this blog's exact query type inline: ChatGPT Search, Perplexity,
  Gemini/AI Overviews, Claude. AI engines handle an estimated 12–18% of English informational
  queries (Q1 2026), and pasted-error lookups — this blog's traffic — are the most AI-answered
  category of all. If the SERP click is dying, being the **cited source** is the remaining seat.

## Research findings (2026 — what works vs what is placebo)

**What measurably matters for being retrieved + cited:**

1. **Raw-HTML readability.** The major AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
   OAI-SearchBot) do **not** execute JavaScript — critical text must be in the server-rendered
   HTML (SSG/SSR).
2. **Bing's index feeds ChatGPT Search.** Registration in Bing Webmaster Tools + fast indexing
   (IndexNow) is the single most direct lever for ChatGPT visibility. Typical lag: 6–12 weeks
   for ChatGPT, 2–4 for Perplexity (real-time crawler, freshness-biased).
3. **Extractable structure.** Princeton GEO research + 2026 practice: quotations (+41%),
   statistics (+32%), citations (+30%), fluent declarative prose (+28%); TL;DR/Quick-answer
   blocks, Q&A sections, self-contained H2 passages, visible author + publish/update dates.
4. **Structured data** (Article, FAQPage, Person/E-E-A-T) — reinforces entity/answer mapping.

**What is mostly placebo in 2026 — implemented anyway because it costs ~zero:**

- **`llms.txt`**: measured across ~500M AI-bot visits, only ~408 requests targeted it; Google
  states it is not an input; OpenAI does not confirm using it. It IS read by IDE/agent tooling
  (Cursor, MCP retrieval flows) and occasionally Perplexity. Zero-cost bet, not a lever.

## Audit of xabierlameiro.com (2026-07-18, production)

| Check | Result |
| --- | --- |
| AI crawler UAs (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot) get 200 | ✅ nothing blocks them |
| Full article text present in raw HTML (no JS execution) | ✅ SSG serves everything |
| Article + FAQPage JSON-LD + datePublished in raw HTML | ✅ |
| Author byline + entity (Person @id, /about) | ✅ (SDD-002/004) |
| Quick-answer/TL;DR + FAQ blocks in enriched posts | ✅ (SDD-010/011 format) |
| `llms.txt` | ❌ → implemented |
| Explicit AI-crawler policy in robots.txt | ❌ → implemented |
| IndexNow → Bing | ❌ → implemented |
| Real `dateModified` on updated content | ❌ (was = datePublished) → implemented |
| Bing Webmaster Tools registration | ❌ **owner action** |

## Implemented

1. **`llms.txt` + `llms-full.txt`** generated at build (`scripts/generate-llms.mjs`, wired as
   npm `prebuild`): spec-format site map with per-post descriptions, plus the full English blog
   inlined as plain markdown (~66 KB) for agent ingestion.
2. **robots.txt**: explicit `Allow: /` sections for GPTBot, OAI-SearchBot, ChatGPT-User,
   ClaudeBot, Claude-User, Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User,
   Google-Extended, Applebot-Extended, meta-externalagent, CCBot; pointer comment to llms.txt.
3. **IndexNow** (`scripts/indexnow-ping.mjs` + `indexnow` job in `post-deploy.yml`): submits all
   sitemap URLs to api.indexnow.org after each production deploy (key file committed —
   IndexNow keys are public by design). Best-effort, never fails the pipeline.
4. **Freshness plumbing**: new optional frontmatter `updated:` → `dateModified` (Article JSON-LD),
   `article:modified_time` (OG) and sitemap `lastmod`. Applied to the 6 substantively enriched
   posts (×3 locales, 18 files).
5. **Editorial standard §5 (GEO)**: extraction-oriented writing rules (TL;DR, self-contained
   sections, stats/citations, declarative voice, `updated:` discipline).

## Owner actions (cannot be done from the repo)

1. **Register the site in Bing Webmaster Tools** and submit `sitemap.xml` — you can import the
   verified property directly from Google Search Console in one click. Without this, ChatGPT
   Search has no reliable path to the content. **This is the critical one.**
2. Optional: in Vercel dashboard, confirm the Bot/Firewall settings never enable "block AI bots".

## Honest expectations

This makes the site as citable as its content deserves — it does not manufacture demand. The
compounding loop is: SDD-011 posts (experience + data + freshness) × this plumbing × Bing
registration. Perplexity effects can show in 2–4 weeks; ChatGPT in 6–12. Measurement: watch GSC
referrers and server logs for `chatgpt.com` / `perplexity.ai` referrals and AI-crawler hits.
