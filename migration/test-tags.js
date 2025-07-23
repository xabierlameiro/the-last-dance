// Script temporal para probar el orden de tags
import { getAllTags, getPostsByTag } from './src/helpers/fileReader.ts';

console.log('Testing tag "node" for locale "es"...');

const postsByTag = getPostsByTag('node', 'es');
console.log('Posts for tag "node":');
postsByTag.forEach((post, index) => {
    console.log(`${index + 1}. ${post.meta.title} - Category: ${post.meta.category} - Slug: ${post.meta.slug}`);
});

const tags = getAllTags('es');
const nodeTag = tags.find(tag => tag.tag === 'node');
console.log('\nNode tag object:', nodeTag);
