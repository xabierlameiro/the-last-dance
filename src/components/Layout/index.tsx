import type { ReactElement } from 'react';
import Head from 'next/head';
import Dock from '@/components/Dock';
import BackgroundImage from '../BackgroundImage';

type Props = {
    children: ReactElement;
    meta?: {
        title: string;
    };
};

const Layout = ({ meta, children }: Props) => {
    return (
        <>
            <BackgroundImage />
            <Head>
                <title>{meta?.title}</title>
            </Head>
            <header data-testid="header"></header>
            <main data-testid="main"> {children}</main>
            <footer data-testid="footer"></footer>
            <Dock data-testid="nav" />
        </>
    );
};

export default Layout;
