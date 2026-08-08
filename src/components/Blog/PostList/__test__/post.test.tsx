import PostList from '..';
import { render, screen } from '@/test';

describe('PostList', () => {
    it('should not render because dont have posts', () => {
        render(<PostList />);
        expect(screen.queryByTestId('post-list')).not.toBeInTheDocument();
    });

    it('should render the post list', () => {
        const posts = [
            {
                meta: {
                    title: 'title',
                    excerpt: 'excerpt',
                    slug: 'slug',
                    category: 'react',
                },
            },
        ];
        render(<PostList posts={posts} slug="slug" />);
        expect(screen.getByTestId('post-list')).toBeInTheDocument();
    });

    it('should render the post list with slug', () => {
        const posts = [
            {
                meta: {
                    title: 'title',
                    excerpt: 'excerpt',
                    slug: 'slug',
                    category: 'react',
                },
            },
        ];
        render(<PostList posts={posts} slug="slug" />);
        expect(screen.getByTestId('post-list')).toBeInTheDocument();
        expect(screen.getByTestId('post-list').children[0].className).toBe('selected');
    });

    // Each href must come from the post's own category, not from whatever segment the current URL
    // used. Building them from the route param turned every tag listing into a set of faceted
    // duplicates that out-linked the canonical, which is what made Google index the facet instead.
    it('should link each post to its own category, not to the browsed one', () => {
        const posts = [
            {
                meta: {
                    title: 'Publish the coverage report',
                    excerpt: 'excerpt',
                    slug: 'publish-report-testing-react',
                    category: 'react',
                },
            },
            {
                meta: {
                    title: 'Find a memory leak',
                    excerpt: 'excerpt',
                    slug: 'nextjs-memory-leak-in-production',
                    category: 'nextjs',
                },
            },
        ];
        render(<PostList posts={posts} slug="publish-report-testing-react" />);

        expect(screen.getByTitle('Publish the coverage report')).toHaveAttribute(
            'href',
            '/blog/react/publish-report-testing-react'
        );
        expect(screen.getByTitle('Find a memory leak')).toHaveAttribute(
            'href',
            '/blog/nextjs/nextjs-memory-leak-in-production'
        );
    });
});
