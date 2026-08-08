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

    /*
     * The regression #186 shipped, pinned so it cannot come back: every link has to stay inside the
     * segment being browsed. When they were rebuilt from each post's own category, clicking a post
     * inside a tag listing jumped to /blog/<that post's category>/… and the sidebar deselected the
     * tag, which made walking a tag impossible.
     */
    it('should keep the browsed segment in every link so the tag stays selected', () => {
        const posts = [
            {
                meta: {
                    title: 'Publish the coverage report',
                    excerpt: 'excerpt',
                    slug: 'publish-report-testing-react',
                },
            },
            {
                meta: {
                    title: 'Deploying my storybook',
                    excerpt: 'excerpt',
                    slug: 'deploying-my-storybook-is-very-simple',
                },
            },
        ];
        render(<PostList posts={posts} slug="publish-report-testing-react" category="ci" />);

        expect(screen.getByTitle('Publish the coverage report')).toHaveAttribute(
            'href',
            '/blog/ci/publish-report-testing-react',
        );
        expect(screen.getByTitle('Deploying my storybook')).toHaveAttribute(
            'href',
            '/blog/ci/deploying-my-storybook-is-very-simple',
        );
    });
});
