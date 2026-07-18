// SDD-013: notify IndexNow (Bing & partners) of all site URLs after a deploy.
// ChatGPT Search retrieves from Bing's index, so fast Bing indexing directly
// improves LLM-surface visibility. The key is public by design (IndexNow verifies
// ownership by fetching /<key>.txt from the host). Runs in post-deploy CI.
import fs from 'fs';

const HOST = 'xabierlameiro.com';
const KEY = 'bb89dd7ce7e0955d26994f5416a1a02b';

// Prefer the live sitemap (reflects the deploy that just went out); fall back to
// the committed copy if the site is unreachable from CI.
const readSitemap = async () => {
    try {
        const response = await fetch(`https://${HOST}/sitemap.xml`);
        if (response.ok) return await response.text();
    } catch {
        // fall through to the local copy
    }
    return fs.readFileSync('public/sitemap.xml', 'utf8');
};

const sitemap = await readSitemap();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url.trim());

if (urlList.length === 0) {
    console.error('[indexnow] no URLs found in public/sitemap.xml — skipping');
    process.exit(0);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});

// 200/202 = accepted. Anything else is logged but never fails the pipeline —
// IndexNow is best-effort acceleration, not a deploy gate.
console.log(`[indexnow] submitted ${urlList.length} URLs — HTTP ${response.status}`);
