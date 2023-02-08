import React from 'react';
import SEO from '@/components/SEO';
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
import { useDialog } from '@/context/dialog';
import SidesShift from '@/components/SidesShift';
import useSideShift from '@/hooks/useSideShift';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

import { clx } from '@/helpers';

const LEGAL_PATH = path.join(process.cwd(), 'data/legal');

type Props = {
    source: MDXRemoteSerializeResult<Record<string, unknown>, Record<string, string>>;
    meta?: {
        noindex?: boolean;
        title: string;
        author?: string;
        description?: string;
        image?: string;
        category?: string;
        alternate?: Array<{ lang: string; url: string }>;
        slug?: string;
        url?: string;
    };
};

const Legal = ({ source, meta }: Props) => {
    const { open, dispatch } = useDialog();
    const { formatMessage: f } = useIntl();
    const { left, onSideShiftLeft } = useSideShift();

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
        <>
            <SEO meta={meta} />
            <Dialog
                large
                modalMode
                open={open}
                body={
                    <div className={clx(styles.container, left ? styles.open : '')} onTouchStart={onSideShiftLeft}>
                        <nav className={styles.nav}>
                            <ControlButtons onClickClose={close} onClickMinimise={close} />
                            <SidesShift className={styles.shift} />
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
        </>
    );
};

export const getStaticProps = async ({
    params,
}: {
    params: {
        slug: string;
    };
}) => {
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

export default Legal;
