import React from 'react';
import styles from '@/styles/settings.module.css';
import { useIntl } from 'react-intl';
import { useDialog } from '@/context/dialog';
import SEO from '@/components/SEO';
import Avatar from '@/ssrcomponents/Avatar';
import Dialog from '@/components/Dialog';
import LangeSelect from '@/components/LangSelect';
import SearchInput from '@/components/SearchInput';
import IconWithName from '@/components/IconWithName';
import ControlButtons from '@/components/ControlButtons';
import NavigationArrows from '@/components/NavigationArrows';
import GridLayoutControl from '@/components/GridLayoutControl';
import useDarkMode from '@/hooks/useDarkMode';

const toggleHandler = (dispatch: Function) => () => dispatch({ type: 'toggleLang' });

const Header = () => {
    const { lang, dispatch } = useDialog();
    const { formatMessage: f } = useIntl();
    const close = () => dispatch({ type: 'close' });
    return (
        <header className={styles.header}>
            <ControlButtons disabled onClickClose={close} onClickMinimise={close} />
            <NavigationArrows
                disabledRight={lang}
                disabledLeft={!lang}
                onClickLeft={toggleHandler(dispatch)}
                onClickRight={toggleHandler(dispatch)}
            />
            <GridLayoutControl routeName={f({ id: 'settings.title' })} />
            <SearchInput placeHolderText={f({ id: 'settings.search' })} />
        </header>
    );
};

const Content = () => {
    const { formatMessage: f } = useIntl();
    const { lang, dispatch } = useDialog();
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
                        icon="/lang.png"
                        alt={f({ id: 'settings.langAlt' })}
                        name={f({ id: 'settings.lang.description' })}
                    />
                    <LangeSelect />
                </div>
            </>
        );

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Avatar
                    img="/avatar.png"
                    name="Xabier Lameiro Cardama"
                    alt={f({ id: 'settings.avatar' })}
                    description={f({ id: 'settings.desc' })}
                />
            </div>
            <section className={styles.confg}>
                <IconWithName
                    icon="/lang.png"
                    alt={f({ id: 'settings.langAlt' })}
                    name={f({ id: 'settings.lang' })}
                    onClick={toggleHandler(dispatch)}
                />
                <IconWithName
                    icon="/theme.png"
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
    const { open } = useDialog();

    return (
        <>
            <SEO
                meta={{
                    title: f({ id: 'settings.seo.title' }),
                    description: f({ id: 'settings.seo.description' }),
                }}
            />
            <Dialog modalMode open={open} body={<Content />} header={<Header />} />
        </>
    );
};

export default Settings;
