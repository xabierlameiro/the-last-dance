import fs from 'fs';
import path from 'path';
import DeploymentStatus from '..';
import { deploymentStatusSchema } from '../../../types/schemas';
import { render, screen } from '@/test';
import useSWR from 'swr';

jest.mock('swr');

const mockData = {
    status: 'READY',
    username: 'test',
    environment: 'production',
    createdAt: new Date().toISOString(),
};

describe('DeploymentStatus component', () => {
    it('renders status indicator', () => {
        (useSWR as jest.Mock).mockReturnValue({ data: mockData, error: undefined });
        const { container } = render(<DeploymentStatus />);
        expect(container.querySelector('.status')).toBeInTheDocument();
    });

    it('renders error state', () => {
        (useSWR as jest.Mock).mockReturnValue({ data: undefined, error: new Error('down') });
        render(<DeploymentStatus />);
        expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    /**
     * SDD-L07. The widget picks its colour with `styles[status.toLowerCase()]`, so a state with no
     * matching class renders an empty circle — indistinguishable from "no data" — and nothing fails.
     * That had already happened twice over: the class for `QUEUED` was named `.queue`, so a queued
     * deployment had never shown its colour; and `BLOCKED` and `DELETED`, which Vercel documents and
     * this codebase's six-value union omitted, had no class at all.
     *
     * Asserting against the schema rather than a hardcoded list means widening the union later fails
     * here until the styling follows.
     *
     * Read from the stylesheet as text on purpose: `next/jest` proxies CSS modules so that every key
     * returns its own name, which means `expect(styles[x]).toBeDefined()` passes for any string at
     * all — including the class that was actually missing. That assertion would have proved nothing.
     */
    const stylesheet = fs.readFileSync(path.join(__dirname, '..', 'deploymentstatus.module.css'), 'utf8');

    it.each(deploymentStatusSchema.options)('has a colour class and a glyph for the %s state', (status) => {
        const state = status.toLowerCase();

        expect(stylesheet).toContain(`.${state} {`);
        expect(stylesheet).toContain(`[data-status='${state}']`);
    });
});
