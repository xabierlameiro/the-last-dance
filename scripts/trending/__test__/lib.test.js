import {
    matchKeywords,
    recencyFactor,
    scoreItem,
    normalize,
    dedupeByUrl,
    buildReport,
    isDiscussionWorthy,
} from '../lib.js';

const NOW = Date.parse('2026-07-17T12:00:00Z');

describe('trending radar lib', () => {
    it('matches profile keywords case-insensitively', () => {
        const matched = matchKeywords('Shipping a Next.js app with Claude and Playwright');
        expect(matched).toEqual(expect.arrayContaining(['next.js', 'claude', 'playwright']));
        expect(matchKeywords('Cooking recipes for summer')).toEqual([]);
    });

    it('decays recency with a 7-day half-life', () => {
        const fresh = recencyFactor('2026-07-17T11:00:00Z', NOW);
        const weekOld = recencyFactor('2026-07-10T12:00:00Z', NOW);
        expect(fresh).toBeGreaterThan(0.9);
        expect(weekOld).toBeCloseTo(0.5, 1);
        expect(recencyFactor('not-a-date', NOW)).toBe(0.5);
    });

    it('scores 0 for items outside the profile', () => {
        const { score } = scoreItem({ title: 'Best pizza in town', popularity: 5000, createdAt: '2026-07-17' }, NOW);
        expect(score).toBe(0);
    });

    it('boosts current-focus keywords over unboosted matches', () => {
        const base = { popularity: 100, createdAt: '2026-07-17T00:00:00Z' };
        const boosted = scoreItem({ ...base, title: 'Claude does something' }, NOW);
        const plain = scoreItem({ ...base, title: 'Storybook does something' }, NOW);
        expect(boosted.score).toBeGreaterThan(plain.score);
    });

    it('normalizes the four source payloads to a common shape', () => {
        const hn = normalize.hn({
            hits: [{ title: 'A', objectID: '1', points: 10, num_comments: 2, created_at: '2026-07-16T00:00:00Z' }],
        });
        expect(hn[0]).toMatchObject({
            source: 'Hacker News',
            popularity: 12,
            url: expect.stringContaining('item?id=1'),
        });

        const devto = normalize.devto([
            {
                title: 'B',
                url: 'https://dev.to/x',
                positive_reactions_count: 3,
                comments_count: 1,
                published_at: '2026-07-15T00:00:00Z',
                tag_list: ['react'],
            },
        ]);
        expect(devto[0]).toMatchObject({ source: 'dev.to', popularity: 4, tags: 'react' });

        const reddit = normalize.reddit({
            data: {
                children: [
                    {
                        data: {
                            title: 'C',
                            permalink: '/r/reactjs/1',
                            score: 7,
                            num_comments: 3,
                            created_utc: 1784200000,
                            subreddit: 'reactjs',
                        },
                    },
                ],
            },
        });
        expect(reddit[0]).toMatchObject({ source: 'r/reactjs', popularity: 10 });

        const github = normalize.github({
            items: [
                {
                    full_name: 'x/y',
                    description: 'An MCP server',
                    html_url: 'https://github.com/x/y',
                    stargazers_count: 42,
                    created_at: '2026-07-10T00:00:00Z',
                    topics: ['mcp'],
                },
            ],
        });
        expect(github[0]).toMatchObject({ source: 'GitHub (new repos)', popularity: 42, tags: 'mcp' });
    });

    it('keeps engaged issues and drops triage noise (isDiscussionWorthy)', () => {
        expect(isDiscussionWorthy({ comments: 40, reactions: { total_count: 10 } })).toBe(true);
        expect(isDiscussionWorthy({ comments: 2, reactions: { total_count: 1 } })).toBe(false);
        expect(isDiscussionWorthy({ comments: 90, labels: [{ name: 'duplicate' }] })).toBe(false);
        expect(isDiscussionWorthy({ comments: 20, labels: ['bug'] })).toBe(true);
    });

    it('normalizes GitHub issues, keying recency off updated_at and filtering noise', () => {
        const issues = normalize.githubIssues({
            items: [
                {
                    title: 'Development high memory usage',
                    html_url: 'https://github.com/vercel/next.js/issues/1',
                    repository_url: 'https://api.github.com/repos/vercel/next.js',
                    comments: 176,
                    reactions: { total_count: 149 },
                    created_at: '2022-01-01T00:00:00Z',
                    updated_at: '2026-07-16T00:00:00Z',
                    labels: [{ name: 'bug' }],
                },
                { title: 'noise', comments: 1, reactions: { total_count: 0 } },
            ],
        });
        expect(issues).toHaveLength(1);
        expect(issues[0]).toMatchObject({
            source: 'GitHub issue',
            title: 'vercel/next.js: Development high memory usage',
            popularity: 325,
            createdAt: '2026-07-16T00:00:00Z',
        });
        expect(issues[0].tags).toContain('vercel/next.js');
    });

    it('dedupes by url keeping the highest score', () => {
        const result = dedupeByUrl([
            { url: 'https://a', score: 1 },
            { url: 'https://a', score: 3 },
            { url: 'https://b', score: 2 },
        ]);
        expect(result).toHaveLength(2);
        expect(result.find(({ url }) => url === 'https://a')?.score).toBe(3);
    });

    it('builds a report with topics, prompts and optional sections', () => {
        const report = buildReport(
            [
                {
                    title: 'Next.js 16 released',
                    url: 'https://example.com/next16',
                    source: 'Hacker News',
                    evidence: '500 points, 300 comments',
                    score: 12.34,
                    matched: ['nextjs'],
                },
            ],
            {
                generatedAt: '2026-07-17',
                risingQueries: [{ query: 'claude mcp', delta: 40, impressions: 55 }],
                recentRepos: [
                    { name: 'the-last-dance', url: 'https://github.com/x/y', pushedAt: '2026-07-17T00:00:00Z' },
                ],
            }
        );
        expect(report).toContain('# Trending content radar — 2026-07-17');
        expect(report).toContain('### 1. Next.js 16 released');
        expect(report).toContain('Claude drafting prompt');
        expect(report).toContain('`claude mcp` — +40 impressions (now 55)');
        expect(report).toContain('[the-last-dance](https://github.com/x/y)');
        expect(report).toContain('NOT content to publish');
    });
});
