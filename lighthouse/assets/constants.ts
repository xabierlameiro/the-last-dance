import type { Flags } from 'lighthouse/types/lh.js';

/**
 * SDD-L11-T8. Data for the Lighthouse report runner, typed.
 *
 * `translations` is keyed by the three site locales and read as `translations[lang]` in the runner,
 * so the key type is stated rather than widened to `string`: that is what lets the compiler prove
 * the lookups there cannot miss.
 */
export type Locale = 'en' | 'es' | 'gl';

export type Translation = {
    title: string;
    subtitle: string;
    description: string;
    lang: string;
};

export const chart = {
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

export const nodeStructure = {
    text: { name: 'xabierlameiro.com' },
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

export const options: Flags = {
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

export const DOMAIN = 'https://xabierlameiro.com';

export const translations: Record<Locale, Translation> = {
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
