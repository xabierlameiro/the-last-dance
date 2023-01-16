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

            if (path === 'public/docs/index.html') {
                replaced = replaced.replace(/src="/g, 'src="docs/');
                replaced = replaced.replace(/href="/g, 'href="docs/');
                replaced = replaced.replace(/href="docs\/index.html"/g, 'href="/docs"');
                replaced = replaced.replace(/url\('/g, "url('docs/");
            }

            replaced = replaced.replace(/href="index.html">Home/g, 'href="/docs">Home');

            writeFile(path, replaced, 'utf-8', function (err, a) {
                if (err) {
                    console.log('err', err);
                    return;
                }
            });
        });
    });
});
