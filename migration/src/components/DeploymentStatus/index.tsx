'use client'
import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/helpers';
import styles from './deploymentstatus.module.css';
import Tooltip from '@/components/Tooltip';
import { useTranslation } from '@/hooks/useTranslationSimple';
import RenderManager from '@/components/RenderManager';

const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/deployments`);

/**
 *
 * @returns { {data: object, isLoading: boolean, isError: boolean} } - The deployment status
 * @description - Fetches the deployment status
 * @example - const { data, isLoading, isError } = useDeploymentStatus();
 */
export const useDeploymentStatus = () => {
    const { data, error } = useSWR(url, fetcher);
    return {
        data: data,
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
    const { t } = useTranslation();

    const { status, username, environment, createdAt } = data ?? {};

    return (
        <RenderManager error={isError} loading={isLoading}>
            <Tooltip>
                <Tooltip.Trigger>
                    <div className={`${styles.status} ${styles[status?.toLowerCase()]}`} />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    {t('deploymentstatus.tooltip', {
                        status: status,
                        username: username,
                        environment: environment,
                        createdAt: new Date(createdAt).toLocaleString(),
                    })}
                </Tooltip.Content>
            </Tooltip>
        </RenderManager>
    );
};

export default DeploymentStatus;
