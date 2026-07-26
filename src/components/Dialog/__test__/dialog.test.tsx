import Dialog from '..';
import { fireEvent, render, screen } from '@/test';

describe('Dialog component', () => {
    it('Should renders header, body and footer', () => {
        render(<Dialog open />);
        expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-body')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
    });

    it('Should render with padding and modal mode', () => {
        render(<Dialog open withPadding modalMode />);
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
        expect(screen.getByTestId('dialog')).toHaveClass('padding');
        expect(screen.getByTestId('dialog')).toHaveClass('modalMode');
    });

    it('Should not visisble', () => {
        render(<Dialog />);
        expect(screen.getByTestId('dialog')).not.toHaveClass('open');
    });

    /**
     * SDD-L06. This primitive backs all eight pages and was a plain <div>: no role, no accessible
     * name, no Escape, and — the part the audit could not settle without a runtime check — a closed
     * window hidden only by `transform: scale(0)`, which is purely visual. Its buttons and links
     * stayed in the tab order and in the accessibility tree.
     */
    it('Should be a dialog with an accessible name from its header', () => {
        render(<Dialog open header={<span>Settings</span>} />);

        expect(screen.getByRole('dialog')).toHaveAccessibleName('Settings');
    });

    it('Should prefer an explicit label over the header', () => {
        render(<Dialog open label="Blog" header={<span>Settings</span>} />);

        expect(screen.getByRole('dialog')).toHaveAccessibleName('Blog');
    });

    // Most windows here are NOT modal — the Dock and menu bar stay usable behind them — so claiming
    // aria-modal would tell assistive tech the rest of the page is inert when it is not.
    it('Should only claim aria-modal in modalMode', () => {
        const { rerender } = render(<Dialog open />);
        expect(screen.getByTestId('dialog')).not.toHaveAttribute('aria-modal');

        rerender(<Dialog open modalMode />);
        expect(screen.getByTestId('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    // The regression that matters: a closed window must not be reachable.
    it('Should be inert while closed, and not while open', () => {
        const { rerender } = render(<Dialog />);
        expect(screen.getByTestId('dialog')).toHaveAttribute('inert');

        rerender(<Dialog open />);
        expect(screen.getByTestId('dialog')).not.toHaveAttribute('inert');
    });

    it('Should close on Escape when it can be closed', () => {
        const onClose = jest.fn();
        render(<Dialog open onClose={onClose} />);

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Should ignore Escape while closed', () => {
        const onClose = jest.fn();
        render(<Dialog onClose={onClose} />);

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(onClose).not.toHaveBeenCalled();
    });
});
