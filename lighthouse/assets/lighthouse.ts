// Usage: `node lighthouse/assets/lighthouse.ts`
import fs from 'fs';
import lighthouse from 'lighthouse';
// chrome-launcher is native ESM and exposes no default export, only named ones.
import * as chromeLauncher from 'chrome-launcher';
import { chart, nodeStructure, options, DOMAIN, translations } from './constants.ts';
import type { Locale } from './constants.ts';

/**
 * SDD-L11-T8. Typed, with the tree the runner builds finally written down.
 *
 * The structure below is the part that was carrying the risk: `levels` is built by walking each URL
 * path segment by segment, putting an object at every intermediate segment and an array of report
 * links at the last one — so the same key can hold either, at any depth, and nothing said so. The
 * three nested `map`s that turn it into a Treant config then index it four levels deep and lean on
 * `isNaN` over an object key to tell "a real path segment" from "an array index". Naming the two
 * shapes is what makes those reads checkable.
 *
 * The `undefined` in `children` is deliberate and matches the original: the inner `map`s return
 * nothing for numeric keys, and the "clean empty childrens" pass below deletes the arrays that come
 * back all-undefined. Typing it honestly keeps that pass necessary instead of hiding it.
 */
type ReportLink = {
    url: string;
    route: string;
    locale: Locale;
};

type LevelNode = {
    [segment: string]: LevelNode | ReportLink[];
};

type TreeNode = {
    text: { name: string };
    link?: { href: string };
    drawLineThrough?: boolean;
    collapsable?: boolean;
    stackChildren?: boolean;
    connectors?: Record<string, unknown>;
    children?: (TreeNode | undefined)[];
};

try {
    // Get the sitemap and filter the urls
    const sitemap: string[] = await fetch(`${DOMAIN}/sitemap.xml`).then((res) => {
        return res.text().then((str) => {
            // `.match` answers null when nothing matches, and the original called `.map` on it
            // straight away — a TypeError with no clue in it. The throw says which document was
            // unusable, and still fails the run, which is the behaviour that matters.
            const matches = str.match(/<loc>([^<]+)<\/loc>/g);
            if (matches === null) {
                throw new Error(`No <loc> entries in ${DOMAIN}/sitemap.xml — cannot pick pages to audit`);
            }
            const urls = matches.map((loc) => {
                return loc.replace(/<\/?loc>/g, '');
            });
            return urls;
        });
    });

    const locales = sitemap.reduce<Record<string, string[]>>((acc, url) => {
        let locale = url.split('/')[3];
        if (locale !== 'gl' && locale !== 'es') {
            locale = 'en';
        }
        const bucket = acc[locale] ?? [];
        acc[locale] = bucket;
        bucket.push(url);
        return acc;
    }, {});

    const englishUrls = locales.en;
    if (englishUrls === undefined) {
        throw new Error(`No English URLs in the sitemap — expected at least ${DOMAIN}`);
    }
    const index = englishUrls.indexOf(DOMAIN);
    englishUrls[index] = `${DOMAIN}/home`;

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

    for (const lang of Object.keys(translations) as Locale[]) {
        const levels: LevelNode = {};
        for (const url of locales[lang] ?? []) {
            const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
            const result = await lighthouse(url === `${DOMAIN}/home` ? DOMAIN : url, {
                port: chrome.port,
                ...options,
            });
            await chromeLauncher.killAll();
            let fileName = url.replace(/https:\/\/xabierlameiro.com\//, '').replace(/\//g, '-');

            if (fileName === 'es' || fileName === 'gl') {
                fileName = 'home';
            }
            // write report in output folder
            fs.writeFileSync(
                lang === 'en' ? `lighthouse/${fileName}.html` : `lighthouse/${lang}/${fileName}.html`,
                // SDD-002 D1: auto-generated report pages must never be indexed
                String(result?.report).replace(/<head>/, '<head><meta name="robots" content="noindex">'),
            );

            const cleanUrl = url.replace(/https:\/\/xabierlameiro.com\//, '');
            const urlWithoutLocale = cleanUrl.replace(/(gl|es)\//, '');

            const urlSplitted = urlWithoutLocale.split('/');
            let currentLevel: LevelNode = levels;
            for (let i = 0; i < urlSplitted.length; i++) {
                const part = urlSplitted[i] ?? '';
                const existing = currentLevel[part];
                if (i === urlSplitted.length - 1) {
                    const leaves = Array.isArray(existing) ? existing : [];
                    currentLevel[part] = leaves;
                    leaves.push({
                        url: url,
                        route: lang === 'en' ? `../${fileName}.html` : `../${lang}/${fileName}.html`,
                        locale: lang,
                    });
                } else {
                    // A segment that is both a page and a parent — `/blog` present in the sitemap
                    // alongside `/blog/<category>/<slug>` — has no representation here: the old code
                    // hung named properties off the leaf array, `Object.keys` then returned a mix of
                    // indices and names, and the cleanup pass below died on the resulting `undefined`
                    // with `Cannot read properties of undefined (reading 'children')`. Reproduced
                    // against the previous version; today's sitemap does not contain that shape, so
                    // it never fired. This says so instead, rather than crashing later or quietly
                    // dropping the page's own report link.
                    if (Array.isArray(existing)) {
                        throw new Error(
                            `${part} is both a page and a parent in the sitemap. The report tree cannot ` +
                                `express that; give it its own node before auditing again.`,
                        );
                    }
                    const branch = existing ?? {};
                    currentLevel[part] = branch;
                    currentLevel = branch;
                }
            }
        }

        /** The report link for this language, when the segment holds links rather than a subtree. */
        const linkFor = (node: LevelNode | ReportLink[] | undefined): ReportLink | undefined =>
            Array.isArray(node) ? node.find((item) => item.locale === lang) : undefined;

        // Make connectors.js file
        const config = {
            ...chart,
            nodeStructure: {
                ...nodeStructure,
                children: Object.keys(levels).map((firstLevel): TreeNode => {
                    const first = levels[firstLevel];
                    const url = linkFor(first);
                    return {
                        text: { name: firstLevel === 'es' || firstLevel === 'gl' ? 'home' : firstLevel },
                        ...(url && { link: { href: url.route } }),
                        stackChildren: true,
                        connectors: {
                            style: {
                                stroke: '#8080FF',
                                'arrow-end': 'block-wide-long',
                            },
                        },

                        ...(first !== undefined &&
                            Object.keys(first).length > 0 && {
                                children: Object.keys(first).map((secondLevel): TreeNode | undefined => {
                                    if (Number.isNaN(Number(secondLevel))) {
                                        const second = Array.isArray(first) ? undefined : first[secondLevel];
                                        const url = linkFor(second);

                                        return {
                                            text: { name: secondLevel },
                                            ...(url && { link: { href: url.route } }),
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

                                            ...(second !== undefined &&
                                                Object.keys(second).length > 0 && {
                                                    children: Object.keys(second).map(
                                                        (thirdLevel): TreeNode | undefined => {
                                                            if (Number.isNaN(Number(thirdLevel))) {
                                                                const third = Array.isArray(second)
                                                                    ? undefined
                                                                    : second[thirdLevel];
                                                                const url = linkFor(third);

                                                                return {
                                                                    text: { name: thirdLevel },
                                                                    ...(url && { link: { href: url.route } }),
                                                                    drawLineThrough: true,
                                                                    collapsable: true,
                                                                    stackChildren: true,
                                                                };
                                                            }
                                                            return undefined;
                                                        },
                                                    ),
                                                }),
                                        };
                                    }
                                    return undefined;
                                }),
                            }),
                    };
                }),
            },
        };
        // clean empty childrens
        config.nodeStructure.children.forEach((item) => {
            if (item.children?.every((child) => child === undefined)) {
                delete item.children;
            } else if (item.children) {
                item.children.forEach((child) => {
                    if (child?.children?.every((grandChild) => grandChild === undefined)) {
                        delete child.children;
                    }
                });
            }
        });
        // write connectors to make a tree
        fs.writeFileSync(
            lang === 'en' ? `lighthouse/connectors.js` : `lighthouse/${lang}/connectors.js`,
            `const config = ${JSON.stringify(config, null, 2)}`,
        );
        // Make links for the others languages
        const links = (Object.keys(translations) as Locale[])
            .filter((item) => item !== lang)
            .map(
                (item) =>
                    `<li><a href="${item === 'en' ? '/index.html' : `../${item}/index.html`}">${
                        translations[item].lang
                    }</a></li>`,
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
                </html>`,
        );
    }
} catch (err) {
    console.error('Lighthouse generation failed', err);
    process.exit(1);
}
