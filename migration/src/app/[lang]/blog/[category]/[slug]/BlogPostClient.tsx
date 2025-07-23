'use client'

import React from 'react';
import Dialog from '@/components/Dialog';
import { AsidePanel, ArticlePanel, NavList, PostList } from '@/components/Blog';
import ControlButtons from '@/components/ControlButtons';
import SidesShift from '@/components/SidesShift';
import { useDialog } from '@/context/dialog';
import { useTranslation } from '@/hooks/useTranslationSimple';
import styles from '@/styles/blog.module.css';

type Props = {
    post: any;
    categories: any[];
    tags: any[];
    postsInCategory: any[];
    content: React.ReactElement;
    category: string;
    slug: string;
    locale: string; // Agregamos el idioma
};

export default function BlogPostClient({ 
    post, 
    categories, 
    tags, 
    postsInCategory, 
    content, 
    category, 
    slug,
    locale 
}: Props) {
    const { open, dispatch } = useDialog();
    const { t } = useTranslation();
    const close = () => dispatch({ type: 'close' });

    return (
        <Dialog
            className="blog-post"
            modalMode={false}
            open={open}
            body={
                <div className={styles.container}>
                    <nav className={styles.nav}>
                        <ControlButtons withPadding onClickClose={close} onClickMinimise={close} />
                        <div className={styles.navListContainer}>
                            <NavList
                                title={t('blog.categories')}
                                list={categories.map(cat => ({
                                    category: cat.category,
                                    total: cat.total,
                                    href: cat.href,
                                    tag: cat.category,
                                }))}
                                category={category}
                                isCategory
                            />
                            <NavList 
                                title={t('blog.tags')} 
                                list={tags.map(tag => ({
                                    category: tag.tag,
                                    total: tag.total,
                                    href: tag.href,
                                    tag: tag.tag,
                                }))}
                                category={category} 
                            />
                        </div>
                        <aside className={styles.navAd}>
                            {/* Placeholder para ads */}
                            <div style={{ minHeight: '200px', background: '#f5f5f5', borderRadius: '4px' }}>
                                <p style={{ padding: '20px', margin: 0, fontSize: '12px', color: '#666' }}>
                                    Advertisement space
                                </p>
                            </div>
                        </aside>
                    </nav>
                    
                    <nav className={styles.secondNav}>
                        <AsidePanel />
                        <div className={styles.postLinks}>
                            <PostList 
                                posts={postsInCategory.map(p => ({
                                    meta: p.meta,
                                    content: p.content,
                                }))}
                                slug={slug}
                                category={category}
                                locale={locale}
                            />
                        </div>
                        <SidesShift leftPosition />
                        <SidesShift />
                    </nav>
                    
                    <article className={styles.article}>
                        <ArticlePanel readTime={post.meta.readTime} />
                        <div className={styles.body}>
                            <div className={styles.mdx}>
                                {content}
                            </div>
                        </div>
                    </article>
                </div>
            }
        />
    );
}
