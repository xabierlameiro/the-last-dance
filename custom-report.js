import { readFile, writeFile } from 'fs';

readFile('playwright-report/index.html', 'utf8', (err, data) => {
    if (err) {
        console.log('hola', err);
        return;
    }
    let replaced = data.replace(
        /<head>/,
        '<head><link rel="shortcut icon" type="image/x-icon" href="https://pre.xabierlameiro.com/favicon.png">'
    );
    writeFile('playwright-report/index.html', replaced, 'utf-8', function (err) {
        if (err) {
            console.log('err', err);
            return;
        }
    });
});
