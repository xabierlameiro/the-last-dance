// Generate one RSS 2.0 feed per locale at build time (npm prebuild).
// A reader who found the blog through the "This Week in React" newsletter asked for a feed;
// that reader profile does not come back through Google, so a feed is the only way to keep them.
//
// Build-time and static rather than a getServerSideProps route: the corpus is already parsed here
// for llms.txt, and this site has taken a FUNCTION_INVOCATION_TIMEOUT in production, so a new
// serverless entry point buys nothing that next.config.ts headers cannot.
//
// Like generate-llms.ts, this runs as `prebuild` and so sits on the deploy path: a throw here fails
// the Vercel build. That is deliberate — a post that silently vanishes from the feed is worse than
// a failed deploy, because subscribers never see what they did not receive.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import * as z from 'zod/mini';
import { postFrontmatterSchema } from '../src/types/upstream.ts';
import { describeIssues } from '../src/types/schemas.ts';

const DOMAIN = 'https://xabierlameiro.com';
const BLOG_DIR = 'data/blog';
const OUT_DIR = 'public';
const DEFAULT_LOCALE = 'en';

/**
 * The router's frontmatter contract, narrowed to what a feed item needs.
 *
 * `slug` and `locale` are required here although the shared schema leaves them optional: an item
 * with no slug has no link, and one with no locale cannot be assigned to a feed. Sharing
 * `postFrontmatterSchema` rather than hand-rolling a second contract is the point — `fileReader.ts`
 * already validates every post, and a private notion of "valid" here would drift from it silently.
 */
const feedPostSchema = z.extend(postFrontmatterSchema, {
    slug: z.string(),
    locale: z.string(),
    description: z.optional(z.string()),
    excerpt: z.optional(z.string()),
    tags: z.optional(z.array(z.string())),
});

type FeedPost = {
    data: z.infer<typeof feedPostSchema>;
    date: Date;
};

type Channel = {
    file: string;
    language: string;
    title: string;
    description: string;
};

// Kept in sync with next.config.ts `i18n.locales`. The channel metadata is per-locale because a
// feed reader shows <title>/<description> verbatim in the subscription list.
const CHANNELS: Record<string, Channel> = {
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

const findMdxFiles = (dir: string): string[] =>
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
const extractPostDate = (content: string): Date | null => {
    const match = content.match(/<Date\s+date="(\d{2})-(\d{2})-(\d{4})"/);
    if (!match) return null;
    const [, month, day, year] = match as unknown as [string, string, string, string];
    const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    // Date.UTC rolls overflow over ("13-40-2023"), so a round-trip mismatch means it was never a
    // real calendar date.
    if (utcDate.getUTCMonth() !== Number(month) - 1 || utcDate.getUTCDate() !== Number(day)) return null;
    return utcDate;
};

const readPosts = (): FeedPost[] =>
    findMdxFiles(BLOG_DIR).map((file) => {
        const { data, content } = matter(fs.readFileSync(file, 'utf8'));
        const parsed = feedPostSchema.safeParse(data);
        if (!parsed.success) {
            throw new Error(`Invalid frontmatter in ${path.basename(file)}: ${describeIssues(parsed.error.issues)}`);
        }
        const date = extractPostDate(content);
        if (!date) {
            throw new Error(`No parseable <Date date="MM-DD-YYYY" /> in ${path.basename(file)}`);
        }
        return { data: parsed.data, date };
    });

// English is the default locale and carries no prefix; the other two are served under /<locale>.
const localeBase = (locale: string): string => (locale === DEFAULT_LOCALE ? DOMAIN : `${DOMAIN}/${locale}`);

const postUrl = ({ locale, category, slug }: FeedPost['data']): string =>
    `${localeBase(locale)}/blog/${String(category).toLowerCase()}/${slug}`;

const escapeXml = (value: string): string =>
    value
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
const toRfc822 = (date: Date): string => {
    const pad = (n: number): string => String(n).padStart(2, '0');
    return (
        `${DAYS[date.getUTCDay()]}, ${pad(date.getUTCDate())} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} ` +
        `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} +0000`
    );
};

const renderItem = ({ data, date }: FeedPost): string => {
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

const renderFeed = (locale: string, channel: Channel, posts: FeedPost[]): string => {
    const selfUrl = `${DOMAIN}/${channel.file}`;
    // Newest post date, not Date.now(). The generated files are committed, so a wall-clock
    // timestamp would put a spurious one-line diff in every single build.
    const lastBuildDate = toRfc822(posts[0]!.date);

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
        .sort((a, b) => b.date.getTime() - a.date.getTime() || a.data.slug.localeCompare(b.data.slug));

    if (localePosts.length === 0) {
        throw new Error(`No posts found for locale "${locale}" — refusing to write an empty ${channel.file}`);
    }

    fs.writeFileSync(path.join(OUT_DIR, channel.file), renderFeed(locale, channel, localePosts));
    console.log(`[feeds] ${channel.file}: ${localePosts.length} items`);
}
