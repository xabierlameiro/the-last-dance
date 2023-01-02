import type { ReactElement } from 'react';
import Dock from '@/components/Dock';
import BackgroundImage from '../BackgroundImage';
import SEO from '@/components/SEO';

type Props = {
    children: ReactElement;
    className?: string;
    isBlog?: boolean;
    meta?: {
        title: string;
        author?: string;
        description?: string;
        image?: string;
        category?: string;
        alternate?: Array<{ lang: string; url: string }>;
        slug?: string;
        url?: string;
    };
};

const Layout = ({ meta, className, children, isBlog }: Props) => {
    return (
        <>
            <SEO meta={meta} isBlog={isBlog} />
            <BackgroundImage />
            <header data-testid="header"></header>
            <main data-testid="main" className={className}>
                {children}
            </main>
            <footer data-testid="footer"></footer>
            <Dock data-testid="nav" />
        </>
    );
};

export default Layout;
