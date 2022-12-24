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

const meta = {
    title: 'This is the Settings page',
};

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
                    alt="TODO change this"
                    img="/avatar.png"
                    name="Xabier Lameiro Cardama"
                    description={f({ id: 'settings.desc' })}
                />
            </div>
            <section className={styles.confg}>
                <IconWithName
                    alt="TODO change this"
                    icon="/language.jpeg"
                    name={f({ id: 'settings.lang' })}
                />
            </section>
        </>
    );
};

const Page = () => {
    const {
        state: { open },
    } = useDialog();

    return (
        <Layout meta={meta}>
            <Dialog body={Content} header={Header} open={open} modalMode />
        </Layout>
    );
};

export default Page;
