import React from 'react';
import styles from './indexed.module.css';
import useIndexedPages from '@/hooks/useIndexedPages';
import RenderManager from '@/components/RenderManager';
import Tooltip from '@/components/Tooltip';
import { GiCheckboxTree } from 'react-icons/gi';
import { useIntl } from 'react-intl';

/**
 * @description This component is used to display the number of indexed pages on Google
 * @returns {JSX.Element}
 * @example <IndexedCounter />
 */
const IndexedCounter = () => {
    const { data, error, loading } = useIndexedPages();
    const { formatMessage: f } = useIntl();

    return (
        <Tooltip>
            <Tooltip.Trigger>
                <div className={styles.container}>
                    <GiCheckboxTree className={styles.xrp} />
                    <RenderManager
                        error={error}
                        loading={loading}
                        errorTitle={f({ id: 'indexedCounter.error' })}
                        loadingTitle={f({ id: 'indexedCounter.loading' })}
                    >
                        <span>{data.num}</span>
                    </RenderManager>
                </div>
            </Tooltip.Trigger>
            <Tooltip.Content>{f({ id: 'indexedCounter.tooltip' }, { num: data.num })}</Tooltip.Content>
        </Tooltip>
    );
};

export default IndexedCounter;
