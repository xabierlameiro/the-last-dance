import path from 'path';
import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
// Path to posts directory
const POST_PATH = path.join(process.cwd(), 'data/blog/posts');

// Find post by slug or file name
const findPostBySlug = (slug: string | { params: { slug: string } }) => {
    let paths = glob.sync(`${POST_PATH}/**/*.mdx`);

    if (typeof slug === 'object') {
        slug = slug.params.slug;
    }
    // Match slug or file name in the available posts
    const route = paths.filter((path) => {
        const document = fs.readFileSync(path, 'utf8');
        const { data } = matter(document);
        const fileName = path.split('/').pop();
        if (data.slug === slug || fileName == `${slug}.mdx`) {
            return true;
        }
    });
    // Return post content and meta data from the first match
    const fileName = route[0].split('/').pop() || '';
    const fullPath = path.join(POST_PATH, fileName);
    return matter(fs.readFileSync(fullPath, 'utf8'));
};

// Return post content and meta data by slug
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
        },
    };
};

// Return all posts slugs
const getPostSlugs = () => {
    let paths = glob.sync(`${POST_PATH}/**/*.mdx`);
    paths = paths.map((path) =>
        path.replace(`${POST_PATH}/`, '').replace(/\.mdx$/, '')
    );
    return paths;
};

// Get all posts
export const getAllPosts = () => {
    const slugs = getPostSlugs();
    return slugs.map((slug) => getPostBySlug(slug));
};

// Get all posts by locale
export const getPostsByLocale = (locale: string) => {
    const posts = getAllPosts();
    return posts.filter((post) => post.meta.locale === locale);
};

// Get all posts by locale and category
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

// Get all posts by tag and locale
export const getPostsByTag = (tag: string, locale: string) => {
    const posts = getPostsByLocale(locale);
    return posts.filter((post) => post.meta.tags.includes(tag));
};

// Get all posts by category and locale
export const getPostsByCategory = (category: string, locale: string) => {
    const posts = getPostsByLocale(locale);
    return posts.filter((post) => post.meta.category === category);
};

// Get all diferent tags from all posts by locale in only one array
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

// Get all categories / tags from all posts by locale in only one array
export const getAllCategories = (locale: string) => {
    const posts = getPostsByLocale(locale);
    const categories = posts.map((post) => post.meta.category);
    const tags = getAllTags(locale);
    return {
        categories: [...new Set(categories)].map((category) => {
            return {
                category,
                total: categories.filter((c) => c === category).length,
                href: `/blog/${category.toLowerCase()}/${posts[0].meta.slug}`,
            };
        }),
        tags,
    };
};

// Function to count words in a post but discard code blocks
export const countWords = (content: string) => {
    const words = content.split(/\s/g);
    const codeBlocks = content.match(/```(.|\n)*?```/g) || [];
    const codeBlocksWords = codeBlocks.map((block) => block.split(/\s/g));
    const wordsInCodeBlocks = codeBlocksWords.flat().length;
    return words.length - wordsInCodeBlocks;
};

// Function to calculate reading time of a post
export const readingTime = (content: string) => {
    const wordsPerMinute = 200;
    const numberOfWords = countWords(content);
    return Math.ceil(numberOfWords / wordsPerMinute);
};
