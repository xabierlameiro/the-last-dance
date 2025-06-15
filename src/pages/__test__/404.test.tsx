import { render, screen } from '@/test';
import Custom404 from '../404';
import { DialogProvider } from '@/context/dialog';

describe('404 page', () => {
    it('renders not found message', () => {
        render(
            <DialogProvider>
                <Custom404 />
            </DialogProvider>
        );
        expect(screen.getByText(/doesn\'t exist/i)).toBeInTheDocument();
    });
});
