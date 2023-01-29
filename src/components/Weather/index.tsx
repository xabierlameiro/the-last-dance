import React from 'react';
import styles from './weather.module.css';
import Img from 'next/image';
import News from '@/components/News';
import useWeather from '@/hooks/useWeather';
import { FaSpinner } from 'react-icons/fa';
import { clx } from '@/helpers';

const Container = ({ children, open }: { children: React.ReactNode; open?: boolean }) => {
    return (
        <div className={clx(styles.container, open ? styles.open : styles.close)}>
            <div className={styles.cities}>{children}</div>
        </div>
    );
};

// TODO: Pending internationalization
const Weather = ({ cities, open }: { cities: string[]; open?: boolean }) => {
    const { data, error } = useWeather(cities);

    if (error) return <Container open={open}>error</Container>;

    if (!data)
        return (
            <Container open={open}>
                <FaSpinner className={styles.spinner} title="Loading stars" />
            </Container>
        );

    return (
        <Container open={open}>
            {data.map(
                (
                    city: {
                        city: string;
                        grades: number;
                        imageUrl: string;
                        name: string;
                        precipitation: number;
                        humidity: number;
                        windSpeed: number;
                    },
                    index: number
                ) => (
                    <div className={styles.city} key={`${city.city}+${index}`}>
                        <div className={styles.weather}>
                            <div className={styles.cityName}>{city.city.replace(/\+/g, ' ')}</div>
                            <div className={styles.cityGrade}>{`${city.grades} ºC | ºF`}</div>
                            {city.imageUrl && (
                                <Img src={`https:${city.imageUrl}`} width={70} height={70} alt={city.name} />
                            )}
                            <div className={styles.info}>
                                <div className={styles.cityPrecipitation}>{`Precipitation: ${city.precipitation}`}</div>
                                <div className={styles.cityHumidity}>{`Humidity: ${city.humidity}`}</div>
                                <div className={styles.cityWindSpeed}>{`Wind Speed: ${city.windSpeed}`}</div>
                            </div>
                        </div>
                        <News city={city.city} />
                    </div>
                )
            )}
        </Container>
    );
};

export default Weather;
