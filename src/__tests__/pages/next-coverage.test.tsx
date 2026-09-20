import { fireEvent, render, screen, waitFor, within } from '@/test';
import NextCoverage from '../../pages/next-coverage';
import { BUCKETS, nextCoverage } from '@/constants/nextCoverage';

const run = nextCoverage.exampleRun;

describe('/next-coverage', () => {
    /*
     * Same contract as /next-leak: the page is read by crawlers and assistants, which do not click
     * tabs. Every section is in the rendered HTML, inactive ones `hidden` rather than absent.
     */
    it('renders all six sections, with only the example run visible', () => {
        render(<NextCoverage />);

        const panels = screen.getAllByRole('tabpanel', { hidden: true });
        expect(panels).toHaveLength(6);
        expect(panels.filter((panel) => !panel.hidden)).toHaveLength(1);
        expect(screen.getByRole('tab', { name: 'nextCoverage.nav.run' })).toHaveAttribute('aria-selected', 'true');
    });

    it('carries the install command and the four bucket counts', () => {
        render(<NextCoverage />);
        const panel = screen.getByRole('tabpanel', { name: 'nextCoverage.nav.run' });

        expect(screen.getByText(nextCoverage.install)).toBeInTheDocument();
        BUCKETS.forEach((bucket) => {
            expect(within(panel).getAllByText(String(run.counts[bucket])).length).toBeGreaterThan(0);
        });
    });

    /*
     * The findings are the tool's own words, file paths included. A finding that lost its files would
     * leave the reader with an assertion and no way to check it.
     */
    it('prints every finding with its reason, its docs link and its files', () => {
        render(<NextCoverage />);
        const panel = screen.getByRole('tabpanel', { name: 'nextCoverage.nav.run' });

        run.findings.forEach(({ api, what, why, docs, files }) => {
            expect(within(panel).getByText(api)).toBeInTheDocument();
            expect(within(panel).getByText(what)).toBeInTheDocument();
            expect(within(panel).getByText(why)).toBeInTheDocument();
            files.forEach((file) => expect(within(panel).getByText(file)).toBeInTheDocument());
            expect(
                within(panel)
                    .getAllByRole('link')
                    .some((link) => link.getAttribute('href') === docs),
            ).toBe(true);
        });
    });

    it('emits the SoftwareApplication structured data and a Home → next-coverage breadcrumb', () => {
        render(<NextCoverage />);

        const payload = JSON.parse(screen.getByTestId('page-jsonld').innerHTML);
        const [software, breadcrumb] = payload;
        expect(software['@type']).toBe('SoftwareApplication');
        expect(software.softwareVersion).toBe(nextCoverage.version);
        expect(breadcrumb['@type']).toBe('BreadcrumbList');
        expect(breadcrumb.itemListElement.map(({ name }: { name: string }) => name)).toEqual(['Home', 'next-coverage']);
    });

    it('switches sections by click and by arrow key', () => {
        render(<NextCoverage />);

        fireEvent.click(screen.getByRole('tab', { name: 'nextCoverage.nav.limits' }));
        expect(screen.getByRole('tabpanel', { name: 'nextCoverage.nav.limits' })).toBeVisible();

        fireEvent.keyDown(screen.getByRole('tab', { name: 'nextCoverage.nav.limits' }), { key: 'ArrowDown' });
        const links = screen.getByRole('tab', { name: 'nextCoverage.nav.links' });
        expect(links).toHaveAttribute('aria-selected', 'true');
        expect(links).toHaveFocus();

        // Wraps around from the last section to the first.
        fireEvent.keyDown(links, { key: 'ArrowRight' });
        expect(screen.getByRole('tab', { name: 'nextCoverage.nav.overview' })).toHaveAttribute('aria-selected', 'true');
    });

    it('links to npmx and to the sibling tool', () => {
        render(<NextCoverage />);
        fireEvent.click(screen.getByRole('tab', { name: 'nextCoverage.nav.links' }));
        const panel = screen.getByRole('tabpanel', { name: 'nextCoverage.nav.links' });

        expect(within(panel).getByText('npmx.dev/package/next-coverage')).toHaveAttribute('href', nextCoverage.npmx);
        expect(within(panel).getByText('next-leak')).toHaveAttribute('href', '/next-leak');
    });

    it('copies the install command', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });
        render(<NextCoverage />);

        fireEvent.click(screen.getByRole('button', { name: 'nextCoverage.copyLabel' }));

        expect(writeText).toHaveBeenCalledWith(nextCoverage.install);
        await waitFor(() => expect(screen.getByText('nextCoverage.copied')).toBeInTheDocument());
    });
});
