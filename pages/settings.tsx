import Layout from '@/layout';
import Dialog from '@/components/Dialog';
import React from 'react';
import Content from '@/components/Dialog/Content';

const meta = {
    title: 'This is the Settings page',
};

const Page = () => {
    const [open, setOpen] = React.useState(true);

    const props = {
        open: open,
        onClickClose: () => setOpen(false),
        onClickMinimise: () => setOpen(false),
    };

    return (
        <Layout meta={meta}>
            <Dialog {...props} modal showControls disabled>
                <Content />
            </Dialog>
        </Layout>
    );
};

export default Page;
