import useHeating from '@/hooks/useHeating';
import styles from './heating.module.css';
import RenderManager from '@/components/RenderManager';
import { FaTemperatureHigh } from 'react-icons/fa';

/**
 * @description - Heating component
 * @returns {JSX.Element} - News component
 * @todo - Pending internalization
 */
const Heating = () => {
    const { data, error, loading } = useHeating();

    return (
        <div className={styles.container}>
            <FaTemperatureHigh className={styles.icon} />
            <RenderManager
                loading={loading}
                error={error}
                loadingTitle="Loading heating data"
                errorTitle="Error loading heating data"
            >
                <div title="Actual temperature outside the house">{data.outsideTemp ?? 0}</div>|
                <div title="Indoor temperature of the dwelling, information collected from the thermostat">
                    {data.zoneMeasuredTemp ?? 0}
                </div>
            </RenderManager>
        </div>
    );
};

export default Heating;
