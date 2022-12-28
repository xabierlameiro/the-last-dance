import * as React from 'react';
import { Layout, Dialog, VisibilityManager } from '@/components';
import { useIntl } from 'react-intl';
import { MDXRemote } from 'next-mdx-remote';
import { components } from '@/helpers/mdxjs';
import { serializePath } from '@/helpers/mdx';
import { useDialog } from '@/context/dialog';

const Page = ({ content }: any) => {
    const { open } = useDialog();
    const { formatMessage: f } = useIntl();

    return (
        <Layout meta={{ title: f({ id: 'home.seo.title' }) }}>
            <Dialog
                modalMode
                open={open}
                body={
                    <>
                        <VisibilityManager hideOnDesktop hideOnTablet>
                            <MDXRemote
                                {...content.mobile}
                                components={components}
                            />
                        </VisibilityManager>
                        <VisibilityManager hideOnMobile>
                            <MDXRemote
                                {...content.desktop}
                                components={components}
                            />
                        </VisibilityManager>
                    </>
                }
            ></Dialog>
        </Layout>
    );
};

export const getStaticProps = async (params: any) => {
    const { locale } = params;
    const path = 'src/mdx/home';
    const desktop = await serializePath(path, `cv.${locale}.mdx`);
    const mobile = await serializePath(path, `cv-mobile.${locale}.mdx`);

    return {
        props: {
            content: {
                desktop: desktop,
                mobile: mobile,
            },
        },
    };
};

export default Page;
