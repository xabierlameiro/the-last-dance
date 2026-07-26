import React from 'react';
import useSWR from 'swr';
import styles from './deploymentstatus.module.css';
import Tooltip from '@/components/Tooltip';
import { useIntl } from 'react-intl';
import RenderManager from '@/components/RenderManager';
import createFetcher from '@/helpers/createFetcher';
import { deploymentSchema } from '../../types/schemas';
import type { DeploymentData } from '../../types/api';

const url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/deployments`;

const fetchDeployment = createFetcher(deploymentSchema, '/api/deployments');

/**
 *
 * @returns { {data: DeploymentData | undefined, isLoading: boolean, error: Error | undefined} }
 * @description - Fetches the deployment status
 * @example - const { data, isLoading, error } = useDeploymentStatus();
 */
const useDeploymentStatus = (): {
    data: DeploymentData | undefined;
    isLoading: boolean;
    error: Error | undefined;
} => {
    const { data, error } = useSWR<DeploymentData, Error>(url, fetchDeployment);
    return {
        data,
        isLoading: !error && !data,
        error,
    };
};

/**
 *
 * @returns {JSX.Element} - DeploymentStatus component
 * @description - Shows the current deployment status
 * @example - <DeploymentStatus />
 */
const DeploymentStatus = () => {
    const { data, isLoading, error } = useDeploymentStatus();
    // SDD-L08: `formatDate` instead of a bare `toLocaleString()` with no locale argument, which
    // formatted against the *browser's* locale rather than the site's — so a reader on /es with an
    // English-configured machine saw an English date inside a Spanish sentence. The other three
    // components that render dates already did this correctly.
    const { formatMessage: f, formatDate } = useIntl();

    const status = data?.status;
    const username = data?.username;
    const environment = data?.environment;
    const createdAt = data?.createdAt;

    return (
        <RenderManager error={error} loading={isLoading}>
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
                            createdAt: createdAt
                                ? formatDate(createdAt, { dateStyle: 'medium', timeStyle: 'short' })
                                : '',
                        }
                    )}
                </Tooltip.Content>
            </Tooltip>
        </RenderManager>
    );
};

export default DeploymentStatus;
