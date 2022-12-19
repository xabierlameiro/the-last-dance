import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { iconUrls } from '@/constants/navMenu';
import Icon from '../';

describe('Icon component', () => {
    it('should render the Icon', () => {
        render(<Icon src={iconUrls[0].url} alt={iconUrls[0].alt} />);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
});
