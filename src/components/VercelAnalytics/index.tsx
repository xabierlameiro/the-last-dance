import { useSyncExternalStore } from 'react';
import { Analytics } from '@vercel/analytics/next';

const subscribeToNothing = () => () => undefined;
const isLighthouseOnClient = () => navigator.userAgent.includes('Chrome-Lighthouse');
// The server has no navigator. Assuming Lighthouse there makes the server render and the hydration
// render agree on "nothing"; React then re-renders on the client with the real answer. Reading
// `navigator` directly in JSX is what desynchronised hydration before (see `_app.tsx`).
const isLighthouseOnServer = () => true;

/**
 * measure-real-traffic: cookieless visit counting (Vercel Web Analytics). Visitors are told apart by
 * a hash of the request discarded after 24 hours, not by a cookie, so it counts visitors who reject
 * or ignore the consent banner, which GA4 under Consent Mode v2 cannot. Skipped for Lighthouse
 * runs, like gtag, so audits measure the site and not the tracker.
 */
const VercelAnalytics = () => {
    const isLighthouse = useSyncExternalStore(subscribeToNothing, isLighthouseOnClient, isLighthouseOnServer);
    return isLighthouse ? null : <Analytics />;
};

export default VercelAnalytics;
