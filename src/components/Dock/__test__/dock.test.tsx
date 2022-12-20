import { render, screen } from '@/test';
import Dock from '../';

jest.mock('next/router', () => ({
    useRouter() {
        return {
            pathname: '/blog',
        };
    },
}));

describe('Dock component', () => {
    it('Should render the Dock and check if blog is selected', () => {
        render(<Dock />);
        expect(screen.getByTestId('dock')).toBeInTheDocument();
        expect(
            screen.getByTestId('dock').querySelector('.selected')
        ).toBeInTheDocument();
    });
});
