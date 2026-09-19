import { fireEvent, render, screen, waitFor, within } from '@/test';
import NextLeak from '../../pages/next-leak';
import { nextLeak, VERDICTS } from '@/constants/nextLeak';

describe('/next-leak', () => {
    /*
     * The page exists to be read by crawlers and AI assistants, which do not click tabs. Every section
     * has to be in the rendered HTML, with the inactive ones `hidden` rather than not rendered.
     */
    it('renders all six sections, with only the example run visible', () => {
        render(<NextLeak />);

        const panels = screen.getAllByRole('tabpanel', { hidden: true });
        expect(panels).toHaveLength(6);
        expect(panels.filter((panel) => !panel.hidden)).toHaveLength(1);
        expect(screen.getByRole('tab', { name: 'nextLeak.nav.run' })).toHaveAttribute('aria-selected', 'true');
    });

    it('carries the install command, every verdict word and every verified issue', () => {
        const { container } = render(<NextLeak />);
        const text = container.textContent ?? '';

        expect(screen.getByText(nextLeak.install)).toBeInTheDocument();
        VERDICTS.forEach((verdict) => expect(text).toContain(verdict));
        nextLeak.issues.forEach(({ issue }) => expect(text).toContain(`#${issue}`));
    });

    it('emits the SoftwareApplication structured data and a Home → next-leak breadcrumb', () => {
        render(<NextLeak />);

        const payload = JSON.parse(screen.getByTestId('page-jsonld').innerHTML);
        const [software, breadcrumb] = payload;
        expect(software['@type']).toBe('SoftwareApplication');
        expect(software.softwareVersion).toBe(nextLeak.version);
        expect(breadcrumb['@type']).toBe('BreadcrumbList');
        expect(breadcrumb.itemListElement.map(({ name }: { name: string }) => name)).toEqual(['Home', 'next-leak']);
    });

    it('switches sections by click and by arrow key', () => {
        render(<NextLeak />);

        fireEvent.click(screen.getByRole('tab', { name: 'nextLeak.nav.limits' }));
        expect(screen.getByRole('tabpanel', { name: 'nextLeak.nav.limits' })).toBeVisible();

        fireEvent.keyDown(screen.getByRole('tab', { name: 'nextLeak.nav.limits' }), { key: 'ArrowDown' });
        const links = screen.getByRole('tab', { name: 'nextLeak.nav.links' });
        expect(links).toHaveAttribute('aria-selected', 'true');
        expect(links).toHaveFocus();

        // Wraps around from the last section to the first.
        fireEvent.keyDown(links, { key: 'ArrowRight' });
        expect(screen.getByRole('tab', { name: 'nextLeak.nav.overview' })).toHaveAttribute('aria-selected', 'true');
    });

    it('shows the retainer chain for the leaking route and the --diff-all note for a stable one', () => {
        render(<NextLeak />);
        const run = screen.getByRole('tabpanel', { name: 'nextLeak.nav.run' });
        const [leaking, stable] = nextLeak.exampleRun.routes;

        expect(within(run).getByText(leaking.retainer as string)).toBeInTheDocument();

        fireEvent.click(within(run).getAllByRole('button', { pressed: false })[0]);
        expect(within(run).getByRole('button', { pressed: true })).toHaveTextContent(stable.route);
        expect(within(run).getByText('nextLeak.run.stableRetainer')).toBeInTheDocument();
    });

    it('copies the install command', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });
        render(<NextLeak />);

        fireEvent.click(screen.getByRole('button', { name: 'nextLeak.copyLabel' }));

        expect(writeText).toHaveBeenCalledWith(nextLeak.install);
        await waitFor(() => expect(screen.getByText('nextLeak.copied')).toBeInTheDocument());
    });
});
