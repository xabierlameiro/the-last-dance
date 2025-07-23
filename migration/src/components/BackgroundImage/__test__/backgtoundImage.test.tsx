import BackgroundImage from '..';
import { render, screen } from '@/test';

describe('BackgroundImage', () => {
    it('should render', () => {
        render(<BackgroundImage />);
        expect(screen.getByTestId('background-image')).toBeInTheDocument();
    });
});
