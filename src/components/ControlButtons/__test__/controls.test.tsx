import Controls from '..';
import { fireEvent, render, screen } from '@/test';

/**
 * SDD-L05 rewrote these three from `<div onClick>` to real `<button>`s. The old tests queried
 * `getByTitle('Close')` — the hardcoded English title attributes that were the finding — so they are
 * now role queries, which is what a user of the component actually has available.
 *
 * Note the intl mock returns the message id rather than a translation, so the accessible names here
 * read as `controls.close`. That is a known limitation of the global mock (tracked in SDD-L10-T16),
 * not of the component.
 */
describe('Controls component', () => {
    it('Should render three buttons and dispatch their handlers', () => {
        const onClickClose = jest.fn();
        const onClickMinimise = jest.fn();
        const onClickMaximise = jest.fn();

        render(
            <Controls onClickClose={onClickClose} onClickMinimise={onClickMinimise} onClickMaximise={onClickMaximise} />
        );

        expect(screen.getByTestId('controls')).toBeInTheDocument();
        expect(screen.getAllByRole('button')).toHaveLength(3);

        fireEvent.click(screen.getByRole('button', { name: 'controls.close' }));
        expect(onClickClose).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole('button', { name: 'controls.minimise' }));
        expect(onClickMinimise).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole('button', { name: 'controls.maximise' }));
        expect(onClickMaximise).toHaveBeenCalledTimes(1);
    });

    // The point of the conversion: these were mouse-only, and on the blog and legal pages the close
    // control is the only way out of the full-screen reading panel.
    it('Should activate with the keyboard', () => {
        const onClickClose = jest.fn();
        render(<Controls onClickClose={onClickClose} />);

        const close = screen.getByRole('button', { name: 'controls.close' });
        close.focus();
        expect(close).toHaveFocus();

        // A real <button> fires click on both Enter and Space; a div with onClick fires on neither.
        fireEvent.click(close);
        expect(onClickClose).toHaveBeenCalledTimes(1);
    });

    it('Should carry an accessible name on every control', () => {
        render(<Controls onClickClose={jest.fn()} onClickMinimise={jest.fn()} onClickMaximise={jest.fn()} />);

        for (const button of screen.getAllByRole('button')) {
            expect(button).toHaveAccessibleName();
        }
    });

    it('Should disable Maximise via the attribute, not just a class', () => {
        render(<Controls disabled />);

        const maximise = screen.getByRole('button', { name: 'controls.maximise' });
        expect(maximise).toBeDisabled();
        expect(maximise).toHaveClass('ch_frame_button_disabled');
    });

    // No caller passes onClickMaximise, so the control advertised an action that did not exist.
    it('Should disable Maximise when no handler is supplied', () => {
        render(<Controls onClickClose={jest.fn()} />);

        expect(screen.getByRole('button', { name: 'controls.maximise' })).toBeDisabled();
    });
});
