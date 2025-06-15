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
        const expectedUrl = new URL('https://xabierlameiro.com/api/github-stars');
        render(<TestComponent />);
        expect(useSWR).toHaveBeenCalledWith(expectedUrl, expect.any(Function), expect.any(Object));
        expect(screen.getByTestId('stars').textContent).toBe('42');
    });
});
