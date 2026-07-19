/**
 * Path-traversal guards for slugs that reach the filesystem or an analytics query.
 *
 * The same three checks were written out by hand in fileReader, /api/analytics and
 * the legal page. Security logic copied three times drifts: tightening one copy and
 * missing the others is exactly how a traversal hole reopens.
 */

const TRAVERSAL = '..';
const BACKSLASH = '\\';

/**
 * @description A single path segment: no traversal, no separators of either kind.
 * @param {unknown} value - Candidate slug.
 * @returns {boolean} True when the value is safe to join onto a directory path.
 */
export const isSafeSlug = (value: unknown): value is string =>
    typeof value === 'string' &&
    value.length > 0 &&
    !value.includes(TRAVERSAL) &&
    !value.includes('/') &&
    !value.includes(BACKSLASH);

/**
 * @description A page path, which legitimately contains '/' separators.
 * @param {unknown} value - Candidate path, e.g. "/es/blog/react/hooks".
 * @returns {boolean} True when the value carries no traversal segment.
 */
export const isSafePagePath = (value: unknown): value is string =>
    typeof value === 'string' && !value.includes(TRAVERSAL) && !value.includes(BACKSLASH);
