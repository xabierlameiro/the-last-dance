import { render, screen } from '@/test';
import useGithubStars from '../useGithubStars';
import useSWR from 'swr';

jest.mock('swr');

const TestComponent = () => {
    const { data } = useGithubStars();
    return <span data-testid="stars">{data}</span>;
};

describe('useGithubStars hook', () => {
    it('returns stars count', () => {
        (useSWR as jest.Mock).mockReturnValue({ data: 42, error: false, isLoading: false });
        render(<TestComponent />);
        // SDD-L07: the key is a string now, like every sibling hook. It was a `URL` built at module
        // scope, which threw `Invalid URL` during import whenever NEXT_PUBLIC_DOMAIN was unset —
        // failing the whole build rather than the one widget.
        expect(useSWR).toHaveBeenCalledWith(
            `${process.env.NEXT_PUBLIC_DOMAIN}/api/github-stars`,
            expect.any(Function),
            expect.any(Object)
        );
        expect(screen.getByTestId('stars').textContent).toBe('42');
    });
});
