# AGENTS

## Documentation Language

All project documentation must be written in English only.

This rule applies to all Markdown files in the repository, including:

1. `docs/**/*.md`
2. `README.md`
3. `AGENTS.md`
4. any new documentation files added later

Do not add or keep non-English text in documentation.

## Mandatory Reading Before Any Work

Before making any change in this repository, you must read:

`docs/replay-parser-architecture.md`

This is the primary reference for:

1. end-to-end replay parsing flow
2. project architecture
3. important implementation nuances and constraints

You must not start implementation, refactoring, or review without reading it first.

## Mandatory Architecture Refresh After Every Change

After every code, config, or documentation change:

1. re-read `docs/replay-parser-architecture.md`
2. verify whether behavior, flow, constraints, or component responsibilities changed
3. update `docs/replay-parser-architecture.md` immediately if anything became outdated

A task is not complete until the architecture document is up to date.

## Mandatory Lint and Test Verification After Code Changes

After any code change, you must run all verification commands:

1. `npm run lint`
2. `npm run test`
3. `npm run build-dist`

You must not mark the task as complete until all commands pass.
