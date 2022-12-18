import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../';

describe('Layout component', () => {
    it('should render the header, main and footer', () => {
        render(
            <Layout>
                <div />
            </Layout>
        );
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('main')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
});
