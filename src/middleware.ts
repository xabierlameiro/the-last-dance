import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import {
    buildCrawlerHitPayload,
    findAiCrawler,
    readCrawlerAnalyticsConfig,
    sendCrawlerHit,
} from '@/helpers/aiCrawler';

// Once per isolate, not once per request: a missing secret on a preview would otherwise print a
// line for every crawler hit.
let hasWarnedMissingConfig = false;

/**
 * @description The path as the crawler requested it. With Pages Router i18n, `nextUrl.pathname`
 * has the locale stripped, so it is put back for every non-default locale.
 */
const requestedPath = ({ nextUrl }: NextRequest): string => {
    const hasLocalePrefix = Boolean(nextUrl.locale) && nextUrl.locale !== nextUrl.defaultLocale;
    if (!hasLocalePrefix) return nextUrl.pathname;
    // `/es`, not `/es/`: the locale root is served without a trailing slash.
    const pathAfterLocale = nextUrl.pathname === '/' ? '' : nextUrl.pathname;
    return `/${nextUrl.locale}${pathAfterLocale}`;
};

/**
 * measure-real-traffic: records every request from a documented AI crawler as an `ai_crawler_hit`
 * event in a GA4 property of its own. Crawlers run no JavaScript, so gtag never sees them, and
 * Vercel Hobby keeps runtime logs for one hour — without this there is no record of them at all.
 *
 * Every other request leaves after one header read and a short substring scan.
 */
export function middleware(request: NextRequest, event: NextFetchEvent): NextResponse {
    const crawler = findAiCrawler(request.headers.get('user-agent'));
    if (!crawler) return NextResponse.next();

    // Named one by one: the edge runtime exposes env vars as individual `process.env.X` reads.
    const config = readCrawlerAnalyticsConfig({
        GA_CRAWLER_MEASUREMENT_ID: process.env.GA_CRAWLER_MEASUREMENT_ID,
        GA_CRAWLER_API_SECRET: process.env.GA_CRAWLER_API_SECRET,
    });

    if (!config) {
        if (!hasWarnedMissingConfig) {
            console.warn('[ai-crawler] GA_CRAWLER_MEASUREMENT_ID / GA_CRAWLER_API_SECRET not set: hits are not recorded');
            hasWarnedMissingConfig = true;
        }
        return NextResponse.next();
    }

    event.waitUntil(sendCrawlerHit(buildCrawlerHitPayload(crawler, requestedPath(request)), config));
    return NextResponse.next();
}

export const config = {
    // Pages and the files crawlers read most (robots.txt, sitemap.xml, llms.txt, llms-full.txt, the
    // RSS feeds) run through it. API routes, Next internals and static assets do not.
    matcher: ['/((?!api/|_next/|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|css|js|map|json|webmanifest)$).*)'],
};
