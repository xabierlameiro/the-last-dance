import Weather from '..';
import { render, screen } from '@/test';

describe('Weather', () => {
    it('should render', () => {
        render(<Weather open cities={['one', 'two']} />);
        expect(screen.getByTestId('weather')).toBeInTheDocument();
    });
});
