import React from 'react';
import styles from './renderManager.module.css';
import { FaSpinner } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';
import Tooltip from '@/components/Tooltip';

type Props = {
    error: boolean;
    loading: boolean;
    errorTitle: string;
    loadingTitle: string;
    children: React.ReactNode;
};

/**
 * @description - Renders children or error/loading icon
 *
 * @param {error} boolean - error state
 * @param {loading} boolean - loading state
 * @param {errorTitle} string - Title for error icon
 * @param {loadingTitle} string - Title for loading icon
 * @param {children} React.ReactNode - Children to render
 * @returns {React.ReactNode} - Returns children or error/loading icon
 */
const RenderManager = ({ error, loading, errorTitle, loadingTitle, children }: Props) => {
    if (error) {
        return (
            <Tooltip>
                <Tooltip.Trigger>
                    <RxCross2 className={styles.error} data-testid="error-render" />
                </Tooltip.Trigger>
                <Tooltip.Content>{errorTitle}</Tooltip.Content>
            </Tooltip>
        );
    }
    if (loading) {
        return (
            <Tooltip>
                <Tooltip.Trigger>
                    <FaSpinner className={styles.spinner} data-testid="loading-render" />
                </Tooltip.Trigger>
                <Tooltip.Content>{loadingTitle}</Tooltip.Content>
            </Tooltip>
        );
    }
    return <>{children}</>;
};

export default RenderManager;
