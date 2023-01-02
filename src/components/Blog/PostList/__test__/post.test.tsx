import PostList from '..';
import { render, screen } from '@testing-library/react';

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
                },
            },
        ];
        render(<PostList posts={posts} slug="slug" category="category" />);
        expect(screen.getByTestId('post-list')).toBeInTheDocument();
    });

    it('should render the post list with slug', () => {
        const posts = [
            {
                meta: {
                    title: 'title',
                    excerpt: 'excerpt',
                    slug: 'slug',
                },
            },
        ];
        render(<PostList posts={posts} slug="slug" category="category" />);
        expect(screen.getByTestId('post-list')).toBeInTheDocument();
        expect(screen.getByTestId('post-list').children[0].className).toBe('selected');
    });
});
