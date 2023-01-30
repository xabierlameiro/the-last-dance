import useHeating from '@/hooks/useHeating';
import styles from './heating.module.css';
import RenderManager from '@/components/RenderManager';
import { FaTemperatureHigh } from 'react-icons/fa';
import Tooltip from '@/components/Tooltip';

/**
 * @description - Shows the current temperature of the house and the outside temperature
 * @returns {JSX.Element} - News component
 * @todo - Pending internalization
 */
const Heating = () => {
    const { data, error, loading } = useHeating();

    return (
        <Tooltip>
            <Tooltip.Trigger>
                <div className={styles.container}>
                    <FaTemperatureHigh className={styles.icon} />
                    <RenderManager
                        loading={loading}
                        error={error}
                        loadingTitle="Loading heating data"
                        errorTitle="Error loading heating data"
                    >
                        <div>{data.outsideTemp ?? 0}</div>|<div>{data.zoneMeasuredTemp ?? 0}</div>
                    </RenderManager>
                </div>
            </Tooltip.Trigger>
            <Tooltip.Content>Outside and inside temperature of my house</Tooltip.Content>
        </Tooltip>
    );
};

export default Heating;
