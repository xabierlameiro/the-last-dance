'use client'
import React from 'react';
import Loading from './Loading';
import Error from './Error';
import Tooltip from '@/components/Tooltip';
import { useTranslation } from '@/hooks/useTranslationSimple';

type Props = {
    error: boolean;
    loading: boolean;
    errorTitle?: string;
    loadingTitle?: string;
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
    const { t } = useTranslation();

    if (error) {
        return (
            <Tooltip>
                <Tooltip.Trigger>
                    <Error />
                </Tooltip.Trigger>
                <Tooltip.Content>{errorTitle ?? t('rendermanager.error')}</Tooltip.Content>
            </Tooltip>
        );
    }
    if (loading) {
        return (
            <Tooltip>
                <Tooltip.Trigger>
                    <Loading />
                </Tooltip.Trigger>
                <Tooltip.Content>{loadingTitle ?? t('rendermanager.loading')}</Tooltip.Content>
            </Tooltip>
        );
    }
    return <>{children}</>;
};

export default RenderManager;
