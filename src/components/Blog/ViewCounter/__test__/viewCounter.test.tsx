import ViewCounter from '..';
import { render, screen } from '@/test';

describe('ViewCounter', () => {
    it('should render', () => {
        render(<ViewCounter />);
        expect(screen.getByTestId('view-counter')).toBeInTheDocument();
    });

    it('should render the number of views', () => {
        render(<ViewCounter />);
        expect(screen.getByTestId('views')).toBeInTheDocument();
        expect(screen.queryByTestId('new-users')).not.toBeInTheDocument();
    });

    it('should render the number of new users', () => {
        render(<ViewCounter all />);
        expect(screen.getByTestId('new-users')).toBeInTheDocument();
    });

    // TODO: Check tooltips behavior
});
