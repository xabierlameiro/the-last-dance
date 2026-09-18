/**
 * tag-facets-as-query-param. A post used to be linked at /blog/<tag>/<slug> for every tag it
 * carries, so each post had one URL per tag and Google sometimes picked a tag URL over the declared
 * canonical. Every internal link now points at the post's own category path, and the segment being
 * browsed rides along as `?tag=` when it is not that category. `next.config.ts` serves that URL from
 * the tag render, so the listing and the highlighted tag look exactly as before.
 */

/**
 * The shape of a `?tag=` value that `next.config.ts` rewrites to the tag render. Shared so the
 * client honours exactly the values the server rewrote; anything else renders the plain post on
 * both sides.
 */
export const TAG_VALUE_PATTERN = '[a-z0-9-]+';
const TAG_VALUE = new RegExp(`^${TAG_VALUE_PATTERN}$`);

/**
 * @description The taxonomy segment the reader is browsing on a post page. After hydration Next
 * re-reads `router.query` from the visible URL, so on `/blog/<category>/<slug>?tag=node` the route's
 * `category` is the post's own category again; the browsed tag is in `tag`.
 * @param query - `router.query` of the post page.
 * @returns The browsed tag when `?tag=` holds a valid one, otherwise the path segment.
 */
export const browsedSegment = (query: {
    category?: string | string[];
    tag?: string | string[];
}): string | string[] | undefined =>
    typeof query.tag === 'string' && TAG_VALUE.test(query.tag) ? query.tag : query.category;

/**
 * @description The path of a post as linked from a taxonomy listing.
 * @param post - The post's `category` and `slug` from its frontmatter.
 * @param browsedSegment - The category or tag the reader is browsing, if any.
 * @returns `/blog/<category>/<slug>`, plus `?tag=<segment>` when browsing something other than the
 * post's own category.
 */
export const postPath = (post: { category: string; slug: string }, browsedSegment?: string): string => {
    const category = post.category.toLowerCase();
    const path = `/blog/${category}/${post.slug}`;
    const segment = browsedSegment?.toLowerCase();
    return segment && segment !== category ? `${path}?tag=${encodeURIComponent(segment)}` : path;
};
