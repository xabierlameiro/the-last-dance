const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
let urls = sitemap
    .match(/<loc>(.*?)<\/loc>/g)
    .map((url) => url.replace(/<\/?loc>/g, ''))
    .filter((url) => !url.match(/\/(es|gl)(\/|$)/));

// remove the same pages in different languages and categories
urls = urls.filter((url, index, self) => {
    const lastPart = url.split('/').pop();
    return self.findIndex((u) => u.split('/').pop() === lastPart) === index;
});

urls = urls.sort((a, b) => {
    const aParts = a.split('/');
    const bParts = b.split('/');
    if (aParts.length === bParts.length) {
        return aParts[aParts.length - 1] > bParts[bParts.length - 1] ? 1 : -1;
    }
    return aParts.length > bParts.length ? 1 : -1;
});

function launchChromeAndRunLighthouse(url, flags = {}, config = null) {
    return chromeLauncher.launch(flags).then((chrome) => {
        flags.port = chrome.port;
        return lighthouse(url, flags, config).then((results) => chrome.kill().then(() => results));
    });
}

(async () => {
    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['accessibility', 'seo'],
        chromeFlags: ['--headless'],
    };

    const results = [];

    for (const url of urls) {
        const result = await launchChromeAndRunLighthouse(url, options);
        results.push({ url, ...result });
    }

    const html = results
        .map((result) => {
            const report = result.report;
            const url = result.lhr.requestedUrl;
            let filename = url
                .replace(/https:\/\/xabierlameiro\.com\//, '')
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            filename = filename === '' ? 'home' : filename;
            fs.writeFileSync(`public/lighthouse/${filename}.html`, report);
            return `<li><a href="/lighthouse/${filename}.html">${
                url === ' '
                    ? 'Home'
                    : filename.includes('blog')
                    ? filename
                          .split('_')
                          .slice(2)
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                    : filename.charAt(0).toUpperCase() + filename.slice(1)
            }</a></li>`;
        })
        .join('');

    fs.writeFileSync(
        'public/lighthouse/index.html',
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="robots" content="noindex">
            <title>LightHouse Report</title>
            <link rel="icon" href="/favicon.svg" title="The favicon">
            <link href="lighthouse.css" rel="stylesheet"/>
        </head>
        <body>
            <ul>
                ${html}
            </ul>
        </body>
        </html>
        `
    );
})();
