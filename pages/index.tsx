import * as React from 'react';
import Dialog from '@/components/Dialog';
import VisibilityManager from '@/components/VisibilityManager';
import { useDialog } from '@/context/dialog';
import { useIntl } from 'react-intl';
import { components } from '@/helpers/mdxjs';
import { serializePath } from '@/helpers/mdx';
import SEO from '@/components/SEO';
import dynamic from 'next/dynamic';
const MDXRemote = dynamic(() => import('next-mdx-remote').then((mod) => mod.MDXRemote));

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

const Home = ({ content }: Props) => {
    const { open } = useDialog();
    const { formatMessage: f } = useIntl();

    return (
        <>
            <SEO
                meta={{
                    title: f({ id: 'home.seo.title' }),
                    description: f({ id: 'home.seo.description' }),
                }}
            />

            <Dialog
                className="home"
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
            />
        </>
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

export default Home;
