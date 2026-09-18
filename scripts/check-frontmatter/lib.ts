/**
 * investigation-content-strategy: build-time frontmatter check for blog posts.
 *
 * Every post is checked, but only posts published on or after `POLICY_DATE` can fail the build.
 * Older posts log warnings: twelve of the fifteen English posts already exceed the description
 * limit, and the error-message posts among them are frozen by the editorial policy
 * (docs/editorial-policy.md), so failing on them would force edits the policy forbids.
 */
import * as z from 'zod/mini';
import { postFrontmatterSchema } from '../../src/types/upstream.ts';
import { describeIssues } from '../../src/types/schemas.ts';

/** The day the editorial policy took effect. A date cut-off needs no list of legacy slugs. */
export const POLICY_DATE = '2026-09-18';
export const TITLE_MAX_LENGTH = 60;
export const DESCRIPTION_MAX_LENGTH = 155;

const nonEmptyString = z.string().check(z.minLength(1));

/**
 * The router's contract (`postFrontmatterSchema`) plus the fields the SEO tags, feeds and listings
 * read. Extending it rather than restating it keeps a single notion of a valid post.
 */
const editorialFrontmatterSchema = z.extend(postFrontmatterSchema, {
    slug: nonEmptyString,
    author: nonEmptyString,
    tags: z.array(nonEmptyString),
    locale: z.enum(['en', 'es', 'gl']),
    description: nonEmptyString,
});

export type FrontmatterSeverity = 'error' | 'warning';

export type FrontmatterFinding = {
    file: string;
    severity: FrontmatterSeverity;
    message: string;
};

/**
 * @description The publish date from the body's `<Date date="MM-DD-YYYY" />`, as `YYYY-MM-DD` so
 * it compares with `POLICY_DATE` as a string. Calendar validity is enforced later in `prebuild` by
 * `generate-feeds.ts`, which fails on a date that does not exist.
 */
export const readPublishDate = (content: string): string | undefined => {
    const match = /<Date\s+date="(\d{2})-(\d{2})-(\d{4})"/.exec(content);
    if (!match) return undefined;
    const [, month, day, year] = match;
    return `${year}-${month}-${day}`;
};

const lengthFinding = (field: string, value: string, limit: number) =>
    value.length > limit ? `${field} is ${value.length} characters, limit ${limit}` : undefined;

/**
 * @description Check one post. Findings are errors for posts published on or after the policy date
 * and warnings for older ones; a post with no readable date is an error, because it cannot be told
 * apart from a new one.
 */
export const checkPost = (file: string, frontmatter: unknown, content: string): FrontmatterFinding[] => {
    const publishDate = readPublishDate(content);
    if (!publishDate) {
        return [{ file, severity: 'error', message: 'no <Date date="MM-DD-YYYY" /> in the body' }];
    }
    const severity: FrontmatterSeverity = publishDate >= POLICY_DATE ? 'error' : 'warning';

    const parsed = editorialFrontmatterSchema.safeParse(frontmatter);
    if (!parsed.success) {
        return [{ file, severity, message: `invalid frontmatter: ${describeIssues(parsed.error.issues)}` }];
    }

    const { title, description } = parsed.data;
    return [
        lengthFinding('title', title, TITLE_MAX_LENGTH),
        lengthFinding('description', description, DESCRIPTION_MAX_LENGTH),
    ]
        .filter((message): message is string => message !== undefined)
        .map((message) => ({ file, severity, message }));
};

const SEVERITY_ORDER: Record<FrontmatterSeverity, number> = { error: 0, warning: 1 };

/** @description Errors first, so a failing build shows its cause above the legacy warnings. */
export const sortBySeverity = (findings: FrontmatterFinding[]): FrontmatterFinding[] =>
    [...findings].sort((first, second) => SEVERITY_ORDER[first.severity] - SEVERITY_ORDER[second.severity]);

/** @description One build-log line: severity, file, and what is wrong with it. */
export const formatFinding = ({ file, severity, message }: FrontmatterFinding): string =>
    `[frontmatter] ${severity}: ${file}: ${message}`;
