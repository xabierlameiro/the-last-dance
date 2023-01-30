import React from 'react';
import styles from './starCounter.module.css';
import { AiOutlineStar } from 'react-icons/ai';
import useGithubStars from '@/hooks/useGithubStars';
import RenderManager from '@/components/RenderManager';
import Tooltip from '@/components/Tooltip';

/**
 * @description Component that shows the number of stars of the repository
 * @returns {JSX.Element} Component
 * @exapmle <StarCounter />
 * @todo Pending internationalization
 */
const StarCounter = () => {
    const { data, error, loading } = useGithubStars();

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
                        errorTitle="Error getting stars"
                        loadingTitle="Loading stars"
                    >
                        <span data-testid="star-counter">{data}</span>
                    </RenderManager>
                </a>
            </Tooltip.Trigger>
            <Tooltip.Content>Come on, give me a star!</Tooltip.Content>
        </Tooltip>
    );
};

export default StarCounter;
