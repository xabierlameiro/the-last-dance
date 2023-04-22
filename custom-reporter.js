import { readFile, writeFile } from 'fs';
import glob from 'glob';

glob('public/coverage/**/*.?(html|css)', function (err, files) {
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
            let replaced = data.replace(
                /Code coverage generated by\n\s*<a href="https:\/\/istanbul\.js\.org\/" target="_blank" rel="noopener noreferrer">istanbul\<\/a>\n\s*(.*)\n\s*<\/div>/g,
                `Code coverage automatically generated by Xabier Lameiro on ${new Date().toLocaleString()}`
            );

            replaced = replaced.replace(
                /<div class='pad1'>\n\s*<h1>(.*)All files/g,
                "<div class='pad1'><h1><a href='/'>Return</a></h1></h1><h1><a href='/'>All tests</a>"
            );

            replaced = replaced.replace(/<title>(.*)<\/title>/, '<title>Code coverage by Xabier Lameiro</title>');

            replaced = replaced.replace(
                /(.*)<link rel="shortcut icon" (.*)\s* href="(.*)" \/>/,
                '<link rel="shortcut icon" type="image/x-icon" href="/favicon.png">'
            );

            replaced = replaced.replace(
                /\.pad1 { padding: 10px; }/,
                '.pad1 { padding: 10px; width: 100%; overflow: scroll; }'
            );

            writeFile(path, replaced, 'utf-8', function (err) {
                if (err) {
                    console.log('err', err);
                    return;
                }
            });
        });
    });

    readFile('public/favicon.png', 'utf8', (err, data) => {
        if (err) {
            console.log('err', err);
            return;
        }
        writeFile('public/coverage/favicon.png', data, 'utf-8', function (err) {
            if (err) {
                console.log('err', err);
                return;
            }
        });
    });
});
