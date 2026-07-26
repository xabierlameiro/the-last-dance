import '../../styles/globals.css';
import '@code-hike/mdx/dist/index.css';
import Script from 'next/script';
import { IntlProvider, type IntlConfig } from 'react-intl';
import { useRouter } from 'next/router';
import { messages } from '../intl/translations';
import type { AppProps, NextWebVitalsMetric } from 'next/app';
import CookieConsent, { CONSENT_STORAGE_KEY } from '@/components/CookieConsent';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';

type locales = 'en' | 'es' | 'gl';
declare global {
    interface Window {
        gtag: (event: string, name: string, obj: object) => void;
    }
}

export function reportWebVitals({ id, name, label, value }: NextWebVitalsMetric) {
    window.gtag?.('event', name, {
        // GA4 drops event_category / event_label / non_interaction unless they are
        // registered as custom dimensions — those are Universal Analytics parameters.
        // These names are the ones Google's own web-vitals guidance uses, so the
        // metrics arrive as custom parameters that can actually be reported on.
        metric_id: id,
        metric_value: value,
        metric_label: label,
        // GA4 only accepts an integer for `value`, and CLS is a fraction.
        value: Math.round(name === 'CLS' ? value * 1000 : value),
    });
}

/**
 * @description Consent Mode v2, then Google Analytics.
 *
 * Everything that can identify a visitor starts `denied`, so the first page view
 * never writes an analytics cookie — that is what makes the banner a prior-consent
 * gate rather than a notice. `CookieConsent` moves these with
 * `gtag('consent', 'update', …)` once the visitor answers, and the stored answer is
 * replayed here on every later load; without the replay every visit would restart
 * denied. `functionality_storage` and `security_storage` are granted outright:
 * they are exempt from prior consent and nothing here asks about them.
 *
 * `wait_for_update` gives that replay a window to land before gtag decides what to
 * send. Ordering is safe even though `afterInteractive` injects this after
 * hydration: nothing else loads gtag.js, this script does it itself, so the denied
 * defaults are always in `dataLayer` before any tag exists.
 *
 * That self-injection is also what lets the Lighthouse exclusion read `navigator`
 * in the browser, where it exists. Gating the JSX on `navigator` instead — as this
 * did before — evaluated `false` on the server and `true` on the client, so the two
 * renders disagreed about the tree.
 *
 * No `routeChangeComplete` page_view is sent, deliberately. GA4 Enhanced
 * Measurement captures history-based navigation by default, and sending our own on
 * top of it double-counts every client-side route change. That listener is
 * Universal Analytics advice; if Enhanced Measurement is ever switched off for this
 * property, it has to come back.
 */
const analyticsBootstrap = (measurementId: string) => `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: 500
    });
    try {
        if (window.localStorage.getItem('${CONSENT_STORAGE_KEY}') === 'granted') {
            gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                analytics_storage: 'granted'
            });
        }
    } catch (error) {
        /* Storage blocked — stay on the denied defaults. */
    }
    if (navigator.userAgent.indexOf('Chrome-Lighthouse') === -1) {
        var tag = document.createElement('script');
        tag.async = true;
        tag.src = 'https://www.googletagmanager.com/gtag/js?id=${measurementId}';
        document.head.appendChild(tag);
        gtag('js', new Date());
        gtag('config', '${measurementId}');
    }
`;

const App = ({ Component, pageProps }: AppProps) => {
    const { locale = 'en' } = useRouter();
    // NEXT_PUBLIC_* is inlined at build time, so this resolves identically on the
    // server and on the client and cannot desynchronise hydration.
    const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';
    const measurementId = process.env.NEXT_PUBLIC_GA;

    /**
     * SDD-L08. This used to be an `if` with an empty body and nothing outside it:
     *
     *     if (err.message.includes('Missing locale data for locale: "gl"')) {
     *         // Silently ignore this specific error
     *     }
     *
     * Which does not silence one error — it discards **all** of them, `MISSING_TRANSLATION` and
     * `MISSING_MESSAGE` included. That single line is the mechanism that let every missing string in
     * this phase's findings accumulate without anyone seeing a warning.
     *
     * The justification was also stale. On this Node, `Intl.DateTimeFormat.supportedLocalesOf(['gl'])`
     * returns `['gl']` and formats as `18 de xul. de 2026`; react-intl v6 uses native `Intl` and loads
     * no locale data of its own. There is nothing left to suppress.
     *
     * Nothing is swallowed now. In production the handler stays quiet on the visitor's console —
     * a missing string is not something a reader can act on — but a missing translation is still a
     * defect, so development gets the whole list.
     */
    const handleIntlError: IntlConfig['onError'] = (err) => {
        if (process.env.NODE_ENV === 'production') return;
        console.error(`[intl:${err.code}] ${err.message}`);
    };

    return (
        <>
            {isProduction && measurementId && (
                <Script id="ga-bootstrap" strategy="afterInteractive">
                    {analyticsBootstrap(measurementId)}
                </Script>
            )}

            <IntlProvider locale={locale} messages={messages[locale as locales]} onError={handleIntlError}>
                <ErrorBoundary>
                    <CookieConsent />
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </ErrorBoundary>
            </IntlProvider>
        </>
    );
};

export default App;
