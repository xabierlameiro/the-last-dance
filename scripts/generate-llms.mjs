// SDD-013: generate /llms.txt and /llms-full.txt at build time (npm prebuild).
// llms.txt follows the llmstxt.org format: H1, blockquote summary, H2 sections with
// "- [title](url): description" lists. llms-full.txt inlines the full English posts
// as plain markdown so agents (IDE assistants, MCP retrieval) can ingest the whole
// blog in one fetch. Honest expectation per 2026 measurements: big AI search crawlers
// rarely fetch these files — this is a zero-cost bet, not the main GEO lever.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DOMAIN = 'https://xabierlameiro.com';
const BLOG_DIR = 'data/blog';
const OUT_DIR = 'public';

const readPosts = () => {
    const posts = [];
    for (const dir of fs.readdirSync(BLOG_DIR)) {
        const full = path.join(BLOG_DIR, dir);
        if (!fs.statSync(full).isDirectory()) continue;
        for (const file of fs.readdirSync(full)) {
            if (!file.endsWith('.en.mdx')) continue;
            const { data, content } = matter(fs.readFileSync(path.join(full, file), 'utf8'));
            posts.push({ data, content });
        }
    }
    return posts.sort((a, b) => (a.data.category + a.data.slug).localeCompare(b.data.category + b.data.slug));
};

const postUrl = ({ category, slug }) => `${DOMAIN}/blog/${String(category).toLowerCase()}/${slug}`;

// Strip MDX-only syntax so the full-text file is plain, readable markdown.
const toPlainMarkdown = (mdx) =>
    mdx
        .replace(/<CH\.Code[^>]*>/g, '')
        .replace(/<\/CH\.Code>/g, '')
        .replace(/<GoogleAdsense\s*\/>/g, '')
        .replace(/<Date\s+date="([^"]+)"\s*\/>/g, 'Published: $1')
        .replace(/<Image[\s\S]*?\/>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const posts = readPosts();

const byCategory = new Map();
for (const post of posts) {
    const cat = post.data.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(post);
}

const llms = [
    '# Xabier Lameiro',
    '',
    '> Personal site and technical blog of Xabier Lameiro, a software architect from Galicia (Spain)',
    '> specialised in web development with React, Next.js and TypeScript. Posts are practical,',
    '> first-hand guides about errors, testing, CI/CD and web tooling, available in English,',
    '> Spanish (/es) and Galician (/gl). English URLs below are canonical.',
    '',
    '## Pages',
    '',
    `- [About](${DOMAIN}/about): Who Xabier Lameiro is — bio, experience and stack`,
    `- [Contact](${DOMAIN}/contact): Email and profiles`,
    `- [Blog index](${DOMAIN}/blog): All posts with categories`,
    '',
    ...[...byCategory.entries()].flatMap(([category, categoryPosts]) => [
        `## Blog: ${category}`,
        '',
        ...categoryPosts.map(({ data }) => `- [${data.title}](${postUrl(data)}): ${data.description ?? data.excerpt ?? ''}`),
        '',
    ]),
    '## Optional',
    '',
    `- [Full content](${DOMAIN}/llms-full.txt): Every post inlined as plain markdown`,
    `- [Sitemap](${DOMAIN}/sitemap.xml): All URLs including /es and /gl locales`,
    '',
].join('\n');

const llmsFull = [
    '# Xabier Lameiro — full blog content',
    '',
    '> Auto-generated from the site source on build. English versions (canonical URLs).',
    '',
    ...posts.flatMap(({ data, content }) => [
        '---',
        '',
        `# ${data.title}`,
        '',
        `- URL: ${postUrl(data)}`,
        `- Author: ${data.author}`,
        `- Category: ${data.category} · Tags: ${(data.tags ?? []).join(', ')}`,
        `- Summary: ${data.description ?? data.excerpt ?? ''}`,
        '',
        toPlainMarkdown(content),
        '',
    ]),
].join('\n');

fs.writeFileSync(path.join(OUT_DIR, 'llms.txt'), `${llms}\n`);
fs.writeFileSync(path.join(OUT_DIR, 'llms-full.txt'), `${llmsFull}\n`);
console.log(`[llms] wrote llms.txt (${posts.length} posts) and llms-full.txt (${(llmsFull.length / 1024).toFixed(0)} KB)`);
