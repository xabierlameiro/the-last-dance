import useHeating from '@/hooks/useHeating';
import styles from './heating.module.css';
import RenderManager from '@/components/RenderManager';
import Tooltip from '@/components/Tooltip';
import { FaTemperatureHigh } from 'react-icons/fa';
import { useIntl } from 'react-intl';

/**
 * @description - Shows the current temperature of the house and the outside temperature
 * @returns {JSX.Element} - News component
 */
const Heating = () => {
    const { data, error, loading } = useHeating();
    const { formatMessage: f } = useIntl();

    return (
        <Tooltip>
            <Tooltip.Trigger>
                <div className={styles.container} data-testid="heating">
                    <FaTemperatureHigh className={styles.icon} />
                    <RenderManager
                        error={error}
                        loading={loading}
                        errorTitle={f({ id: 'heating.error' })}
                        loadingTitle={f({ id: 'heating.loading' })}
                    >
                        <div>{data.outsideTemp ?? 0}</div>|<div>{data.zoneMeasuredTemp ?? 0}</div>
                    </RenderManager>
                </div>
            </Tooltip.Trigger>
            <Tooltip.Content>
                {f(
                    { id: 'heating.tooltip' },
                    { outsideTemp: data.outsideTemp, zoneMeasuredTemp: data.zoneMeasuredTemp }
                )}
            </Tooltip.Content>
        </Tooltip>
    );
};

export default Heating;
