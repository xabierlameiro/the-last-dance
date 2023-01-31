import React from 'react';
import styles from './weather.module.css';
import Img from 'next/image';
import News from '@/components/News';
import useWeather from '@/hooks/useWeather';
import RenderManager from '@/components/RenderManager';
import { GrFormClose } from 'react-icons/gr';
import { clx } from '@/helpers';
import { useIntl } from 'react-intl';

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
 * @param {Function} handleClose - Function to close the component
 * @returns {JSX.Element} - News component
 */
const Weather = ({ cities, open, handleClose }: { cities: string[]; open?: boolean; handleClose?: () => void }) => {
    const { data, error } = useWeather(cities);
    const { formatMessage: f } = useIntl();

    return (
        <Container open={open}>
            {handleClose && <GrFormClose className={styles.iconClose} onClick={handleClose} />}
            <RenderManager
                error={error}
                loading={!data}
                errorTitle={f({ id: 'weather.error' })}
                loadingTitle={f({ id: 'weather.loading' })}
            >
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
                                        <div className={styles.cityPrecipitation}>
                                            {f({ id: 'weather.precipitation' }, { precipitation: city?.precipitation })}
                                        </div>
                                        <div className={styles.cityHumidity}>
                                            {f({ id: 'weather.humidity' }, { humidity: city?.humidity })}
                                        </div>
                                        <div className={styles.cityWindSpeed}>
                                            {f({ id: 'weather.windSpeed' }, { windSpeed: city?.windSpeed })}
                                        </div>
                                    </div>
                                </div>
                                {city?.city && <News city={city.city} />}
                            </div>
                        ))}
                </>
            </RenderManager>
        </Container>
    );
};

export default Weather;
