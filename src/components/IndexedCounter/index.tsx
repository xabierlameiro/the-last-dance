import React from 'react';
import { GiCheckboxTree } from 'react-icons/gi';
import styles from './indexed.module.css';
import useIndexedPages from '@/hooks/useIndexedPages';
import RenderManager from '@/components/RenderManager';

/**
 * @description This component is used to display the number of indexed pages on Google
 * @returns {JSX.Element}
 * @example <IndexedCounter />
 * @todo Pending internationalization
 */
const IndexedCounter = () => {
    const { data, error, loading } = useIndexedPages();

    return (
        <div className={styles.container} title="title">
            <GiCheckboxTree className={styles.xrp} />
            <RenderManager error={error} loading={loading} errorTitle="Error" loadingTitle="Loading">
                <span>{data.num}</span>
            </RenderManager>
        </div>
    );
};

export default IndexedCounter;
