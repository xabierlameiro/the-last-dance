// Generates the blog post cover posters (og:image) as clean vector-designed PNGs.
// SVG is authored here and rasterized with sharp — text stays crisp and correct
// (AI image models garble exact strings like "#425" or "${NPM_TOKEN}"), files are
// light (~60 KB vs 1-2 MB), consistent, and reproducible. See SDD-010.
//
// Usage: node scripts/generate-post-posters.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'posts');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const ghostSize = (t) => (t.length <= 3 ? 300 : t.length <= 4 ? 230 : 170);

const poster = ({
    eyebrow,
    line1,
    line2,
    accentWord,
    subhead,
    ghost,
}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#111a2e"/></linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#818cf8"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g stroke="#1e293b" stroke-width="1" opacity="0.5"><path d="M0 158 H1200 M0 316 H1200 M0 474 H1200"/><path d="M300 0 V630 M600 0 V630 M900 0 V630"/></g>
  <rect x="0" y="0" width="1200" height="8" fill="url(#accent)"/>
  <text x="1120" y="470" fill="#1e293b" font-family="system-ui, sans-serif" font-size="${ghostSize(
      ghost
  )}" font-weight="800" text-anchor="end" opacity="0.55">${esc(ghost)}</text>
  <text x="80" y="150" fill="#38bdf8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="24" font-weight="700" letter-spacing="3">${esc(
      eyebrow
  )}</text>
  <text x="78" y="248" fill="#f8fafc" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="82" font-weight="800">${esc(
      line1
  )}</text>
  <text x="78" y="336" fill="#f8fafc" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="82" font-weight="800">${esc(
      line2
  )}${accentWord ? ` <tspan fill="#38bdf8">${esc(accentWord)}</tspan>` : ''}</text>
  <text x="80" y="404" fill="#94a3b8" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="30" font-weight="500">${esc(
      subhead
  )}</text>
  <text x="80" y="560" fill="#cbd5e1" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="26" font-weight="700">Xabier Lameiro <tspan fill="#64748b" font-weight="500">· xabierlameiro.com</tspan></text>
</svg>`;

const posts = [
    {
        file: 'npm-token.png',
        eyebrow: 'ERROR · NPM',
        line1: 'Fix the npm',
        line2: '${NPM_TOKEN} error',
        subhead: 'Define the env var your .npmrc expects',
        ghost: 'npm',
    },
    {
        file: 'uncaught-error.png',
        eyebrow: 'ERROR · REACT · HYDRATION',
        line1: 'Minified React',
        line2: 'error ',
        accentWord: '#425',
        subhead: 'Hydration mismatch — what it means and every fix',
        ghost: '425',
    },
    {
        file: 'address-in-use.png',
        eyebrow: 'ERROR · NODE',
        line1: 'EADDRINUSE:',
        line2: 'free the port',
        subhead: 'Find the process on the port and kill it',
        ghost: '3000',
    },
    {
        file: 'automatic-lighthouse-report.png',
        eyebrow: 'PERFORMANCE · PLAYWRIGHT',
        line1: 'Automate',
        line2: 'Lighthouse reports',
        subhead: 'Run Lighthouse on every deploy with Playwright',
        ghost: 'LH',
    },
    {
        file: 'dark-theme-in-nextjs.png',
        eyebrow: 'NEXT.JS · CSS',
        line1: 'Dark theme',
        line2: 'in Next.js',
        subhead: 'CSS variables and a theme toggle, no flash',
        ghost: 'CSS',
    },
    {
        file: 'how-document-my-react-components-with-jsdoc.png',
        eyebrow: 'REACT · DOCS',
        line1: 'Document React',
        line2: 'with JSDoc',
        subhead: 'Auto-generate component docs as a static site',
        ghost: 'docs',
    },
    {
        file: 'filter-for-positions.png',
        eyebrow: 'REACT · SURVEY',
        line1: 'Job-fit',
        line2: 'survey',
        subhead: 'A quick compatibility check for recruiters',
        ghost: 'fit',
    },
    {
        file: 'continuous-integration-with-github-actions-workflow.png',
        eyebrow: 'DEVOPS · CI/CD',
        line1: 'CI/CD with',
        line2: 'GitHub Actions',
        subhead: 'Lint, test, build and deploy on every push',
        ghost: 'CI',
    },
    {
        file: 'counter-for-github-stars-repository.png',
        eyebrow: 'NEXT.JS · API',
        line1: 'GitHub stars',
        line2: 'counter',
        subhead: 'A live star count with a Next.js API route + Octokit',
        ghost: 'API',
    },
    {
        file: 'make-a-views-counter.png',
        eyebrow: 'NEXT.JS · ANALYTICS',
        line1: 'Page-views',
        line2: 'counter',
        subhead: 'Read GA4 data behind a Next.js API route',
        ghost: 'GA4',
    },
    {
        file: 'publish-report.png',
        eyebrow: 'REACT · TESTING',
        line1: 'Publish Jest',
        line2: 'coverage',
        subhead: 'Ship your test coverage report to a static site',
        ghost: 'Jest',
    },
    {
        file: 'deploying-storybook.png',
        eyebrow: 'REACT · STORYBOOK',
        line1: 'Deploy your',
        line2: 'Storybook',
        subhead: 'Host your component library as a static site',
        ghost: 'SB',
    },
    {
        file: 'translate-slugs-web-pages.png',
        eyebrow: 'NEXT.JS · I18N',
        line1: 'Translate',
        line2: 'URL slugs',
        subhead: 'Localized URLs for a fully i18n Next.js site',
        ghost: 'i18n',
    },
    {
        file: 'nextjs-memory-leak.png',
        eyebrow: 'NEXT.JS · MEMORY',
        line1: 'Find the Next.js',
        line2: 'memory',
        accentWord: 'leak',
        subhead: 'Heap growth, OOM and 504s — a Next.js 16 field map',
        ghost: 'OOM',
    },
    {
        // Pairs with nextjs-memory-leak.png above: that post is about finding
        // the leak, this one about proving it. Hence Find → Prove, OOM → GC.
        file: 'measure-nextjs-memory-leak.png',
        eyebrow: 'NEXT.JS · DIAGNOSTICS',
        line1: 'Prove the',
        line2: 'memory ',
        accentWord: 'leak',
        subhead: 'Force GC, diff the heap, then remove the cause',
        ghost: 'GC',
    },
];

let done = 0;
for (const p of posts) {
    const svg = Buffer.from(poster(p));
    await sharp(svg, { density: 96 })
        .resize({ width: 1200, height: 630 })
        .png({ compressionLevel: 9 })
        .toFile(path.join(OUT, p.file));
    done += 1;
    console.log(`  ✓ ${p.file}`);
}
console.log(`Generated ${done} posters into ${OUT}`);
