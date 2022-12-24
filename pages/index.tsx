import * as React from 'react';
import CVMobile from '@/mdx/cv-mobile.mdx';
import CVDesktop from '@/mdx/cv.mdx';
import VisibilityManager from '@/components/VisibilityManager';
import Layout from '@/layout';
import Dialog from '@/components/Dialog';
import { useDialog } from '@/context/dialog';
import { useIntl } from 'react-intl';

const Page = () => {
    const { open } = useDialog();
    const { formatMessage: f } = useIntl();

    return (
        <Layout meta={{ title: f({ id: 'home.seo.title' }) }}>
            <Dialog
                open={open}
                modalMode
                body={
                    <>
                        <VisibilityManager hideOnDesktop hideOnTablet>
                            <CVMobile />
                        </VisibilityManager>
                        <VisibilityManager hideOnMobile>
                            <CVDesktop />
                        </VisibilityManager>
                    </>
                }
            ></Dialog>
        </Layout>
    );
};

export default Page;
