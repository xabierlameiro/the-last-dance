'use client'

import React from 'react';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import styles from '@/styles/legal.module.css';
import SearchInput from '@/components/SearchInput';
import Link from 'next/link';
import { BiCookie } from 'react-icons/bi';
import { VscLaw } from 'react-icons/vsc';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import { useDialog } from '@/context/dialog';
import SidesShift from '@/components/SidesShift';
import useSideShift from '@/hooks/useSideShift';
import { clx } from '@/helpers';

type Props = {
    compiledContent: React.ReactElement;
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
    dict: any;
    slug: string;
    lang: string;
};

export default function LegalContent({ compiledContent, meta, dict, slug, lang }: Props) {
    const { open, dispatch } = useDialog();
    const { left, onSideShiftLeft } = useSideShift();
    const [selected, setSelected] = React.useState(0);
    const close = () => dispatch({ type: 'close' });

    const links = React.useMemo(() => [
        {
            title: dict.legal['cookies-policy'],
            href: `/${lang}/legal/cookies-policy`,
            icon: <BiCookie />,
            slug: 'cookies-policy',
        },
        {
            title: dict.legal['legal-notice'],
            href: `/${lang}/legal/legal-notice`,
            icon: <VscLaw />,
            slug: 'legal-notice',
        },
        {
            title: dict.legal['privacy-policy'],
            href: `/${lang}/legal/privacy-policy`,
            icon: <MdOutlinePrivacyTip />,
            slug: 'privacy-policy',
        },
    ], [dict.legal, lang]);

    // Find the selected index based on current slug
    React.useEffect(() => {
        const index = links.findIndex(link => link.slug === slug);
        if (index !== -1) {
            setSelected(index);
        }
    }, [slug, links]);

    return (
        <Dialog
            large
            modalMode
            open={open}
            body={
                <div className={clx(styles.container, left ? styles.open : '')} onTouchStart={onSideShiftLeft}>
                    <nav className={styles.nav}>
                        <ControlButtons onClickClose={close} onClickMinimise={close} />
                        <SidesShift className={styles.shift} />
                        <SearchInput placeHolderText={dict.legal['search-placeholder']} />
                        <span className={styles.title}>{dict.legal.title}</span>
                        <ul>
                            {links.map((link) => (
                                <li
                                    key={link.slug}
                                    className={selected === links.findIndex(l => l.slug === link.slug) ? styles.selected : ''}
                                >
                                    <Link 
                                        href={link.href}
                                        onClick={() => setSelected(links.findIndex(l => l.slug === link.slug))}
                                    >
                                        {link.icon}
                                        <span>{link.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <article className={styles.content}>
                        {compiledContent}
                    </article>
                </div>
            }
        />
    );
}
