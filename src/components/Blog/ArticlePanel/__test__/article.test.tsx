import ArticlePanel from '..';
import { act, render, screen } from '@testing-library/react';

jest.mock('../../ViewCounter', () => {
    const ViewCounter = () => <div />;
    ViewCounter.displayName = 'ViewCounter';
    return ViewCounter;
});
jest.mock('../../StarCounter', () => {
    const StarCounter = () => <div />;
    StarCounter.displayName = 'StarCounter';
    return StarCounter;
});

describe('ArticlePanel', () => {
    it('should render the article panel', async () => {
        await act(async () => render(<ArticlePanel />));
        expect(screen.getByTestId('article-panel')).toBeInTheDocument();
    });
    it('should render readTime', async () => {
        await act(async () => render(<ArticlePanel readTime="1" />));
        expect(screen.getByTestId('read-time')).toBeInTheDocument();
    });
});
