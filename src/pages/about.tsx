import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Img from 'next/image';
import { useIntl } from 'react-intl';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import SEO from '@/components/SEO';
import { useDialog } from '@/context/dialog';
import { author } from '@/constants/site';
import styles from '@/styles/about.module.css';

/**
 * @description About page (SDD-003/SDD-004): the entity home for the Person —
 * ProfilePage structured data pointing at the site-wide Person @id, plus a
 * crawlable professional bio and the canonical headshot.
 */
const About = () => {
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const close = () => dispatch({ type: 'close' });

    return (
        <>
            <SEO
                meta={{
                    title: f({ id: 'about.seo.title' }),
                    description: f({ id: 'about.seo.description' }),
                }}
            />
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
                    <div className={styles.container} data-testid="about-page">
                        <ControlButtons onClickClose={close} onClickMinimise={close} />
                        <h1>{f({ id: 'about.title' })}</h1>
                        <Img
                            className={styles.headshot}
                            src="/xabier-lameiro.png"
                            width={160}
                            height={160}
                            alt={author}
                            priority
                        />
                        <p>{f({ id: 'about.p1' })}</p>
                        <p>{f({ id: 'about.p2' })}</p>
                        <p>{f({ id: 'about.p3' })}</p>
                        <p className={styles.links}>
                            <Link href="/blog">{f({ id: 'blog.index.title' })}</Link>
                            {' · '}
                            <Link href="/contact">{f({ id: 'contact.title' })}</Link>
                        </p>
                    </div>
                }
            />
        </>
    );
};

export default About;
