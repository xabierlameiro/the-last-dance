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
import { useDialog } from '@/context/dialog';

const LEGAL_PATH = path.join(process.cwd(), 'data/legal');

// TODO: Refactor this component and add test and internationalization

const Page = ({ source, meta }: any) => {
    const { open, dispatch } = useDialog();

    const close = () => dispatch({ type: 'close' });

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
                            <SearchInput />
                            <span className={styles.title}>Legal documents</span>
                            <ul>
                                <li>
                                    <Link href="/legal/cookies-policy">
                                        <BiCookie />
                                        <span>Cookies policy</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/legal/legal-notice">
                                        <VscLaw />
                                        <span>Legal Notice</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/legal/privacy-policy">
                                        <MdOutlinePrivacyTip />
                                        <span>Privacy policy</span>
                                    </Link>
                                </li>
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
        fallback: true,
    };
};

export default Page;
