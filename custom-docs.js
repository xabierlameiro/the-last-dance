import { readFile, writeFile } from 'fs';
import glob from 'glob';

glob('public/docs/*.?(html|css|ts.html)', function (err, files) {
    if (err) {
        console.log('err', err);
        return;
    }

    files.forEach((path) => {
        readFile(path, 'utf8', (err, data) => {
            if (err) {
                console.log('err', err);
                return;
            }

            let replaced = data.replace(/<title>(.*)<\/title>/, '<title>Docs by Xabier Lameiro</title>');

            replaced = replaced.replace(/href="docs\/index.html"/g, 'href="/doc');

            if (path === 'public/docs/index.html') {
                replaced = replaced.replace(/script src="/g, 'script src="docs/');
                replaced = replaced.replace(/rel="stylesheet" href="/g, 'rel="stylesheet" href="docs/');
            }

            writeFile(path, replaced, 'utf-8', function (err, a) {
                if (err) {
                    console.log('err', err);
                    return;
                }
            });
        });
    });
});
