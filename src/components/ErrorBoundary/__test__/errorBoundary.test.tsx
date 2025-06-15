import ErrorBoundary from '..';
import { render, screen } from '@/test';

const ProblemChild = () => {
    throw new Error('boom');
};

describe('ErrorBoundary component', () => {
    it('catches errors and renders fallback UI', () => {
        render(
            <ErrorBoundary>
                <ProblemChild />
            </ErrorBoundary>
        );
        expect(screen.getByText(/boom/)).toBeInTheDocument();
    });
});
