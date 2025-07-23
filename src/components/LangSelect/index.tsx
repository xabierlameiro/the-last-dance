import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import styles from './langselect.module.css';
import { messages } from '../../../src/intl/translations';

/**
 * @example
 *     <LangSelect />;
 *
 * @returns {JSX.Element}
 */
const LangeSelect = () => {
    const { formatMessage: f } = useIntl();
    const router = useRouter();

    const handleLanguageChange = (newLocale: string) => {
        // Use router.push with locale parameter
        router.push(router.asPath, router.asPath, {
            locale: newLocale,
        });
    };

    return (
        <div className={styles.lang_container} data-testid="lang-select">
            <label className={styles.lang_label} htmlFor="lang">
                {f({ id: 'settings.lang.preferred' })}
            </label>
            <select
                id="lang"
                name="lang"
                className={styles.lang_select}
                size={Object.keys(messages).length}
                value={router.locale}
                onChange={(e) => handleLanguageChange(e.target.value)}
            >
                {Object.entries(messages).map(([key, value]) => {
                    return (
                        <option key={key} value={key}>
                            {value.language}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

export default LangeSelect;
