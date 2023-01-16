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

/**
 * @example
 *     <Notification title="Success" message="This is a success message" type="success" />;
 *     <Notification title="Error" message="This is an error message" type="error" />;
 *
 * @param {string} title - The title of the notification
 * @param {string} message - The message of the notification
 * @param {string} type - The type of the notification
 * @param {function} onClose - The function to be called when the notification is closed
 * @returns {JSX.Element}
 */
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
