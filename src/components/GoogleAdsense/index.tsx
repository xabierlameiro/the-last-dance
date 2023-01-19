import React from 'react';
import { clx } from '@/helpers';
import styles from './adsense.module.css';

type Props = {
    client?: string;
    slot: string;
    horizontal?: boolean;
};

/**
 * @description - The adsense will be rendered only in production mode and horizontal only on mobile
 *
 * @example
 *     <GoogleAdsense slot="1234567890" />;
 *
 * @param {string} client - The client id
 * @param {string} slot - The slot id
 * @param {boolean} horizontal - If true, the adsense will be horizontal
 * @returns {JSX.Element}
 */
const GoogleAdsense = ({ client = 'ca-pub-3537017956623483', slot, horizontal }: Props) => {
    const adsbygoogle = React.useRef(null);
    const isProduction = process.env.NODE_ENV === 'production';

    React.useEffect(() => {
        if (isProduction) {
            if (adsbygoogle.current) {
                try {
                    if (window.adsbygoogle && window.adsbygoogle.push) {
                        window.adsbygoogle.push({});
                    }
                } catch (error) {
                    console.error('Google Adsense error:', error);
                }
            }

            return () => {
                try {
                    if (window.adsbygoogle && window.adsbygoogle.pop) {
                        window.adsbygoogle.pop();
                    }
                } catch (error) {
                    console.error('Google Adsense error:', error);
                }
            };
        }
    }, [isProduction, , horizontal]);

    if (!isProduction) {
        return null;
    }

    return (
        <ins
            aria-hidden="true"
            ref={adsbygoogle}
            className={clx('adsbygoogle', horizontal ? styles.horizontal : styles.block)}
            style={{ display: 'block' }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
            title="Google Adsense"
        />
    );
};

export default GoogleAdsense;
