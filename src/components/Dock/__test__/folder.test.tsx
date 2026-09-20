import { render, screen } from '@/test';
import userEvent from '@testing-library/user-event';
import Dock from '../';
import { DialogProvider } from '@/context/dialog';

const dock = () => (
    <DialogProvider>
        <Dock />
    </DialogProvider>
);

/*
 * SDD-015. The folder is the only Dock item that is not a link, so it is the only one that has to
 * answer for its own keyboard and focus behaviour.
 */
describe('Dock folder', () => {
    it('starts closed, with the panel hidden but present', () => {
        render(dock());
        const trigger = screen.getByRole('button', { name: 'dock.tools' });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        const panel = document.getElementById('dock-tools-panel');
        expect(panel).toBeInTheDocument();
        expect(panel).toHaveAttribute('hidden');
    });

    it('opens on click and closes again on a second click', async () => {
        const user = userEvent.setup();
        render(dock());
        const trigger = screen.getByRole('button', { name: 'dock.tools' });

        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(document.getElementById('dock-tools-panel')).not.toHaveAttribute('hidden');
        expect(screen.getByRole('link', { name: 'dock.nextCoverage' })).toHaveAttribute('href', '/next-coverage');

        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    // Escape has to give the focus back, or it lands on <body> and the Dock is lost.
    it('closes on Escape and returns focus to the trigger', async () => {
        const user = userEvent.setup();
        render(dock());
        const trigger = screen.getByRole('button', { name: 'dock.tools' });

        await user.click(trigger);
        await user.keyboard('{Escape}');

        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(trigger).toHaveFocus();
    });

    it('closes when a click lands outside it', async () => {
        const user = userEvent.setup();
        render(dock());
        const trigger = screen.getByRole('button', { name: 'dock.tools' });

        await user.click(trigger);
        await user.click(document.body);

        expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens from the keyboard', async () => {
        const user = userEvent.setup();
        render(dock());
        const trigger = screen.getByRole('button', { name: 'dock.tools' });

        trigger.focus();
        await user.keyboard('{Enter}');

        expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
});
