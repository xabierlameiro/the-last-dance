/**
 * What a crawler fetches pages for, as its operator documents it.
 * - `training`: collects content to train models.
 * - `search`: builds the index behind an AI search product.
 * - `user-fetch`: fetches one page because a person asked the assistant to (not a crawl).
 * - `ads`: validates ad landing pages.
 * - `dataset`: builds an open web corpus that others train on.
 */
export type AiCrawlerPurpose = 'training' | 'search' | 'user-fetch' | 'ads' | 'dataset';

export type AiCrawler = {
    /** Substring matched case-insensitively against the request's User-Agent. */
    token: string;
    operator: string;
    purpose: AiCrawlerPurpose;
};

/**
 * AI crawlers recognised by the middleware, from each operator's own documentation (read
 * 2026-09-18): developers.openai.com/api/docs/bots, support.claude.com/en/articles/8896518,
 * docs.perplexity.ai/guides/bots, commoncrawl.org/ccbot and
 * developers.facebook.com/docs/sharing/webmasters/web-crawlers.
 *
 * Deliberately absent, although public/robots.txt names them:
 * - `Google-Extended` and `Applebot-Extended` are robots.txt tokens only. Google and Apple fetch with
 *   their ordinary crawlers and never send these strings as a User-Agent, so matching on them would
 *   count nothing.
 * - `anthropic-ai` no longer appears in Anthropic's crawler list; its current bots are the three
 *   `Claude*` entries below.
 * Bytespider is not listed either: ByteDance publishes no documentation to take a purpose from.
 *
 * No token is a substring of another, so the order of the list does not change the result.
 */
export const AI_CRAWLERS: readonly AiCrawler[] = [
    { token: 'GPTBot', operator: 'OpenAI', purpose: 'training' },
    { token: 'OAI-SearchBot', operator: 'OpenAI', purpose: 'search' },
    { token: 'ChatGPT-User', operator: 'OpenAI', purpose: 'user-fetch' },
    { token: 'OAI-AdsBot', operator: 'OpenAI', purpose: 'ads' },
    { token: 'ClaudeBot', operator: 'Anthropic', purpose: 'training' },
    { token: 'Claude-SearchBot', operator: 'Anthropic', purpose: 'search' },
    { token: 'Claude-User', operator: 'Anthropic', purpose: 'user-fetch' },
    { token: 'PerplexityBot', operator: 'Perplexity', purpose: 'search' },
    { token: 'Perplexity-User', operator: 'Perplexity', purpose: 'user-fetch' },
    { token: 'meta-externalagent', operator: 'Meta', purpose: 'training' },
    { token: 'meta-externalfetcher', operator: 'Meta', purpose: 'user-fetch' },
    { token: 'CCBot', operator: 'Common Crawl', purpose: 'dataset' },
];
