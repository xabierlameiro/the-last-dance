import React from 'react';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import { components } from '@/helpers/mdxjs';
import { author as defaultAuthor } from '@/constants/site';
import styles from '@/styles/blog.module.css';

type BylineMeta = {
    author?: string;
    date?: string | null;
};

/**
 * @description MDX component overrides that inject the E-E-A-T byline under the post title.
 *
 * Every MDX body opens with `# Title` immediately followed by <Date />, so a page-level
 * byline rendered above <MDXRemote> produced: author → title → date. Injecting it through
 * the h1 override lands it under the heading, where a byline belongs, without editing the
 * 42 MDX files. It stays server-rendered (the <Date /> component is ssr: false, so its
 * output never reaches a crawler) which is the point of the E-E-A-T byline in SDD-003.
 *
 * @param {object} meta - Post frontmatter carrying the author and publication date.
 * @returns {object} The MDX components map to hand to <MDXRemote />.
 */
const usePostComponents = (meta: BylineMeta) => {
    const { formatDate } = useIntl();
    const { author, date } = meta;

    return React.useMemo(() => {
        const byline = (
            <p className={styles.byline}>
                {/* The entity page is the home: its editor window holds the bio and contact tabs */}
                <Link href="/">{author ?? defaultAuthor}</Link>
                {date ? (
                    <>
                        {' · '}
                        {/* UTC pins the calendar day: date is a date-only ISO string, which parses
                            as UTC midnight and would format one day early behind UTC (see #135). */}
                        <time dateTime={date}>
                            {formatDate(date, {
                                timeZone: 'UTC',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </time>
                    </>
                ) : null}
            </p>
        );

        return {
            ...components,
            h1: (props: React.ComponentPropsWithoutRef<'h1'>) => (
                <>
                    <h1 {...props} />
                    {byline}
                </>
            ),
            // The byline carries the date now. The <Date /> tag stays in the MDX source because
            // extractPostDate parses it for datePublished and the sitemap lastmod.
            Date: () => null,
        };
    }, [formatDate, author, date]);
};

export default usePostComponents;
