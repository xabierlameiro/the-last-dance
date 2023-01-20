const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

function launchChromeAndRunLighthouse(url, flags = {}, config = null) {
    return chromeLauncher.launch(flags).then((chrome) => {
        flags.port = chrome.port;
        return lighthouse(url, flags, config).then((results) => chrome.kill().then(() => results));
    });
}

const urls = [
    'https://xabierlameiro.com',
    'https://xabierlameiro.com/comments',
    'https://xabierlameiro.com/settings',
    'https://xabierlameiro.com/legal/cookies-policy',
    'https://xabierlameiro.com/legal/legal-notice',
    'https://xabierlameiro.com/legal/privacy-policy',
    'https://xabierlameiro.com/blog/error/solve-address-in-use-error',
    'https://xabierlameiro.com/blog/error/npm-token-solution-error',
    'https://xabierlameiro.com/blog/error/uncaught-error-minified-react-error',
    'https://xabierlameiro.com/blog/react/how-document-my-react-components-with-jsdoc',
    'https://xabierlameiro.com/blog/react/publish-report-testing-react',
    'https://xabierlameiro.com/blog/react/deploying-my-storybook-is-very-simple',
    'https://xabierlameiro.com/blog/nextjs/counter-for-github-stars-repository',
    'https://xabierlameiro.com/blog/nextjs/make-a-views-counter-with-google-analytics',
    'https://xabierlameiro.com/blog/nextjs/translate-slugs-web-pages',
    'https://xabierlameiro.com/blog/node/solve-address-in-use-error',
    'https://xabierlameiro.com/blog/node/how-document-my-react-components-with-jsdoc',
    'https://xabierlameiro.com/blog/node/counter-for-github-stars-repository',
    'https://xabierlameiro.com/blog/node/make-a-views-counter-with-google-analytics',
    'https://xabierlameiro.com/blog/node/uncaught-error-minified-react-error',
    'https://xabierlameiro.com/blog/npm/npm-token-solution-error',
    'https://xabierlameiro.com/blog/jest/publish-report-testing-react',
    'https://xabierlameiro.com/blog/storybook/deploying-my-storybook-is-very-simple',
    'https://xabierlameiro.com/blog/intl/translate-slugs-web-pages',
];
(async () => {
    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'seo'],
        chromeFlags: ['--headless'],
        settings: {
            formFactor: 'desktop',
        },
    };

    const results = [];

    for (const url of urls) {
        const result = await launchChromeAndRunLighthouse(url, options);
        results.push({ url, ...result });
    }

    // Write documents with the last part of the url for name and the html report
    results.forEach((result) => {
        const url = result.url;
        const name = url.split('/').pop();
        fs.writeFileSync(`public/lighthouse/${name}.html`, result.report);
    });

    fs.writeFileSync(
        'public/lighthouse/index.html',
        `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
                    <meta name="viewport" content="width=device-width" />
                    <title>Lighthouse reports</title>
                    <link rel="stylesheet" href="/lighthouse/statics/connectors.css" />
                    <meta name="robots" content="noindex" />
                    <link rel="icon" href="/favicon.svg" title="The favicon" />
                </head>
                <body class="container">
                    <h1>Lighthouse report</h1>
                    <h2>More details in each link</h2>
                    <a href="https://www.xabierlameiro.com">go back</a>
                    <div class="chart" id="OrganiseChart-big-commpany"></div>
            
                    <script src="/lighthouse/statics/raphael.js"></script>
                    <script src="/lighthouse/statics/Treant.js"></script>
                    <script src="/lighthouse/statics/connectors.js"></script>
            
                    <script>
                        new Treant(chart_config);
                    </script>
                </body>
            </html>
        
        `
    );
})();
