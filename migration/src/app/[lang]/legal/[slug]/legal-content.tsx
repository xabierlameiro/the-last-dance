'use client'

import React from 'react';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import styles from '@/styles/legal.module.css';
import SearchInput from '@/components/SearchInput';
import Link from 'next/link';
import { useDialog } from '@/context/dialog';
import SidesShift from '@/components/SidesShift';
import useSideShift from '@/hooks/useSideShift';
import { clx } from '@/helpers';

// Dynamic imports for icons to avoid SSR issues
const IconCookie = () => <span>🍪</span>;
const IconLaw = () => <span>⚖️</span>;
const IconPrivacy = () => <span>🔒</span>;

type Props = {
    content: string;
    meta?: {
        noindex?: boolean;
        title?: string;
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

export default function LegalContent({ content, meta, dict, slug, lang }: Props) {
    const { open, dispatch } = useDialog();
    const { left, onSideShiftLeft } = useSideShift();
    const [selected, setSelected] = React.useState(0);
    const close = () => dispatch({ type: 'close' });

    const links = React.useMemo(() => [
        {
            title: dict.legal['cookies-policy'],
            href: `/${lang}/legal/cookies-policy`,
            slug: 'cookies-policy',
        },
        {
            title: dict.legal['legal-notice'],
            href: `/${lang}/legal/legal-notice`,
            slug: 'legal-notice',
        },
        {
            title: dict.legal['privacy-policy'],
            href: `/${lang}/legal/privacy-policy`,
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

    const getIcon = (slug: string) => {
        switch (slug) {
            case 'cookies-policy':
                return <IconCookie key={slug} />;
            case 'legal-notice':
                return <IconLaw key={slug} />;
            case 'privacy-policy':
                return <IconPrivacy key={slug} />;
            default:
                return null;
        }
    };

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
                            {links.map((link, index) => (
                                <li
                                    key={link.slug}
                                    className={selected === index ? styles.selected : ''}
                                >
                                    <Link 
                                        href={link.href}
                                        onClick={() => setSelected(index)}
                                    >
                                        {getIcon(link.slug)}
                                        <span>{link.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <article className={styles.content}>
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    </article>
                </div>
            }
        />
    );
}
