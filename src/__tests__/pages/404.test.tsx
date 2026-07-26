import { render, screen } from '@/test';
import Custom404 from '../../pages/404';
import { DialogProvider } from '@/context/dialog';

describe('404 page', () => {
    /*
     * SDD-L08: the page was hardcoded English ("Oh! sorry, this page doesn't exist") on a trilingual
     * site. The intl mock returns message ids, so these assertions read as ids rather than prose.
     */
    it('renders a translated not-found message', () => {
        render(
            <DialogProvider>
                <Custom404 />
            </DialogProvider>
        );
        expect(screen.getByText('error.404.message')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('error.404.title');
    });

    // A visitor who landed here had the Dock and nothing else — no way out of the page.
    it('offers a way back to the home page', () => {
        render(
            <DialogProvider>
                <Custom404 />
            </DialogProvider>
        );
        expect(screen.getByRole('link', { name: 'error.home' })).toHaveAttribute('href', '/');
    });
});
