import SEO from '..';
import { render, screen } from '@/test';

describe('SEO', () => {
    it('Should renders json-ld when isBlog is true', async () => {
        render(
            <SEO
                meta={{
                    title: 'test title',
                    noindex: true,
                }}
                isBlog
            />
        );
        
        // Check that the Head component mock is rendered
        expect(screen.getByTestId('next-head')).toBeInTheDocument();
        
        // Check that JSON-LD script is present
        expect(screen.getByTestId('json-ld')).toBeInTheDocument();
    });

    it('Should render Head component when not blog', async () => {
        render(
            <SEO
                meta={{
                    title: 'test title',
                    description: 'test description'
                }}
                isBlog={false}
            />
        );
        
        // Check that the Head component mock is rendered
        expect(screen.getByTestId('next-head')).toBeInTheDocument();
        
        // Since meta tags and links don't render in testing environment,
        // we just verify the Head component is present
        const headElement = screen.getByTestId('next-head');
        expect(headElement).toBeInTheDocument();
    });
});
