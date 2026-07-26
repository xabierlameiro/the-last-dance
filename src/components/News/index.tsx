import React from 'react';
import styles from './news.module.css';
import useNews from '@/hooks/useNews';
import RenderManager from '@/components/RenderManager';
import { setInverval } from '@/helpers';
import { useIntl } from 'react-intl';

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
    const { data, error } = useNews(city);
    const { formatMessage: f } = useIntl();
    const items = data?.news?.filter((item) => item.title && item.link) ?? [];

    /**
     * SDD-L09-T12. Two defects in the old version of this effect.
     *
     * The handlers were assigned to refs *inside* the effect, which runs after the first paint — so
     * on the first render both `onMouseEnter` and `onMouseLeave` were `null` and a pointer entering
     * the panel in that window did nothing.
     *
     * Worse, `mouseleave` created a fresh interval and reassigned the local `interval` binding.
     * Browsers dispatch `mouseleave` more than once in ordinary use — leaving through a child
     * element, leaving while the window loses focus — and each extra one **orphaned** the previous
     * interval: still running, still scrolling the panel, with no reference left to clear it. The
     * cleanup could only ever clear the last one.
     *
     * The id lives in a ref now, so start and stop always refer to the same timer, and starting
     * twice is idempotent.
     */
    const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

    const stopScrolling = React.useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startScrolling = React.useCallback(() => {
        if (intervalRef.current) return;
        intervalRef.current = setInverval(ref);
    }, []);

    React.useEffect(() => {
        startScrolling();
        return stopScrolling;
    }, [startScrolling, stopScrolling]);

    return (
        <RenderManager
            error={error}
            loading={!data}
            errorTitle={f({ id: 'news.error' })}
            loadingTitle={f({ id: 'news.loading' })}
        >
            <div
                ref={ref}
                data-testid="news"
                className={styles.container}
                onMouseEnter={stopScrolling}
                onMouseLeave={startScrolling}
            >
                {items.length === 0 && <p className={styles.empty}>{f({ id: 'news.empty' })}</p>}
                {items.map((news) => (
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
