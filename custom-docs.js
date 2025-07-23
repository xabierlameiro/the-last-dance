import { readFile, writeFile } from 'fs/promises';
import pkg from 'glob';
const { glob } = pkg;

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
                console.log('Error processing file:', path, err);
            }
        }
    } catch (err) {
        console.log('Error finding files:', err);
    }
}

async function processCssFile() {
    try {
        const data = await readFile('public/docs/styles/jsdoc-default.css', 'utf8');
        const replaced = data.replace(/nav(?:\r\n|\r|\n){/g, 'nav { position:sticky; top:20px;');
        await writeFile('public/docs/styles/jsdoc-default.css', replaced, 'utf-8');
    } catch (err) {
        console.log('Error processing CSS file:', err);
    }
}

// Run both functions
Promise.all([processFiles(), processCssFile()])
    .then(() => console.log('Documentation processing completed'))
    .catch(err => console.error('Error:', err));
