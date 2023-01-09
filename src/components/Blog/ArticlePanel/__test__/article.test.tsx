import ArticlePanel from '..';
import { act, render, screen } from '@testing-library/react';

describe('ArticlePanel', () => {
    it('should render the article panel', async () => {
        await act(async () => render(<ArticlePanel />));
        expect(screen.getByTestId('article-panel')).toBeInTheDocument();
    });
    it('should render readTime', async () => {
        await act(async () => render(<ArticlePanel readTime="10" />));
        expect(screen.getByText('blog.readtime')).toBeInTheDocument();
    });
});
