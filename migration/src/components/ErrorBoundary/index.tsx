import React from 'react';
import ControlButtons from '@/components/ControlButtons';
import Dialog from '@/components/Dialog';
import Layout from '@/components/Layout';

class ErrorBoundary extends React.Component<React.PropsWithChildren<unknown>, { hasError: boolean; error?: any }> {
    constructor(props: any) {
        super(props);
        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Layout>
                    
                        
                        <Dialog
                            open
                            modalMode
                            withPadding
                            header={<ControlButtons disabled />}
                            body={
                                <div style={{ display: 'grid', placeContent: 'center', height: 'inherit' }}>
                                    {JSON.stringify(this.state.error.message)}
                                </div>
                            }
                        />
                    
                </Layout>
            );
        }

        return <>{this.props.children}</>;
    }
}

export default ErrorBoundary;
