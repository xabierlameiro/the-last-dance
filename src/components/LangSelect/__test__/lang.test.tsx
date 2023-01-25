import LangeSelect from '..';
import { render, screen } from '@/test';

describe('LangeSelect', () => {
    it('should render the lang select', () => {
        render(<LangeSelect />);
        expect(screen.getByTestId('lang-select')).toBeInTheDocument();
    });
});
