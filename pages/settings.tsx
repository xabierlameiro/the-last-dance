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

const meta = {
    title: 'This is the Settings page',
};

const Header = () => {
    return (
        <header className={styles.header}>
            <ControlButtons disabled />
            <NavigationArrows />
            <GridLayoutControl />
            <SearchInput />
        </header>
    );
};

const Content = () => {
    return (
        <>
            <div className={styles.content}>
                <Avatar
                    alt="TODO change this"
                    img="/avatar.png"
                    name="Xabier Lameiro Cardama"
                    description="ID of Apple"
                />
            </div>
            <section className={styles.confg}>
                <IconWithName
                    alt="TODO change this"
                    icon="/language.jpeg"
                    name="Language & Region"
                />
            </section>
        </>
    );
};

const Page = () => {
    return (
        <Layout meta={meta}>
            <Dialog body={Content} header={Header} open modalMode />
        </Layout>
    );
};

export default Page;
