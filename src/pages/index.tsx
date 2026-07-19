import Dialog from '@/components/Dialog';
import VisibilityManager from '@/components/VisibilityManager';
import { useDialog } from '@/context/dialog';
import { useIntl } from 'react-intl';
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote';
import { components } from '@/helpers/mdxjs';
import { serializePath } from '@/helpers/mdx';
import SEO from '@/components/SEO';
import Head from 'next/head';
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

// Tipo correcto para MDX components
type MDXComponents = NonNullable<MDXRemoteProps['components']>;

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
            {/* Person/WebSite JSON-LD lives once in _document (SDD-002 D4) — no per-page copies.
                ProfilePage belongs here and only here: /about used to carry it, but the bio,
                experience and contact details are the three tabs of this page's editor window,
                so this URL is the entity page. It must not move to _document, which would claim
                every URL on the site is the profile. */}
            <Head>
                <script
                    data-testid="profilepage-jsonld"
                    type="application/ld+json"
                    key="profilepage-jsonld"
                    // skipcq: JS-0440 - dangerouslySetInnerHTML is safe here for JSON-LD structured data
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'ProfilePage',
                            '@id': `${process.env.NEXT_PUBLIC_DOMAIN}/#profilepage`,
                            url: process.env.NEXT_PUBLIC_DOMAIN,
                            mainEntity: { '@id': `${process.env.NEXT_PUBLIC_DOMAIN}/#person` },
                        }),
                    }}
                />
            </Head>
            <Dialog
                className="home"
                modalMode
                open={open}
                body={
                    <>
                        <VisibilityManager hideOnDesktop hideOnTablet>
                            <MDXRemote
                                {...content.mobile}
                                components={components as MDXComponents}
                                frontmatter={undefined}
                                scope={{}}
                            />
                        </VisibilityManager>
                        <VisibilityManager hideOnMobile>
                            <MDXRemote
                                {...content.desktop}
                                components={components as MDXComponents}
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
