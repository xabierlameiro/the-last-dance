import Layout from '@/layout';
import { DialogProvider } from '@/context/dialog';
import { act, render, screen } from '@testing-library/react';

jest.mock('@/components/CryptoPrice', () => {
    const CryptoPrice = () => <div />;
    CryptoPrice.displayName = 'CryptoPrice';
    return CryptoPrice;
});

describe('Layout component', () => {
    it('should render the header, main and footer', async () => {
        await act(async () =>
            render(
                <DialogProvider>
                    <Layout>
                        <div />
                    </Layout>
                </DialogProvider>
            )
        );

        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('main')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
});
