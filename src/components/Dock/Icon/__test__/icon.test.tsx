import { render, screen } from '@/test';
import { menu } from '@/constants/navMenu';
import Icon from '../';

describe('Icon component', () => {
    it('should render the Icon', () => {
        render(<Icon src={menu[0].img} alt={menu[0].alt} />);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
});
