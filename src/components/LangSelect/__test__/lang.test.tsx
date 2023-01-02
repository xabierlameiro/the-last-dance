import LangeSelect from '..';
import { render, screen } from '@testing-library/react';

describe('LangeSelect', () => {
    it('should render the lang select', () => {
        render(<LangeSelect />);
        expect(screen.getByTestId('lang-select')).toBeInTheDocument();
    });
});
