import React from 'react';
import styles from '@/styles/settings.module.css';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import SEO from '@/components/SEO';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import LangSelect from '@/components/LangSelect';
import SearchInput from '@/components/SearchInput';
import IconWithName from '@/components/IconWithName';
import ControlButtons from '@/components/ControlButtons';
import NavigationArrows from '@/components/NavigationArrows';
import GridLayoutControl from '@/components/GridLayoutControl';
import useDarkMode from '@/hooks/useDarkMode';

const toggleHandler = (toggleLang: () => void) => () => toggleLang();

const Header = ({ lang, toggleLang }: { lang: boolean; toggleLang: () => void }) => {
    const { formatMessage: f } = useIntl();
    const router = useRouter();
    const close = () => {
        /*
         * SDD-L08: was `window.location.href = '/'`. Two problems in one line. It is a full document
         * reload, throwing away the SPA and re-downloading everything to go one route away; and `/`
         * is the *English* home, so closing Settings from `/es/settings` or `/gl/settings` silently
         * dropped the visitor's language. `router.push` with an explicit locale keeps both.
         */
        router.push('/', '/', { locale: router.locale });
    };
    return (
        <header className={styles.header}>
            <ControlButtons disabled onClickClose={close} onClickMinimise={close} />
            <NavigationArrows
                disabledRight={lang}
                disabledLeft={!lang}
                onClickLeft={toggleHandler(toggleLang)}
                onClickRight={toggleHandler(toggleLang)}
            />
            <GridLayoutControl routeName={f({ id: 'settings.title' })} />
            <SearchInput placeHolderText={f({ id: 'settings.search' })} />
        </header>
    );
};

const Content = ({ lang, toggleLang }: { lang: boolean; toggleLang: () => void }) => {
    const { formatMessage: f } = useIntl();
    const {
        theme,
        scheme: { dark },
        toggleTheme,
    } = useDarkMode();

    if (lang)
        return (
            <>
                <div className={styles.lang}>
                    <IconWithName
                        horizontal
                        icon="/settings/lang.png"
                        alt={f({ id: 'settings.langAlt' })}
                        name={f({ id: 'settings.lang.description' })}
                    />
                    <LangSelect />
                </div>
            </>
        );

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Avatar
                    img="/settings/avatar.png"
                    name="Xabier Lameiro"
                    alt={f({ id: 'settings.avatar' })}
                    description={f({ id: 'settings.desc' })}
                />
            </div>
            <section className={styles.confg}>
                <IconWithName
                    icon="/settings/lang.png"
                    alt={f({ id: 'settings.langAlt' })}
                    name={f({ id: 'settings.lang' })}
                    onClick={toggleHandler(toggleLang)}
                />
                <IconWithName
                    icon="/settings/theme.png"
                    // SDD-L05: this used to be `settings.langAlt` — the *language* setting's alt text on
                    // the theme icon. Empty is correct anyway: the adjacent `name` already labels the
                    // control, so a described icon would just repeat it.
                    alt=""
                    name={f({ id: theme === dark ? 'settings.dark' : 'settings.light' })}
                    onClick={toggleTheme}
                    // Announces on/off rather than leaving a screen-reader user to infer it from the label.
                    pressed={theme === dark}
                />
            </section>
            <section className={styles.confg}></section>
        </div>
    );
};

const Settings = () => {
    const { formatMessage: f } = useIntl();
    // For the settings page, we always want the dialog to be open
    // We don't use the context here since this is a dedicated page
    const [lang, setLang] = React.useState(false);

    const toggleLang = () => setLang(!lang);

    return (
        <>
            <SEO
                meta={{
                    title: f({ id: 'settings.seo.title' }),
                    description: f({ id: 'settings.seo.description' }),
                    // SDD-L04: both this page and /settings were indexed by Google while being
                    // excluded from the sitemap — content-free UI demos ranking under the brand and
                    // diluting site-quality signals. /survey already did this correctly, so the
                    // pattern existed and these two just never got it.
                    noindex: true,
                }}
            />
            <Dialog
                modalMode
                open
                body={<Content lang={lang} toggleLang={toggleLang} />}
                header={<Header lang={lang} toggleLang={toggleLang} />}
            />
        </>
    );
};

export default Settings;
