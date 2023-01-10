import path from 'path';
import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
// Path to posts directory
const POST_PATH = path.join(process.cwd(), 'data/blog');

/**
 * @description Find post by slug.
 *
 * @example
 *     findPostBySlug('first-post')
 *     returns [{ content: '...', meta: {...} }]
 *
 * @param {string} slug - Slug of the post.
 * @returns {Object} - Object with post content and meta data.
 */
const findPostBySlug = (slug: string | { params: { slug: string } }) => {
    let paths = glob.sync(`${POST_PATH}/**/*.mdx`);

    if (typeof slug === 'object') {
        slug = slug.params.slug;
    } else {
        slug = slug.split('/')[slug.split('/').length - 1];
    }
    const [route] = paths.filter((path) => {
        const document = fs.readFileSync(path, 'utf8');
        const { data } = matter(document);
        const fileName = path.split('/').pop();
        if (data.slug === slug || fileName == `${slug}.mdx`) {
            return true;
        }
    });
    return matter(fs.readFileSync(route, 'utf8'));
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
export const getPostBySlug = (slug: string | { params: { slug: string } }) => {
    const { data, content } = findPostBySlug(slug);
    const readTime = readingTime(content);
    const numberOfWords = countWords(content);
    return {
        content,
        meta: {
            readTime,
            numberOfWords,
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
        },
    };
};

/**
 * @description Get all post slugs.
 *
 * @example
 *     getPostSlugs();
 *     returns[('first-post', 'second-post')];
 *
 * @returns {Array} - Array with slugs.
 */
const getPostSlugs = () => {
    let paths = glob.sync(`${POST_PATH}/**/*.mdx`);
    paths = paths.map((path) => path.replace(`${POST_PATH}/`, '').replace(/\.mdx$/, ''));
    return paths;
};

/**
 * @description Get all posts.
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

export const getAllPosts = () => {
    const slugs = getPostSlugs();
    return slugs.map((slug) => getPostBySlug(slug));
};

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
export const getPostsByTag = (tag: string, locale: string) => {
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
export const getPostsByCategory = (category: string, locale: string) => {
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
export const getAllTags = (locale: string) => {
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
    const words = content.split(/\s/g);
    const codeBlocks = content.match(/```(.|\n)*?```/g) || [];
    const codeBlocksWords = codeBlocks.map((block) => block.split(/\s/g));
    const wordsInCodeBlocks = codeBlocksWords.flat().length;
    return words.length - wordsInCodeBlocks;
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
