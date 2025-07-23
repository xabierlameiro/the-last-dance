import React from 'react';
import ControlButtons from '@/components/ControlButtons';
import SEO from '@/components/SEO';
import Dialog from '@/components/Dialog';
import Layout from '@/components/Layout';

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

    render() {
        if (this.state.hasError) {
            return (
                <Layout>
                    <>
                        <SEO
                            meta={{
                                title: 'Error | Oh! sorry, an error has occurred',
                                description: 'Oh! sorry, an error has occurred',
                                noindex: true,
                            }}
                        />
                        <Dialog
                            open
                            modalMode
                            withPadding
                            header={<ControlButtons disabled />}
                            body={
                                <div style={{ display: 'grid', placeContent: 'center', height: 'inherit' }}>
                                    {this.state.error?.message || 'An unknown error occurred'}
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
