import Error from '../';
import { render, screen } from '@/test';

describe('Error', () => {
    it('should render', () => {
        render(<Error />);
        expect(screen.getByTestId('error')).toBeInTheDocument();
    });
});
