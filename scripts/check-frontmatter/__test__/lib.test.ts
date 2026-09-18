import {
    DESCRIPTION_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    checkPost,
    formatFinding,
    readPublishDate,
    sortBySeverity,
} from '../lib';

const NEW_POST_BODY = '<Date date="10-01-2026" />\n\nBody.';
const POLICY_DAY_BODY = '<Date date="09-18-2026" />\n\nBody.';
const LEGACY_POST_BODY = '<Date date="01-05-2023" />\n\nBody.';

const validFrontmatter = {
    title: 'A short title',
    slug: 'a-short-title',
    author: 'Xabier Lameiro',
    category: 'Nextjs',
    tags: ['nextjs'],
    locale: 'en',
    description: 'A description well under the limit.',
};

describe('readPublishDate', () => {
    it('turns the MM-DD-YYYY Date tag into a sortable YYYY-MM-DD', () => {
        expect(readPublishDate('<Date date="07-22-2026" />')).toBe('2026-07-22');
    });

    it('returns undefined without a Date tag or with another format', () => {
        expect(readPublishDate('No date here')).toBeUndefined();
        expect(readPublishDate('<Date date="2026-07-22" />')).toBeUndefined();
    });
});

describe('checkPost', () => {
    it('passes a valid new post', () => {
        expect(checkPost('new.en.mdx', validFrontmatter, NEW_POST_BODY)).toEqual([]);
    });

    it('fails a new post with a long description, stating the length and the limit', () => {
        const description = 'x'.repeat(170);
        expect(checkPost('new.en.mdx', { ...validFrontmatter, description }, NEW_POST_BODY)).toEqual([
            {
                file: 'new.en.mdx',
                severity: 'error',
                message: `description is 170 characters, limit ${DESCRIPTION_MAX_LENGTH}`,
            },
        ]);
    });

    it('fails a new post with a long title', () => {
        const title = 'x'.repeat(TITLE_MAX_LENGTH + 1);
        const [finding] = checkPost('new.en.mdx', { ...validFrontmatter, title }, NEW_POST_BODY);
        expect(finding).toEqual(
            expect.objectContaining({ severity: 'error', message: `title is 61 characters, limit ${TITLE_MAX_LENGTH}` })
        );
    });

    it('fails a new post with no description, naming the field', () => {
        const withoutDescription: Record<string, unknown> = { ...validFrontmatter };
        delete withoutDescription.description;
        const [finding] = checkPost('new.en.mdx', withoutDescription, NEW_POST_BODY);
        expect(finding?.severity).toBe('error');
        expect(finding?.message).toMatch(/^invalid frontmatter: .*description/);
    });

    it('rejects a locale the site does not serve', () => {
        const [finding] = checkPost('new.fr.mdx', { ...validFrontmatter, locale: 'fr' }, NEW_POST_BODY);
        expect(finding?.message).toMatch(/locale/);
    });

    it('only warns for a legacy post over the limits', () => {
        const description = 'x'.repeat(254);
        const findings = checkPost('uncaught-error.en.mdx', { ...validFrontmatter, description }, LEGACY_POST_BODY);
        expect(findings).toEqual([expect.objectContaining({ severity: 'warning' })]);
    });

    it('treats the policy day itself as new', () => {
        const title = 'x'.repeat(TITLE_MAX_LENGTH + 1);
        const [finding] = checkPost('new.en.mdx', { ...validFrontmatter, title }, POLICY_DAY_BODY);
        expect(finding?.severity).toBe('error');
    });

    it('fails a post without a Date tag, since it cannot be told apart from a new one', () => {
        expect(checkPost('undated.en.mdx', validFrontmatter, 'Body.')).toEqual([
            expect.objectContaining({ severity: 'error', message: expect.stringContaining('<Date') }),
        ]);
    });
});

describe('sortBySeverity and formatFinding', () => {
    it('puts errors first and names severity, file and problem on one line', () => {
        const sorted = sortBySeverity([
            { file: 'old.en.mdx', severity: 'warning', message: 'title is 67 characters, limit 60' },
            { file: 'new.en.mdx', severity: 'error', message: 'description is 170 characters, limit 155' },
        ]);
        expect(sorted.map(formatFinding)).toEqual([
            '[frontmatter] error: new.en.mdx: description is 170 characters, limit 155',
            '[frontmatter] warning: old.en.mdx: title is 67 characters, limit 60',
        ]);
    });
});
