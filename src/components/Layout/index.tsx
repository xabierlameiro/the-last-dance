import type { ReactElement } from 'react';
import BackgroundImage from '../BackgroundImage';
import styles from './layout.module.css';
import SEO from '@/components/SEO';
import Footer from './Footer';
import Header from './Header';

type Props = {
    children: ReactElement;
    className?: string;
    isBlog?: boolean;
    meta?: {
        noindex?: boolean;
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
        <div className={styles.layout}>
            <Header>
                <SEO meta={meta} isBlog={isBlog} />
            </Header>
            <main data-testid="main" className={className}>
                <BackgroundImage />
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
