import React from 'react';
import { useIntl } from 'react-intl';
import styles from './date.module.css';

type Props = {
    date: Date;
};
const Date = ({ date }: Props) => {
    const { formatDate } = useIntl();

    return (
        <div className={styles.date} suppressHydrationWarning>
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
