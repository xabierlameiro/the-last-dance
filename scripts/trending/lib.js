// Pure logic for the trending content radar (SDD-006). No network calls here —
// everything is unit-testable with fixtures.

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

/**
 * @description Case-insensitive profile-keyword matching against a text.
 * @param {string} text - Text to scan (usually title + tags)
 * @param {string[]} keywords - Keyword list
 * @returns {string[]} - Matched keywords (unique, original casing from the list)
 */
export const matchKeywords = (text, keywords = PROFILE.keywords) => {
    const haystack = (text || '').toLowerCase();
    return keywords.filter((keyword) => haystack.includes(keyword.toLowerCase()));
};

/**
 * @description Exponential recency decay with a 7-day half-life.
 * @param {string} createdAt - ISO date of the item
 * @param {number} now - Reference timestamp (ms)
 * @returns {number} - Factor in (0, 1]
 */
export const recencyFactor = (createdAt, now, halfLifeDays = 7) => {
    const created = Date.parse(createdAt);
    if (Number.isNaN(created)) return 0.5;
    const ageDays = Math.max(0, (now - created) / 86_400_000);
    return 2 ** (-ageDays / halfLifeDays);
};

/**
 * @description Score one normalized item: popularity × keyword affinity × recency.
 * Items without profile matches score 0 and are dropped by the caller.
 * @param {{title: string, tags?: string, popularity: number, createdAt: string}} item
 * @param {number} now - Reference timestamp (ms)
 * @returns {{score: number, matched: string[]}}
 */
export const scoreItem = (item, now) => {
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

/**
 * @description Keep only GitHub issues worth writing about (SDD-011): real, engaged
 * discussions, not triage noise. Drops junk-labelled issues and low-engagement ones.
 * @param {{comments?: number, reactions?: {total_count?: number}, labels?: Array}} issue
 * @returns {boolean}
 */
export const isDiscussionWorthy = (issue) => {
    const labels = (issue?.labels ?? []).map((label) =>
        (typeof label === 'string' ? label : label?.name ?? '').toLowerCase()
    );
    if (labels.some((label) => JUNK_ISSUE_LABELS.has(label))) return false;
    const engagement = (issue?.comments ?? 0) + (issue?.reactions?.total_count ?? 0);
    return engagement >= MIN_ISSUE_ENGAGEMENT;
};

/** @description Normalizers: raw API payload → {title, url, source, evidence, popularity, createdAt, tags} */
export const normalize = {
    hn: (json) =>
        (json?.hits ?? []).map((hit) => ({
            title: hit.title ?? '',
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            source: 'Hacker News',
            evidence: `${hit.points ?? 0} points, ${hit.num_comments ?? 0} comments`,
            popularity: (hit.points ?? 0) + (hit.num_comments ?? 0),
            createdAt: hit.created_at,
            tags: (hit._tags ?? []).join(' '),
        })),
    devto: (json) =>
        (Array.isArray(json) ? json : []).map((article) => ({
            title: article.title ?? '',
            url: article.url ?? '',
            source: 'dev.to',
            evidence: `${article.positive_reactions_count ?? 0} reactions, ${article.comments_count ?? 0} comments`,
            popularity: (article.positive_reactions_count ?? 0) + (article.comments_count ?? 0),
            createdAt: article.published_at,
            tags: (article.tag_list ?? []).join(' '),
        })),
    reddit: (json) =>
        (json?.data?.children ?? []).map(({ data }) => ({
            title: data.title ?? '',
            url: `https://www.reddit.com${data.permalink ?? ''}`,
            source: `r/${data.subreddit}`,
            evidence: `${data.score ?? 0} upvotes, ${data.num_comments ?? 0} comments`,
            popularity: (data.score ?? 0) + (data.num_comments ?? 0),
            createdAt: new Date((data.created_utc ?? 0) * 1000).toISOString(),
            tags: data.subreddit ?? '',
        })),
    github: (json) =>
        (json?.items ?? []).map((repo) => ({
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
    githubIssues: (json) =>
        (json?.items ?? []).filter(isDiscussionWorthy).map((issue) => {
            const repo = (issue.repository_url ?? '').split('/repos/')[1] ?? '';
            const reactions = issue.reactions?.total_count ?? 0;
            const labels = (issue.labels ?? []).map((label) => (typeof label === 'string' ? label : label?.name ?? ''));
            return {
                title: repo ? `${repo}: ${issue.title ?? ''}`.trim() : issue.title ?? '',
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
 * @param {Array<{url: string, score: number}>} items
 */
export const dedupeByUrl = (items) => {
    const byUrl = new Map();
    for (const item of items) {
        const existing = byUrl.get(item.url);
        if (!existing || item.score > existing.score) byUrl.set(item.url, item);
    }
    return [...byUrl.values()];
};

const claudePrompt = (topic) =>
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

/**
 * @description Build the weekly markdown report from scored topics.
 * @param {Array} topics - Scored, sorted, deduped items
 * @param {{generatedAt: string, risingQueries?: Array<{query: string, delta: number, impressions: number}>, recentRepos?: Array<{name: string, url: string, pushedAt: string}>}} context
 * @returns {string} - Markdown report
 */
export const buildReport = (topics, { generatedAt, risingQueries = [], recentRepos = [] }) => {
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
            ''
        );
    });

    if (risingQueries.length > 0) {
        lines.push('## Rising queries on your own GSC (28d vs previous 28d)', '');
        risingQueries.forEach(({ query, delta, impressions }) =>
            lines.push(`- \`${query}\` — +${delta} impressions (now ${impressions})`)
        );
        lines.push('');
    }

    if (recentRepos.length > 0) {
        lines.push('## Your recently pushed repos (angle material)', '');
        recentRepos.forEach(({ name, url, pushedAt }) =>
            lines.push(`- [${name}](${url}) — last push ${pushedAt?.slice(0, 10)}`)
        );
        lines.push('');
    }

    return lines.join('\n');
};
