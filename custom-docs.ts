import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';

/**
 * SDD-L10-T8. This script reported success on every run while doing nothing.
 *
 * `glob` was never declared as a dependency — it arrived transitively through jest@29, which pinned
 * 7.2.3. In v7 the awaited call resolves to a `Glob` **instance**, not an array, so
 * `for (const path of files)` threw `files is not iterable` on the first line of the loop. The
 * blanket `catch` below turned that into a `console.log` and the process exited 0.
 *
 * The consequence is not cosmetic. The replacement at the bottom of the loop injects
 * `<meta name="robots" content="noindex">` into every generated docs page — a guard whose own
 * comment calls it mandatory — and it had never once executed. (It is moot today because
 * `.vercelignore` excludes `public/docs`, but the script is what the guard depends on.)
 *
 * Now: `glob` is an explicit devDependency at ^11, whose promise API returns a real array (verified
 * by running it), and a failure sets a non-zero exit code instead of printing and moving on.
 *
 * SDD-L11-T5. Typed, and the guard is asserted instead of assumed — a silent no-op is precisely how
 * this file failed before, and a `catch` that only logs cannot tell "did nothing" from "did the job".
 */
const NOINDEX_META = '<meta name="robots" content="noindex">';

const brandDocsPage = (data: string): string => {
    let replaced = data.replace(/<title>(.*)<\/title>/, '<title>Docs by Xabier Lameiro</title>');

    replaced = replaced.replace(/href="index.html">Home/g, 'href="/">Home');

    replaced = replaced.replace(
        /<a href="docs\/https:\/\/github.com\/jsdoc\/jsdoc">JSDoc 3.6.11<\/a>/g,
        '<a href="https://xabierlameiro.com">Xabier Lameiro</a>',
    );

    replaced = replaced.replace(
        /<a href="https:\/\/github.com\/jsdoc\/jsdoc">JSDoc 3.6.11<\/a>/g,
        '<a href="https://xabierlameiro.com">Xabier Lameiro</a>',
    );

    replaced = replaced.replace(
        /<\/title>/,
        `</title><link rel="icon" href="https://pre.xabierlameiro.com/favicon.png" title="The favicon">${NOINDEX_META}`,
    );

    replaced = replaced.replace(/Global/g, 'Components');

    replaced = replaced.replace(/<h3 class="subsection-title">Methods<\/h3>/g, '');

    return replaced;
};

/**
 * @description Fail loudly if the indexing guard did not land. jsdoc emits `<title>` on every page,
 * so a miss means its template changed and the guard lapsed silently — the original failure mode of
 * this script.
 */
const assertNoindex = (path: string, html: string): void => {
    if (html.includes(NOINDEX_META)) return;
    throw new Error(
        `${path}: the noindex guard did not apply — jsdoc's HTML no longer matches the </title> ` +
            `replacement in custom-docs.ts. Fix the pattern; do not ship an indexable docs page.`,
    );
};

const processFiles = async (): Promise<void> => {
    const files = await glob('public/docs/*.?(html|css|ts.html)');

    for (const path of files) {
        const data = await readFile(path, 'utf8');
        const replaced = brandDocsPage(data);
        assertNoindex(path, replaced);
        await writeFile(path, replaced, 'utf-8');
    }
};

const processCssFile = async (): Promise<void> => {
    const path = 'public/docs/styles/jsdoc-default.css';
    const data = await readFile(path, 'utf8');
    await writeFile(path, data.replace(/nav(?:\r\n|\r|\n){/g, 'nav { position:sticky; top:20px;'), 'utf-8');
};

Promise.all([processFiles(), processCssFile()])
    .then(() => console.log('Documentation processing completed'))
    .catch((err: unknown) => {
        console.error('Failed to post-process the documentation:', err);
        process.exitCode = 1;
    });
