## Purpose

Catch missing or oversized post frontmatter at build time, so a new post cannot ship with a
truncated snippet or a missing field that breaks SEO tags.

## ADDED Requirements

### Requirement: Post frontmatter is validated against a schema

The build SHALL parse every post's frontmatter with a Zod schema covering at least `title`,
`slug`, `author`, `category`, `tags`, `locale` and `description`.

#### Scenario: Missing description

- **WHEN** a post published after the policy date has no `description`
- **THEN** the build fails and the error names the file and the missing field

### Requirement: Snippet lengths are enforced for new posts

For posts published on or after the policy date, `title` SHALL be at most 60 characters and
`description` at most 155. For older posts a violation SHALL log a warning and not fail the build.

#### Scenario: New post with a long description

- **WHEN** a post dated after the policy date has a 170-character description
- **THEN** the build fails and the message states the file, the length and the limit

#### Scenario: Legacy error post

- **WHEN** `uncaught-error.en.mdx` (254-character description, published 2023) is validated
- **THEN** the build logs a warning for it and succeeds
