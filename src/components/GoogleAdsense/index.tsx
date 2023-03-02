import Script from 'next/script';
import { FC, useId } from 'react';

type AdComponent = FC<{
    slot: string;
    client?: string;
}>;

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

export const GoogleAdsense: AdComponent = ({ client = 'ca-pub-3537017956623483', slot }) => {
    const id = useId();
    return (
        <>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={client}
                data-ad-slot={slot}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
            <Script
                async
                id={id + '#' + slot}
                dangerouslySetInnerHTML={{
                    __html: `
                            (adsbygoogle = window.adsbygoogle || []).push({});
                    `,
                }}
            />
        </>
    );
};
export default GoogleAdsense;
