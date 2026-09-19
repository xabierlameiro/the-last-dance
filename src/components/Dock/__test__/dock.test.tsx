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

    // The short label is for touch screens only; assistive tech keeps hearing the full name.
    it('keeps the full name as the accessible name where a short label is shown', () => {
        render(
            <DialogProvider>
                <Dock />
            </DialogProvider>
        );
        const legal = screen.getByRole('link', { name: 'dock.legal' });
        expect(legal.querySelector('[aria-hidden="true"]')).toHaveTextContent('dock.legal.short');
        expect(screen.getByRole('link', { name: 'dock.settings' })).toBeInTheDocument();
    });
});
