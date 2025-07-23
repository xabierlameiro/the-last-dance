import React from 'react';
import useSWR from 'swr';
import styles from './deploymentstatus.module.css';
import Tooltip from '@/components/Tooltip';
import { useIntl } from 'react-intl';
import RenderManager from '@/components/RenderManager';
import type { DeploymentData } from '../../types/api';

const url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/deployments`;

const fetchDeployment = async (url: string): Promise<DeploymentData> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch deployment data: ${response.statusText}`);
    }
    const data = await response.json();
    return data as DeploymentData;
};

/**
 *
 * @returns { {data: DeploymentData | undefined, isLoading: boolean, isError: boolean} } - The deployment status
 * @description - Fetches the deployment status
 * @example - const { data, isLoading, isError } = useDeploymentStatus();
 */
export const useDeploymentStatus = () => {
    const { data, error } = useSWR<DeploymentData>(url, fetchDeployment);
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

    const status = data?.status;
    const username = data?.username;
    const environment = data?.environment;
    const createdAt = data?.createdAt;

    return (
        <RenderManager error={isError} loading={isLoading}>
            <Tooltip>
                <Tooltip.Trigger>
                    <div className={`${styles.status} ${status ? styles[status.toLowerCase()] : ''}`} />
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
                            createdAt: createdAt ? new Date(createdAt).toLocaleString() : '',
                        }
                    )}
                </Tooltip.Content>
            </Tooltip>
        </RenderManager>
    );
};

export default DeploymentStatus;
