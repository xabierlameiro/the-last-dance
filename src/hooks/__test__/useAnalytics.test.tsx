import { render, screen } from '@/test';
import useAnalytics from '../useAnalytics';
import useSWR from 'swr';
import { useRouter } from 'next/router';

jest.mock('swr');

const TestComponent = ({ all }: { all?: boolean }) => {
    const { data } = useAnalytics(all);
    return <span data-testid="page-views">{data.pageViews}</span>;
};

describe('useAnalytics hook', () => {
    beforeEach(() => {
        (useSWR as jest.Mock).mockReturnValue({
            data: { pageViews: 5, newUsers: 2 },
            error: undefined,
            isLoading: false,
        });
    });

    /**
     * SDD-L10-T17. This assertion used to expect `?slug=%2Fundefined`.
     *
     * That string was not a decision — it was whatever the broken router mock happened to produce.
     * `asPath` was `''` and there was no `locale` at all, so the hook built `` `/${undefined}${''}` ``
     * and the test pinned the result as correct. A test is only as truthful as its mock, and this one
     * was asserting a bug.
     */
    it('should request the current path for the active locale', () => {
        render(<TestComponent />);

        expect(useSWR).toHaveBeenCalledWith(
            `${process.env.NEXT_PUBLIC_DOMAIN}/api/analytics?slug=%2F`,
            expect.any(Function),
            expect.any(Object)
        );
        expect(screen.getByTestId('page-views').textContent).toBe('5');
    });

    // The locale prefix is the whole reason this hook builds a slug instead of using asPath
    // directly: GA4 records `/es/blog/...`, not `/blog/...`. Nothing could observe that before,
    // because the mock had no locale to vary.
    it('should prefix the slug with the locale when it is not the default', () => {
        (useRouter as jest.Mock).mockReturnValue({ asPath: '/blog/react/hooks', locale: 'es' });

        render(<TestComponent />);

        expect(useSWR).toHaveBeenCalledWith(
            `${process.env.NEXT_PUBLIC_DOMAIN}/api/analytics?slug=%2Fes%2Fblog%2Freact%2Fhooks`,
            expect.any(Function),
            expect.any(Object)
        );
    });

    it('should request the site-wide totals with an empty slug', () => {
        (useRouter as jest.Mock).mockReturnValue({ asPath: '/blog/react/hooks', locale: 'en' });

        render(<TestComponent all />);

        expect(useSWR).toHaveBeenCalledWith(
            `${process.env.NEXT_PUBLIC_DOMAIN}/api/analytics?slug=`,
            expect.any(Function),
            expect.any(Object)
        );
    });
});
