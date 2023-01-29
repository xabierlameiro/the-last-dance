import useHeating from '@/hooks/useHeating';
import styles from './heating.module.css';

const Heating = () => {
    const { data, error } = useHeating();

    console.log('data', data);
    console.log('error', error);

    if (error) {
        return <div>Failed to load</div>;
    }

    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <div title="Actual temperature outside the house">{`${data.outsideTemp} º`}</div>|
            <div title="Indoor temperature of the dwelling, information collected from the thermostat">{`${data.zoneMeasuredTemp} º`}</div>
        </div>
    );
};

export default Heating;
