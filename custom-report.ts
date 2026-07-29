// Usage: `node custom-report.ts`
import { readFile, writeFile } from 'fs/promises';

/**
 * SDD-L11-T5. Typed, and two things fixed on the way through.
 *
 * The callback form threw from inside the `fs` callbacks, where a `throw` cannot be caught by
 * anything: it surfaced as an uncaught exception with a stack trace instead of the message it
 * carried, and the write error path was unreachable from any handler. `fs/promises` makes the
 * failure catchable and matches the other two report scripts. (A leftover `console.error('hola')`
 * went with it.)
 *
 * The guard itself is now asserted. This injects `<meta name="robots" content="noindex">` per
 * SDD-002 D1, and Playwright owns the surrounding markup — when its reporter template changes, the
 * regex stops matching and the report ships indexable with nothing said.
 */
const REPORT_PATH = 'playwright-report/index.html';
const NOINDEX_META = '<meta name="robots" content="noindex">';

const run = async (): Promise<void> => {
    const data = await readFile(REPORT_PATH, 'utf8');

    // SDD-002 D1: auto-generated report pages must never be indexed
    const replaced = data.replace(
        /<head>/,
        `<head>${NOINDEX_META}<link rel="shortcut icon" type="image/x-icon" href="https://pre.xabierlameiro.com/favicon.png">`,
    );

    if (!replaced.includes(NOINDEX_META)) {
        throw new Error(
            `${REPORT_PATH}: the noindex guard did not apply — Playwright's report no longer matches ` +
                `the <head> replacement in custom-report.ts. Fix the pattern; do not ship an indexable report.`,
        );
    }

    await writeFile(REPORT_PATH, replaced, 'utf-8');
};

run().catch((err: unknown) => {
    console.error('Failed to post-process the Playwright report:', err);
    process.exitCode = 1;
});
