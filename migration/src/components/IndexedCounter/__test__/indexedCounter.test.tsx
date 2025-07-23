import IndexedCounter from '..';
import { render, screen } from '@/test';

describe('IndexedCounter', () => {
    it('should render', () => {
        render(<IndexedCounter />);
        expect(screen.getByTestId('indexed-counter')).toBeInTheDocument();
    });
});
