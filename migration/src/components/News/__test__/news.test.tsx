import News from '..';
import { render, screen } from '@/test';

describe('News', () => {
    it('should render', () => {
        render(<News city="Limerick" />);
        expect(screen.getByTestId('news')).toBeInTheDocument();
    });
});
