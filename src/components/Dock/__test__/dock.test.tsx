import { render, screen } from '@/test';
import Dock from '../';
import { DialogProvider } from '@/context/dialog';

describe('Dock component', () => {
    it('Should render the Dock and check if blog is selected', () => {
        render(
            <DialogProvider>
                <Dock />
            </DialogProvider>,
        );
        expect(screen.getByTestId('dock')).toBeInTheDocument();
        expect(screen.getByTestId('dock').querySelector('.selected')).toBeInTheDocument();
    });

    /*
     * SDD-015: the sixth slot is a folder now, and the two tools live inside it. The Dock keeps six
     * slots on purpose — a seventh does not fit at 320px.
     */
    it('lists the Tools folder as the sixth app, with both tools as links in the markup', () => {
        render(
            <DialogProvider>
                <Dock />
            </DialogProvider>,
        );
        const items = screen.getByTestId('dock').querySelectorAll(':scope > ul > li');
        expect(items).toHaveLength(6);
        expect(items[5]).toHaveAttribute('data-testid', 'tools');
        // Rendered whether or not the panel is open: this is how a crawler reaches both pages.
        expect(screen.getByRole('link', { name: 'dock.nextLeak', hidden: true })).toHaveAttribute('href', '/next-leak');
        expect(screen.getByRole('link', { name: 'dock.nextCoverage', hidden: true })).toHaveAttribute(
            'href',
            '/next-coverage',
        );
    });

    // The short label is for touch screens only; assistive tech keeps hearing the full name.
    it('keeps the full name as the accessible name where a short label is shown', () => {
        render(
            <DialogProvider>
                <Dock />
            </DialogProvider>,
        );
        const legal = screen.getByRole('link', { name: 'dock.legal' });
        expect(legal.querySelector('[aria-hidden="true"]')).toHaveTextContent('dock.legal.short');
        expect(screen.getByRole('link', { name: 'dock.settings' })).toBeInTheDocument();
    });
});
