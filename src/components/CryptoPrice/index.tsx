import React from 'react';
import { TbCurrencyRipple } from 'react-icons/tb';
import useXRP from '@/hooks/useXRP';
import RenderManager from '@/components/RenderManager';
import styles from './crypto.module.css';
import { FormattedNumber } from 'react-intl';

/**
 * @description Show the current price of XRP in EUR
 * @returns {JSX.Element}
 * @example <CryptoPrice />
 * @todo Pending internationalization
 */
const CryptoPrice = () => {
    const { data, error, loading } = useXRP();

    return (
        <div className={styles.container} title="Pending">
            <TbCurrencyRipple className={styles.xrp} />
            <RenderManager
                loading={loading}
                error={error}
                errorTitle="Error loading XRP price"
                loadingTitle="Loading XRP price"
            >
                <FormattedNumber
                    value={!isNaN(data.price) ? data.price : 0}
                    style="currency"
                    currency="EUR"
                    minimumFractionDigits={2}
                    maximumFractionDigits={2}
                />
            </RenderManager>
        </div>
    );
};

export default CryptoPrice;
