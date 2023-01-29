import useHeating from '@/hooks/useHeating';
import styles from './heating.module.css';
import RenderManager from '@/components/RenderManager';

/**
 * @description - Heating component
 * @returns {JSX.Element} - News component
 * @todo - Pending internalization
 */
const Heating = () => {
    const { data, error, loading } = useHeating();

    return (
        <RenderManager
            loading={loading}
            error={error}
            loadingTitle="Loading heating data"
            errorTitle="Error loading heating data"
        >
            <div className={styles.container}>
                <div title="Actual temperature outside the house">{`${data.outsideTemp} º`}</div>|
                <div title="Indoor temperature of the dwelling, information collected from the thermostat">{`${data.zoneMeasuredTemp} º`}</div>
            </div>
        </RenderManager>
    );
};

export default Heating;
