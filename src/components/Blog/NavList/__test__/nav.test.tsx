import NavList from '..';
import { render, screen } from '@testing-library/react';

describe('NavList', () => {
    it('should not render because dont have list', () => {
        render(<NavList title="" />);
        expect(screen.queryByTestId('nav-list')).not.toBeInTheDocument();
    });

    it('should render the nav list', () => {
        const list = [
            {
                category: 'category',
                total: 1,
                href: '/category/category',
                tag: 'tag',
            },
        ];
        render(<NavList title="NavList" list={list} />);
        expect(screen.getByTestId('nav-list')).toBeInTheDocument();
    });

    it('should render the nav list with category', () => {
        const list = [
            {
                category: 'category',
                total: 1,
                href: '/category/category',
                tag: 'tag',
            },
        ];
        render(<NavList title="NavList" list={list} category="category" isCategory />);
        expect(screen.getByTestId('nav-list')).toBeInTheDocument();
        expect(screen.getByTestId('nav-list').children[0].children[0].className).toBe('selected');
    });
});
