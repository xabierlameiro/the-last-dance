import path from 'path';
import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
// Path to posts directory
const POST_PATH = path.join(process.cwd(), 'posts');

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
    return {
        content,
        meta: {
            slug: data.slug,
            title: data.title,
            locale: data.locale,
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
