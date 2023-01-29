import useHeating from '@/hooks/useHeating';
import styles from './heating.module.css';
import { FaSpinner } from 'react-icons/fa';

const Heating = () => {
    const { data, error } = useHeating();

    if (error) {
        return <div>Failed to load</div>;
    }

    if (!data) return <FaSpinner className={styles.spinner} title="Loading stars" />;

    return (
        <div className={styles.container}>
            <div title="Actual temperature outside the house">{`${data.outsideTemp} º`}</div>|
            <div title="Indoor temperature of the dwelling, information collected from the thermostat">{`${data.zoneMeasuredTemp} º`}</div>
        </div>
    );
};

export default Heating;
