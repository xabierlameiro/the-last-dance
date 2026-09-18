> Each task closes with the command and its output pasted under it.

## 1. Owner decisions

- [x] 1.1 Owner confirms that distribution replaces the "no syndication" decision recorded in
      `specs/013-llm-visibility-geo.md:4`. Record the answer and date here. If the answer is no,
      stop this change.
      **Answer 2026-09-18: no.** The goal is organic growth, not depending on posting links
      around. SDD-013's "no syndication" decision stands. **This change is stopped**: none of the
      tasks below are to be implemented, and no code was written for it. Keep this folder only as
      the record of the decision, or delete it.
- [ ] 1.2 Owner states whether the memory-leak post was ever shared on dev.to, LinkedIn or Reddit,
      with links if so. This is the only prior data point.
- [ ] 1.3 Owner creates a dev.to API key and sets `DEVTO_API_KEY` locally (never committed).
- [ ] 1.4 Owner picks the subreddits allowed for self-posts and confirms each one's self-promotion
      rules (read the sidebar/wiki; paste the relevant rule).

## 2. Kit template

- [ ] 2.1 `docs/distribution/TEMPLATE.md` with the sections required by the spec and the UTM
      format.
- [ ] 2.2 Add a "Reddit slot" line at the top of `docs/distribution/README.md` listing the month
      and the post that used it.

## 3. dev.to draft script

- [ ] 3.1 `scripts/crosspost-devto.ts`: parse frontmatter, convert the MDX body to Markdown
      (strip or translate custom components, rewrite relative links and images to absolute URLs),
      POST `/api/articles` with `published: false` and `canonical_url`.
- [ ] 3.2 Zod-validate the API response; print the draft URL and the list of conversions.
- [ ] 3.3 Jest tests for the MDX → Markdown conversion on the two memory-leak posts (snapshot of
      the output, no network).
- [ ] 3.4 `npm run crosspost:devto -- <slug>` entry.

## 4. First run

- [ ] 4.1 Build the kit for `measure-nextjs-memory-leak` right after `memory-leak-cluster-refresh`
      ships, and run the script to create its draft. Owner publishes.
- [ ] 4.2 Day 14: record visits per channel and GSC position in the kit.

## 5. Verify

- [ ] 5.1 `npm run lint`, `npm test` pass.
- [ ] 5.2 Add a note to `specs/013-llm-visibility-geo.md` pointing to this change (after 1.1).
