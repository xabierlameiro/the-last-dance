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
 */
async function processFiles() {
    try {
        const files = await glob('public/docs/*.?(html|css|ts.html)');
        
        for (const path of files) {
            try {
                const data = await readFile(path, 'utf8');
                
                let replaced = data.replace(/<title>(.*)<\/title>/, '<title>Docs by Xabier Lameiro</title>');

                replaced = replaced.replace(/href="index.html">Home/g, 'href="/">Home');

                replaced = replaced.replace(
                    /<a href="docs\/https:\/\/github.com\/jsdoc\/jsdoc">JSDoc 3.6.11<\/a>/g,
                    '<a href="https://xabierlameiro.com">Xabier Lameiro</a>'
                );

                replaced = replaced.replace(
                    /<a href="https:\/\/github.com\/jsdoc\/jsdoc">JSDoc 3.6.11<\/a>/g,
                    '<a href="https://xabierlameiro.com">Xabier Lameiro</a>'
                );

                replaced = replaced.replace(
                    /<\/title>/,
                    '</title><link rel="icon" href="https://pre.xabierlameiro.com/favicon.png" title="The favicon"><meta name="robots" content="noindex">'
                );

                replaced = replaced.replace(/Global/g, 'Components');

                replaced = replaced.replace(/<h3 class="subsection-title">Methods<\/h3>/g, '');

                await writeFile(path, replaced, 'utf-8');
            } catch (err) {
                console.error('Error processing file:', path, err);
                process.exitCode = 1;
            }
        }
    } catch (err) {
        console.error('Error finding files:', err);
        process.exitCode = 1;
    }
}

async function processCssFile() {
    try {
        const data = await readFile('public/docs/styles/jsdoc-default.css', 'utf8');
        const replaced = data.replace(/nav(?:\r\n|\r|\n){/g, 'nav { position:sticky; top:20px;');
        await writeFile('public/docs/styles/jsdoc-default.css', replaced, 'utf-8');
    } catch (err) {
        console.error('Error processing CSS file:', err);
        process.exitCode = 1;
    }
}

// Run both functions
Promise.all([processFiles(), processCssFile()])
    .then(() => console.log('Documentation processing completed'))
    .catch((err) => {
        console.error('Error:', err);
        process.exitCode = 1;
    });
