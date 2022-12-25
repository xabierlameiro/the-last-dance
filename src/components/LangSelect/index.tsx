import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import styles from './langselect.module.css';
import { messages } from '../../../src/intl/translations';

const LangeSelect = () => {
    const { formatMessage: f } = useIntl();
    const router = useRouter();

    return (
        <div className={styles.lang_container}>
            <label className={styles.lang_label} htmlFor="lang">
                {f({ id: 'settings.lang.preferred' })}
            </label>
            <select
                id="lang"
                name="lang"
                className={styles.lang_select}
                size={Object.keys(messages).length}
                onChange={(e) => {
                    router.push(router.pathname, router.pathname, {
                        locale: e.target.value,
                    });
                }}
            >
                {Object.entries(messages).map(([key, value]) => {
                    return (
                        <option
                            key={key}
                            value={key}
                            selected={router.locale === key}
                        >
                            {value.language}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

export default LangeSelect;
