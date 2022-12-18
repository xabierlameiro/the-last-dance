import type { ReactElement } from 'react';
import Head from 'next/head';

type Props = {
    children: ReactElement;
    meta?: {
        title: string;
    };
};

const Layout = ({ meta, children }: Props) => {
    return (
        <>
            <Head>
                <title>{meta?.title}</title>
            </Head>
            <header data-testid="header"></header>
            <main data-testid="main"> {children}</main>
            <footer data-testid="footer"></footer>
        </>
    );
};

export default Layout;
