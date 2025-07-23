'use client'
import React from 'react';
import { AiOutlineStar } from 'react-icons/ai';
import { useTranslation } from '@/hooks/useTranslationSimple';
import useGithubStars from '@/hooks/useGithubStars';
import RenderManager from '@/components/RenderManager';
import Tooltip from '@/components/Tooltip';
import styles from './starCounter.module.css';

/**
 * @description Component that shows the number of stars of the repository
 * @returns {JSX.Element} Component
 * @exapmle <StarCounter />
 */
const StarCounter = () => {
    const { data, error, loading } = useGithubStars();
    const { t } = useTranslation();

    return (
        <Tooltip>
            <Tooltip.Trigger>
                <a
                    className={styles.stars}
                    href="https://github.com/xabierlameiro/the-last-dance"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <AiOutlineStar />
                    <RenderManager
                        loading={loading}
                        error={error}
                        errorTitle={t('starCounter.error')}
                        loadingTitle={t('starCounter.loading')}
                    >
                        <span data-testid="star-counter">{data}</span>
                    </RenderManager>
                </a>
            </Tooltip.Trigger>
            <Tooltip.Content>{t('starCounter.tooltip')}</Tooltip.Content>
        </Tooltip>
    );
};

export default StarCounter;
