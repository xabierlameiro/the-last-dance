// Usage: `node custom-report.js`
import { readFile, writeFile } from 'fs';

readFile('playwright-report/index.html', 'utf8', (readErr, data) => {
    if (readErr) {
        console.error('hola', readErr);
        throw new Error('Failed to read report file');
    }
    // SDD-002 D1: auto-generated report pages must never be indexed
    const replaced = data.replace(
        /<head>/,
        '<head><meta name="robots" content="noindex"><link rel="shortcut icon" type="image/x-icon" href="https://pre.xabierlameiro.com/favicon.png">'
    );
    writeFile('playwright-report/index.html', replaced, 'utf-8', (writeErr) => {
        if (writeErr) {
            console.error('err', writeErr);
            throw new Error('Failed to write report file');
        }
    });
});
