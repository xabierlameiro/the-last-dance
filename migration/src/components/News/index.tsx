'use client'

import React from 'react';
import styles from './news.module.css';
import useNews from '@/hooks/useNews';
import RenderManager from '@/components/RenderManager';
import { setInverval } from '@/helpers';
import { useTranslation } from '@/hooks/useTranslationSimple';

type WeatherProps = {
    city: string;
};

/**
 * @description - Show the latest news about the city
 * @param {city} string - City name
 * @returns {JSX.Element} - News component
 */
const News = ({ city }: WeatherProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const handleMouseEnter = React.useRef<(() => void) | null>(null);
    const handleMouseLeave = React.useRef<(() => void) | null>(null);
    const { data, error } = useNews(city);
    const { t } = useTranslation();

    React.useEffect(() => {
        let interval = ref.current ? setInverval(ref as React.RefObject<HTMLDivElement>) : undefined;

        handleMouseEnter.current = () => {
            if (interval) clearInterval(interval);
        };

        handleMouseLeave.current = () => {
            if (ref.current) {
                interval = setInverval(ref as React.RefObject<HTMLDivElement>);
            }
        };

        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    return (
        <RenderManager
            error={error}
            loading={!data}
            errorTitle={t('news.error')}
            loadingTitle={t('news.loading')}
        >
            <div
                ref={ref}
                data-testid="news"
                className={styles.container}
                onMouseEnter={handleMouseEnter.current || undefined}
                onMouseLeave={handleMouseLeave.current || undefined}
            >
                {data.news.map((news: { link: string; title: string; published: string; description: string }) => (
                    <a
                        href={news.link}
                        target="_blank"
                        rel="noreferrer"
                        key={news.link}
                        className={styles.link}
                        title={news.title}
                    >
                        <h3 className={styles.title}>{news.title}</h3>
                        <span className={styles.published}>{news.published}</span>
                        <p className={styles.description}>{news.description}</p>
                    </a>
                ))}
            </div>
        </RenderManager>
    );
};

export default News;
