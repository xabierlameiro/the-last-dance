import { act, render, screen } from '@/test';
import Date from '..';

describe('Date', () => {
    it('should render the date', async () => {
        await act(async () => render(<Date date="01-02-2023" />));
        expect(screen.getByTestId('date')).toBeInTheDocument();
    });
});
