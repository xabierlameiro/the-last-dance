import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

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

const loadCorpus = (): ParsedPost[] => {
    if (corpusCache && process.env.NODE_ENV === 'production') {
        return corpusCache;
    }
    corpusCache = findMdxFiles(POST_PATH).map(buildPost);
    return corpusCache;
};

/**
 * @description Find a parsed post by slug in the cached corpus.
 * @param {string | { params: { slug: string } }} slug - Slug or route params.
 * @returns {ParsedPost}
 */
const findPostBySlug = (slug: string | { params: { slug: string } }): ParsedPost => {
    let raw = typeof slug === 'object' ? slug.params.slug : slug;
    raw = raw.split('/').pop() ?? raw;

    // Validate slug to prevent directory traversal
    if (!raw || raw.includes('..') || raw.includes('/') || raw.includes('\\')) {
        throw new Error('Invalid slug parameter');
    }

    // Slugs with non-ASCII characters (e.g. "compoñentes") may arrive NFD-decomposed from some
    // clients/crawlers while the frontmatter stores them NFC-composed.
    const normalizedSlug = raw.normalize('NFC');

    const post = loadCorpus().find(
        ({ data, fileName }) =>
            data.slug?.normalize('NFC') === normalizedSlug || fileName.normalize('NFC') === `${normalizedSlug}.mdx`
    );

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
    const parsed = new Date(match[1]);
    if (isNaN(parsed.getTime())) return null;
    return parsed.toISOString().split('T')[0];
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
const toPost = ({ content, data }: ParsedPost) => ({
    content,
    meta: {
        readTime: readingTime(content),
        numberOfWords: countWords(content),
        date: extractPostDate(content),
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
});

export const getPostBySlug = (slug: string | { params: { slug: string } }) => toPost(findPostBySlug(slug));

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
 * @description Get all posts by category and locale.
 *
 * @example
 *     getPostsByLocaleAndCategory('en', 'JavaScript');
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
export const getPostsByLocaleAndCategory = (locale: string, category: string) => {
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
 *     getPostsByCategory('JavaScript', 'en');
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
const getPostsByCategory = (category: string, locale: string) => {
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
    return [...new Set(tags.flat())].map((tag) => {
        const postsBytag = getPostsByTag(tag, locale);
        return {
            tag,
            total: tags.flat().filter((t) => t === tag).length,
            href: `/blog/${tag.toLowerCase()}/${postsBytag[0].meta.slug}`,
        };
    });
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
        categories: [...new Set(categories)].map((category) => {
            const postsByCategory = getPostsByCategory(category, locale);
            return {
                category,
                total: categories.filter((c) => c === category).length,
                href: `/blog/${category.toLowerCase()}/${postsByCategory[0].meta.slug}`,
            };
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
export const readingTime = (content: string) => {
    const wordsPerMinute = 200;
    const numberOfWords = countWords(content);
    return Math.ceil(numberOfWords / wordsPerMinute);
};
