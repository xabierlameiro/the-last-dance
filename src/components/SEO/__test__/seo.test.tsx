import SEO from '..';
import { render, screen } from '@/test';

describe('SEO', () => {
    it('Should renders json-ld and noindex', async () => {
        const { container } = render(
            <SEO
                meta={{
                    title: 'test title',
                    noindex: true,
                }}
                isBlog={true}
            />
        );
        expect(container.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
        expect(screen.getByTestId('json-ld')).toBeInTheDocument();
        expect(screen.getByText('test title')).toBeInTheDocument();
    });

    it('Should render alternate urls and index', async () => {
        const { container } = render(
            <SEO
                meta={{
                    title: 'test title',
                    alternate: [
                        { lang: 'es', url: 'resolver-direccion-en-uso-error' },
                        { lang: 'gl', url: 'arranxar-direccion-en-uso-erro' },
                    ],
                }}
            />
        );
        expect(container.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
        expect(container.querySelector('link[hrefLang="es"]')).toBeInTheDocument();
        expect(container.querySelector('link[data-testid="blog-alternate"]')).toBeInTheDocument();
    });
});
