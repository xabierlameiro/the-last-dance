import Weather from '..';
import { render, screen } from '@/test';

describe('Weather', () => {
    it('should render', () => {
        render(<Weather open cities={['one', 'two']} />);
        expect(screen.getByTestId('weather')).toBeInTheDocument();
    });

    /**
     * Closed, the panel is parked off-screen by a transform, which hides it from the eye and from
     * nothing else: its news links stayed in the tab order and in the accessibility tree, so a
     * keyboard user tabbed through 28 links they could not see.
     */
    it('should take a closed panel out of the tab order and the accessibility tree', () => {
        render(<Weather cities={['one', 'two']} />);
        expect(screen.getByTestId('weather')).toHaveAttribute('inert');
    });

    it('should leave an open panel interactive', () => {
        render(<Weather open cities={['one', 'two']} />);
        expect(screen.getByTestId('weather')).not.toHaveAttribute('inert');
    });
});
