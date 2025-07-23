import React from 'react';
import styles from '@/styles/settings.module.css';
import { useIntl } from 'react-intl';
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
    const close = () => {
        // For a standalone page, we can't really "close", so we'll go back to home
        window.location.href = '/';
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
                    name="Xabier Lameiro Cardama"
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
                    alt={f({ id: 'settings.langAlt' })}
                    name={f({ id: theme === dark ? 'settings.dark' : 'settings.light' })}
                    onClick={toggleTheme}
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
