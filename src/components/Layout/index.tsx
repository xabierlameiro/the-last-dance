import type { ReactElement } from 'react';
import BackgroundImage from '@/components/BackgroundImage';
import { DialogProvider } from '@/context/dialog';
import styles from './layout.module.css';
import Footer from './Footer';
import Header from './Header';
import StarPrompt from '@/components/StarPrompt';

type Props = {
    children: ReactElement;
    className?: string;
};

/**
 * @example
 *     <Layout meta={meta} isBlog={true}>
 *         <div>Content</div>
 *     </Layout>;
 *
 * @param {string} className - The class name for the different pages
 * @param {JSX.Element} children - Content to be rendered
 * @returns {JSX.Element}
 */
const Layout = ({ className, children }: Props) => {
    return (
        <div className={styles.layout}>
            <Header />
            <main data-testid="main" className={className}>
                <BackgroundImage />
                {children}
            </main>
            <Footer />
            <StarPrompt />
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
