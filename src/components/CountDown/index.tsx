import React from 'react';
import styles from './countdown.module.css';
import Tooltip from '@/components/Tooltip';
import { useIntl } from 'react-intl';

type Props = {
    date: string;
    caption?: string;
};

type TimeLeft = {
    years: string | number;
    months: string | number;
    days: string | number;
    hours: string | number;
    minutes: string | number;
    seconds: string | number;
};

/**
 * @description This function is used to calculate the time left until the date
 * @param {string} date - The date to calculate the time left
 * @param {Function} setTime - The function to set the time left
 * @param {TimeLeft} timeLeft - The time left object
 * @returns {TimeLeft} - The time left object
 * @example calculateTimeLeft('2021-12-31', setTime)
 */
const calculateTimeLeft = (
    date: string, 
    setTime: (time: TimeLeft) => void, 
    timeLeft: TimeLeft = {} as TimeLeft
) => {
    const difference = new Date(date).getTime() - Date.now();
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
    const { formatMessage: f, formatDate } = useIntl();
    const [time, setTime] = React.useState<TimeLeft>({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    /**
     * SDD-L09-T10. This was a `setTimeout` with `time` in its dependency array, and the callback
     * called `setTime` with a **fresh object every tick**. So each tick changed `time` by identity,
     * which re-ran the effect, which cleared and re-armed the timeout — a re-render loop that ran on
     * every page, because the header mounts this site-wide. Each pass also dragged the Floating UI
     * `Tooltip` wrapping it through a full render.
     *
     * One interval keyed on the date does the same job: the tick is what should drive the update,
     * not the state the tick produced.
     */
    React.useEffect(() => {
        calculateTimeLeft(dateProvided, setTime);
        const timer = setInterval(() => calculateTimeLeft(dateProvided, setTime), 1000);

        return () => clearInterval(timer);
    }, [dateProvided]);

    /*
     * SDD-L08-T18: the countdown was six bare numbers whose only explanation was a tooltip reading
     * "Important date". This at least says what the number counts towards, in the reader's locale
     * and calendar. What the date signifies is the owner's copy to write, not something to invent.
     */
    const label = f(
        { id: 'countdown.label' },
        { date: formatDate(dateProvided, { dateStyle: 'long', timeZone: 'UTC' }) }
    );

    return (
        <Tooltip>
            <Tooltip.Trigger>
                <div className={styles.countdown} data-testid="countdown" role="group" aria-label={label}>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.years}</div>
                        <div className={styles.countdown__item__text}>{f({ id: 'countdown.years' })}</div>
                    </div>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.months}</div>
                        <div className={styles.countdown__item__text}>{f({ id: 'countdown.months' })}</div>
                    </div>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.days}</div>
                        <div className={styles.countdown__item__text}>{f({ id: 'countdown.days' })}</div>
                    </div>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.hours}</div>
                        <div className={styles.countdown__item__text}>{f({ id: 'countdown.hours' })}</div>
                    </div>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.minutes}</div>
                        <div className={styles.countdown__item__text}>{f({ id: 'countdown.minutes' })}</div>
                    </div>
                    <div className={styles.countdown__item}>
                        <div suppressHydrationWarning>{time.seconds}</div>
                        <div className={styles.countdown__item__text}>{f({ id: 'countdown.seconds' })}</div>
                    </div>
                </div>
            </Tooltip.Trigger>
            {caption && <Tooltip.Content>{caption}</Tooltip.Content>}
        </Tooltip>
    );
};

export default CountDown;
