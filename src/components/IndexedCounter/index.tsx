import React from 'react';
import { GiCheckboxTree } from 'react-icons/gi';
import styles from './indexed.module.css';
import useIndexedPages from '@/hooks/useIndexedPages';
import RenderManager from '@/components/RenderManager';
import Tooltip from '@/components/Tooltip';

/**
 * @description This component is used to display the number of indexed pages on Google
 * @returns {JSX.Element}
 * @example <IndexedCounter />
 * @todo Pending internationalization
 */
const IndexedCounter = () => {
    const { data, error, loading } = useIndexedPages();

    return (
        <Tooltip>
            <Tooltip.Trigger>
                <div className={styles.container}>
                    <GiCheckboxTree className={styles.xrp} />
                    <RenderManager error={error} loading={loading} errorTitle="Error" loadingTitle="Loading">
                        <span>{data.num}</span>
                    </RenderManager>
                </div>
            </Tooltip.Trigger>
            <Tooltip.Content>Pages indexed on google.com</Tooltip.Content>
        </Tooltip>
    );
};

export default IndexedCounter;
