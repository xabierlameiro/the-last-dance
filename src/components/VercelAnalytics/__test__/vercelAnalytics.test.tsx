import VercelAnalytics from '..';
import { render, screen } from '@/test';

jest.mock('@vercel/analytics/next', () => ({
    Analytics: () => <span data-testid="vercel-analytics" />,
}));

describe('VercelAnalytics', () => {
    const originalUserAgent = navigator.userAgent;

    const setUserAgent = (value: string) => {
        Object.defineProperty(window.navigator, 'userAgent', { value, configurable: true });
    };

    afterEach(() => setUserAgent(originalUserAgent));

    it('renders the analytics script for a visitor', () => {
        setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36');
        render(<VercelAnalytics />);
        expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
    });

    it('renders nothing for a Lighthouse run', () => {
        setUserAgent('Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse');
        render(<VercelAnalytics />);
        expect(screen.queryByTestId('vercel-analytics')).not.toBeInTheDocument();
    });
});
