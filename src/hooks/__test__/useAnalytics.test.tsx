import { render, screen } from '@/test';
import useAnalytics from '../useAnalytics';
import useSWR from 'swr';

jest.mock('swr');

const TestComponent = () => {
    const { data } = useAnalytics();
    return <span data-testid="page-views">{data.pageViews}</span>;
};

describe('useAnalytics hook', () => {
    it('returns analytics data', () => {
        const mockData = { pageViews: 5, newUsers: 2 };
        (useSWR as jest.Mock).mockReturnValue({ data: mockData, error: false, isLoading: false });
        const expectedUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/api/analytics?slug=%2Fundefined`;
        render(<TestComponent />);
        expect(useSWR).toHaveBeenCalledWith(expectedUrl, expect.any(Function), expect.any(Object));
        expect(screen.getByTestId('page-views').textContent).toBe('5');
    });
});
