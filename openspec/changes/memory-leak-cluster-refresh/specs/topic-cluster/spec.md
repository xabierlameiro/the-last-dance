## Purpose

Define how posts that share a subject split search intent, link to each other where the reader
needs it, and are judged together, so that a second post on a topic adds reach instead of
competing with the first.

## ADDED Requirements

### Requirement: Each post in a cluster owns a distinct intent

Every post in a topic cluster SHALL declare, in its first paragraph and its title, one search
intent that no sibling post in the cluster targets. Two posts in the same cluster SHALL NOT use
the same primary head query in their titles.

#### Scenario: The memory-leak pair after the refresh

- **WHEN** the titles and first paragraphs of `nextjs-memory-leak-in-production` and
  `measure-nextjs-memory-leak` are compared
- **THEN** the first addresses identifying which leak is present in production and the second
  addresses proving a leak with measurements, and neither title leads with the bare phrase
  "Next.js memory leak" as its whole subject

### Requirement: Cross-links sit where the reader needs the other post

A post SHALL link to its cluster sibling at the first point where the reader needs what the
sibling provides, not only in a closing "related" section. The link text SHALL describe what the
sibling gives the reader.

#### Scenario: Reader of the production post reaches the diagnosis

- **WHEN** a reader of `nextjs-memory-leak-in-production` reaches the section where a leak is
  suspected and must be confirmed
- **THEN** that section links to `measure-nextjs-memory-leak` with anchor text that names the
  proof it offers

### Requirement: Snippet fields fit the result page

A clustered post's `description` SHALL be 155 characters or fewer, and its `title` SHALL be 60
characters or fewer, so Google shows them without truncation.

#### Scenario: Refreshed measurement post

- **WHEN** the frontmatter of `measure-nextjs-memory-leak.en.mdx` is read after the refresh
- **THEN** `description` has at most 155 characters and `title` at most 60

### Requirement: The cluster is measured as one unit

A cluster refresh SHALL record the combined clicks, impressions and per-page average position
from GSC before the change, and SHALL read them again at 14 and 28 days after deploy. A refresh
that lowers the combined clicks at day 28 SHALL be reported as a failure, even if one page
improved.

#### Scenario: Day-28 reading

- **WHEN** 28 days have passed since the refresh deployed
- **THEN** the combined clicks and each page's position are compared to the baseline in the
  proposal and the result is written in the change's `tasks.md`
