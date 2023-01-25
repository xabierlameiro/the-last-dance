import React from 'react';
import { useIntl } from 'react-intl';
import styles from './date.module.css';

type Props = {
    date: string;
};

/**
 * @example
 *    <Date date="01-02-2023" />
 *
 * @param {Date} string
 * @returns {JSX.Element}
 */
const Date = ({ date }: Props) => {
    const { formatDate } = useIntl();

    return (
        <div data-testid="date" className={styles.date} suppressHydrationWarning>
            {formatDate(date, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })}
        </div>
    );
};

export default Date;
