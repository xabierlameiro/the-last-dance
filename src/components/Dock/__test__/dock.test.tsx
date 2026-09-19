import { render, screen } from '@/test';
import Dock from '../';
import { DialogProvider } from '@/context/dialog';

describe('Dock component', () => {
    it('Should render the Dock and check if blog is selected', () => {
        render(
            <DialogProvider>
                <Dock />
            </DialogProvider>
        );
        expect(screen.getByTestId('dock')).toBeInTheDocument();
        expect(screen.getByTestId('dock').querySelector('.selected')).toBeInTheDocument();
    });

    it('lists next-leak as the sixth app', () => {
        render(
            <DialogProvider>
                <Dock />
            </DialogProvider>
        );
        const items = screen.getByTestId('dock').querySelectorAll('li');
        expect(items).toHaveLength(6);
        expect(items[5]).toHaveAttribute('data-testid', 'next-leak');
        expect(screen.getByRole('link', { name: 'dock.nextLeak' })).toHaveAttribute('href', '/next-leak');
    });
});
