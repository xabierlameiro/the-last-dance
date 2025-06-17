import SidesShift from '..';
import { render, screen } from '@/test';

describe('SidesShift', () => {
    it('should render', () => {
        render(<SidesShift />);
        expect(screen.getByTestId('sides-shift')).toBeInTheDocument();
    });
});
