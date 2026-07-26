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
const useDeploymentStatus = () => {
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
                    {/*
                     * SDD-L06: was an empty <div> — no text, no label, no role. A screen reader
                     * announced nothing, and sighted users had only hue to go on: every one of the six
                     * states computes between 1.01:1 and 2.93:1 against the LIGHT header gradient, so
                     * low-vision users could not see it at all and colour-blind users could not tell
                     * ready from error. `role="img"` plus a name carries the state to assistive tech,
                     * and the glyph gives it a second, non-colour channel (WCAG 1.4.1).
                     */}
                    <span
                        role="img"
                        aria-label={f(
                            { id: 'deploymentstatus.tooltip' },
                            { status, username, environment, createdAt: '' }
                        )}
                        data-status={status ? status.toLowerCase() : 'unknown'}
                        className={`${styles.status} ${status ? styles[status.toLowerCase()] : ''}`}
                    />
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
