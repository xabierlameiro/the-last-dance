## Purpose

Keep tag browsing working exactly as it does today while making sure each post has a single
indexable URL, by carrying the browsed tag in a query parameter instead of a path segment.

## ADDED Requirements

### Requirement: Posts are linked only at their category URL

Every internal link to a post SHALL point at `/blog/<primary-category>/<slug>` (with the locale
prefix where applicable), optionally followed by `?tag=<tag>`. No internal link SHALL point at
`/blog/<tag>/<slug>` when the tag is not the post's primary category.

#### Scenario: Link from a tag listing

- **WHEN** the listing for tag `node` is rendered and it contains `nextjs-memory-leak-in-production`
- **THEN** the post link is `/blog/nextjs/nextjs-memory-leak-in-production?tag=node`

### Requirement: Tag navigation behaves as before

With a tag selected, opening a post SHALL keep that tag highlighted in the sidebar and the
filtered list SHALL be the same; the browser back button SHALL return to the same filtered
listing.

#### Scenario: Browse tag, open post, go back

- **WHEN** a reader selects tag `node`, opens a post from the list and presses back
- **THEN** on the post the `node` tag is highlighted, and after back the listing shows the same
  `node`-filtered posts

#### Scenario: Direct visit without a tag

- **WHEN** a reader opens `/blog/nextjs/nextjs-memory-leak-in-production` directly
- **THEN** no tag is highlighted, as today

### Requirement: Tagged URLs stay out of the index

`robots.txt` SHALL contain `Disallow: /*?tag=`. The sitemap SHALL list post URLs without
parameters. Post pages SHALL keep `rel=canonical` to the parameter-free URL.

#### Scenario: robots.txt

- **WHEN** `/robots.txt` is fetched in production
- **THEN** it contains `Disallow: /*?tag=` and still allows `/`

### Requirement: Legacy facet paths redirect permanently

After the link and robots changes are live, a request to `/blog/<tag>/<slug>` where `<tag>` is not
the post's category SHALL return 301 to `/blog/<category>/<slug>?tag=<tag>`.

#### Scenario: Old facet URL from GSC

- **WHEN** `/blog/cli/solve-address-in-use-error` is requested
- **THEN** the response is 301 to `/blog/error/solve-address-in-use-error?tag=cli`
