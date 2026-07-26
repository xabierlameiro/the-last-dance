import ErrorBoundary from '..';
import { render, screen } from '@/test';

const ProblemChild = () => {
    throw new Error('boom');
};

describe('ErrorBoundary component', () => {
    // React logs the caught error itself, and the boundary logs it deliberately (see below).
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    afterAll(() => consoleError.mockRestore());

    it('catches errors and renders a translated fallback', () => {
        render(
            <ErrorBoundary>
                <ProblemChild />
            </ErrorBoundary>
        );

        expect(screen.getByText('error.boundary.message')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'error.home' })).toHaveAttribute('href', '/');
    });

    /**
     * SDD-L08. This suite used to assert `screen.getByText(/boom/)` — that is, it pinned rendering
     * the raw exception message to the visitor as the *correct* behaviour.
     *
     * In a production bundle that message is at best "Minified React error #418" and at worst a
     * fragment of internal state, a URL, or a property name from whatever threw. It gives a reader
     * nothing they can act on and gives anyone else more than they should see. The detail goes to
     * the console, where a developer can read it.
     */
    it('never renders the exception message to the visitor', () => {
        render(
            <ErrorBoundary>
                <ProblemChild />
            </ErrorBoundary>
        );

        expect(screen.queryByText(/boom/)).not.toBeInTheDocument();
        expect(consoleError).toHaveBeenCalled();
    });

    it('renders children when nothing throws', () => {
        render(
            <ErrorBoundary>
                <span data-testid="child" />
            </ErrorBoundary>
        );

        expect(screen.getByTestId('child')).toBeInTheDocument();
    });
});
