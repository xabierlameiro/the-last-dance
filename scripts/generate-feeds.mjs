// Generate one RSS 2.0 feed per locale at build time (npm prebuild).
// A reader who found the blog through the "This Week in React" newsletter asked for a feed;
// that reader profile does not come back through Google, so a feed is the only way to keep them.
//
// Build-time and static rather than a getServerSideProps route: the corpus is already parsed here
// for llms.txt, and this site has taken a FUNCTION_INVOCATION_TIMEOUT in production, so a new
// serverless entry point buys nothing that next.config.js headers cannot.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DOMAIN = 'https://xabierlameiro.com';
const BLOG_DIR = 'data/blog';
const OUT_DIR = 'public';
const DEFAULT_LOCALE = 'en';

// Kept in sync with next.config.js `i18n.locales`. The channel metadata is per-locale because a
// feed reader shows <title>/<description> verbatim in the subscription list.
const CHANNELS = {
    en: {
        file: 'feed.xml',
        language: 'en',
        title: 'Xabier Lameiro — Blog',
        description:
            'Practical, first-hand notes on React, Next.js and TypeScript: production errors, testing, CI/CD and web tooling.',
    },
    es: {
        file: 'feed.es.xml',
        language: 'es',
        title: 'Xabier Lameiro — Blog',
        description:
            'Apuntes de primera mano sobre React, Next.js y TypeScript: errores en producción, testing, CI/CD y herramientas web.',
    },
    gl: {
        file: 'feed.gl.xml',
        language: 'gl',
        title: 'Xabier Lameiro — Blog',
        description:
            'Apuntamentos de primeira man sobre React, Next.js e TypeScript: erros en produción, testing, CI/CD e ferramentas web.',
    },
};

const findMdxFiles = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return findMdxFiles(full);
        return entry.name.endsWith('.mdx') ? [full] : [];
    });

/*
 * The publish date lives in the post body as <Date date="MM-DD-YYYY" />, not in the frontmatter.
 * Build the instant from the components rather than letting V8 parse the string: it reads a
 * non-ISO date as LOCAL midnight, which shifted every post one day early in timezones ahead of
 * UTC — the same bug already fixed for the sitemap's <lastmod>. See helpers/fileReader.ts.
 */
const extractPostDate = (content) => {
    const match = content.match(/<Date\s+date="(\d{2})-(\d{2})-(\d{4})"/);
    if (!match) return null;
    const [, month, day, year] = match;
    const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    // Date.UTC rolls overflow over ("13-40-2023"), so a round-trip mismatch means it was never a
    // real calendar date.
    if (utcDate.getUTCMonth() !== Number(month) - 1 || utcDate.getUTCDate() !== Number(day)) return null;
    return utcDate;
};

const readPosts = () =>
    findMdxFiles(BLOG_DIR)
        .map((file) => {
            const { data, content } = matter(fs.readFileSync(file, 'utf8'));
            return { data, date: extractPostDate(content) };
        })
        .filter(({ data, date }) => data.slug && data.locale && date);

// English is the default locale and carries no prefix; the other two are served under /<locale>.
const localeBase = (locale) => (locale === DEFAULT_LOCALE ? DOMAIN : `${DOMAIN}/${locale}`);

const postUrl = ({ locale, category, slug }) =>
    `${localeBase(locale)}/blog/${String(category).toLowerCase()}/${slug}`;

const escapeXml = (value) =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// RSS 2.0 requires RFC 822 dates. toUTCString() emits "Sat, 18 Jul 2026 00:00:00 GMT" on Node,
// but that is a spec'd *HTTP* format rather than a guaranteed RSS one — building it explicitly
// keeps the output pinned to what feed validators expect.
const toRfc822 = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return (
        `${DAYS[date.getUTCDay()]}, ${pad(date.getUTCDate())} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} ` +
        `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} +0000`
    );
};

const renderItem = ({ data, date }) => {
    const url = postUrl(data);
    return [
        '        <item>',
        `            <title>${escapeXml(data.title)}</title>`,
        `            <link>${escapeXml(url)}</link>`,
        // The URL is stable and unique per post, so it doubles as the guid. Readers key "already
        // seen" off this value — it must never be regenerated for an existing post.
        `            <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `            <pubDate>${toRfc822(date)}</pubDate>`,
        `            <description>${escapeXml(data.description ?? data.excerpt ?? '')}</description>`,
        ...(data.tags ?? []).map((tag) => `            <category>${escapeXml(tag)}</category>`),
        '        </item>',
    ].join('\n');
};

const renderFeed = (locale, posts) => {
    const channel = CHANNELS[locale];
    const selfUrl = `${DOMAIN}/${channel.file}`;
    // Newest post date, not Date.now(). The generated files are committed, so a
    // wall-clock timestamp would put a spurious one-line diff in every single build.
    const lastBuildDate = toRfc822(posts[0].date);

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '    <channel>',
        `        <title>${escapeXml(channel.title)}</title>`,
        `        <link>${localeBase(locale)}</link>`,
        `        <description>${escapeXml(channel.description)}</description>`,
        `        <language>${channel.language}</language>`,
        `        <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
        // Required by the RSS Best Practices profile; validators warn without it.
        `        <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />`,
        posts.map(renderItem).join('\n'),
        '    </channel>',
        '</rss>',
        '',
    ].join('\n');
};

const posts = readPosts();

for (const [locale, channel] of Object.entries(CHANNELS)) {
    const localePosts = posts
        .filter(({ data }) => data.locale === locale)
        // Newest first. Ties break on slug so the output does not depend on readdir order.
        .sort((a, b) => b.date - a.date || a.data.slug.localeCompare(b.data.slug));

    if (localePosts.length === 0) {
        console.error(`[feeds] no posts found for locale "${locale}" — skipping ${channel.file}`);
        continue;
    }

    fs.writeFileSync(path.join(OUT_DIR, channel.file), renderFeed(locale, localePosts));
    console.log(`[feeds] ${channel.file}: ${localePosts.length} items`);
}
