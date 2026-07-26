import React from 'react';
import Link from 'next/link';
import { FormattedMessage } from 'react-intl';
import ControlButtons from '@/components/ControlButtons';
import SEO from '@/components/SEO';
import Dialog from '@/components/Dialog';
import Layout from '@/components/Layout';
import styles from '../../pages/error.module.css';

class ErrorBoundary extends React.Component<React.PropsWithChildren<unknown>, { hasError: boolean; error?: Error }> {
    constructor(props: React.PropsWithChildren<unknown>) {
        super(props);
        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    /**
     * SDD-L08. The boundary used to render `this.state.error?.message` straight to the visitor.
     *
     * That is a React error object from a production bundle: at best it reads "Minified React error
     * #418", at worst it carries a fragment of internal state, a URL, or a property name from
     * whatever threw. It tells a reader nothing they can act on and tells anyone else more than they
     * should see. The detail belongs in the console, where a developer can read it; the page gets a
     * sentence in the visitor's own language.
     */
    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('Unhandled render error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Layout>
                    <>
                        <SEO
                            meta={{
                                title: 'Error',
                                description: '',
                                noindex: true,
                            }}
                        />
                        <Dialog
                            open
                            modalMode
                            withPadding
                            header={<ControlButtons disabled />}
                            body={
                                // A class component cannot call useIntl. FormattedMessage reads the
                                // same context, and _app mounts IntlProvider outside this boundary.
                                <div className={styles.body}>
                                    <p>
                                        <FormattedMessage id="error.boundary.message" />
                                    </p>
                                    <Link href="/" className={styles.home}>
                                        <FormattedMessage id="error.home" />
                                    </Link>
                                </div>
                            }
                        />
                    </>
                </Layout>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
