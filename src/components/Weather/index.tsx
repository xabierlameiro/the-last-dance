import React from 'react';
import styles from './weather.module.css';
import Img from 'next/image';
import News from '@/components/News';
import useWeather from '@/hooks/useWeather';
import RenderManager from '@/components/RenderManager';
import { clx } from '@/helpers';

const Container = ({ children, open }: { children: React.ReactNode; open?: boolean }) => {
    return (
        <div className={clx(styles.container, open ? styles.open : styles.close)}>
            <div className={styles.cities}>{children}</div>
        </div>
    );
};

/**
 *
 * @description -  Show the weather of array of cities and the last news of each city
 * @param {string[]} cities - Cities to get weather
 * @param {boolean} open - Open or close the component
 * @returns {JSX.Element} - News component
 * @todo - Pending internalization
 */
const Weather = ({ cities, open }: { cities: string[]; open?: boolean }) => {
    const { data, error } = useWeather(cities);

    return (
        <Container open={open}>
            <RenderManager loading={!data} error={error} errorTitle="" loadingTitle="Loading weather...">
                <>
                    {data &&
                        data?.map((city: any, index: any) => (
                            <div className={styles.city} key={`${city?.city}+${index}`}>
                                <div className={styles.weather}>
                                    <div className={styles.cityName}>{city?.city?.replace(/\+/g, ' ')}</div>
                                    <div className={styles.cityGrade}>{`${city?.grades} ºC | ºF`}</div>
                                    {city?.imageUrl && (
                                        <Img src={`https:${city?.imageUrl}`} width={70} height={70} alt={city?.name} />
                                    )}
                                    <div className={styles.info}>
                                        <div
                                            className={styles.cityPrecipitation}
                                        >{`Precipitation: ${city?.precipitation}`}</div>
                                        <div className={styles.cityHumidity}>{`Humidity: ${city?.humidity}`}</div>
                                        <div className={styles.cityWindSpeed}>{`Wind Speed: ${city?.windSpeed}`}</div>
                                    </div>
                                </div>
                                <News city={city.city} />
                            </div>
                        ))}
                </>
            </RenderManager>
        </Container>
    );
};

export default Weather;
