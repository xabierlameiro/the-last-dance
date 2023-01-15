import React from 'react';
import { clx } from '@/helpers';
import styles from './notification.module.css';
import { GrFormClose } from 'react-icons/gr';

type Props = {
    title: string;
    message: string;
    type?: 'success' | 'error';
    onClose?: () => void;
};

const Notification = ({ title, message, type = 'success', onClose }: Props) => {
    const [show, setShow] = React.useState(true);

    React.useEffect(() => {
        if (show) {
            const timeout = setTimeout(() => {
                setShow(false);
            }, 7000);

            return () => clearTimeout(timeout);
        }
    }, [show]);

    return (
        <div
            className={clx(
                styles.notification,
                type === 'success' ? styles.success : styles.error,
                show ? styles.show : styles.hide
            )}
        >
            <GrFormClose className={styles.close} onClick={() => setShow(false)} />
            <div className={styles.title}>{title}</div>
            <div className={styles.message}>{message}</div>
        </div>
    );
};

export default Notification;
