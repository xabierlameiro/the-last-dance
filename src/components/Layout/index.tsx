import type { ReactElement } from 'react';
import BackgroundImage from '@/components/BackgroundImage';
import { DialogProvider } from '@/context/dialog';
import styles from './layout.module.css';
import Footer from './Footer';
import Header from './Header';

type Props = {
    children: ReactElement;
    className?: string;
    isBlog?: boolean;
};

/**
 * @example
 *     <Layout meta={meta} isBlog={true}>
 *         <div>Content</div>
 *     </Layout>;
 *
 * @param {boolean} isBlog - Whether the page is a blog post the SEO changes
 * @param {string} className - The class name for the different pages
 * @param {JSX.Element} children - Content to be rendered
 * @returns {JSX.Element}
 */
const Layout = ({ className, children, isBlog }: Props) => {
    return (
        <div className={styles.layout}>
            <Header />
            <main data-testid="main" className={className}>
                <BackgroundImage />
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default function Page(props: { children: ReactElement }) {
    return (
        <DialogProvider>
            <Layout {...props} />
        </DialogProvider>
    );
}
