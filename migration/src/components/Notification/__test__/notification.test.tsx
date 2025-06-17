import Notification from '..';
import { waitFor, render, screen } from '@/test';

describe('Notification', () => {
    it('Should renders Notification component', () => {
        render(<Notification title="Test" message="Test" />);
        expect(screen.getByTestId('notification')).toBeInTheDocument();
    });

    it('Check if the notification is closed after pass 7 seconds', async () => {
        jest.useFakeTimers();

        render(<Notification title="Test" message="Test" />);
        expect(screen.getByTestId('notification')).toBeInTheDocument();

        jest.advanceTimersByTime(7100);
        await waitFor(() => {
            expect(screen.queryByTestId('notification-hidden')).toBeInTheDocument();
        });
    });
});
