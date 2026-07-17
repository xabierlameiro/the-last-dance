import { google, webmasters_v3 } from 'googleapis';

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

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.ANALYTICS_CLIENT_EMAIL,
            private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: 'https://www.googleapis.com/auth/webmasters.readonly',
    });

    return google.webmasters({ version: 'v3', auth });
};
