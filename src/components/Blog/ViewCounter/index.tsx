import React from 'react';
import styles from './viewCounter.module.css';
import useAnalytics from '@/hooks/useAnalytics';
import RenderManager from '@/components/RenderManager';
import { FiUsers } from 'react-icons/fi';
import { BsBook, BsEye } from 'react-icons/bs';

/**
 * @description Component that shows the number of views of the current page or the totally of website, include de new users
 * @param all If true, shows the total of views and new users
 * @expample <ViewCounter all />
 * @returns {JSX.Element}
 * @todo Pending internationalization
 */
const ViewCounter = ({ all }: { all?: boolean }) => {
    const { data, error, loading } = useAnalytics(all);

    return (
        <div className={styles.views}>
            <span className={styles.views} title="Nº of new users">
                {all ? <BsEye /> : <BsBook />}
                <RenderManager
                    loading={all ? !data : loading}
                    error={error}
                    errorTitle="Error loading views"
                    loadingTitle="Loading views"
                >
                    <span title="Nº of page views">{data.pageViews}</span>
                </RenderManager>
            </span>
            {all && (
                <span className={styles.users} title="Nº of new users">
                    <FiUsers />
                    <RenderManager
                        loading={!data}
                        error={error}
                        errorTitle="Error loading views"
                        loadingTitle="Loading views"
                    >
                        {data.newUsers}
                    </RenderManager>
                </span>
            )}
        </div>
    );
};

export default ViewCounter;
