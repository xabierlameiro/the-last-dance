import React from 'react';
import styles from '@/styles/settings.module.css';
import Layout from '@/layout';
import Dialog from '@/components/Dialog';
import Avatar from '@/components/Avatar';
import IconWithName from '@/components/IconWithName';
import ControlButtons from '@/components/ControlButtons';
import NavigationArrows from '@/components/NavigationArrows';
import SearchInput from '@/components/SearchInput';
import GridLayoutControl from '@/components/GridLayoutControl';
import { useDialog } from '@/context/dialog';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import { messages } from '../src/intl/translations';

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
    const router = useRouter();

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
                </div>
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
