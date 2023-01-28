import React from 'react';
import styles from './news.module.css';
import { FaSpinner } from 'react-icons/fa';
import useSWR from 'swr';

type WeatherProps = {
    city: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MAX_STEPS = 10;

function setInverval(ref: React.RefObject<HTMLDivElement>) {
    let step = 0;
    const interval = setInterval(() => {
        if (ref.current) {
            step += 1;
            if (step < MAX_STEPS) {
                ref.current.scrollBy({
                    top: ref.current.clientHeight,
                    behavior: 'smooth',
                });
            } else {
                step = 0;
                ref.current.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                });
            }
        }
    }, 15000);

    return interval;
}

const News = ({ city }: WeatherProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const handleMouseEnter = React.useRef<() => void>();
    const handleMouseLeave = React.useRef<() => void>();
    const url = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/news`);
        url.searchParams.set('city', city);
        return url;
    }, [city]);

    const { data, error } = useSWR(url, fetcher, {
        keepPreviousData: true,
    });

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
