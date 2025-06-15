import { render, screen } from '@/test';
import useIndexedPages from '../useIndexedPages';
import useSWR from 'swr';

jest.mock('swr');

const TestComponent = () => {
    const { data } = useIndexedPages();
    return <span data-testid="num">{data.num}</span>;
};

describe('useIndexedPages hook', () => {
    it('returns indexed pages count', () => {
        (useSWR as jest.Mock).mockReturnValue({ data: { num: 1 }, error: false, isLoading: false });
        const expectedUrl = new URL('https://xabierlameiro.com/api/indexed-pages');
        render(<TestComponent />);
        expect(useSWR).toHaveBeenCalledWith(expectedUrl, expect.any(Function), expect.any(Object));
        expect(screen.getByTestId('num').textContent).toBe('1');
    });
});
