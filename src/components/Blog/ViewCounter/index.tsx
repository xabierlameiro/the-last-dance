import React from 'react';
import styles from './viewCounter.module.css';
import useAnalytics from '@/hooks/useAnalytics';
import RenderManager from '@/components/RenderManager';
import { FiUsers } from 'react-icons/fi';
import { BsBook, BsEye } from 'react-icons/bs';
import { useIntl } from 'react-intl';
import Tooltip from '@/components/Tooltip';

/**
 * @description Component that shows the number of views of the current page or the totally of website, include de new users
 * @param all If true, shows the total of views and new users
 * @expample <ViewCounter all />
 * @returns {JSX.Element}
 */
const ViewCounter = ({ all }: { all?: boolean }) => {
    const { data, error, loading } = useAnalytics(all);
    const { formatMessage: f } = useIntl();

    return (
        <div className={styles.views} data-testid="view-counter">
            <Tooltip>
                <Tooltip.Trigger>
                    <span className={styles.views} data-testid="views">
                        {all ? <BsEye /> : <BsBook />}
                        <RenderManager
                            loading={all ? !data : loading}
                            error={error}
                            errorTitle={f({ id: 'viewCounter.error' })}
                            loadingTitle={f({ id: 'viewCounter.loading' })}
                        >
                            <span>{data.pageViews}</span>
                        </RenderManager>
                    </span>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    {all ? f({ id: 'viewCounter.tooltipAll' }) : f({ id: 'viewCounter.tooltipPage' })}
                </Tooltip.Content>
            </Tooltip>
            {all && (
                <Tooltip>
                    <Tooltip.Trigger>
                        <span className={styles.users} data-testid="new-users">
                            <FiUsers
                                style={{
                                    fill: 'transparent',
                                    width: '14px',
                                }}
                            />
                            <RenderManager
                                loading={!data}
                                error={error}
                                errorTitle={f({ id: 'viewCounter.users.error' })}
                                loadingTitle={f({ id: 'viewCounter.users.loading' })}
                            >
                                {data.newUsers}
                            </RenderManager>
                        </span>
                    </Tooltip.Trigger>
                    <Tooltip.Content>{f({ id: 'viewCounter.users.tooltip' })}</Tooltip.Content>
                </Tooltip>
            )}
        </div>
    );
};

export default ViewCounter;
