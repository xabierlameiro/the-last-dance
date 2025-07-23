import Heating from '..';
import { render, screen } from '@/test';

describe('Heating', () => {
    it('should render', () => {
        render(<Heating />);
        expect(screen.getByTestId('heating')).toBeInTheDocument();
    });
});
