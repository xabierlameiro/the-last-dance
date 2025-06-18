'use client'

import { useState } from 'react';
import Dialog from '@/components/Dialog';
import { useDialog } from '@/context/dialog';
import { NavList, PostList } from '@/components/Blog';
import styles from './blog.module.css';
import SidesShift from '@/components/SidesShift';
import { useTranslation } from '@/hooks/useTranslationSimple';

type Post = {
    content: string;
    meta: {
        readTime: string;
        numberOfWords: number;
        slug: string;
        title: string;
        locale: string;
        category: string;
        author: string;
        tags: string[];
        excerpt: string;
        image: string;
        description: string;
        alternate?: Array<{ lang: string; url: string }>;
    };
};

type Category = {
    category: string;
    total: number;
    href: string;
};

type Tag = {
    tag: string;
    total: number;
    href: string;
};

type Props = {
    posts: Post[];
    categories: Category[];
    tags: Tag[];
    lang: string;
};

export default function BlogContent({ posts, categories, tags, lang }: Props) {
    const { open } = useDialog();
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    // Filtrar posts por categoría si hay una seleccionada
    const filteredPosts = selectedCategory 
        ? posts.filter(post => post.meta.category.toLowerCase() === selectedCategory.toLowerCase())
        : posts;

    return (
        <Dialog
            className="blog"
            open={open}
            body={
                <div className={styles.blog}>
                    <nav className={styles.firstNav}>
                        <div className={styles.navLinks}>
                            <NavList
                                title={t('blog.categories')}
                                list={categories.map(cat => ({
                                    category: cat.category,
                                    total: cat.total,
                                    href: cat.href,
                                    tag: cat.category,
                                }))}
                                category={selectedCategory}
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
                                category={selectedCategory} 
                            />
                        </div>
                        <SidesShift />
                    </nav>
                    <main className={styles.content}>
                        <h1 className={styles.title}>Blog</h1>
                        <div className={styles.posts}>
                            <PostList 
                                posts={filteredPosts.map(post => ({
                                    meta: post.meta,
                                    content: post.content,
                                }))}
                                slug=""
                                category={selectedCategory}
                            />
                        </div>
                    </main>
                    <nav className={styles.secondNav}>
                        <SidesShift leftPosition />
                    </nav>
                </div>
            }
        />
    );
}
