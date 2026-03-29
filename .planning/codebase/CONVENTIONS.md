# Coding Conventions

**Analysis Date:** 2026-03-29

## Naming Patterns

**Files:**
- Source files use `camelCase.ts` for most modules, for example `src/0 - utils/runtimeConfig.ts`, `src/1 - replays/parseReplays.ts`, and `src/2 - parseReplayInfo/combineSamePlayersInfo.ts`.
- Entry files use `index.ts` and `start.ts` with stable meanings: `index.ts` holds the main module implementation, while `start.ts` wraps it with top-level logging and exit-code handling. Examples: `src/index.ts`, `src/start.ts`, `src/jobs/prepareReplaysList/index.ts`, `src/jobs/prepareReplaysList/start.ts`.
- Test files end with `.test.ts` and usually mirror the source module name under `src/!tests/unit-tests/`, for example `src/!tests/unit-tests/0 - utils/runtimeConfig.test.ts`.
- Directories preserve numbered pipeline stages and often include spaces as part of the committed path names, for example `src/0 - utils`, `src/1 - replays`, `src/2 - parseReplayInfo`, `src/3 - statistics`, and `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo`.

**Functions:**
- Use `const` function expressions, not function declarations. ESLint enforces this via `"func-style": ["error", "expression"]` in `.eslintrc`.
- Function names are `camelCase`, for example `getRuntimeConfig` in `src/0 - utils/runtimeConfig.ts`, `startParsingReplays` in `src/index.ts`, and `parseReplays` in `src/1 - replays/parseReplays.ts`.
- Predicate helpers read as booleans: `isCloudflareBanError`, `isSgZoneRequest`, and `isRelayUnsupportedUrlError` in `src/0 - utils/request.ts`.
- Internal helper names are descriptive and domain-specific instead of abbreviated, for example `sortAndLimitWeaponsStatisticsCount` and `addPrefixAndUpdateName` in `src/3 - statistics/global/index.ts`.

**Variables:**
- Local variables use `camelCase`, for example `workerPool`, `runUpdateTime`, `processedCount`, and `nextLogPercent` in `src/index.ts`.
- Constants use `UPPER_SNAKE_CASE` when they are true configuration constants, for example `MIN_WORKER_COUNT` and `MAX_WORKER_COUNT` in `src/0 - utils/runtimeConfig.ts`.
- A few short loop/index names are allowed because `.eslintrc` explicitly permits `i`, `x`, `y`, `z`, `e`, and `r` in the `id-length` rule.

**Types:**
- Type aliases and interfaces use `PascalCase`, for example `WorkerPoolConfig`, `QueuedTask`, `InFlightTask` in `src/1 - replays/workers/workerPool.ts`, and `NamesInfo` in `src/3 - statistics/global/index.ts`.
- Shared domain types are ambient declarations under `src/0 - types/*.d.ts`, such as `src/0 - types/replay.d.ts` and `src/0 - types/statistics.d.ts`.

## Code Style

**Formatting:**
- Formatting is enforced through ESLint only. No Prettier config is present in the repo root.
- `.eslintrc` extends `airbnb-base` and `airbnb-typescript/base`.
- Imports are separated by blank lines between groups and alphabetized inside groups. `src/index.ts` and `src/0 - utils/logger.ts` show the expected layout: built-in Node imports, external packages, then internal relative imports.
- Padding rules insert blank lines after variable declarations and before control-flow statements. `src/index.ts` and `src/1 - replays/workers/workerPool.ts` follow this consistently.
- Multiline arrays and arguments are split aggressively. The `gameTypes.map(...)` blocks in `src/index.ts` and targets array in `src/0 - utils/logger.ts` match the ESLint rules.

**Linting:**
- ESLint config lives in `.eslintrc`.
- `import/no-unused-modules` is enabled, so avoid dead exports.
- `import/prefer-default-export` is off, but the codebase still prefers default exports for one-main-function modules.
- `max-nested-callbacks`, `max-depth`, `no-duplicate-imports`, and strict import ordering are enforced.
- File-level or line-level disables exist only where the code intentionally breaks a rule, for example `src/jobs/prepareReplaysList/index.ts` (`no-await-in-loop`) and `src/0 - utils/pipe.ts` (`id-length`).

## Import Organization

**Order:**
1. Node built-ins, for example `path`, `os`, `worker_threads`, `events`.
2. External packages, for example `fs-extra`, `lodash`, `node-fetch`, `pino`.
3. Internal relative modules, usually grouped by layer path such as `../0 - utils/logger` or `./workers/workerPool`.

**Path Aliases:**
- Not used. Imports are relative across the repo, for example `../../0 - utils/logger` in tests and `../0 - utils/paths` in source files.

## Error Handling

**Patterns:**
- Entry scripts wrap the main async call in `try/catch`, log with `logger.fatal(...)`, and set `process.exitCode = 1`. See `src/start.ts`, `src/jobs/prepareReplaysList/start.ts`, `src/jobs/generateMaceListHTML/start.ts`, and `src/jobs/updateNameChangesCsv/start.ts`.
- Operational modules throw plain `Error` instances with contextual messages when a missing file or invalid state should stop the flow. Examples: `src/1 - replays/getReplays.ts`, `src/jobs/generateMissionMakersList/index.ts`, and `src/1 - replays/workers/workerPool.ts`.
- Non-fatal fallbacks use narrow `try/catch` blocks and continue with defaults. Examples: `src/0 - utils/parsingStatus.ts` silently falls back on missing status files, and `src/0 - utils/runtimeConfig.ts` falls back to default worker count for invalid env input.
- Unknown caught values are normalized to `Error` before logging. Examples: `src/jobs/prepareReplaysList/start.ts` and `src/1 - replays/workers/workerPool.ts` (`toError`).
- Recursive retry logic lives inside the request utility instead of callers. See `src/0 - utils/request.ts`.

## Logging

**Framework:** `pino` with `pino-pretty`

**Patterns:**
- Shared logger lives in `src/0 - utils/logger.ts` and is imported directly where needed.
- Use `logger.info(...)` for milestones and progress updates, for example `src/index.ts` and `src/jobs/updateNameChangesCsv/index.ts`.
- Use `logger.warn(...)` for recoverable replay-level failures, for example `src/1 - replays/parseReplays.ts`.
- Use `logger.error(...)` for request and I/O failures that still allow the process to continue, for example `src/0 - utils/request.ts`, `src/1 - replays/fetchReplayInfo.ts`, and `src/jobs/prepareReplaysList/saveReplayFile.ts`.
- Use `logger.fatal(...)` only at process boundaries or signal handlers, for example `src/0 - utils/logger.ts` and `src/start.ts`.
- Error logs usually include both message and stack trace inline in the log string. Preserve that format when adding new failure logs.

## Comments

**When to Comment:**
- Comments are sparse and usually justify exceptions or debug hooks instead of restating logic.
- Keep comments short and practical, for example the manual-timeout explanation in `src/0 - utils/request.ts`.
- Temporary debug hooks are commented out in place rather than deleted, for example `src/2 - parseReplayInfo/index.ts` and `src/1 - replays/getReplays.ts`.

**JSDoc/TSDoc:**
- Not used in production modules or tests.

## Function Design

**Size:** Small pure helpers are preferred, but orchestration files can be medium-sized and inline nested helpers when needed. `src/index.ts` and `src/0 - utils/request.ts` are representative.

**Parameters:**
- Parameter and return types are usually explicit on exported functions, for example `getRuntimeConfig` in `src/0 - utils/runtimeConfig.ts` and `parseReplays` in `src/1 - replays/parseReplays.ts`.
- Lightweight structural helper types are defined near the implementation instead of in shared files when they are local, for example `WorkerPoolLike` in `src/1 - replays/parseReplays.ts`.

**Return Values:**
- Functions typically return plain objects and arrays, not classes. See `countStatistics` in `src/index.ts` and `generateReplay` in `src/!tests/utils/generators/generateReplay.ts`.
- Async functions return `Promise<void>` for side-effect jobs and `Promise<T>` for data reads/transforms. Examples: `runPrepareReplaysList` in `src/jobs/prepareReplaysList/start.ts` and `request` in `src/0 - utils/request.ts`.

## Module Design

**Exports:**
- Default export the primary function/class of a module, for example `src/index.ts`, `src/1 - replays/getReplays.ts`, and `src/3 - statistics/global/index.ts`.
- Add named exports for helpers, constants, or companion APIs from the same file, for example `logsFolderPath` in `src/0 - utils/logger.ts` and `CloudflareBanError` plus `isCloudflareBanError` in `src/0 - utils/request.ts`.

**Barrel Files:**
- Used selectively, not everywhere. `src/3 - statistics/global/index.ts`, `src/3 - statistics/rotations/index.ts`, `src/4 - output/index.ts`, and `src/jobs/prepareReplaysList/index.ts` act as feature entry modules.
- Do not add barrel files just for convenience. The repo mostly imports concrete relative files.

## Verification Workflow

**Required before any change:**
- Read `docs/architecture.md` first. This is enforced by `AGENTS.md`.

**Required after any code change:**
1. Run `npm run lint`.
2. Run `npm run test`.
3. Run `npm run build-dist`.

**Required after any code, config, or documentation change:**
- Re-read `docs/architecture.md` and update it immediately if responsibilities, flow, or constraints changed. This rule is defined in `AGENTS.md`.

**Documentation language:**
- Keep Markdown documentation in English only, per `AGENTS.md`.

---

*Convention analysis: 2026-03-29*
