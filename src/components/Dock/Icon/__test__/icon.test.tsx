import { render, screen } from '@/test';
import { menu } from '@/constants/navMenu';
import Icon from '../';

describe('Icon component', () => {
    it('should render the Icon', () => {
        render(<Icon src={menu[0].img} alt={menu[0].alt} testId="icon" />);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should load eagerly, since the Dock is always on screen', () => {
        render(<Icon src={menu[0].img} alt={menu[0].alt} testId="icon" />);
        expect(screen.getByTestId('icon')).toHaveAttribute('loading', 'eager');
    });
});
