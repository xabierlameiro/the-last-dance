const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const urls = sitemap
    .match(/<loc>(.*?)<\/loc>/g)
    .map((url) => url.replace(/<\/?loc>/g, ''))
    .filter((url) => !url.match(/\/(es|gl)(\/|$)/));

(async () => {
    const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless'],
    });
    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['accessibility', 'seo'],
        port: chrome.port,
    };

    const results = [];

    for (const url of urls.slice(0, 4)) {
        const result = await lighthouse(url, options);
        results.push({ url, ...result });
    }

    const html = results
        .map((result) => {
            const report = result.report;
            const url = result.lhr.requestedUrl;
            // remove https://xabierlameiro.com from the url
            const filename = url
                .replace(/https:\/\/xabierlameiro\.com\//, '')
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            fs.writeFileSync(`public/lighthouse/${filename}.html`, report);
            return `<li><a href="/lighthouse/${filename}.html">${url}</a></li>`;
        })
        .join('');

    fs.writeFileSync('public/lighthouse/index.html', `<html><body><ul>${html}</ul></body></html>`);

    await chrome.kill();
})();
