import { render, screen } from '@/test';
import Layout from '@/layout';
import { DialogProvider } from '@/context/dialog';

describe('Layout component', () => {
    it('should render the header, main and footer', () => {
        render(
            <DialogProvider>
                <Layout>
                    <div />
                </Layout>
            </DialogProvider>
        );
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('main')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
});
