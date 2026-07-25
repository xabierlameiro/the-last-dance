import React from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { clx } from '@/helpers';
import styles from './cookieConsent.module.css';

/**
 * Where the visitor's answer is kept. `_app` reads the same key from its inline
 * bootstrap so a returning visitor's grant is replayed into Consent Mode before
 * gtag.js ever runs — otherwise every visit would start denied.
 */
export const CONSENT_STORAGE_KEY = 'cookie-consent';

export type ConsentChoice = 'granted' | 'denied';

/**
 * @description The four Consent Mode v2 signals this site can move. Storage that
 * is not tied to identifying the visitor (`functionality_storage`,
 * `security_storage`) is granted by default in `_app` and never asked about,
 * because it is exempt from prior consent.
 */
export const consentSignals = (choice: ConsentChoice) => ({
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
});

/**
 * @description Prior-consent gate for analytics storage. Until the visitor
 * answers, `_app` has already told gtag every identifying signal is denied, so
 * nothing is written; this component only ever moves that state.
 *
 * @example
 *     <CookieConsent />;
 *
 * @returns {JSX.Element | null}
 */
const CookieConsent = () => {
    const { formatMessage } = useIntl();
    const [needsAnswer, setNeedsAnswer] = React.useState(false);

    React.useEffect(() => {
        // Reading storage during render would make the server and client markup
        // disagree, so the banner is decided after hydration.
        try {
            setNeedsAnswer(window.localStorage.getItem(CONSENT_STORAGE_KEY) === null);
        } catch {
            // Storage blocked (private mode, cookie-blocking extension). With
            // nowhere to record an answer, asking on every page load is worse than
            // staying on the denied defaults.
        }
    }, []);

    const answer = React.useCallback((choice: ConsentChoice) => {
        try {
            window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
        } catch {
            // Same as above: the choice still applies to this page view.
        }
        window.gtag?.('consent', 'update', consentSignals(choice));
        setNeedsAnswer(false);
    }, []);

    const handleAccept = React.useCallback(() => answer('granted'), [answer]);
    const handleReject = React.useCallback(() => answer('denied'), [answer]);

    if (!needsAnswer) return null;

    return (
        <div className={styles.banner} role="dialog" aria-live="polite" aria-labelledby="cookie-consent-title">
            <div className={styles.copy}>
                <div className={styles.title} id="cookie-consent-title">
                    {formatMessage({ id: 'consent.title' })}
                </div>
                <div className={styles.message}>
                    {formatMessage({ id: 'consent.message' })}{' '}
                    <Link href="/legal/cookies-policy">{formatMessage({ id: 'legal.cookies-policy' })}</Link>
                </div>
            </div>
            <div className={styles.actions}>
                <button type="button" className={styles.button} onClick={handleReject} data-testid="consent-reject">
                    {formatMessage({ id: 'consent.reject' })}
                </button>
                <button
                    type="button"
                    className={clx(styles.button, styles.accept)}
                    onClick={handleAccept}
                    data-testid="consent-accept"
                >
                    {formatMessage({ id: 'consent.accept' })}
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
