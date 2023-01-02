import ArticlePanel from '..';
import { render, screen } from '@testing-library/react';

describe('ArticlePanel', () => {
    it('should render the article panel', () => {
        render(<ArticlePanel />);
        expect(screen.getByTestId('article-panel')).toBeInTheDocument();
    });
    it('should render readTime', () => {
        render(<ArticlePanel readTime="10" />);
        expect(screen.getByText('blog.readtime')).toBeInTheDocument();
    });
});
