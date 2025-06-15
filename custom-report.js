// Usage: `node custom-report.js`
import { readFile, writeFile } from 'fs';

readFile('playwright-report/index.html', 'utf8', (err, data) => {
    if (err) {
        console.error('hola', err);
        process.exit(1);
    }
    let replaced = data.replace(
        /<head>/,
        '<head><link rel="shortcut icon" type="image/x-icon" href="https://pre.xabierlameiro.com/favicon.png">'
    );
    writeFile('playwright-report/index.html', replaced, 'utf-8', function (err) {
        if (err) {
            console.error('err', err);
            process.exit(1);
        }
    });
});
