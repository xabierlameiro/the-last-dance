/**
 * Runs in `prebuild`: checks the frontmatter of every post under data/blog and fails the build when
 * a post published on or after the editorial policy date breaks the schema or the snippet limits.
 * Older posts only warn. See ./lib.ts.
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { checkPost, formatFinding, sortBySeverity } from './lib.ts';

const BLOG_DIR = 'data/blog';

const findMdxFiles = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return findMdxFiles(fullPath);
        return entry.name.endsWith('.mdx') ? [fullPath] : [];
    });

const files = findMdxFiles(BLOG_DIR);
const findings = files.flatMap((file) => {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    return checkPost(file, data, content);
});

for (const finding of sortBySeverity(findings)) {
    if (finding.severity === 'error') console.error(formatFinding(finding));
    else console.warn(formatFinding(finding));
}

const errorCount = findings.filter(({ severity }) => severity === 'error').length;
console.log(
    `[frontmatter] ${files.length} posts checked: ${errorCount} errors, ${findings.length - errorCount} warnings`
);
if (errorCount > 0) process.exit(1);
