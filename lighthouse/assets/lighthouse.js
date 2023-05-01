import fs from 'fs';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
const chart = {
    chart: {
        container: '#OrganiseChart-big-commpany',
        levelSeparation: 40,
        siblingSeparation: 20,
        subTeeSeparation: 30,
        rootOrientation: 'NORTH',
        nodeAlign: 'BOTTOM',

        connectors: {
            type: 'step',
            style: {
                'stroke-width': 2,
            },
        },
        node: {
            HTMLclass: 'big-commpany',
        },
    },
};

const nodeStructure = {
    text: { name: 'pre.xabierlameiro.com' },
    HTMLclass: 'domain',
    drawLineThrough: true,
    collapsable: true,
    connectors: {
        style: {
            stroke: 'blue',
            'arrow-end': 'oval-wide-long',
        },
    },
};
const options = {
    logLevel: 'silent', //'info'
    output: 'html',
    onlyCategories: ['performance'],
    formFactor: 'desktop',
    throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0, // 0 means unset
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
    },
    screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
    },
    emulatedUserAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
};
const DOMAIN = 'https://pre.xabierlameiro.com';

// Get the sitemap and filter the urls
const sitemap = await fetch(`${DOMAIN}/sitemap.xml`).then((res) => {
    return res.text().then((str) => {
        const urls = str.match(/<loc>(.*?)<\/loc>/g).map((loc) => {
            return loc.replace(/<\/?loc>/g, '');
        });
        return urls;
    });
});

let locales = sitemap.reduce((acc, url) => {
    let locale = url.split('/')[3];
    if (locale !== 'gl' && locale !== 'es') {
        locale = 'en';
    }
    if (!acc[locale]) {
        acc[locale] = [];
    }
    acc[locale].push(url);
    return acc;
}, {});

// Translations
const translations = {
    es: {
        title: 'Informes de Lighthouse',
        subtitle: 'Más detalles en cada enlace',
        description: 'Estos informes se generaron a través de un script',
        lang: 'Español',
    },
    gl: {
        title: 'Informes de Lighthouse',
        subtitle: 'Máis detalles en cada enlace',
        description: 'Estes informes foron xerados a través dun script',
        lang: 'Galego',
    },
    en: {
        title: 'Lighthouse reports',
        subtitle: 'More details in each link',
        description: 'These reports were generated via a script',
        lang: 'English',
    },
};

const index = locales.en.indexOf(DOMAIN);
locales.en[index] = `${DOMAIN}/home`;

// Add the legal pages
locales.en.push(`${DOMAIN}/legal/cookies-policy`);
locales.en.push(`${DOMAIN}/legal/legal-notice`);
locales.en.push(`${DOMAIN}/legal/privacy-policy`);

// `.report` is the HTML report as a string
//const reportHtml = runnerResult.report;
//fs.writeFileSync('lhreport.html', reportHtml);

// `.lhr` is the Lighthouse Result as a JS object
//console.log('Report is done for', runnerResult.lhr.finalDisplayedUrl);
//console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
//console.log('Performance score was', runnerResult.lhr);

if (!fs.existsSync('lighthouse')) {
    fs.mkdirSync('lighthouse');
}
Object.keys(locales).forEach((locale) => {
    if (!fs.existsSync(`lighthouse/${locale}`) && locale !== 'en') {
        fs.mkdirSync(`lighthouse/${locale}`);
    }
});

for (const lang of Object.keys(translations)) {
    let levels = {};
    for (const url of locales[lang]) {
        const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
        const result = await lighthouse(url === `${DOMAIN}/home` ? DOMAIN : url, {
            port: chrome.port,
            ...options,
        });
        await chromeLauncher.killAll();
        let fileName = url.replace(/https:\/\/pre.xabierlameiro.com\//, '').replace(/\//g, '-');

        if (fileName === 'es' || fileName === 'gl') {
            fileName = 'home';
        }
        // write report in output folder
        fs.writeFileSync(
            lang === 'en' ? `lighthouse/${fileName}.html` : `lighthouse/${lang}/${fileName}.html`,
            result.report
        );

        const cleanUrl = url.replace(/https:\/\/pre.xabierlameiro.com\//, '');
        const urlWithoutLocale = cleanUrl.replace(/(gl|es)\//, '');

        const urlSplitted = urlWithoutLocale.split('/');
        let currentLevel = levels;
        for (let i = 0; i < urlSplitted.length; i++) {
            const part = urlSplitted[i];
            if (i === urlSplitted.length - 1) {
                if (!currentLevel[part]) {
                    currentLevel[part] = [];
                }
                currentLevel[part].push({
                    url: url,
                    route: lang === 'en' ? `../${fileName}.html` : `../${lang}/${fileName}.html`,
                    locale: lang,
                });
            } else {
                if (!currentLevel[part]) {
                    currentLevel[part] = {};
                }
                currentLevel = currentLevel[part];
            }
        }
    }
    // Make connectors.js file
    const config = {
        ...chart,
        nodeStructure: {
            ...nodeStructure,
            children: Object.keys(levels).map((firstLevel) => {
                let url = '';
                if (Array.isArray(levels[firstLevel])) {
                    url = levels[firstLevel].find((item) => item.locale === lang);
                }
                return {
                    text: { name: firstLevel === 'es' || firstLevel === 'gl' ? 'home' : firstLevel },
                    ...(url && { link: { href: url?.route } }),
                    stackChildren: true,
                    connectors: {
                        style: {
                            stroke: '#8080FF',
                            'arrow-end': 'block-wide-long',
                        },
                    },

                    ...(Object.keys(levels[firstLevel]).length > 0 && {
                        children: Object.keys(levels[firstLevel]).map((secondLevel) => {
                            if (isNaN(secondLevel)) {
                                let url = '';
                                if (Array.isArray(levels[firstLevel][secondLevel])) {
                                    url = levels[firstLevel][secondLevel].find((item) => item.locale === lang);
                                }

                                return {
                                    text: { name: secondLevel },
                                    ...(url && { link: { href: url?.route } }),
                                    drawLineThrough: true,
                                    collapsable: true,
                                    stackChildren: true,
                                    connectors: {
                                        stackIndent: 30,
                                        style: {
                                            stroke: '#E3C61A',
                                            'arrow-end': 'block-wide-long',
                                        },
                                    },

                                    ...(Object.keys(levels[firstLevel][secondLevel]).length > 0 && {
                                        children: Object.keys(levels[firstLevel][secondLevel]).map((thirdLevel) => {
                                            if (isNaN(thirdLevel)) {
                                                let url = '';
                                                if (Array.isArray(levels[firstLevel][secondLevel][thirdLevel])) {
                                                    url = levels[firstLevel][secondLevel][thirdLevel].find(
                                                        (item) => item.locale === lang
                                                    );
                                                }

                                                return {
                                                    text: { name: thirdLevel },
                                                    ...(url && { link: { href: url?.route } }),
                                                    drawLineThrough: true,
                                                    collapsable: true,
                                                    stackChildren: true,
                                                };
                                            }
                                        }),
                                    }),
                                };
                            }
                        }),
                    }),
                };
            }),
        },
    };
    // clean empty childrens
    config.nodeStructure.children.forEach((item) => {
        if (item.children && item.children.every((item) => item === undefined)) {
            delete item.children;
        } else if (item.children) {
            item.children.forEach((item) => {
                if (item.children && item.children.every((item) => item === undefined)) {
                    delete item.children;
                }
            });
        }
    });
    // write connectors to make a tree
    fs.writeFileSync(
        lang === 'en' ? `lighthouse/connectors.js` : `lighthouse/${lang}/connectors.js`,
        `const config = ${JSON.stringify(config, null, 2)}`
    );
    // Make links for the others languages
    const links = Object.keys(translations)
        .filter((item) => item !== lang)
        .map(
            (item) =>
                `<li><a href="${item === 'en' ? '/index.html' : `../${item}/index.html`}">${
                    translations[item].lang
                }</a></li>`
        );

    // write entry point
    fs.writeFileSync(
        lang === 'en' ? `lighthouse/index.html` : `lighthouse/${lang}/index.html`,
        `<!DOCTYPE html>
                <html lang="${lang}">
                   <head>
                      <meta charset="utf-8" />
                      <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
                      <meta name="viewport" content="width=device-width" />
                      <title>${translations[lang].title}</title>
                      <link rel="icon" href="../../assets/favicon.png" title="The favicon" />
                      <link rel="stylesheet" href="../../assets/connectors.css" />
                      <meta name="robots" content="noindex" />
                   </head>
                   <body class="container">
                      <h1>${translations[lang].title}</h1>
                      <h2>${translations[lang].subtitle}</h2>
                      <p class="notice">${translations[lang].description}</p>
                      <ul class="links">${links.join('')}</ul>
                      <div class="chart" id="OrganiseChart-big-commpany"></div>
                      <script src="../../assets/raphael.js"></script>
                      <script src="../../assets/Treant.js"></script>
                      <script src="${lang === 'en' ? '../../' : `../../${lang}/`}connectors.js"></script>
                      <script>
                         new Treant(config);
                         var div = document.getElementById('OrganiseChart-big-commpany');
                         var element = document.querySelector('.node.big-commpany.domain');
                         div.scrollLeft = element.offsetLeft - div.clientWidth / 2 + element.clientWidth / 2;
                      </script>
                   </body>
                </html>`
    );
}
