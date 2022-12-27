import path from 'path';
import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
// path to posts directory
const POST_PATH = path.join(process.cwd(), 'posts');

// find post by slug or file name
const findPostBySlug = (slug) => {
    let paths = glob.sync(`${POST_PATH}/**/*.mdx`);

    if (typeof slug === 'object') {
        slug = slug.params.slug;
    }
    // match slug or file name in the available posts
    const route = paths.filter((path) => {
        const fileName = path.split('/').pop();
        const content = fs.readFileSync(path, 'utf8');
        const { data } = matter(content);
        if (data.slug === slug || fileName == `${slug}.mdx`) {
            return true;
        }
    });
    // return post content and meta data from the first match
    const fileName = route[0].split('/').pop();
    const fullPath = path.join(POST_PATH, fileName);
    return matter(fs.readFileSync(fullPath, 'utf8'));
};

// Return post content and meta data by slug
export const getPostBySlug = (slug) => {
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

// get all posts slugs (only slugs)
const getPostSlugs = () => {
    let paths = glob.sync(`${POST_PATH}/**/*.mdx`);
    paths = paths.map((path) =>
        path.replace(`${POST_PATH}/`, '').replace(/\.mdx$/, '')
    );
    return paths;
};

export const getAllPosts = () => {
    const slugs = getPostSlugs();
    return slugs.map((slug) => getPostBySlug(slug));
};
