import { AI_CRAWLERS } from '@/constants/aiCrawlers';
import {
    AI_CRAWLER_HIT_EVENT,
    buildCrawlerHitPayload,
    findAiCrawler,
    readCrawlerAnalyticsConfig,
    sendCrawlerHit,
} from '../aiCrawler';

// Full User-Agent strings as the operators publish them, not bare tokens: the match has to work
// inside the real header.
const USER_AGENTS = {
    GPTBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    'OAI-SearchBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
    'ChatGPT-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    'OAI-AdsBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-AdsBot/1.0; +https://openai.com/adsbot',
    ClaudeBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'Claude-SearchBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)',
    'Claude-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)',
    PerplexityBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    'Perplexity-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)',
    'meta-externalagent': 'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'meta-externalfetcher': 'meta-externalfetcher/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    CCBot: 'CCBot/2.0 (https://commoncrawl.org/faq/)',
} as const;

const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const CONFIG = { measurementId: 'G-TEST123', apiSecret: 'secret' };

describe('findAiCrawler', () => {
    it.each(Object.entries(USER_AGENTS))('recognises %s inside its published User-Agent', (token, userAgent) => {
        expect(findAiCrawler(userAgent)?.token).toBe(token);
    });

    it('covers every crawler in the table', () => {
        expect(Object.keys(USER_AGENTS).sort()).toEqual(AI_CRAWLERS.map((crawler) => crawler.token).sort());
    });

    it('matches regardless of case', () => {
        expect(findAiCrawler('mozilla/5.0 (compatible; gptbot/1.2)')?.token).toBe('GPTBot');
    });

    it('ignores browsers, search engines and missing headers', () => {
        expect(findAiCrawler(CHROME)).toBeUndefined();
        expect(findAiCrawler(GOOGLEBOT)).toBeUndefined();
        expect(findAiCrawler('')).toBeUndefined();
        expect(findAiCrawler(null)).toBeUndefined();
        expect(findAiCrawler(undefined)).toBeUndefined();
    });

    it('keeps tokens independent, so list order cannot change a result', () => {
        const tokens = AI_CRAWLERS.map((crawler) => crawler.token.toLowerCase());
        tokens.forEach((token, index) => {
            tokens
                .filter((_, otherIndex) => otherIndex !== index)
                .forEach((other) => expect(other.includes(token)).toBe(false));
        });
    });

    it('does not recognise robots.txt-only tokens as user agents', () => {
        expect(findAiCrawler('Google-Extended')).toBeUndefined();
        expect(findAiCrawler('Applebot-Extended')).toBeUndefined();
    });
});

describe('readCrawlerAnalyticsConfig', () => {
    it('returns the settings when both are valid', () => {
        expect(
            readCrawlerAnalyticsConfig({ GA_CRAWLER_MEASUREMENT_ID: 'G-ABC123', GA_CRAWLER_API_SECRET: 'xyz' })
        ).toEqual({ measurementId: 'G-ABC123', apiSecret: 'xyz' });
    });

    it('returns undefined when either is missing or malformed', () => {
        expect(readCrawlerAnalyticsConfig({})).toBeUndefined();
        expect(readCrawlerAnalyticsConfig({ GA_CRAWLER_MEASUREMENT_ID: 'G-ABC123' })).toBeUndefined();
        expect(
            readCrawlerAnalyticsConfig({ GA_CRAWLER_MEASUREMENT_ID: 'UA-123-1', GA_CRAWLER_API_SECRET: 'xyz' })
        ).toBeUndefined();
        expect(
            readCrawlerAnalyticsConfig({ GA_CRAWLER_MEASUREMENT_ID: 'G-ABC123', GA_CRAWLER_API_SECRET: '' })
        ).toBeUndefined();
    });
});

describe('buildCrawlerHitPayload', () => {
    const claudeBot = AI_CRAWLERS.find((crawler) => crawler.token === 'ClaudeBot')!;

    it('names the bot, its operator, purpose and path, with a fixed client id per bot', () => {
        expect(buildCrawlerHitPayload(claudeBot, '/llms.txt')).toEqual({
            client_id: 'ai-crawler.claudebot',
            events: [
                {
                    name: AI_CRAWLER_HIT_EVENT,
                    params: { bot: 'ClaudeBot', operator: 'Anthropic', purpose: 'training', path: '/llms.txt' },
                },
            ],
        });
    });

    it('cuts the path at the 100 characters GA4 keeps', () => {
        const longPath = `/blog/${'a'.repeat(200)}`;
        expect(buildCrawlerHitPayload(claudeBot, longPath).events[0].params.path).toHaveLength(100);
    });
});

describe('sendCrawlerHit', () => {
    const payload = buildCrawlerHitPayload(AI_CRAWLERS[0], '/');
    let warn: jest.SpyInstance;

    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => warn.mockRestore());

    it('posts the payload to the Measurement Protocol with the stream credentials', async () => {
        const fetchMock = jest.fn().mockResolvedValue(new Response(null, { status: 204 }));

        await expect(sendCrawlerHit(payload, CONFIG, fetchMock)).resolves.toBe(true);

        const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
        expect(url.origin + url.pathname).toBe('https://www.google-analytics.com/mp/collect');
        expect(url.searchParams.get('measurement_id')).toBe('G-TEST123');
        expect(url.searchParams.get('api_secret')).toBe('secret');
        expect(init.method).toBe('POST');
        expect(JSON.parse(init.body as string)).toEqual(payload);
        expect(warn).not.toHaveBeenCalled();
    });

    it('resolves false and warns when GA4 rejects the request', async () => {
        const fetchMock = jest.fn().mockResolvedValue(new Response(null, { status: 500 }));

        await expect(sendCrawlerHit(payload, CONFIG, fetchMock)).resolves.toBe(false);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('500'));
    });

    it('resolves false instead of throwing when the network fails', async () => {
        const fetchMock = jest.fn().mockRejectedValue(new Error('ECONNRESET'));

        await expect(sendCrawlerHit(payload, CONFIG, fetchMock)).resolves.toBe(false);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('ECONNRESET'));
    });
});
