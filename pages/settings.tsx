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

const Header = () => {
    const { dispatch } = useDialog();
    const { formatMessage: f } = useIntl();
    const close = () => dispatch({ type: 'close' });
    return (
        <header className={styles.header}>
            <ControlButtons
                disabled
                onClickClose={close}
                onClickMinimise={close}
            />
            <NavigationArrows />
            <GridLayoutControl routeName={f({ id: 'settings.title' })} />
            <SearchInput placeHolderText={f({ id: 'settings.search' })} />
        </header>
    );
};

const Content = () => {
    const { formatMessage: f } = useIntl();
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
            <section className={styles.confg}>
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
                body={<Content />}
                header={<Header />}
                open={open}
                modalMode
            />
        </Layout>
    );
};

export default Page;
