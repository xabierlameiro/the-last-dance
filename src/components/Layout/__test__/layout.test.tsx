import { render, screen } from '@/test';
import Layout from '@/layout';
import { DialogProvider } from '@/context/dialog';

jest.mock('next/router', () => ({
    useRouter() {
        return {
            route: '/',
            pathname: '',
            query: '',
            asPath: '',
            push: jest.fn(),
            events: {
                on: jest.fn(),
                off: jest.fn(),
            },
            beforePopState: jest.fn(() => null),
            prefetch: jest.fn(() => null),
        };
    },
}));

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
