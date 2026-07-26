import React from 'react';
import SEO from '@/components/SEO';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from '@/helpers/mdx';
import { isSafeSlug } from '@/helpers/slug';
import styles from '@/styles/legal.module.css';
import path from 'path';
import fs from 'fs';
import SearchInput from '@/components/SearchInput';
import Link from 'next/link';
import { BiCookie } from 'react-icons/bi';
import { VscLaw } from 'react-icons/vsc';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import matter from 'gray-matter';
import { useIntl } from 'react-intl';
import { useDialog } from '@/context/dialog';
import { useRouter } from 'next/router';
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
    const { asPath } = useRouter();
    const { formatMessage: f } = useIntl();
    const { left, onSideShiftLeft } = useSideShift();

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
                        <nav className={styles.nav} aria-label={f({ id: 'nav.legal' })}>
                            <ControlButtons onClickClose={close} onClickMinimise={close} />
                            <SidesShift className={styles.shift} />
                            <SearchInput placeHolderText={f({ id: 'legal.search-placeholder' })} />
                            <span className={styles.title}>{f({ id: 'legal.title' })}</span>
                            <ul>
                                {links.map((link) => {
                                    /*
                                     * SDD-L08: which item is highlighted comes from the URL now.
                                     * It was `useState(0)`, initialised to the first item and only
                                     * ever changed by an in-page click — so arriving at
                                     * /legal/privacy-policy from anywhere else (a link, a bookmark,
                                     * a search result, a full reload) highlighted "Cookies Policy"
                                     * while the reader looked at the privacy document. State that
                                     * mirrors the route belongs to the route.
                                     */
                                    const isCurrent = asPath.split('?')[0]?.endsWith(link.href) ?? false;
                                    return (
                                        /* SDD-L05: handler moved from the <li> to the <Link>, as in the Dock —
                                           a list item is not an interaction target, and on the <li> it fired
                                           for clicks in the row's padding where no link exists. */
                                        <li key={link.href} className={isCurrent ? styles.selected : ''}>
                                            <Link href={link.href} aria-current={isCurrent ? 'page' : undefined}>
                                                {link.icon}
                                                <span>{link.title}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                        <article className={styles.content}>{source && <MDXRemote {...source} />}</article>
                    </div>
                }
            />
        </>
    );
};

/**
 * @description Resolve a legal document path, or null when the slug is unsafe,
 * escapes the legal directory, or names a file that does not exist.
 * @param {string} slug - Route slug.
 * @returns {string | null} Absolute path to the .mdx file, or null.
 */
const resolveLegalDocPath = (slug: string): string | null => {
    if (!isSafeSlug(slug)) return null;

    const fullPath = path.join(LEGAL_PATH, `${slug}.mdx`);

    // Belt and braces: isSafeSlug already rejects traversal, this catches path.join surprises
    if (!fullPath.startsWith(LEGAL_PATH) || !fs.existsSync(fullPath)) return null;

    return fullPath;
};

export const getStaticProps = async ({
    params,
}: {
    params: {
        slug: string;
    };
}) => {
    const { slug } = params;
    const fullPath = resolveLegalDocPath(slug);

    if (!fullPath) {
        // SDD-L08: `revalidate` added. `fallback: 'blocking'` means an unknown slug is resolved at
        // request time, and a bare `notFound: true` is cached for the lifetime of the deployment —
        // so a legal document added after a deploy 404s until the next one. The blog page already
        // does `{ notFound: true, revalidate: 60 }`; these two routes had no reason to differ.
        return { notFound: true, revalidate: 60 };
    }

    const mdx = fs.readFileSync(fullPath, 'utf8');
    const { content, data } = matter(mdx);
    const mdxSource = await serialize(content);

    return {
        props: {
            source: mdxSource,
            // url feeds the SEO canonical — router.pathname would render "/legal/[slug]"
            meta: { ...data, url: `/legal/${slug}` },
        },
    };
};

export const getStaticPaths = () => {
    const files = fs.readdirSync(LEGAL_PATH);
    const paths = files.filter((file) => file.endsWith('.mdx')).map((file) => file.replace('.mdx', ''));

    return {
        paths: paths.map((slug) => ({
            params: {
                slug,
            },
        })),
        fallback: 'blocking',
    };
};

export default Legal;
