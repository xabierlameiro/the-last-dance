import React from 'react';
import Layout from '@/layout';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from '@/helpers/mdx';
import styles from '@/styles/legal.module.css';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import SearchInput from '@/components/SearchInput';
import Link from 'next/link';
import { BiCookie } from 'react-icons/bi';
import { VscLaw } from 'react-icons/vsc';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import matter from 'gray-matter';
import { useIntl } from 'react-intl';
import { useDialog, DialogProvider } from '@/context/dialog';

const LEGAL_PATH = path.join(process.cwd(), 'data/legal');

const Legal = ({ source, meta }: any) => {
    const { open, dispatch } = useDialog();
    const { formatMessage: f } = useIntl();
    const [selected, setSelected] = React.useState(0);
    const close = () => dispatch({ type: 'close' });

    const links = [
        {
            title: f({ id: 'legal.cookies-policy' }),
            href: '/legal/cookies-policy',
            icon: <BiCookie />,
        },
        {
            title: f({ id: 'legal.legal-notice' }),
            href: '/legal/legal-notice',
            icon: <VscLaw />,
        },
        {
            title: f({ id: 'legal.privacy-policy' }),
            href: '/legal/privacy-policy',
            icon: <MdOutlinePrivacyTip />,
        },
    ];

    return (
        <Layout
            className="comments"
            meta={{
                title: meta.title,
                noindex: meta.noindex,
            }}
        >
            <Dialog
                large
                modalMode
                open={open}
                body={
                    <div className={styles.container}>
                        <nav className={styles.nav}>
                            <ControlButtons onClickClose={close} onClickMinimise={close} />
                            <SearchInput placeHolderText={f({ id: 'legal.search-placeholder' })} />
                            <span className={styles.title}>{f({ id: 'legal.title' })}</span>
                            <ul>
                                {links.map((link, index) => (
                                    <li
                                        key={index}
                                        onClick={() => setSelected(index)}
                                        className={selected === index ? styles.selected : ''}
                                    >
                                        <Link href={link.href}>
                                            {link.icon}
                                            <span>{link.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <article className={styles.content}>{source && <MDXRemote {...source} />}</article>
                    </div>
                }
            />
        </Layout>
    );
};

export const getStaticProps = async ({ params }: any) => {
    const { slug } = params;
    const fullPath = path.join(LEGAL_PATH, `${slug}.mdx`);
    const mdx = fs.readFileSync(fullPath, 'utf8');
    const { content, data } = matter(mdx);
    const mdxSource = await serialize(content);

    return {
        props: {
            source: mdxSource,
            meta: data,
        },
    };
};

export const getStaticPaths = () => {
    let paths = glob
        .sync(`${LEGAL_PATH}/**/*.mdx`)
        .map((path) => path.replace(`${LEGAL_PATH}/`, '').replace(/\.mdx$/, ''));

    return {
        paths: paths.map((path) => ({
            params: {
                slug: path,
            },
        })),
        fallback: 'blocking',
    };
};

export default function Page(props: any) {
    return (
        <DialogProvider>
            <Legal {...props} />
        </DialogProvider>
    );
}
