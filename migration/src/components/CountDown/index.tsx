'use client'

import React from 'react';
import styles from './countdown.module.css';
import Tooltip from '@/components/Tooltip';
import { useTranslation } from '@/hooks/useTranslationSimple';

type Props = {
    date: string;
    caption?: string;
};

/**
 * @description This function is used to calculate the time left until the date
 * @param {string} date - The date to calculate the time left
 * @param {Function} setTime - The function to set the time left
 * @param {Object} timeLeft - The time left object
 * @returns {Object} - The time left object
 * @example calculateTimeLeft('2021-12-31', setTime)
 */
const calculateTimeLeft = (date: string, setTime: Function, timeLeft: Object = {}) => {
    const difference = +new Date(date) - +new Date();
    const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 30 * 12));
    const months = Math.floor((difference / (1000 * 60 * 60 * 24 * 30)) % 12);
    const days = Math.floor((difference / (1000 * 60 * 60 * 24)) % 30);
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    if (difference > 0) {
        setTime({
            years: years < 10 ? `0${years}` : years,
            months: months < 10 ? `0${months}` : months,
            days: days < 10 ? `0${days}` : days,
            hours: hours < 10 ? `0${hours}` : hours,
            minutes: minutes < 10 ? `0${minutes}` : minutes,
            seconds: seconds < 10 ? `0${seconds}` : seconds,
        });
    }

    return timeLeft;
};

/**
 * @description Countdown to date provided in months, days, hours, minutes and seconds
 * @param {string} date - date to countdown to
 * @param {string} caption - caption to display
 * @returns {JSX.Element}
 */
const CountDown = ({ date: dateProvided, caption }: Props) => {
    const { t } = useTranslation();
    const [time, setTime] = React.useState({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    React.useEffect(() => {
        const timer = setTimeout(() => {
            calculateTimeLeft(dateProvided, setTime);
        }, 1000);

        return () => clearTimeout(timer);
    }, [dateProvided, time]);

    return (
        <Tooltip>
            <Tooltip.Trigger>
                <div className={styles.countdown} data-testid="countdown">
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.years}</div>
                        <div className={styles.countdown__item__text}>{t('countdown.years')}</div>
                    </div>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.months}</div>
                        <div className={styles.countdown__item__text}>{t('countdown.months')}</div>
                    </div>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.days}</div>
                        <div className={styles.countdown__item__text}>{t('countdown.days')}</div>
                    </div>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.hours}</div>
                        <div className={styles.countdown__item__text}>{t('countdown.hours')}</div>
                    </div>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.minutes}</div>
                        <div className={styles.countdown__item__text}>{t('countdown.minutes')}</div>
                    </div>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.seconds}</div>
                        <div className={styles.countdown__item__text}>{t('countdown.seconds')}</div>
                    </div>
                </div>
            </Tooltip.Trigger>
            {caption && <Tooltip.Content>{caption}</Tooltip.Content>}
        </Tooltip>
    );
};

export default CountDown;
