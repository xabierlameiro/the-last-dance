import React from 'react';
import { TbCurrencyRipple } from 'react-icons/tb';
import useXRP from '@/hooks/useXRP';
import RenderManager from '@/components/RenderManager';
import styles from './crypto.module.css';
import { useIntl } from 'react-intl';
import Tooltip from '@/components/Tooltip';

/**
 * @description Show the current price of XRP in EUR
 * @returns {JSX.Element}
 * @example <CryptoPrice />
 */
const CryptoPrice = () => {
    const { data, error, loading } = useXRP();
    const { formatMessage: f, formatNumber } = useIntl();

    return (
        <Tooltip>
            <Tooltip.Trigger>
                <div className={styles.container} data-testid="crypto-price">
                    <TbCurrencyRipple className={styles.xrp} />
                    <RenderManager
                        loading={loading}
                        error={error}
                        errorTitle={f({ id: 'cryptoPrice.error' })}
                        loadingTitle={f({ id: 'cryptoPrice.loading' })}
                    >
                        {formatNumber(!isNaN(data?.price ?? 0) ? (data?.price ?? 0) : 0, {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </RenderManager>
                </div>
            </Tooltip.Trigger>
            <Tooltip.Content>
                {f(
                    { id: 'cryptoPrice.tooltip' },
                    {
                        todayPorcentage: data?.todayPorcentage ?? '0%',
                    }
                )}
            </Tooltip.Content>
        </Tooltip>
    );
};

export default CryptoPrice;
