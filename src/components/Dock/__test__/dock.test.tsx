import { render, screen } from '@/test';
import Dock from '../';
import { DialogProvider } from '@/context/dialog';

jest.mock('next/router', () => ({
    useRouter() {
        return {
            pathname: '/',
        };
    },
}));

describe('Dock component', () => {
    it('Should render the Dock and check if blog is selected', () => {
        render(
            <DialogProvider>
                <Dock />
            </DialogProvider>
        );
        expect(screen.getByTestId('dock')).toBeInTheDocument();
        expect(
            screen.getByTestId('dock').querySelector('.selected')
        ).toBeInTheDocument();
    });
});
