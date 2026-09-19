import { z } from 'zod';
import { AI_CRAWLERS, type AiCrawler } from '@/constants/aiCrawlers';

const MEASUREMENT_PROTOCOL_URL = 'https://www.google-analytics.com/mp/collect';
// GA4 truncates event parameter values past 100 characters; cutting here keeps the stored value
// predictable instead of leaving it to GA4.
const MAX_PARAM_LENGTH = 100;
// The send runs after the response is handed back (waitUntil), so this bounds how long the edge
// function stays alive for a slow GA4, not how long the crawler waits.
const SEND_TIMEOUT_MS = 2000;

export const AI_CRAWLER_HIT_EVENT = 'ai_crawler_hit';

export type CrawlerAnalyticsConfig = {
    measurementId: string;
    apiSecret: string;
};

export type CrawlerHitPayload = {
    client_id: string;
    events: [
        {
            name: typeof AI_CRAWLER_HIT_EVENT;
            params: { bot: string; operator: string; purpose: string; path: string };
        },
    ];
};

const crawlerAnalyticsEnvSchema = z.object({
    GA_CRAWLER_MEASUREMENT_ID: z.string().regex(/^G-[A-Z0-9]+$/),
    GA_CRAWLER_API_SECRET: z.string().min(1),
});

/**
 * @description The documented AI crawler whose token appears in the User-Agent, if any.
 * Matching is case-insensitive because operators are not consistent about casing across versions.
 */
export const findAiCrawler = (userAgent: string | null | undefined): AiCrawler | undefined => {
    if (!userAgent) return undefined;
    const normalizedUserAgent = userAgent.toLowerCase();
    return AI_CRAWLERS.find((crawler) => normalizedUserAgent.includes(crawler.token.toLowerCase()));
};

/**
 * @description Crawler telemetry settings, or `undefined` when they are missing or malformed.
 * Missing settings disable sending; they are not an error, because previews and local builds run
 * without them.
 */
export const readCrawlerAnalyticsConfig = (
    env: Record<string, string | undefined>
): CrawlerAnalyticsConfig | undefined => {
    const parsed = crawlerAnalyticsEnvSchema.safeParse(env);
    if (!parsed.success) return undefined;
    return {
        measurementId: parsed.data.GA_CRAWLER_MEASUREMENT_ID,
        apiSecret: parsed.data.GA_CRAWLER_API_SECRET,
    };
};

/**
 * @description One Measurement Protocol event for one crawler request.
 * `client_id` is fixed per bot, so GA4 counts each bot as one "user" and no visitor identifier is
 * ever involved.
 */
export const buildCrawlerHitPayload = (crawler: AiCrawler, path: string): CrawlerHitPayload => ({
    client_id: `ai-crawler.${crawler.token.toLowerCase()}`,
    events: [
        {
            name: AI_CRAWLER_HIT_EVENT,
            params: {
                bot: crawler.token,
                operator: crawler.operator,
                purpose: crawler.purpose,
                path: path.slice(0, MAX_PARAM_LENGTH),
            },
        },
    ],
});

/**
 * @description Send one crawler hit to GA4. Never throws: a telemetry failure must not reach the
 * response the crawler receives.
 * @returns `true` when GA4 accepted the request.
 */
export const sendCrawlerHit = async (
    payload: CrawlerHitPayload,
    config: CrawlerAnalyticsConfig,
    fetchImplementation: typeof fetch = fetch
): Promise<boolean> => {
    const url = new URL(MEASUREMENT_PROTOCOL_URL);
    url.searchParams.set('measurement_id', config.measurementId);
    url.searchParams.set('api_secret', config.apiSecret);

    try {
        const response = await fetchImplementation(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        });
        if (!response.ok) {
            console.warn(`[ai-crawler] GA4 rejected the hit for ${payload.events[0].params.bot}: ${response.status}`);
        }
        return response.ok;
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        console.warn(`[ai-crawler] could not send the hit for ${payload.events[0].params.bot}: ${reason}`);
        return false;
    }
};
