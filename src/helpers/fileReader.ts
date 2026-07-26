import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { defaultLocale } from '@/constants/site';
import { isSafeSlug } from './slug';
import { describeIssues } from '../types/schemas';
import { postFrontmatterSchema } from '../types/upstream';

// Path to posts directory
const POST_PATH = path.join(process.cwd(), 'data/blog');

/**
 * @description Recursively find all .mdx files in a directory
 */
const findMdxFiles = (dir: string): string[] => {
    const files: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...findMdxFiles(fullPath));
        } else if (item.endsWith('.mdx')) {
            files.push(fullPath);
        }
    }

    return files;
};

type ParsedPost = {
    content: string;
    fileName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
};

/**
 * @description Read and gray-matter-parse a single MDX file into its raw post shape.
 * @param {string} filePath - Absolute path to the .mdx file.
 * @returns {ParsedPost}
 */
const buildPost = (filePath: string): ParsedPost => {
    const { data, content } = matter(fs.readFileSync(filePath, 'utf8'));

    /*
     * SDD-L07. `data` is `Record<string, any>` — gray-matter cannot know the shape — and every
     * consumer downstream simply trusted it: `getAllPosts` annotates its map callback as `PathPost`,
     * a cast the compiler accepts only because the source is `any`.
     *
     * All 45 posts currently carry every required field, so nothing is broken today. It is checked
     * anyway because this is the one place the `as` pattern can break a **deploy** rather than a
     * widget: `getStaticPaths` runs over the whole corpus during `next build`, and one post
     * published without a `category` throws deep inside the route with no filename anywhere in the
     * message. Failing here instead names the file and the field.
     */
    const parsed = postFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error(`Invalid frontmatter in ${path.basename(filePath)}: ${describeIssues(parsed.error.issues)}`);
    }

    return { content, data, fileName: filePath.split('/').pop() ?? '' };
};

// The blog corpus is static per deploy, so read + parse every file ONCE and reuse it.
// Before this, `findPostBySlug` scanned and gray-matter-parsed the WHOLE corpus to resolve a
// single slug (O(N)); `getAllPosts` called it per slug (O(N²)); and `getAllCategories` called
// `getAllPosts` once per category/tag (O(C·N²)) — thousands of disk parses per page render.
// On-demand (fallback: 'blocking') tag URLs ran all of it inside a request-time serverless
// function, which blew past Vercel's timeout (FUNCTION_INVOCATION_TIMEOUT). Cache only in
// production so `next dev` still hot-reloads content edits.
let corpusCache: ParsedPost[] | null = null;
let corpusStamp = '';

/**
 * SDD-L09-T13. The cache used to be production-only, so `next dev` re-read and gray-matter-parsed
 * all 45 posts on **every** call — and `getAllTags` calls `loadCorpus` once per tag, `getPostsByTag`
 * once more per tag after that. Rendering one blog page in development was hundreds of full-corpus
 * parses.
 *
 * The intent behind that guard was right and is preserved: an author editing an `.mdx` file must see
 * the change without restarting the server. The implementation just paid more than it had to.
 * Stat-ing the files is cheap next to parsing them, so development keys the cache on the newest
 * mtime and the file count — an edit, an addition or a deletion all change that, and nothing else
 * has to.
 */
const corpusFingerprint = (files: string[]): string => {
    let newest = 0;
    for (const file of files) {
        const { mtimeMs } = fs.statSync(file);
        if (mtimeMs > newest) newest = mtimeMs;
    }
    return `${files.length}:${newest}`;
};

const loadCorpus = (): ParsedPost[] => {
    if (corpusCache && process.env.NODE_ENV === 'production') {
        return corpusCache;
    }

    const files = findMdxFiles(POST_PATH);

    if (corpusCache) {
        const stamp = corpusFingerprint(files);
        if (stamp === corpusStamp) return corpusCache;
        corpusStamp = stamp;
    } else {
        corpusStamp = corpusFingerprint(files);
    }

    corpusCache = files.map(buildPost);
    return corpusCache;
};

/**
 * @description Reduce a slug or route params object to the bare, comparable slug.
 * @param {string | { params: { slug: string } }} slug - Slug or route params.
 * @returns {string} NFC-normalized slug.
 * @throws {Error} When the slug looks like a directory traversal attempt.
 */
const normalizeSlug = (slug: string | { params: { slug: string } }): string => {
    const input = typeof slug === 'object' ? slug.params.slug : slug;
    const bare = input.split('/').pop() ?? input;

    if (!isSafeSlug(bare)) {
        throw new Error('Invalid slug parameter');
    }

    // Slugs with non-ASCII characters (e.g. "compoñentes") may arrive NFD-decomposed from some
    // clients/crawlers while the frontmatter stores them NFC-composed.
    return bare.normalize('NFC');
};

/**
 * @description Find a parsed post by slug in the cached corpus, preferring the requested locale.
 *
 * SDD-L04. This used to match on slug alone, which had two consequences. The visible one was that
 * every post answered under every locale prefix, and combined with a router-derived canonical it let
 * Google index the same Spanish article twice. The subtler one: **two posts can legitimately share a
 * slug across locales** — `github-workflows.es.mdx` and `.gl.mdx` both use
 * `integracion-continua-con-github-actions-workflow`, because the phrase is spelled the same in
 * Spanish and Galician — and a slug-only lookup returned whichever came first in the corpus, so
 * `/gl/blog/nextjs/<slug>` served the *Spanish* post under a Galician prefix.
 *
 * Filtering by locale first fixes both. A slug that exists in no locale, or only in another, throws
 * and the page 404s.
 *
 * @param {string | { params: { slug: string } }} slug - Slug or route params.
 * @param {string} [locale] - Locale to resolve within. Omitted only by callers that genuinely want
 *   any match, of which there are none today.
 * @returns {ParsedPost}
 */
const findPostBySlug = (slug: string | { params: { slug: string } }, locale?: string): ParsedPost => {
    const normalizedSlug = normalizeSlug(slug);

    const matchesSlug = ({ data, fileName }: ParsedPost) =>
        data.slug?.normalize('NFC') === normalizedSlug || fileName.normalize('NFC') === `${normalizedSlug}.mdx`;

    const corpus = loadCorpus();
    const post = locale
        ? corpus.find((entry) => entry.data.locale === locale && matchesSlug(entry))
        : corpus.find(matchesSlug);

    if (!post) {
        throw new Error('Post not found');
    }

    return post;
};

/**
 * @description Extract the publication date from the `<Date date="MM-DD-YYYY" />`
 * tag embedded in the post body. Returns an ISO date string (YYYY-MM-DD) or null,
 * so it can be serialized in getStaticProps and used for JSON-LD datePublished.
 *
 * @param {string} content - Raw MDX content of the post.
 * @returns {string | null} - ISO date string or null if not found/invalid.
 */
const extractPostDate = (content: string): string | null => {
    const match = content.match(/<Date\s+date="([^"]+)"/);
    if (!match) return null;
    // Build the ISO string from the MM-DD-YYYY components directly: V8 parses non-ISO
    // date strings as LOCAL midnight, so round-tripping through `new Date(...)` +
    // `toISOString()` shifted every post one day early in timezones ahead of UTC
    // (e.g. Europe/Madrid: "07-18-2026" → "2026-07-17").
    const componentsMatch = match[1]?.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!componentsMatch) return null;
    const [, month, day, year] = componentsMatch;
    // Date.UTC normalizes overflow ("13-40-2023" would roll over), so a round-trip
    // mismatch means the components were not a real calendar date.
    const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (utcDate.getUTCMonth() !== Number(month) - 1 || utcDate.getUTCDate() !== Number(day)) {
        return null;
    }
    // SDD-L04: return a full ISO instant, not a bare date. `2026-07-22` is valid ISO 8601 and Google
    // accepts it, but its own structured-data guidance asks for a timezone so freshness is
    // unambiguous rather than interpreted against the crawler's clock. `PostByline` already pins
    // display formatting to `timeZone: 'UTC'` and the sitemap's <lastmod> accepts the full form, so
    // nothing downstream has to change.
    return `${year}-${month}-${day}T00:00:00+00:00`;
};

/**
 * @description Get post by slug.
 *
 * @example
 *     getPostBySlug('first-post')
 *     returns [{ content: '...', meta: {...} }]
 *
 * @param {string} slug - Slug of the post.
 * @returns {Object} - Object with post content and meta data.
 */
/**
 * @description Shape a parsed corpus entry into the public { content, meta } post form.
 * @param {ParsedPost} parsed - Raw parsed post from the corpus.
 * @returns {Object} - Object with post content and derived meta.
 */
const toPost = ({ content, data }: ParsedPost) => {
    /*
     * SDD-L09-T14: `readingTime(content)` calls `countWords(content)` internally, so this used to
     * split the whole body on ``` and then on whitespace **twice** for every post — and `toPost`
     * runs across the entire corpus for every listing, category and tag page.
     */
    const numberOfWords = countWords(content);

    return {
        content,
        meta: {
            readTime: minutesToRead(numberOfWords),
            numberOfWords,
            date: extractPostDate(content),
            // Optional frontmatter field marking a substantive content update (freshness
            // signal for search + LLM engines; feeds dateModified and sitemap lastmod)
            updated: data.updated ?? null,
            slug: data.slug,
            title: data.title,
            locale: data.locale,
            category: data.category,
            author: data.author,
            tags: data.tags,
            excerpt: data.excerpt,
            image: data.image,
            description: data.description,
            alternate: data.alternate,
            // null (not undefined) so the meta object survives getStaticProps serialization
            faq: data.faq ?? null,
        },
    };
};

export const getPostBySlug = (slug: string | { params: { slug: string } }, locale?: string) =>
    toPost(findPostBySlug(slug, locale));

/**
 * @description Get all posts (read + parsed once, cached per deploy in production).
 *
 * @example
 *     getAllPosts();
 *     returns[
 *         {
 *             content: '...',
 *             meta: '...',
 *         }
 *     ];
 *
 * @returns {Object} - Object with posts.
 */
export const getAllPosts = () => loadCorpus().map(toPost);

/**
 * @description Get all posts by locale.
 *
 * @example
 *     getPostsByLocale('en');
 *     returns[
 *         {
 *             content: '...',
 *             meta: '...',
 *         }
 *     ];
 *
 * @param {string} locale - Locale of the posts.
 * @returns {Object} - Object with posts.
 */

export const getPostsByLocale = (locale: string) => {
    const posts = getAllPosts();
    return posts.filter((post) => post.meta.locale === locale);
};

/**
 * @description Path of the newest post, used as the blog's landing URL: the Dock links to
 * /blog and that route redirects here, so the entry point follows publishing instead of being
 * pinned to a slug that goes stale (and 404s outright if the post is ever renamed or removed).
 *
 * Dates are the ISO strings extracted from the post body, so comparing them as text orders them
 * chronologically. Scoping to a category serves /blog/<category>, which should land on that
 * category's newest post rather than the blog's; an empty category falls back to the newest
 * post overall, and a locale with no posts at all falls back to the default locale.
 *
 * @example
 *     getLatestPostPath('es');
 *     returns '/blog/nextjs/integracion-continua-con-github-actions-workflow'
 *
 * @param {string} locale - Locale of the posts.
 * @param {string} [category] - Optional category to scope the search to.
 * @returns {string | null} - Post path without locale prefix, or null when the corpus is empty.
 */
export const getLatestPostPath = (locale: string, category?: string): string | null => {
    const localePosts = getPostsByLocale(locale);
    const posts = localePosts.length ? localePosts : getPostsByLocale(defaultLocale);

    const inCategory = category
        ? posts.filter((post) => post.meta.category.toLowerCase() === category.toLowerCase())
        : [];
    const pool = inCategory.length ? inCategory : posts;

    const latest = [...pool].sort((a, b) => (b.meta.date ?? '').localeCompare(a.meta.date ?? ''))[0];

    return latest ? `/blog/${latest.meta.category.toLowerCase()}/${latest.meta.slug}` : null;
};

/**
 * @description Every post in a locale whose **category or tag** matches, compared case-insensitively
 * on the category.
 *
 * SDD-L10-T25 renamed this from `getPostsByLocaleAndCategory`. It sat forty lines from
 * `getPostsByCategory` — now `findPostsByExactCategory` — and the two differ in two ways that
 * neither name hinted at: this one also matches tags, and it lowercases. They are the reason a tag
 * URL and a category URL can resolve to the same listing, which is deliberate (SDD-012 leaves tag
 * URLs on `fallback: 'blocking'` with a canonical pointing at the category), but "ByLocaleAndCategory"
 * versus "ByCategory" reads like an argument-order difference.
 *
 * @example
 *     findPostsByCategoryOrTag('en', 'JavaScript');
 *     returns[
 *         {
 *             content: '...',
 *             meta: '...',
 *         }
 *     ];
 *
 * @param {string} locale - Locale of the posts.
 * @param {string} category - Category of the posts.
 * @returns {Object} - Object with posts.
 */
export const findPostsByCategoryOrTag = (locale: string, category: string) => {
    const posts = getPostsByLocale(locale);
    return posts.filter(
        (post) => post.meta.category.toLowerCase() === category?.toLowerCase() || post.meta.tags.includes(category)
    );
};

/**
 * @description Get all posts by tag and locale.
 *
 * @example
 *     getPostsByTag('JavaScript', 'en');
 *     returns[
 *         {
 *             content: '...',
 *             meta: '...',
 *         }
 *     ];
 *
 * @param {string} tag - Tag of the posts.
 * @param {string} locale - Locale of the posts.
 * @returns {Object} - Object with posts.
 */
const getPostsByTag = (tag: string, locale: string) => {
    const posts = getPostsByLocale(locale);
    return posts.filter((post) => post.meta.tags.includes(tag));
};

/**
 * @description Get all posts by category and locale.
 *
 * @example
 *     findPostsByExactCategory('JavaScript', 'en');
 *     returns[
 *         {
 *             content: '...',
 *             meta: '...',
 *         }
 *     ];
 *
 * @param {string} category - Category of the posts.
 * @param {string} locale - Locale of the posts.
 * @returns {Object} - Object with posts.
 */
/*
 * Exact and case-sensitive, unlike `findPostsByCategoryOrTag` above, and tags are not consulted.
 * Used to resolve the first post of a category for the sidebar link, where matching a tag would
 * point the link at a listing the reader did not ask for.
 */
const findPostsByExactCategory = (category: string, locale: string) => {
    const posts = getPostsByLocale(locale);
    return posts.filter((post) => post.meta.category === category);
};

/**
 * @description Get all tags from all posts by locale.
 *
 * @example
 *     getAllTags('en');
 *     returns[
 *         {
 *             tag: 'JavaScript',
 *             total: 2,
 *             href: '/blog/javascript/first-post',
 *         }
 *     ];
 *
 * @param {string} locale - Locale of the posts.
 * @returns {Object} - Object with tags.
 */
const getAllTags = (locale: string) => {
    const posts = getPostsByLocale(locale);
    const tags = posts.map((post) => post.meta.tags);
    // Categories and tags share the /blog/[category]/ URL namespace, so a tag that spells a
    // category name ('nextjs' vs category 'Nextjs') resolves to the SAME URL and shows up
    // twice in the sidebar — once under Topics, once under Tags — with different counts.
    // The SEO content pass (PR #131) introduced several of these. Frontmatter is cleaned, and
    // this guard keeps the taxonomies disjoint if a colliding tag is ever added back.
    const categoryNames = new Set(posts.map((post) => post.meta.category.toLowerCase()));
    return (
        [...new Set(tags.flat())]
            .filter((tag) => !categoryNames.has(tag.toLowerCase()))
            // SDD-L07: `postsBytag[0].meta.slug` was unguarded. The list cannot be empty today — the
            // tags come from these same posts — but the sidebar entry exists only to link at a post,
            // so if that ever stops holding, dropping the entry is right and a crash in
            // `getStaticProps` is not.
            .flatMap((tag) => {
                const [firstPost] = getPostsByTag(tag, locale);
                if (!firstPost) return [];
                return [
                    {
                        tag,
                        total: tags.flat().filter((t) => t === tag).length,
                        href: `/blog/${tag.toLowerCase()}/${firstPost.meta.slug}`,
                    },
                ];
            })
    );
};

/**
 * @description Get all categories from all posts by locale.
 *
 * @example
 *     getAllCategories('en')
 *     returns { categories: [], tags: [] }
 *
 * @param {string} locale - Locale of the posts.
 * @returns {Object} - Object with categories.
 */

export const getAllCategories = (locale: string) => {
    const posts = getPostsByLocale(locale);
    const categories = posts.map((post) => post.meta.category);
    const tags = getAllTags(locale);
    return {
        // Same guard as getAllTags: the link needs a post to point at.
        categories: [...new Set(categories)].flatMap((category) => {
            const [firstPost] = findPostsByExactCategory(category, locale);
            if (!firstPost) return [];
            return [
                {
                    category,
                    total: categories.filter((c) => c === category).length,
                    href: `/blog/${category.toLowerCase()}/${firstPost.meta.slug}`,
                },
            ];
        }),
        tags,
    };
};

/**
 * @description Count words in a string.
 *
 * @example
 *     countWords('Hello world')
 *     returns 2
 *
 * @param {string} content - String to count words.
 * @returns {number} - Number of words.
 */
const WORDS_PER_MINUTE = 200;

export const countWords = (content: string) => {
    // Fixed: Use a more secure approach to avoid regex DoS
    // Split by triple backticks and count words only in non-code sections
    const parts = content.split('```');
    let nonCodeContent = '';

    // Take every other part (non-code sections)
    for (let i = 0; i < parts.length; i += 2) {
        nonCodeContent += parts[i] || '';
    }

    const nonCodeWords = nonCodeContent.split(/\s/g).filter((word) => word.length > 0);
    return nonCodeWords.length;
};

/**
 * @description Calculate reading time in minutes.
 *
 * @example
 *     readingTime('Hello world. This is a test. This is a test')
 *     returns 2
 *
 * @param {string} content - String to calculate reading time.
 * @returns {number} - Reading time in minutes.
 */
export const minutesToRead = (numberOfWords: number) => Math.ceil(numberOfWords / WORDS_PER_MINUTE);

/** Kept for callers that only have the text; `toPost` uses `minutesToRead` to avoid a second walk. */
export const readingTime = (content: string) => minutesToRead(countWords(content));
