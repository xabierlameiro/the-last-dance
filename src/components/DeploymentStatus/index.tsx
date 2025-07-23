import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/helpers';
import styles from './deploymentstatus.module.css';
import Tooltip from '@/components/Tooltip';
import { useIntl } from 'react-intl';
import RenderManager from '@/components/RenderManager';

const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/deployments`);

/**
 *
 * @returns { {data: object, isLoading: boolean, isError: boolean} } - The deployment status
 * @description - Fetches the deployment status
 * @example - const { data, isLoading, isError } = useDeploymentStatus();
 */
export const useDeploymentStatus = () => {
    const { data, error } = useSWR(url.toString(), fetcher);
    return {
        data,
        isLoading: !error && !data,
        isError: error,
    };
};

/**
 *
 * @returns {JSX.Element} - DeploymentStatus component
 * @description - Shows the current deployment status
 * @example - <DeploymentStatus />
 */
const DeploymentStatus = () => {
    const { data, isLoading, isError } = useDeploymentStatus();
    const { formatMessage: f } = useIntl();

    const { status, username, environment, createdAt } = data ?? {};

    return (
        <RenderManager error={isError} loading={isLoading}>
            <Tooltip>
                <Tooltip.Trigger>
                    <div className={`${styles.status} ${styles[status?.toLowerCase()]}`} />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    {f(
                        {
                            id: 'deploymentstatus.tooltip',
                        },
                        {
                            status,
                            username,
                            environment,
                            createdAt: new Date(createdAt).toLocaleString(),
                        }
                    )}
                </Tooltip.Content>
            </Tooltip>
        </RenderManager>
    );
};

export default DeploymentStatus;
