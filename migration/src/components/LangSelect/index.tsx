'use client'

import { useTranslation } from '@/hooks/useTranslationSimple';
import { useRouter, usePathname } from 'next/navigation';
import styles from './langselect.module.css';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'gl', name: 'Galego' }
];

/**
 * @example
 *     <LangSelect />;
 *
 * @returns {JSX.Element}
 */
const LangeSelect = () => {
    const { t, lang } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();

    const handleLanguageChange = (newLang: string) => {
        // Get the current path without the language prefix
        const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '');
        // Navigate to the new language path
        router.push(`/${newLang}${pathWithoutLang}`);
    };

    return (
        <div className={styles.lang_container} data-testid="lang-select">
            <label className={styles.lang_label} htmlFor="lang">
                {t('settings.lang.preferred')}
            </label>
            <select
                id="lang"
                name="lang"
                className={styles.lang_select}
                size={languages.length}
                defaultValue={lang}
                onChange={(e) => handleLanguageChange(e.target.value)}
            >
                {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                        {language.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LangeSelect;
