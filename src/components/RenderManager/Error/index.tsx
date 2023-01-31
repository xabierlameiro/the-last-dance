import { RxCross2 } from 'react-icons/rx';
import styles from './error.module.css';

const Error = () => {
    return <RxCross2 className={styles.error} data-testid="error" />;
};

export default Error;
