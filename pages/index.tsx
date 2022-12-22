import * as React from 'react';
import CVMobile from '@/mdx/cv-mobile.mdx';
import CVDesktop from '@/mdx/cv.mdx';
import VisibilityManager from '@/components/VisibilityManager';
import Layout from '@/layout';
import Dialog from '@/components/Dialog';
import { useDialog } from '@/context/dialog';

const Page = () => {
    const {
        state: { open },
    } = useDialog();

    const meta = {
        title: "This is the Xabier's portfolio",
    };

    return (
        <Layout meta={meta}>
            <Dialog
                open={open}
                modalMode
                body={() => (
                    <>
                        <VisibilityManager hideOnDesktop hideOnTablet>
                            <CVMobile />
                        </VisibilityManager>
                        <VisibilityManager hideOnMobile>
                            <CVDesktop />
                        </VisibilityManager>
                    </>
                )}
            ></Dialog>
        </Layout>
    );
};

export default Page;
