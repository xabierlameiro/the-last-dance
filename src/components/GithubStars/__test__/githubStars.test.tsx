import { render, screen, fireEvent } from '@/test';
import GithubStars from '..';
import useGithubStars from '@/hooks/useGithubStars';

jest.mock('@/hooks/useGithubStars');
const mockUseGithubStars = useGithubStars as jest.MockedFunction<typeof useGithubStars>;

const repo = { stars: 1234, forks: 7, watchers: 3, issues: 5, pushedAt: '2026-09-19T08:00:00Z' };

const ready = () => mockUseGithubStars.mockReturnValue({ data: repo, error: undefined, loading: false });

describe('GithubStars', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        ready();
    });

    /**
     * The grouping itself is `formatNumber`'s job and the suite's `react-intl` mock passes numbers
     * through, so what is asserted here is that the count reaches the bar at all.
     */
    it('shows the star count on the bar', () => {
        render(<GithubStars />);
        expect(screen.getByTestId('github-stars-count')).toHaveTextContent('1234');
    });

    /**
     * The panel ships in the server HTML so it can be the target of `aria-controls`; `hidden` is
     * what keeps it out of the accessibility tree until asked for.
     */
    it('keeps the panel hidden until the trigger is pressed', () => {
        render(<GithubStars />);
        const trigger = screen.getByRole('button');

        expect(screen.getByTestId('github-stars-panel')).not.toBeVisible();
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(trigger);

        expect(screen.getByTestId('github-stars-panel')).toBeVisible();
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('reports every counter the route returns, not just the stars', () => {
        render(<GithubStars />);
        fireEvent.click(screen.getByRole('button'));

        const panel = screen.getByTestId('github-stars-panel');
        expect(panel).toHaveTextContent('7');
        expect(panel).toHaveTextContent('3');
        expect(panel).toHaveTextContent('5');
    });

    it('closes on Escape and hands focus back to the trigger', () => {
        render(<GithubStars />);
        const trigger = screen.getByRole('button');
        fireEvent.click(trigger);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(screen.getByTestId('github-stars-panel')).not.toBeVisible();
        expect(trigger).toHaveFocus();
    });

    it('closes when the pointer goes down outside it', () => {
        render(<GithubStars />);
        fireEvent.click(screen.getByRole('button'));

        fireEvent.mouseDown(document.body);

        expect(screen.getByTestId('github-stars-panel')).not.toBeVisible();
    });

    /**
     * The count is a status, so a failing route must not leave a plausible-looking zero on the bar
     * next to an invitation to go and star it.
     */
    it('defers to RenderManager while loading and on error', () => {
        mockUseGithubStars.mockReturnValue({ data: undefined, error: undefined, loading: true });
        const { unmount } = render(<GithubStars />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.queryByTestId('github-stars-count')).not.toBeInTheDocument();
        unmount();

        mockUseGithubStars.mockReturnValue({ data: undefined, error: new Error('boom'), loading: false });
        render(<GithubStars />);
        expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    it('does not print an invalid date when the route has not answered yet', () => {
        mockUseGithubStars.mockReturnValue({
            data: { ...repo, pushedAt: '' },
            error: undefined,
            loading: false,
        });
        render(<GithubStars />);
        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByTestId('github-stars-panel')).not.toHaveTextContent('Invalid');
    });
});
