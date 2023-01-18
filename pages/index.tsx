import * as React from 'react';
import { Layout, Dialog, VisibilityManager } from '@/components';
import { useDialog, DialogProvider } from '@/context/dialog';
import { useIntl } from 'react-intl';
import { MDXRemote } from 'next-mdx-remote';
import { components } from '@/helpers/mdxjs';
import { serializePath } from '@/helpers/mdx';

type Props = {
    content: {
        desktop: {
            compiledSource: string;
        };
        mobile: {
            compiledSource: string;
        };
    };
};

const Legal = ({ content }: Props) => {
    const { open } = useDialog();
    const { formatMessage: f } = useIntl();

    return (
        <Layout
            className="home"
            meta={{
                title: f({ id: 'home.seo.title' }),
                description: f({ id: 'home.seo.description' }),
            }}
        >
            <Dialog
                modalMode
                open={open}
                body={
                    <>
                        <VisibilityManager hideOnDesktop hideOnTablet>
                            <MDXRemote {...content.mobile} components={components} />
                        </VisibilityManager>
                        <VisibilityManager hideOnMobile>
                            <MDXRemote {...content.desktop} components={components} />
                        </VisibilityManager>
                    </>
                }
            ></Dialog>
        </Layout>
    );
};

export const getStaticProps = async (params: { locale: string }) => {
    const { locale } = params;
    const path = 'data/home';
    const desktop = await serializePath(path, `${locale}.mdx`);
    const mobile = await serializePath(path, `mobile.${locale}.mdx`);

    return {
        props: {
            content: {
                desktop: desktop,
                mobile: mobile,
            },
        },
        revalidate: 10,
    };
};

export default function Page(props: any) {
    return (
        <DialogProvider>
            <Legal {...props} />
        </DialogProvider>
    );
}
