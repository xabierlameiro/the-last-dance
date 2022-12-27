import Layout from '@/layout';
import Dialog from '@/components/Dialog';
import React from 'react';
import { getAllPosts } from 'src/api';
import { useIntl } from 'react-intl';
import Link from 'next/link';

const meta = {
    title: "This is the Xabier's blog",
};

const Page = ({ posts }: any) => {
    const [open, setOpen] = React.useState(true);
    const { formatMessage: f } = useIntl();

    const props = {
        open: open,
        onClickClose: () => setOpen(false),
        onClickMinimise: () => setOpen(false),
    };

    return (
        <Layout meta={meta}>
            <Dialog
                open
                body={
                    <>
                        <h1>{f({ id: 'blog.title' })}</h1>
                        {posts.map(
                            (
                                item: {
                                    meta: { slug: string; locale: string };
                                },
                                index: string
                            ) => {
                                return (
                                    <p key={index}>
                                        <Link
                                            href={`blog/${item.meta.slug}`}
                                            locale={item.meta.locale}
                                        >
                                            {item.meta.slug}
                                        </Link>
                                    </p>
                                );
                            }
                        )}
                    </>
                }
            />
        </Layout>
    );
};

export const getStaticProps = async ({ locale }: any) => {
    const posts = await getAllPosts().filter(
        (item: any) => item.meta.locale === locale
    );
    return {
        props: {
            posts,
        },
    };
};

export default Page;
