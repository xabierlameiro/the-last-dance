import React from 'react';
import styles from '@/styles/settings.module.css';
import { useIntl } from 'react-intl';
import { useDialog } from '@/context/dialog';
import {
    Layout,
    Avatar,
    Dialog,
    LangeSelect,
    SearchInput,
    IconWithName,
    ControlButtons,
    NavigationArrows,
    GridLayoutControl,
} from '@/components';

const Header = () => {
    const { lang, dispatch } = useDialog();
    const { formatMessage: f } = useIntl();
    const close = () => dispatch({ type: 'close' });
    return (
        <header className={styles.header}>
            <ControlButtons
                disabled
                onClickClose={close}
                onClickMinimise={close}
            />
            <NavigationArrows
                disabledRight={lang}
                disabledLeft={!lang}
                onClickLeft={() => dispatch({ type: 'toggleLang' })}
                onClickRight={() => dispatch({ type: 'toggleLang' })}
            />
            <GridLayoutControl routeName={f({ id: 'settings.title' })} />
            <SearchInput placeHolderText={f({ id: 'settings.search' })} />
        </header>
    );
};

const Content = () => {
    const { formatMessage: f } = useIntl();
    const { lang, dispatch } = useDialog();

    if (lang)
        return (
            <>
                <div className={styles.lang}>
                    <IconWithName
                        horizontal
                        icon="/language.jpeg"
                        alt={f({ id: 'settings.langAlt' })}
                        name={f({ id: 'settings.lang.description' })}
                    />
                    <LangeSelect />
                </div>
            </>
        );

    return (
        <>
            <div className={styles.content}>
                <Avatar
                    img="/avatar.png"
                    name="Xabier Lameiro Cardama"
                    alt={f({ id: 'settings.avatar' })}
                    description={f({ id: 'settings.desc' })}
                />
            </div>
            <section
                className={styles.confg}
                onClick={() => dispatch({ type: 'toggleLang' })}
            >
                <IconWithName
                    icon="/language.jpeg"
                    alt={f({ id: 'settings.langAlt' })}
                    name={f({ id: 'settings.lang' })}
                />
            </section>
        </>
    );
};

const Page = () => {
    const { formatMessage: f } = useIntl();
    const { open } = useDialog();

    return (
        <Layout meta={{ title: f({ id: 'settings.seo.title' }) }}>
            <Dialog
                modalMode
                open={open}
                body={<Content />}
                header={<Header />}
            />
        </Layout>
    );
};

export default Page;
