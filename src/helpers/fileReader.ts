import path from 'path';
import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
// Path to posts directory
const POST_PATH = path.join(process.cwd(), 'data/blog');

/**
 * Find post by slug
 * @param {string} slug - Slug of the post
 * @returns {Object} - Object with post content and meta data
 * @example
 * findPostBySlug('first-post')
 * returns {content: '...', data: {readTime: 1, numberOfWords: 100, slug: 'first-post', title: 'First Post', locale: 'en', category: 'JavaScript', author: 'John Doe', tags: ['JavaScript'], excerpt: '...', date: '2021-01-01', image: '...', description: '...', alternate: '...'}}
 * */
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
 * Get post by slug
 * @param {string} slug - Slug of the post
 * @returns {Object} - Object with post content and meta data
 * @example
 * getPostBySlug('first-post')
 * returns {content: '...', meta: {readTime: 1, numberOfWords: 100, slug: 'first-post', title: 'First Post', locale: 'en', category: 'JavaScript', author: 'John Doe', tags: ['JavaScript'], excerpt: '...', date: '2021-01-01', image: '...', description: '...', alternate: '...'}}
 * */
export const getPostBySlug = (slug: string) => {
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
            date: data.date,
            image: data.image,
            description: data.description,
            alternate: data.alternate,
        },
    };
};

/**
 * Get all post slugs
 * @returns {Array} - Array with slugs
 * @example
 * getPostSlugs()
 * returns ['first-post', 'second-post']
 * */
const getPostSlugs = () => {
    let paths = glob.sync(`${POST_PATH}/**/*.mdx`);
    paths = paths.map((path) =>
        path.replace(`${POST_PATH}/`, '').replace(/\.mdx$/, '')
    );
    return paths;
};

/**
 * Get all posts
 * @returns {Object} - Object with posts
 * @example
 * getAllPosts()
 * returns [{content: '...', meta: {readTime: 1, numberOfWords: 100, slug: 'first-post', title: 'First Post', locale: 'en', category: 'JavaScript', author: 'John Doe', tags: ['JavaScript'], excerpt: '...', date: '2021-01-01', image: '...', description: '...', alternate: '...'}}]
 * */

export const getAllPosts = () => {
    const slugs = getPostSlugs();
    return slugs.map((slug) => getPostBySlug(slug));
};

/**
 * Get all posts by locale
 * @param {string} locale - Locale of the posts
 * @returns {Object} - Object with posts
 * @example
 * getPostsByLocale('en')
 * returns [{content: '...', meta: {readTime: 1, numberOfWords: 100, slug: 'first-post', title: 'First Post', locale: 'en', category: 'JavaScript', author: 'John Doe', tags: ['JavaScript'], excerpt: '...', date: '2021-01-01', image: '...', description: '...', alternate: '...'}}]
 */

export const getPostsByLocale = (locale: string) => {
    const posts = getAllPosts();
    return posts.filter((post) => post.meta.locale === locale);
};

/**
 * Get all posts by category and locale
 * @param {string} locale - Locale of the posts
 * @param {string} category - Category of the posts
 * @returns {Object} - Object with posts
 * @example
 * getPostsByLocaleAndCategory('en', 'JavaScript')
 * returns [{content: '...', meta: {readTime: 1, numberOfWords: 100, slug: 'first-post', title: 'First Post', locale: 'en', category: 'JavaScript', author: 'John Doe', tags: ['JavaScript'], excerpt: '...', date: '2021-01-01', image: '...', description: '...', alternate: '...'}}]
 */
export const getPostsByLocaleAndCategory = (
    locale: string,
    category: string
) => {
    const posts = getPostsByLocale(locale);
    return posts.filter(
        (post) =>
            post.meta.category.toLowerCase() === category?.toLowerCase() ||
            post.meta.tags.includes(category)
    );
};

/**
 * Get all posts by tag and locale
 * @param {string} tag - Tag of the posts
 * @param {string} locale - Locale of the posts
 * @returns {Object} - Object with posts
 * @example
 * getPostsByTag('JavaScript', 'en')
 * returns [{content: '...', meta: {readTime: 1, numberOfWords: 100, slug: 'first-post', title: 'First Post', locale: 'en', category: 'JavaScript', author: 'John Doe', tags: ['JavaScript'], excerpt: '...', date: '2021-01-01', image: '...', description: '...', alternate: '...'}}]
 */
export const getPostsByTag = (tag: string, locale: string) => {
    const posts = getPostsByLocale(locale);
    return posts.filter((post) => post.meta.tags.includes(tag));
};

/**
 * Get all posts by category and locale
 * @param {string} category - Category of the posts
 * @param {string} locale - Locale of the posts
 * @returns {Object} - Object with posts
 * @example
 * getPostsByCategory('JavaScript', 'en')
 * returns [{content: '...', meta: {readTime: 1, numberOfWords: 100, slug: 'first-post', title: 'First Post', locale: 'en', category: 'JavaScript', author: 'John Doe', tags: ['JavaScript'], excerpt: '...', date: '2021-01-01', image: '...', description: '...', alternate: '...'}}]
 */
export const getPostsByCategory = (category: string, locale: string) => {
    const posts = getPostsByLocale(locale);
    return posts.filter((post) => post.meta.category === category);
};

/**
 * Get all tags from all posts by locale
 * @param {string} locale - Locale of the posts
 * @returns {Object} - Object with tags
 * @example
 * getAllTags('en')
 * returns [{tag: 'JavaScript', total: 2, href: '/blog/javascript/first-post'}]
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
 * Get all categories from all posts by locale
 * @param {string} locale - Locale of the posts
 * @returns {Object} - Object with categories
 * @example
 * getAllCategories('en')
 * returns {categories: [{category: 'JavaScript', total: 2, href: '/blog/javascript/first-post'}], tags: [{tag: 'JavaScript', total: 2, href: '/blog/javascript/first-post'}]}
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
                href: `/blog/${category.toLowerCase()}/${
                    postsByCategory[0].meta.slug
                }`,
            };
        }),
        tags,
    };
};

/**
 * Count words in a string
 * @param {string} content - String to count words
 * @returns {number} - Number of words
 * @example
 * countWords('Hello world')
 * returns 2
 */
export const countWords = (content: string) => {
    const words = content.split(/\s/g);
    const codeBlocks = content.match(/```(.|\n)*?```/g) || [];
    const codeBlocksWords = codeBlocks.map((block) => block.split(/\s/g));
    const wordsInCodeBlocks = codeBlocksWords.flat().length;
    return words.length - wordsInCodeBlocks;
};

/**
 * Calculate reading time in minutes
 * @param {string} content - String to calculate reading time
 * @returns {number} - Reading time in minutes
 * @example
 * readingTime('Hello world. This is a test. This is a test')
 * returns 2
 */
export const readingTime = (content: string) => {
    const wordsPerMinute = 200;
    const numberOfWords = countWords(content);
    return Math.ceil(numberOfWords / wordsPerMinute);
};
