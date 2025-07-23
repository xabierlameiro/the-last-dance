import CryptoPrice from '..';
import { render, screen } from '@/test';

describe('CryptoPrice', () => {
    it('should render', () => {
        render(<CryptoPrice />);
        expect(screen.getByTestId('crypto-price')).toBeInTheDocument();
    });
});
