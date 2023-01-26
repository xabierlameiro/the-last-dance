import React from 'react';
import styles from './countdown.module.css';

type Props = {
    date: string;
};

const calculateTimeLeft = (date: string, setTime: Function, timeLeft: Object = {}) => {
    const difference = +new Date(date) - +new Date();
    const months = Math.floor((difference / (1000 * 60 * 60 * 24 * 30)) % 12);
    const days = Math.floor((difference / (1000 * 60 * 60 * 24)) % 30);
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    if (difference > 0) {
        setTime({
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
 * @returns {JSX.Element}
 */
const CountDown = ({ date: dateProvided }: Props) => {
    const [time, setTime] = React.useState({
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
        <div className={styles.countdown} data-testid="countdown">
            <div className={styles.countdown__item}>
                <div suppressHydrationWarning className={styles.countdown__item__number}>
                    {time.months}
                </div>
                <div className={styles.countdown__item__text}>Mons</div>
            </div>

            <div className={styles.countdown__item}>
                <div suppressHydrationWarning className={styles.countdown__item__number}>
                    {time.days}
                </div>
                <div className={styles.countdown__item__text}>Days</div>
            </div>
            <div className={styles.countdown__item}>
                <div suppressHydrationWarning className={styles.countdown__item__number}>
                    {time.hours}
                </div>
                <div className={styles.countdown__item__text}>Hour</div>
            </div>
            <div className={styles.countdown__item}>
                <div suppressHydrationWarning className={styles.countdown__item__number}>
                    {time.minutes}
                </div>
                <div className={styles.countdown__item__text}>Mins</div>
            </div>
            <div className={styles.countdown__item}>
                <div suppressHydrationWarning className={styles.countdown__item__number}>
                    {time.seconds}
                </div>
                <div className={styles.countdown__item__text}>Secs</div>
            </div>
        </div>
    );
};

export default CountDown;
