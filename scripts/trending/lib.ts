// Pure logic for the trending content radar (SDD-006). No network calls here —
// everything is unit-testable with fixtures.
//
// SDD-L11-T2: raw source payloads are validated with zod/mini before normalizing.
// What `??` used to absorb silently is now an explicit contract: fields the
// normalizers default are optional/nullable, but the envelope (hits/items/
// data.children) is required — a malformed payload throws one line naming the
// source and field instead of yielding a silently thinner radar.
// Runs under Node's type stripping: relative imports carry explicit `.ts` extensions.
import * as z from 'zod/mini';
import { describeIssues } from '../../src/types/schemas.ts';

export const PROFILE = {
    // Keywords that define the owner's editorial profile. Matching is case-insensitive.
    keywords: [
        'react',
        'nextjs',
        'next.js',
        'typescript',
        'javascript',
        'node',
        'testing',
        'jest',
        'vitest',
        'playwright',
        'storybook',
        'vercel',
        'seo',
        'lighthouse',
        'accessibility',
        'automation',
        'github actions',
        'iot',
        'home assistant',
        'ai',
        'llm',
        'claude',
        'mcp',
        'agents',
        'copilot',
    ],
    // Current professional focus — these topics rank higher when matched.
    boosted: ['claude', 'mcp', 'ai', 'llm', 'agents', 'nextjs', 'next.js'],
    boostFactor: 1.5,
};

/** The common shape every source is normalized into before scoring. */
export type NormalizedItem = {
    title: string;
    url: string;
    source: string;
    evidence: string;
    popularity: number;
    createdAt: string | undefined;
    tags: string;
};

/** The subset `scoreItem` actually reads — callers may pass richer objects. */
export type ScoreInput = {
    title: string;
    tags?: string | undefined;
    popularity: number;
    createdAt?: string | undefined;
};

/**
 * @description Case-insensitive profile-keyword matching against a text.
 * @param text - Text to scan (usually title + tags)
 * @param keywords - Keyword list
 * @returns Matched keywords (unique, original casing from the list)
 */
export const matchKeywords = (text: string, keywords: string[] = PROFILE.keywords): string[] => {
    const haystack = (text || '').toLowerCase();
    return keywords.filter((keyword) => haystack.includes(keyword.toLowerCase()));
};

/**
 * @description Exponential recency decay with a 7-day half-life.
 * @param createdAt - ISO date of the item (sources may omit it — decays to the 0.5 neutral factor)
 * @param now - Reference timestamp (ms)
 * @returns Factor in (0, 1]
 */
export const recencyFactor = (createdAt: string | undefined, now: number, halfLifeDays = 7): number => {
    const created = Date.parse(createdAt ?? '');
    if (Number.isNaN(created)) return 0.5;
    const ageDays = Math.max(0, (now - created) / 86_400_000);
    return 2 ** (-ageDays / halfLifeDays);
};

/**
 * @description Score one normalized item: popularity × keyword affinity × recency.
 * Items without profile matches score 0 and are dropped by the caller.
 * @param item - Normalized item (or any object carrying the scored fields)
 * @param now - Reference timestamp (ms)
 */
export const scoreItem = (item: ScoreInput, now: number): { score: number; matched: string[] } => {
    const matched = matchKeywords(`${item.title} ${item.tags ?? ''}`);
    if (matched.length === 0) return { score: 0, matched };
    const hasBoost = matched.some((keyword) => PROFILE.boosted.includes(keyword.toLowerCase()));
    const affinity = (1 + matched.length) * (hasBoost ? PROFILE.boostFactor : 1);
    // log10 keeps a 5000-point HN thread from drowning every other source
    const popularity = Math.log10(1 + Math.max(0, item.popularity));
    return { score: popularity * affinity * recencyFactor(item.createdAt, now), matched };
};

// Labels that mark an issue as triage noise rather than a topic worth writing about.
const JUNK_ISSUE_LABELS = new Set(['duplicate', 'invalid', 'wontfix', 'spam', 'stale']);
const MIN_ISSUE_ENGAGEMENT = 15;

const githubLabelSchema = z.union([z.string(), z.object({ name: z.optional(z.nullable(z.string())) })]);

const githubIssueSchema = z.object({
    title: z.optional(z.nullable(z.string())),
    html_url: z.optional(z.nullable(z.string())),
    repository_url: z.optional(z.nullable(z.string())),
    comments: z.optional(z.nullable(z.number())),
    reactions: z.optional(z.nullable(z.object({ total_count: z.optional(z.nullable(z.number())) }))),
    labels: z.optional(z.array(githubLabelSchema)),
    created_at: z.optional(z.string()),
    updated_at: z.optional(z.string()),
});

export type GithubIssue = z.infer<typeof githubIssueSchema>;

/**
 * @description Keep only GitHub issues worth writing about (SDD-011): real, engaged
 * discussions, not triage noise. Drops junk-labelled issues and low-engagement ones.
 */
export const isDiscussionWorthy = (issue: GithubIssue): boolean => {
    const labels = (issue?.labels ?? []).map((label) =>
        (typeof label === 'string' ? label : (label?.name ?? '')).toLowerCase(),
    );
    if (labels.some((label) => JUNK_ISSUE_LABELS.has(label))) return false;
    const engagement = (issue?.comments ?? 0) + (issue?.reactions?.total_count ?? 0);
    return engagement >= MIN_ISSUE_ENGAGEMENT;
};

const hnHitSchema = z.object({
    title: z.optional(z.nullable(z.string())),
    url: z.optional(z.nullable(z.string())),
    objectID: z.optional(z.union([z.string(), z.number()])),
    points: z.optional(z.nullable(z.number())),
    num_comments: z.optional(z.nullable(z.number())),
    created_at: z.optional(z.string()),
    _tags: z.optional(z.array(z.string())),
});
const hnPayloadSchema = z.object({ hits: z.array(hnHitSchema) });

const devtoArticleSchema = z.object({
    title: z.optional(z.nullable(z.string())),
    url: z.optional(z.nullable(z.string())),
    positive_reactions_count: z.optional(z.nullable(z.number())),
    comments_count: z.optional(z.nullable(z.number())),
    published_at: z.optional(z.string()),
    tag_list: z.optional(z.array(z.string())),
});
const devtoPayloadSchema = z.array(devtoArticleSchema);

const redditPostSchema = z.object({
    title: z.optional(z.nullable(z.string())),
    permalink: z.optional(z.nullable(z.string())),
    score: z.optional(z.nullable(z.number())),
    num_comments: z.optional(z.nullable(z.number())),
    created_utc: z.optional(z.nullable(z.number())),
    subreddit: z.optional(z.nullable(z.string())),
});
const redditPayloadSchema = z.object({
    data: z.object({ children: z.array(z.object({ data: redditPostSchema })) }),
});

const githubRepoSchema = z.object({
    full_name: z.string(),
    description: z.optional(z.nullable(z.string())),
    html_url: z.optional(z.nullable(z.string())),
    stargazers_count: z.optional(z.nullable(z.number())),
    created_at: z.optional(z.string()),
    topics: z.optional(z.array(z.string())),
});
const githubPayloadSchema = z.object({ items: z.array(githubRepoSchema) });

const githubIssuesPayloadSchema = z.object({ items: z.array(githubIssueSchema) });

/**
 * @description Validate a raw source payload before normalizing. The thrown message names
 * the source and the offending field (`hn payload invalid: hits.0.points expected number`),
 * so `runCollector`'s stderr line says what actually broke.
 */
const parsePayload = <Schema extends z.ZodMiniType>(
    schema: Schema,
    source: string,
    payload: unknown,
): z.infer<Schema> => {
    const result = schema.safeParse(payload);
    if (!result.success) throw new Error(`${source} payload invalid: ${describeIssues(result.error.issues)}`);
    return result.data;
};

/** @description Normalizers: raw API payload → validated `NormalizedItem[]` */
export const normalize = {
    hn: (json: unknown): NormalizedItem[] =>
        parsePayload(hnPayloadSchema, 'hn', json).hits.map((hit) => ({
            title: hit.title ?? '',
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            source: 'Hacker News',
            evidence: `${hit.points ?? 0} points, ${hit.num_comments ?? 0} comments`,
            popularity: (hit.points ?? 0) + (hit.num_comments ?? 0),
            createdAt: hit.created_at,
            tags: (hit._tags ?? []).join(' '),
        })),
    devto: (json: unknown): NormalizedItem[] =>
        parsePayload(devtoPayloadSchema, 'devto', json).map((article) => ({
            title: article.title ?? '',
            url: article.url ?? '',
            source: 'dev.to',
            evidence: `${article.positive_reactions_count ?? 0} reactions, ${article.comments_count ?? 0} comments`,
            popularity: (article.positive_reactions_count ?? 0) + (article.comments_count ?? 0),
            createdAt: article.published_at,
            tags: (article.tag_list ?? []).join(' '),
        })),
    reddit: (json: unknown): NormalizedItem[] =>
        parsePayload(redditPayloadSchema, 'reddit', json).data.children.map(({ data }) => ({
            title: data.title ?? '',
            url: `https://www.reddit.com${data.permalink ?? ''}`,
            source: `r/${data.subreddit}`,
            evidence: `${data.score ?? 0} upvotes, ${data.num_comments ?? 0} comments`,
            popularity: (data.score ?? 0) + (data.num_comments ?? 0),
            createdAt: new Date((data.created_utc ?? 0) * 1000).toISOString(),
            tags: data.subreddit ?? '',
        })),
    github: (json: unknown): NormalizedItem[] =>
        parsePayload(githubPayloadSchema, 'github', json).items.map((repo) => ({
            title: `${repo.full_name}: ${repo.description ?? ''}`.trim(),
            url: repo.html_url ?? '',
            source: 'GitHub (new repos)',
            evidence: `${repo.stargazers_count ?? 0} stars since ${repo.created_at?.slice(0, 10)}`,
            popularity: repo.stargazers_count ?? 0,
            createdAt: repo.created_at,
            tags: (repo.topics ?? []).join(' '),
        })),
    // Recurring/evergreen developer pain in the stack's own repos (SDD-011). Recency is
    // keyed off `updated_at`, not `created_at`: a valuable recurring issue is old but
    // still active, and a 7-day decay on its creation date would wrongly drop it.
    githubIssues: (json: unknown): NormalizedItem[] =>
        parsePayload(githubIssuesPayloadSchema, 'githubIssues', json)
            .items.filter(isDiscussionWorthy)
            .map((issue) => {
                const repo = (issue.repository_url ?? '').split('/repos/')[1] ?? '';
                const reactions = issue.reactions?.total_count ?? 0;
                const labels = (issue.labels ?? []).map((label) =>
                    typeof label === 'string' ? label : (label?.name ?? ''),
                );
                return {
                    title: repo ? `${repo}: ${issue.title ?? ''}`.trim() : (issue.title ?? ''),
                    url: issue.html_url ?? '',
                    source: 'GitHub issue',
                    evidence: `${issue.comments ?? 0} comments, ${reactions} reactions`,
                    popularity: (issue.comments ?? 0) + reactions,
                    createdAt: issue.updated_at ?? issue.created_at,
                    tags: `${repo} ${labels.join(' ')}`.trim(),
                };
            }),
};

/**
 * @description Deduplicate items by URL, keeping the highest-scored occurrence.
 */
export const dedupeByUrl = <T extends { url: string; score: number }>(items: T[]): T[] => {
    const byUrl = new Map<string, T>();
    for (const item of items) {
        const existing = byUrl.get(item.url);
        if (!existing || item.score > existing.score) byUrl.set(item.url, item);
    }
    return [...byUrl.values()];
};

const claudePrompt = (topic: { title: string; url: string }): string =>
    [
        'Contexto: soy Xabier Lameiro, arquitecto de software (banca y retail: CaixaBank, Openbank, Inditex),',
        'stack React/Next.js/TypeScript, y escribo en xabierlameiro.com (en/es/gl).',
        `Tema trending: "${topic.title}" (${topic.url}).`,
        'Escribe un BORRADOR de post (800+ palabras de prosa, además del código) que aporte valor real:',
        '1) qué está pasando y por qué importa, 2) MI experiencia de primera mano con esto (pídeme los',
        'detalles concretos que necesites: proyectos, métricas, errores), 3) ejemplo práctico reproducible,',
        '4) conclusión con opinión. Prohibido el relleno genérico que cualquier blog podría publicar.',
        'Sigue el estándar editorial del repo (docs/editorial-standard.md): E-E-A-T con experiencia',
        'de primera mano, mi voz (sin muletillas de IA), estructura problema→solución y título/meta',
        'benefit-led. No inventes salidas de terminal ni capturas.',
        'No lo publiques: es un borrador para que yo lo revise y lo traduzca a los tres idiomas.',
    ].join(' ');

/** The subset `buildReport` reads per topic — scored items carry more. */
export type ReportTopic = {
    title: string;
    url: string;
    source: string;
    evidence: string;
    score: number;
    matched: string[];
};

export type ReportContext = {
    generatedAt: string;
    risingQueries?: { query: string; delta: number; impressions: number }[];
    recentRepos?: { name: string; url: string; pushedAt: string | undefined }[];
};

/**
 * @description Build the weekly markdown report from scored topics.
 * @param topics - Scored, sorted, deduped items
 * @param context - Generation date plus the optional GSC/repos sections
 * @returns Markdown report
 */
export const buildReport = (
    topics: ReportTopic[],
    { generatedAt, risingQueries = [], recentRepos = [] }: ReportContext,
): string => {
    const lines = [
        `# Trending content radar — ${generatedAt}`,
        '',
        '> SDD-006: this is a briefing, NOT content to publish. Pick at most one topic,',
        '> draft it with Claude using the prompt, add first-hand experience, review all locales.',
        '',
        `## Top topics (${topics.length})`,
        '',
    ];

    topics.forEach((topic, index) => {
        lines.push(
            `### ${index + 1}. ${topic.title}`,
            '',
            `- **Source**: ${topic.source} — ${topic.evidence} — ${topic.url}`,
            `- **Matched profile keywords**: ${topic.matched.join(', ')}`,
            `- **Score**: ${topic.score.toFixed(2)}`,
            `- **Angle**: connect it to production experience (banking/retail) or a recent repo below.`,
            '',
            '<details><summary>Claude drafting prompt</summary>',
            '',
            '```text',
            claudePrompt(topic),
            '```',
            '',
            '</details>',
            '',
        );
    });

    if (risingQueries.length > 0) {
        lines.push('## Rising queries on your own GSC (28d vs previous 28d)', '');
        risingQueries.forEach(({ query, delta, impressions }) =>
            lines.push(`- \`${query}\` — +${delta} impressions (now ${impressions})`),
        );
        lines.push('');
    }

    if (recentRepos.length > 0) {
        lines.push('## Your recently pushed repos (angle material)', '');
        recentRepos.forEach(({ name, url, pushedAt }) =>
            lines.push(`- [${name}](${url}) — last push ${pushedAt?.slice(0, 10)}`),
        );
        lines.push('');
    }

    return lines.join('\n');
};
