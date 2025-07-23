import { FaSpinner } from 'react-icons/fa';
import styles from './loading.module.css';

const Loading = () => {
    return <FaSpinner className={styles.spinner} data-testid="loading" />;
};

export default Loading;
