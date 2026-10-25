/*
 * The Search Console package alone, not the all-APIs `googleapis` entry point. `googleapis` ships
 * declarations for 339 APIs and `import { google }` loads every one of them into the type checker:
 * with octokit 5 beside it, the type check inside `next build` ran out of the default 2 GB heap.
 * `@googleapis/webmasters` is the same client class and the same `auth` helper, scoped to this API.
 */
import { auth, webmasters, type webmasters_v3 } from '@googleapis/webmasters';

export const SITE_URL = 'sc-domain:xabierlameiro.com';

/**
 * @description Build an authenticated Search Console (webmasters v3) client using the
 * shared analytics service account. Returns null when the credentials are absent so
 * callers can degrade gracefully instead of throwing.
 *
 * @returns {webmasters_v3.Webmasters | null} - Authenticated client, or null if unconfigured
 */
export const getSearchConsoleClient = (): webmasters_v3.Webmasters | null => {
    if (!process.env.ANALYTICS_CLIENT_EMAIL || !process.env.ANALYTICS_PRIVATE_KEY) {
        return null;
    }

    const googleAuth = new auth.GoogleAuth({
        credentials: {
            client_email: process.env.ANALYTICS_CLIENT_EMAIL,
            private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: 'https://www.googleapis.com/auth/webmasters.readonly',
    });

    return webmasters({ version: 'v3', auth: googleAuth });
};
