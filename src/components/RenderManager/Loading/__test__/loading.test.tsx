import Loading from '../';
import { render, screen } from '@/test';

describe('Loading', () => {
    it('should render', () => {
        render(<Loading />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
