#!/bin/sh
# Vercel "Ignored Build Step". Referenced by `ignoreCommand` in vercel.json.
#
# Contract is inverted from how it reads: exit 0 means SKIP the build, exit 1 means BUILD it.
#
# SDD-L01b. Vercel's `git.deploymentEnabled` object only overrides the branches it names —
# "unspecified branches default to true" — so with only `master` and `dev` listed, every `fix/*` and
# every `dependabot/*` branch was building a preview on each push. Dependabot also rebases its
# branches, which pushes again and builds again: `globals`, `eslint` and `cross-env` each produced two
# previews on 2026-07-26 alone.
#
# Policy: production always builds; preview builds are skipped for dependabot branches only. A
# dependency bump has nothing to look at in a browser, while a preview of a real change is how PRs get
# reviewed here.
#
# `VERCEL_ENV` and `VERCEL_GIT_COMMIT_REF` are both documented system environment variables.

set -eu

# Never skip production. Guard first so a malformed ref below can never take the site down.
if [ "${VERCEL_ENV:-}" = "production" ]; then
    echo "vercel-ignore-build: production — building."
    exit 1
fi

branch="${VERCEL_GIT_COMMIT_REF:-}"

case "$branch" in
    dependabot/*)
        echo "vercel-ignore-build: '$branch' is a dependabot branch — skipping preview build."
        exit 0
        ;;
    *)
        echo "vercel-ignore-build: '$branch' — building preview."
        exit 1
        ;;
esac
