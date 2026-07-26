/**
 * Shared outbound-HTTP and cache policy for the API routes.
 *
 * SDD-L02. Both halves of this file exist because the same thing was missing from seven of the eight
 * routes and present in one, which is how the drift started:
 *
 * - **Cache-Control.** Only /api/analytics set one, so every visitor rendering the header invoked six
 *   serverless functions, each hitting a third-party API. That let an anonymous caller spend the
 *   owner's GitHub, Vercel, Search Console, Open-Meteo, CoinGecko and Ariston quotas at will, with
 *   10:1 amplification on /api/weather (5 cities x 2 fetches). Caching at the edge collapses almost
 *   all of it, because the CDN absorbs the repeats.
 * - **Timeouts.** No outbound fetch had one. A slow upstream held a function open until the platform
 *   killed it, which is the cheapest available path to FUNCTION_INVOCATION_TIMEOUT.
 *
 * Centralised rather than copied per route for the reason recorded in helpers/slug.ts and
 * helpers/city.ts: logic duplicated across routes drifts, and tightening one copy while missing the
 * others is how the gap reopens.
 */

/** Every outbound call gets the same ceiling. Five seconds is well inside the function limit. */
export const FETCH_TIMEOUT_MS = 5_000;

/**
 * Cache windows, chosen per upstream rather than uniformly — the constraint is how stale a reader
 * would notice, not how fast the data can change.
 *
 * `stale-while-revalidate` is the important half: when an upstream is down or a quota is exhausted,
 * the edge serves the last known value instead of an error, so a widget degrades to slightly-old
 * rather than broken.
 */
export const CACHE = {
    /** Analytics view counts. A five-minute-old total reads identically to a fresh one. */
    analytics: 'public, s-maxage=300, stale-while-revalidate=86400',
    /** Indoor/outdoor temperature. Also the rate limiter for the Ariston login (see api/heating.ts). */
    heating: 'public, s-maxage=600, stale-while-revalidate=3600',
    /** Weather. Open-Meteo is IP-rate-limited and this route fans out up to 10 calls per request. */
    weather: 'public, s-maxage=600, stale-while-revalidate=3600',
    /** Crypto price. The widget shows a 24h change, so ten minutes of staleness is invisible. */
    price: 'public, s-maxage=600, stale-while-revalidate=3600',
    /** Google News RSS. Headlines do not turn over faster than this. */
    news: 'public, s-maxage=900, stale-while-revalidate=3600',
    /** Star count and indexed-page count. Both move on the order of days. */
    slow: 'public, s-maxage=3600, stale-while-revalidate=86400',
    /** Deployment status. Short, because this one is meant to look live. */
    deployment: 'public, s-maxage=60, stale-while-revalidate=600',
    /**
     * Errors are deliberately uncacheable. Caching a 500 would pin a transient upstream failure in
     * front of every visitor for the whole window.
     */
    error: 'no-store',
} as const;

/**
 * @description `fetch` with a hard timeout. Callers may pass their own `signal`; a caller-supplied
 * signal wins, on the assumption it is more specific than the default.
 * @param {string | URL} url - Absolute URL. No route builds this from user input.
 * @param {RequestInit} [init] - Standard fetch init.
 * @returns {Promise<Response>}
 */
export const fetchWithTimeout = async (url: string | URL, init: RequestInit = {}): Promise<Response> =>
    fetch(url, {
        ...init,
        signal: init.signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
