# Security Policy

## Reporting a vulnerability

Please report security issues **privately**, using GitHub's private vulnerability reporting on this
repository: open the **Security** tab and choose *Report a vulnerability*. That opens a channel only
the maintainer can see.

Please do not open a public issue for a security problem, and please do not disclose it publicly
before it is fixed.

What to expect:

- **Acknowledgement** within 7 days.
- **An assessment** — whether it is confirmed, and the intended fix — within 30 days.
- **Credit** in the fix commit or release notes if you would like it. Say so in your report.

This is a personal site maintained by one person in their own time, so please read those windows as
good-faith targets rather than a service level agreement.

## Scope

The site is `xabierlameiro.com` and this repository is its source. In scope:

- The public API routes under `src/pages/api/`.
- Anything that could expose the maintainer's credentials or third-party API tokens.
- Cross-site scripting, request forgery, or injection through the MDX content pipeline.
- Dependency vulnerabilities that are actually reachable from production code.

Out of scope:

- Findings that only apply to development or test tooling and never ship. See
  `specs/008-dev-audit-vulnerabilities.md` for the standing assessment, and
  `scripts/audit-gate.mjs` for the reviewed exceptions in production dependencies.
- Missing security headers that are load-bearing for Google Analytics or AdSense. The
  `Content-Security-Policy` in `next.config.js` documents which directives are deliberate and why.
- Volumetric denial of service.

## Supported versions

There is one deployed version — whatever `master` currently is. There are no maintained release
branches, so fixes land on `master` and deploy from there. The `version` field in `package.json` is
a release counter, not a support matrix.

## Content contributions are executable code

`src/helpers/mdx.ts` deliberately allows JavaScript expressions in MDX (`blockJS: false`) because the
syntax-highlighting pipeline requires them. A merged pull request touching `data/blog/**` or
`data/home/**` therefore ships client-side JavaScript to every visitor. `.github/CODEOWNERS` marks
those paths so the review requirement is explicit rather than remembered.
