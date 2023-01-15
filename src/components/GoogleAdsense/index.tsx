import React from 'react';
import { clx } from '@/helpers';
import styles from './adsense.module.css';

type Props = {
    client?: string;
    slot: string;
    horizontal?: boolean;
};

const GoogleAdsense = ({ client = 'ca-pub-3537017956623483', slot, horizontal }: Props) => {
    const adsbygoogle = React.useRef(null);

    React.useEffect(() => {
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
    }, [adsbygoogle]);

    return (
        <ins
            ref={adsbygoogle}
            className={clx('adsbygoogle', horizontal ? styles.horizontal : styles.block)}
            style={{ display: 'block' }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
};

export default GoogleAdsense;
