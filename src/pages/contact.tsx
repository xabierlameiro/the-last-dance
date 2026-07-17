import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useIntl } from 'react-intl';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import SEO from '@/components/SEO';
import { useDialog } from '@/context/dialog';
import { socialLinks } from '@/constants/site';
import styles from '@/styles/about.module.css';

const CONTACT_EMAIL = 'xabier.lameiro@gmail.com';
const CONTACT_PROFILES = ['Linkedin', 'Github', 'Reddit'];

/**
 * @description Contact page (SDD-003): a standalone crawlable page with the
 * ways to reach the author, marked up as ContactPage.
 */
const Contact = () => {
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const close = () => dispatch({ type: 'close' });
    const profiles = socialLinks.filter(({ name }) => CONTACT_PROFILES.includes(name));

    return (
        <>
            <SEO
                meta={{
                    title: f({ id: 'contact.seo.title' }),
                    description: f({ id: 'contact.seo.description' }),
                }}
            />
            <Head>
                <script
                    data-testid="contactpage-jsonld"
                    type="application/ld+json"
                    key="contactpage-jsonld"
                    // skipcq: JS-0440 - dangerouslySetInnerHTML is safe here for JSON-LD structured data
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'ContactPage',
                            mainEntity: { '@id': `${process.env.NEXT_PUBLIC_DOMAIN}/#person` },
                        }),
                    }}
                />
            </Head>
            <Dialog
                large
                modalMode
                open={open}
                body={
                    <div className={styles.container} data-testid="contact-page">
                        <ControlButtons onClickClose={close} onClickMinimise={close} />
                        <h1>{f({ id: 'contact.title' })}</h1>
                        <p>{f({ id: 'contact.intro' })}</p>
                        <ul className={styles.list}>
                            <li>
                                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                            </li>
                            {profiles.map(({ href, name, title }) => (
                                <li key={href}>
                                    <a href={href} target="_blank" rel="noopener noreferrer" title={title}>
                                        {name}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a
                                    href="https://x.com/xlameirodev"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="X profile"
                                >
                                    X
                                </a>
                            </li>
                        </ul>
                        <p className={styles.links}>
                            <Link href="/blog">{f({ id: 'blog.index.title' })}</Link>
                            {' · '}
                            <Link href="/about">{f({ id: 'about.title' })}</Link>
                        </p>
                    </div>
                }
            />
        </>
    );
};

export default Contact;
