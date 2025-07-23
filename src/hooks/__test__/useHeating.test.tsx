import { render, screen } from '@/test';
import useHeating from '../useHeating';
import useSWR from 'swr';

jest.mock('swr');

const TestComponent = () => {
    const { data } = useHeating();
    return <span data-testid="temp">{data.outsideTemp}</span>;
};

describe('useHeating hook', () => {
    it('returns heating data', () => {
        (useSWR as jest.Mock).mockReturnValue({ data: { outsideTemp: 10 }, error: false, isLoading: false });
        const expectedUrl = new URL('https://xabierlameiro.com/api/heating');
        render(<TestComponent />);
        expect(useSWR).toHaveBeenCalledWith(expectedUrl, expect.any(Function), expect.any(Object));
        expect(screen.getByTestId('temp').textContent).toBe('10');
    });
});
