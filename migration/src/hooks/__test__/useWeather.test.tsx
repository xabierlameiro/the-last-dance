import { render, screen } from '@/test';
import useWeather from '../useWeather';
import useSWR from 'swr';

jest.mock('swr');

const TestComponent = () => {
    const { data } = useWeather(['london', 'paris']);
    return <span data-testid="city">{data[0].city}</span>;
};

describe('useWeather hook', () => {
    it('returns weather data for cities', () => {
        const mockData = [{ city: 'london' }];
        (useSWR as jest.Mock).mockReturnValue({ data: mockData, error: false, isLoading: false });
        const expectedUrl = new URL('https://xabierlameiro.com/api/weather');
        expectedUrl.searchParams.append('cities', 'london,paris');
        render(<TestComponent />);
        expect(useSWR).toHaveBeenCalledWith(expectedUrl, expect.any(Function), expect.any(Object));
        expect(screen.getByTestId('city').textContent).toBe('london');
    });
});
