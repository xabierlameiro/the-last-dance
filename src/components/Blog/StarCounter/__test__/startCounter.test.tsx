// @ts-nocheck
import { waitFor, render, screen } from '@/test';
import StarCounter from '..';

describe('StarCounter', () => {
    it.skip('should render the success render', async () => {
        fetch.mockResponseOnce(JSON.stringify(22));
        render(<StarCounter />);
        await waitFor(() => {
            expect(screen.getByTestId('star-counter')).toBeInTheDocument();
        });
    });
    it.skip('should render the error render', async () => {
        fetch.mockRejectOnce();
        render(<StarCounter />);
        await waitFor(() => {
            expect(screen.getByTestId('error-render')).toBeInTheDocument();
        });
    });
    it.skip('should render the loading render', async () => {
        render(<StarCounter />);
        await waitFor(() => {
            expect(screen.getByTestId('loading-render')).toBeInTheDocument();
        });
    });
});
