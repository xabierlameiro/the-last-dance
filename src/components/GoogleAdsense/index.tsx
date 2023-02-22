import React from 'react';
import { clx } from '@/helpers';
import styles from './adsense.module.css';
import console from '@/helpers/console';
import Script from 'next/script';

type Props = {
    client?: string;
    slot: string;
};

declare global {
    interface Window {
        adsbygoogle: { [key: string]: unknown }[];
    }
}

/**
 * @description - The adsense will be rendered only in production mode and horizontal only on mobile
 *
 * @example
 *     <GoogleAdsense slot="1234567890" />;
 *
 * @param {string} client - The client id
 * @param {string} slot - The slot id
 * @returns {JSX.Element}
 */
const GoogleAdsense = ({ client = 'ca-pub-3537017956623483', slot }: Props) => {
    const adsbygoogle = React.useRef(null);
    const addContainer = React.useRef(null);
    const [sizes, setSizes] = React.useState({ width: '', height: '' });

    React.useEffect(() => {
        if (addContainer.current) {
            const { clientWidth, clientHeight } = addContainer.current;
            setSizes({ width: clientWidth + 'px', height: clientHeight + 'px' });
        }
    }, [addContainer]);

    React.useEffect(() => {
        return () => {
            try {
                if (window.adsbygoogle && window.adsbygoogle.pop) {
                    window.adsbygoogle.pop();
                }
            } catch (error) {
                console.error('Google Adsense error:', error);
            }
        };
    }, []);

    return (
        <div ref={addContainer} className={styles.container}>
            {sizes.width && sizes.height && (
                <>
                    <ins
                        aria-hidden="true"
                        ref={adsbygoogle}
                        className={clx('adsbygoogle', styles.adsbygoogle)}
                        style={{ ...sizes }}
                        data-ad-slot={slot}
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                        title="Google Adsense"
                    />
                    <Script
                        data-ad-client={client}
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
                        strategy="lazyOnload"
                        onReady={() => {
                            try {
                                if (window.adsbygoogle && window.adsbygoogle.push) {
                                    window.adsbygoogle.push({});
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default GoogleAdsense;
