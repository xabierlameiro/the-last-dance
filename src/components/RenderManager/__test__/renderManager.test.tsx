import RenderManager from '..';
import { ResponseShapeError, ResponseStatusError } from '@/helpers/createFetcher';
import { fireEvent, render, screen } from '@/test';

describe('RenderManager', () => {
    it('should render', () => {
        render(
            <RenderManager error={undefined} loading={false}>
                <div data-testid="render-manager" />
            </RenderManager>
        );
        expect(screen.getByTestId('render-manager')).toBeInTheDocument();
    });

    it('should render loading', () => {
        render(
            <RenderManager error={undefined} loading>
                <div data-testid="render-manager" />
            </RenderManager>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should render error', () => {
        render(
            <RenderManager error={new Error('boom')} loading={false}>
                <div data-testid="render-manager" />
            </RenderManager>
        );
        expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    /**
     * SDD-L07, and criterion 5 of the spec: two different errors must produce two different
     * messages. `error` was typed `boolean` — it never was one, since every caller passes SWR's
     * error object — so all three failure kinds collapsed into one icon with one sentence.
     *
     * The intl mock returns message ids, so these assertions read as ids rather than prose.
     */
    it('should tell a bad status apart from a response that does not match its contract', () => {
        const { rerender } = render(
            <RenderManager error={new ResponseStatusError('/api/xrp', 502, 'Bad Gateway')} loading={false}>
                <div />
            </RenderManager>
        );
        // The tooltip only mounts its content once open, so focus the trigger the way a keyboard
        // user would.
        fireEvent.focus(screen.getByTestId('error'));
        expect(screen.getByText('rendermanager.error.status')).toBeInTheDocument();

        rerender(
            <RenderManager error={new ResponseShapeError('/api/xrp', 'price expected number')} loading={false}>
                <div />
            </RenderManager>
        );
        fireEvent.focus(screen.getByTestId('error'));
        expect(screen.getByText('rendermanager.error.shape')).toBeInTheDocument();
    });

    it('should fall back to the generic message for any other failure', () => {
        render(
            <RenderManager error={new TypeError('Failed to fetch')} loading={false}>
                <div />
            </RenderManager>
        );
        fireEvent.focus(screen.getByTestId('error'));
        expect(screen.getByText('rendermanager.error')).toBeInTheDocument();
    });

    // A widget that supplies its own wording still wins — the distinction only fills in where there
    // was none.
    it('should prefer an explicit errorTitle over the kind-specific message', () => {
        render(
            <RenderManager
                error={new ResponseShapeError('/api/heating', 'outsideTemp expected number')}
                loading={false}
                errorTitle="Heating unavailable"
            >
                <div />
            </RenderManager>
        );
        fireEvent.focus(screen.getByTestId('error'));
        expect(screen.getByText('Heating unavailable')).toBeInTheDocument();
    });
});
