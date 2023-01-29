import React from 'react';
import styles from './news.module.css';
import useNews from '@/hooks/useNews';
import { FaSpinner } from 'react-icons/fa';
import { setInverval } from '@/helpers';

type WeatherProps = {
    city: string;
};

const News = ({ city }: WeatherProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const handleMouseEnter = React.useRef<() => void>();
    const handleMouseLeave = React.useRef<() => void>();
    const { data, error } = useNews(city);

    React.useEffect(() => {
        let interval = setInverval(ref);

        handleMouseEnter.current = () => {
            clearInterval(interval);
        };

        handleMouseLeave.current = () => {
            interval = setInverval(ref);
        };

        return () => clearInterval(interval);
    }, []);

    if (error) return <div>failed to load</div>;

    if (!data) return <FaSpinner className={styles.spinner} title="Loading stars" />;

    return (
        <div
            className={styles.container}
            ref={ref}
            onMouseEnter={handleMouseEnter.current}
            onMouseLeave={handleMouseLeave.current}
        >
            {data.news.map((news: any) => (
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
    );
};

export default News;
