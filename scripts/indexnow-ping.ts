// SDD-013: notify IndexNow (Bing & partners) of all site URLs after a deploy.
// ChatGPT Search retrieves from Bing's index, so fast Bing indexing directly
// improves LLM-surface visibility. The key is public by design (IndexNow verifies
// ownership by fetching /<key>.txt from the host). Runs in post-deploy CI.
//
// SDD-L11-T1 pilot: executed by Node 22's native type stripping (default since
// v22.18.0) — erasable syntax only: no enums, no tsconfig paths, relative imports
// need explicit `.ts` extensions.
//
// This file imports nothing but `node:fs`, and that is load-bearing rather than
// incidental. The post-deploy job runs it straight after `checkout` + `setup-node`
// with no `npm ci`, so any bare specifier — `zod` included — fails at link time with
// ERR_MODULE_NOT_FOUND, before a single URL is submitted, and the `|| true` that keeps
// IndexNow non-blocking turns that into a green step. Keep this script dependency-free.
import fs from 'fs';

const HOST = 'xabierlameiro.com';
const KEY = 'bb89dd7ce7e0955d26994f5416a1a02b';

// Prefer the live sitemap (reflects the deploy that just went out); fall back to
// the committed copy if the site is unreachable from CI.
const readSitemap = async (): Promise<string> => {
    try {
        const response = await fetch(`https://${HOST}/sitemap.xml`);
        if (response.ok) return await response.text();
    } catch {
        // fall through to the local copy
    }
    return fs.readFileSync('public/sitemap.xml', 'utf8');
};

const sitemap = await readSitemap();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1]?.trim())
    .filter((url): url is string => url !== undefined);

if (urlList.length === 0) {
    console.error('[indexnow] no URLs found in public/sitemap.xml — skipping');
    process.exit(0);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});

// The six responses IndexNow documents. 200/202 = accepted. Anything else — documented
// or not — is logged but never fails the pipeline: IndexNow is best-effort
// acceleration, not a deploy gate.
// https://www.indexnow.org/documentation
const STATUS_MEANING: Record<number, string> = {
    200: 'OK',
    202: 'Accepted — key validation pending',
    400: 'Bad request — invalid format',
    403: 'Forbidden — key not found or invalid',
    422: 'Unprocessable — URL ownership or key mismatch',
    429: 'Too many requests',
};

const meaning = STATUS_MEANING[response.status] ?? 'undocumented status';
console.log(`[indexnow] submitted ${urlList.length} URLs — HTTP ${response.status} (${meaning})`);
