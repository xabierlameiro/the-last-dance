import React from 'react';
import { AiOutlineStar } from 'react-icons/ai';
import { useIntl } from 'react-intl';
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
    const { formatMessage: f } = useIntl();

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
                        errorTitle={f({ id: 'starCounter.error' })}
                        loadingTitle={f({ id: 'starCounter.loading' })}
                    >
                        <span data-testid="star-counter">{data as string}</span>
                    </RenderManager>
                </a>
            </Tooltip.Trigger>
            <Tooltip.Content>{f({ id: 'starCounter.tooltip' })}</Tooltip.Content>
        </Tooltip>
    );
};

export default StarCounter;
