import { waitFor, render, screen } from '@/test';
import StarCounter from '..';

describe('StarCounter', () => {
    it('should render the success render', async () => {
        fetch.mockResponseOnce(JSON.stringify(22));
        render(<StarCounter />);

        await waitFor(() => {
            expect(screen.getByTestId('star-counter')).toBeInTheDocument();
            expect(screen.getByTestId('star-counter').children[1]).toHaveTextContent('22');
        });
    });

    it('should render the error render', async () => {
        fetch.mockRejectOnce();
        render(<StarCounter />);

        await waitFor(() => {
            expect(screen.getByTestId('error')).toBeInTheDocument();
        });
    });

    it('should render the loading render', async () => {
        render(<StarCounter />);

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toBeInTheDocument();
        });
    });
});
