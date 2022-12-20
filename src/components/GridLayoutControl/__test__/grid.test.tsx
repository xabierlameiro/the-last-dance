import GridLayoutControl from '..';
import { render, screen } from '@/test';

describe('GridLayoutControl component', () => {
    it('Should render default title', () => {
        render(<GridLayoutControl />);
        expect(screen.getByTestId('grid-layout-control')).toBeInTheDocument();
        expect(screen.getByText('System Preferences')).toBeInTheDocument();
    });

    it('Should render custom title', () => {
        render(<GridLayoutControl routeName="Blog" />);
        expect(screen.getByTestId('grid-layout-control')).toBeInTheDocument();
        expect(screen.getByText('Blog')).toBeInTheDocument();
    });
});
