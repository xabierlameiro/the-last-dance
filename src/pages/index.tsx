import * as React from 'react';
import Dialog from '@/components/Dialog';
import VisibilityManager from '@/components/VisibilityManager';
import { useDialog } from '@/context/dialog';
import { useIntl } from 'react-intl';
import { MDXRemote } from 'next-mdx-remote';
import { components } from '@/helpers/mdxjs';
import { serializePath } from '@/helpers/mdx';
import SEO from '@/components/SEO';
import path from 'path';

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
                            {/* @ts-expect-error: MDX component compatibility */}
                            <MDXRemote {...content.mobile} components={components} frontmatter={undefined} scope={{}} />
                        </VisibilityManager>
                        <VisibilityManager hideOnMobile>
                            <MDXRemote
                                {...content.desktop}
                                // @ts-expect-error: MDX component compatibility
                                components={components}
                                frontmatter={undefined}
                                scope={{}}
                            />
                        </VisibilityManager>
                    </>
                }
            />
        </>
    );
};

export const getStaticProps = async (params: { locale: string }) => {
    const { locale } = params;
    const HOME_PATH = path.join(process.cwd(), 'data/home');
    const desktop = await serializePath(HOME_PATH, `desktop.${locale}.mdx`);
    const mobile = await serializePath(HOME_PATH, `mobile.${locale}.mdx`);

    return {
        props: {
            content: {
                desktop,
                mobile,
            },
        },
    };
};

export default Home;
