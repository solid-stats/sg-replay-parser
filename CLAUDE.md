<!-- GSD:project-start source:PROJECT.md -->
## Project

**Replay Parser Modernization**

This repository is a production replay-statistics pipeline for `sg.zone` replays. It collects replay metadata and raw JSON files, parses match events into per-player results, aggregates statistics for multiple game types, and publishes generated result artifacts from the local runtime storage under `~/sg_stats`.

This milestone is not about inventing a new product. It is a brownfield modernization of the existing parser so it can keep producing the same outputs while upgrading its toolchain, reducing operational risk around Cloudflare and scheduling, and scaling the parsing/statistics pipeline much further.

**Core Value:** The parser must produce stable, correct statistics continuously, with much lower operational risk and much higher throughput than the current implementation.

### Constraints

- **Compatibility**: Output contracts and runtime folder semantics should remain stable — downstream consumers already rely on the current JSON/results structure
- **Operational Risk**: `sg.zone` is Cloudflare/rate-limit constrained — replay discovery must become less aggressive, not more
- **Runtime Architecture**: The system persists its operational state under `~/sg_stats` — modernization must respect and evolve that file-based runtime model
- **Brownfield Scope**: Existing validated capabilities must keep working while tooling and orchestration change — this is not a greenfield rewrite
- **Testing**: Future code changes must preserve deterministic, readable tests and keep verification meaningful — modernization without regression coverage is too risky
- **Type Safety**: Tooling upgrades must not reduce TypeScript rigor — the migration is a chance to improve type guarantees, not weaken them
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 4.6.x - application code, jobs, worker pool, and tests under `src/**/*.ts`, compiled by `tsc` via `tsconfig.json` and `tsconfig.build.json`.
- JavaScript (CommonJS) - repo-level config and automation files such as `jest.config.js`, `babel.config.js`, `ecosystem.config.cjs`, and `deploy/remote-deploy.sh`.
- Shell - deployment automation in `deploy/remote-deploy.sh`.
- HTML/CSS strings - generated list pages assembled in `src/0 - utils/generateBasicHTML.ts`, `src/jobs/generateMaceListHTML/index.ts`, and `src/jobs/generateMissionMakersList/index.ts`.
## Runtime
- Node.js 18.14.0 - pinned in `.nvmrc`.
- CommonJS output targeting ES6 - configured in `tsconfig.json` with `"module": "commonjs"` and `"target": "es6"`.
- npm - scripts and lockfile are defined in `package.json` and `package-lock.json`.
- Lockfile: present (`package-lock.json`)
## Frameworks
- Node.js standard runtime - entrypoints in `src/start.ts`, `src/schedule.ts`, `src/jobs/prepareReplaysList/start.ts`, and `src/!yearStatistics/index.ts`.
- Worker Threads - multi-core replay parsing in `src/1 - replays/workers/workerPool.ts` and `src/1 - replays/workers/parseReplayWorker.ts`.
- Pino 8.x - structured logging in `src/0 - utils/logger.ts`.
- Zod 3.x - schema validation for worker data and CSV/name helpers in `src/1 - replays/workers/workerData.ts` and `src/0 - utils/namesHelper/prepareNamesList.ts`.
- Jest 28.x with `ts-jest` - unit test runner configured in `jest.config.js`, executed against `src/!tests`.
- Babel Jest - Babel config exists in `babel.config.js` and supports the Jest toolchain declared in `package.json`.
- TypeScript compiler - `npm run tsc` and `npm run build-dist` from `package.json`.
- ESLint 8.x with Airbnb TypeScript config - configured in `.eslintrc`.
- PM2 - production process manager used by `npm run schedule-prod`, `ecosystem.config.cjs`, and `deploy/remote-deploy.sh`.
- Croner - cron scheduling library used in `src/schedule.ts`.
## Key Dependencies
- `node-fetch` 2.x - all HTTP access goes through `src/0 - utils/request.ts` and `src/0 - utils/getProxiedRequest.ts`.
- `fs-extra` 11.x - filesystem operations across runtime data, logs, and outputs in `src/0 - utils/paths.ts`, `src/index.ts`, and many jobs.
- `lodash` 4.x - collection transforms and aggregation helpers across parsing/statistics layers such as `src/1 - replays/getReplays.ts` and `src/3 - statistics/global/index.ts`.
- `dayjs` 1.11.x - date parsing, UTC/timezone handling, and formatting via `src/0 - utils/dayjs.ts`.
- `pino` and `pino-pretty` - logging transport stack in `src/0 - utils/logger.ts`.
- `dotenv` - local relay env loading in `src/0 - utils/getProxiedRequest.ts`.
- `jsdom` - DOM parsing and HTML generation in `src/jobs/prepareReplaysList/utils/parseDOM.ts`, `src/jobs/generateMissionMakersList/index.ts`, and `src/jobs/generateMaceListHTML/index.ts`.
- `csv-parse` - CSV ingestion for name changes in `src/0 - utils/namesHelper/prepareNamesList.ts`.
- `archiver` - ZIP bundle generation in `src/4 - output/archiveFiles.ts`.
- `p-limit` - bounded replay-page parsing concurrency in `src/jobs/prepareReplaysList/parseReplaysOnPage.ts`.
- `uuid` - generated identifiers in `src/0 - utils/namesHelper/prepareNamesList.ts`.
## Configuration
- Local env loading is limited to relay configuration in `src/0 - utils/getProxiedRequest.ts`.
- `.env` and `.env.sample` are present at repo root; `.env.sample` documents `REPLAYS_RELAY_URL` and `REPLAYS_RELAY_TOKEN`.
- Runtime worker parallelism is configured with `WORKER_COUNT` in `src/0 - utils/runtimeConfig.ts`.
- Log verbosity is configured with `LOG_LEVEL` in `src/0 - utils/logger.ts`.
- TypeScript build config: `tsconfig.json`, `tsconfig.build.json`.
- Lint config: `.eslintrc`, `.eslintignore`.
- Test config: `jest.config.js`, `babel.config.js`.
- Process/deploy config: `ecosystem.config.cjs`, `.github/workflows/ci.yml`, `deploy/remote-deploy.sh`.
## Platform Requirements
- Node.js 18.14.0 from `.nvmrc`.
- npm with dependency install from `package-lock.json`.
- Writable home-directory runtime data path `~/sg_stats`, used by `src/0 - utils/paths.ts`.
- Optional relay service for local replay scraping when Cloudflare blocks direct access, configured through `.env.sample` and consumed by `src/0 - utils/getProxiedRequest.ts`.
- Linux host with Node.js, npm, and PM2, matching the deployment flow in `deploy/remote-deploy.sh`.
- Git access and SSH-based deployment from `.github/workflows/ci.yml`.
- Persistent writable storage under `~/sg_stats` for raw replays, logs, config, and generated results as defined in `src/0 - utils/paths.ts`.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Source files use `camelCase.ts` for most modules, for example `src/0 - utils/runtimeConfig.ts`, `src/1 - replays/parseReplays.ts`, and `src/2 - parseReplayInfo/combineSamePlayersInfo.ts`.
- Entry files use `index.ts` and `start.ts` with stable meanings: `index.ts` holds the main module implementation, while `start.ts` wraps it with top-level logging and exit-code handling. Examples: `src/index.ts`, `src/start.ts`, `src/jobs/prepareReplaysList/index.ts`, `src/jobs/prepareReplaysList/start.ts`.
- Test files end with `.test.ts` and usually mirror the source module name under `src/!tests/unit-tests/`, for example `src/!tests/unit-tests/0 - utils/runtimeConfig.test.ts`.
- Directories preserve numbered pipeline stages and often include spaces as part of the committed path names, for example `src/0 - utils`, `src/1 - replays`, `src/2 - parseReplayInfo`, `src/3 - statistics`, and `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo`.
- Use `const` function expressions, not function declarations. ESLint enforces this via `"func-style": ["error", "expression"]` in `.eslintrc`.
- Function names are `camelCase`, for example `getRuntimeConfig` in `src/0 - utils/runtimeConfig.ts`, `startParsingReplays` in `src/index.ts`, and `parseReplays` in `src/1 - replays/parseReplays.ts`.
- Predicate helpers read as booleans: `isCloudflareBanError`, `isSgZoneRequest`, and `isRelayUnsupportedUrlError` in `src/0 - utils/request.ts`.
- Internal helper names are descriptive and domain-specific instead of abbreviated, for example `sortAndLimitWeaponsStatisticsCount` and `addPrefixAndUpdateName` in `src/3 - statistics/global/index.ts`.
- Local variables use `camelCase`, for example `workerPool`, `runUpdateTime`, `processedCount`, and `nextLogPercent` in `src/index.ts`.
- Constants use `UPPER_SNAKE_CASE` when they are true configuration constants, for example `MIN_WORKER_COUNT` and `MAX_WORKER_COUNT` in `src/0 - utils/runtimeConfig.ts`.
- A few short loop/index names are allowed because `.eslintrc` explicitly permits `i`, `x`, `y`, `z`, `e`, and `r` in the `id-length` rule.
- Type aliases and interfaces use `PascalCase`, for example `WorkerPoolConfig`, `QueuedTask`, `InFlightTask` in `src/1 - replays/workers/workerPool.ts`, and `NamesInfo` in `src/3 - statistics/global/index.ts`.
- Shared domain types are ambient declarations under `src/0 - types/*.d.ts`, such as `src/0 - types/replay.d.ts` and `src/0 - types/statistics.d.ts`.
## Code Style
- Formatting is enforced through ESLint only. No Prettier config is present in the repo root.
- `.eslintrc` extends `airbnb-base` and `airbnb-typescript/base`.
- Imports are separated by blank lines between groups and alphabetized inside groups. `src/index.ts` and `src/0 - utils/logger.ts` show the expected layout: built-in Node imports, external packages, then internal relative imports.
- Padding rules insert blank lines after variable declarations and before control-flow statements. `src/index.ts` and `src/1 - replays/workers/workerPool.ts` follow this consistently.
- Multiline arrays and arguments are split aggressively. The `gameTypes.map(...)` blocks in `src/index.ts` and targets array in `src/0 - utils/logger.ts` match the ESLint rules.
- ESLint config lives in `.eslintrc`.
- `import/no-unused-modules` is enabled, so avoid dead exports.
- `import/prefer-default-export` is off, but the codebase still prefers default exports for one-main-function modules.
- `max-nested-callbacks`, `max-depth`, `no-duplicate-imports`, and strict import ordering are enforced.
- File-level or line-level disables exist only where the code intentionally breaks a rule, for example `src/jobs/prepareReplaysList/index.ts` (`no-await-in-loop`) and `src/0 - utils/pipe.ts` (`id-length`).
## Import Organization
- Not used. Imports are relative across the repo, for example `../../0 - utils/logger` in tests and `../0 - utils/paths` in source files.
## Error Handling
- Entry scripts wrap the main async call in `try/catch`, log with `logger.fatal(...)`, and set `process.exitCode = 1`. See `src/start.ts`, `src/jobs/prepareReplaysList/start.ts`, `src/jobs/generateMaceListHTML/start.ts`, and `src/jobs/updateNameChangesCsv/start.ts`.
- Operational modules throw plain `Error` instances with contextual messages when a missing file or invalid state should stop the flow. Examples: `src/1 - replays/getReplays.ts`, `src/jobs/generateMissionMakersList/index.ts`, and `src/1 - replays/workers/workerPool.ts`.
- Non-fatal fallbacks use narrow `try/catch` blocks and continue with defaults. Examples: `src/0 - utils/parsingStatus.ts` silently falls back on missing status files, and `src/0 - utils/runtimeConfig.ts` falls back to default worker count for invalid env input.
- Unknown caught values are normalized to `Error` before logging. Examples: `src/jobs/prepareReplaysList/start.ts` and `src/1 - replays/workers/workerPool.ts` (`toError`).
- Recursive retry logic lives inside the request utility instead of callers. See `src/0 - utils/request.ts`.
## Logging
- Shared logger lives in `src/0 - utils/logger.ts` and is imported directly where needed.
- Use `logger.info(...)` for milestones and progress updates, for example `src/index.ts` and `src/jobs/updateNameChangesCsv/index.ts`.
- Use `logger.warn(...)` for recoverable replay-level failures, for example `src/1 - replays/parseReplays.ts`.
- Use `logger.error(...)` for request and I/O failures that still allow the process to continue, for example `src/0 - utils/request.ts`, `src/1 - replays/fetchReplayInfo.ts`, and `src/jobs/prepareReplaysList/saveReplayFile.ts`.
- Use `logger.fatal(...)` only at process boundaries or signal handlers, for example `src/0 - utils/logger.ts` and `src/start.ts`.
- Error logs usually include both message and stack trace inline in the log string. Preserve that format when adding new failure logs.
## Comments
- Comments are sparse and usually justify exceptions or debug hooks instead of restating logic.
- Keep comments short and practical, for example the manual-timeout explanation in `src/0 - utils/request.ts`.
- Temporary debug hooks are commented out in place rather than deleted, for example `src/2 - parseReplayInfo/index.ts` and `src/1 - replays/getReplays.ts`.
- Not used in production modules or tests.
## Function Design
- Parameter and return types are usually explicit on exported functions, for example `getRuntimeConfig` in `src/0 - utils/runtimeConfig.ts` and `parseReplays` in `src/1 - replays/parseReplays.ts`.
- Lightweight structural helper types are defined near the implementation instead of in shared files when they are local, for example `WorkerPoolLike` in `src/1 - replays/parseReplays.ts`.
- Functions typically return plain objects and arrays, not classes. See `countStatistics` in `src/index.ts` and `generateReplay` in `src/!tests/utils/generators/generateReplay.ts`.
- Async functions return `Promise<void>` for side-effect jobs and `Promise<T>` for data reads/transforms. Examples: `runPrepareReplaysList` in `src/jobs/prepareReplaysList/start.ts` and `request` in `src/0 - utils/request.ts`.
## Module Design
- Default export the primary function/class of a module, for example `src/index.ts`, `src/1 - replays/getReplays.ts`, and `src/3 - statistics/global/index.ts`.
- Add named exports for helpers, constants, or companion APIs from the same file, for example `logsFolderPath` in `src/0 - utils/logger.ts` and `CloudflareBanError` plus `isCloudflareBanError` in `src/0 - utils/request.ts`.
- Used selectively, not everywhere. `src/3 - statistics/global/index.ts`, `src/3 - statistics/rotations/index.ts`, `src/4 - output/index.ts`, and `src/jobs/prepareReplaysList/index.ts` act as feature entry modules.
- Do not add barrel files just for convenience. The repo mostly imports concrete relative files.
## Verification Workflow
- Read `docs/architecture.md` first. This is enforced by `AGENTS.md`.
- Re-read `docs/architecture.md` and update it immediately if responsibilities, flow, or constraints changed. This rule is defined in `AGENTS.md`.
- Keep Markdown documentation in English only, per `AGENTS.md`.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Runtime orchestration is centralized in a small set of entry files: `src/start.ts`, `src/index.ts`, `src/schedule.ts`, `src/jobs/prepareReplaysList/start.ts`, and `src/!yearStatistics/index.ts`.
- The main parse pipeline is stage-based: replay discovery/download in `src/jobs/prepareReplaysList/*`, replay parsing in `src/1 - replays/*` and `src/2 - parseReplayInfo/*`, aggregation in `src/3 - statistics/*`, and publishing in `src/4 - output/*`.
- Shared infrastructure is implemented as plain utilities and ambient types under `src/0 - utils`, `src/0 - consts`, and `src/0 - types`; there is no DI container, service registry, or framework-level module system.
- Runtime state is mostly file-backed under `~/sg_stats`, with paths defined in `src/0 - utils/paths.ts`.
## Layers
- Purpose: Start jobs, sequence stages, and apply top-level fatal logging.
- Location: `src/start.ts`, `src/index.ts`, `src/schedule.ts`, `src/jobs/prepareReplaysList/start.ts`, `src/jobs/generateMissionMakersList/start.ts`, `src/jobs/generateMaceListHTML/start.ts`, `src/!yearStatistics/index.ts`
- Contains: Cron registration, run setup, progress logging, worker-pool lifecycle, and top-level `try/catch`.
- Depends on: Shared utilities from `src/0 - utils/*` plus stage modules below.
- Used by: npm scripts in `package.json` and compiled runtime in `dist/*`.
- Purpose: Provide filesystem paths, logging, HTTP, date helpers, normalization, and runtime config.
- Location: `src/0 - utils/*`, `src/0 - consts/*`, `src/0 - types/*`
- Contains: Logger (`src/0 - utils/logger.ts`), request wrapper (`src/0 - utils/request.ts`), runtime path definitions (`src/0 - utils/paths.ts`), worker count config (`src/0 - utils/runtimeConfig.ts`), parsing status persistence (`src/0 - utils/parsingStatus.ts`), and names cache helpers in `src/0 - utils/namesHelper/*`.
- Depends on: Node APIs and small libraries such as `fs-extra`, `dayjs`, `lodash`, `pino`, and `zod`.
- Used by: Every other layer.
- Purpose: Build `replaysList.json`, normalize replay metadata, and download raw replay JSON files.
- Location: `src/jobs/prepareReplaysList/*`
- Contains: Page fetching (`src/jobs/prepareReplaysList/utils/fetchReplaysPage.ts`), DOM parsing (`src/jobs/prepareReplaysList/utils/parseDOM.ts`), row parsing (`src/jobs/prepareReplaysList/parseReplaysOnPage.ts`), replay-card fetching (`src/jobs/prepareReplaysList/parseReplay.ts`), raw JSON download (`src/jobs/prepareReplaysList/saveReplayFile.ts`), and result post-processing (`src/jobs/prepareReplaysList/utils/*`).
- Depends on: Shared request/logger/path helpers and config file paths from `src/jobs/prepareReplaysList/consts.ts`.
- Used by: `src/jobs/prepareReplaysList/index.ts` and `src/schedule.ts`.
- Purpose: Read prepared replay metadata, filter by game type, and distribute parse work to worker threads.
- Location: `src/1 - replays/*`
- Contains: Replay selection (`src/1 - replays/getReplays.ts`), worker submission and result collation (`src/1 - replays/parseReplays.ts`), worker protocol (`src/1 - replays/workers/types.ts`, `src/1 - replays/workers/workerData.ts`), worker implementation (`src/1 - replays/workers/parseReplayWorker.ts`), and worker lifecycle management (`src/1 - replays/workers/workerPool.ts`).
- Depends on: Shared paths/logger/names helpers and `src/2 - parseReplayInfo/index.ts`.
- Used by: `src/index.ts` and `src/!yearStatistics/index.ts`.
- Purpose: Convert one raw replay JSON structure into per-player results for a single match.
- Location: `src/2 - parseReplayInfo/*`
- Contains: Entity extraction (`src/2 - parseReplayInfo/getEntities.ts`), kill/death computation (`src/2 - parseReplayInfo/getKillsAndDeaths.ts`), same-player merge (`src/2 - parseReplayInfo/combineSamePlayersInfo.ts`), and the stage coordinator in `src/2 - parseReplayInfo/index.ts`.
- Depends on: Shared date/name helpers and ambient replay/player types.
- Used by: `src/1 - replays/workers/parseReplayWorker.ts`.
- Purpose: Turn parsed match results into global, squad, and rotation statistics.
- Location: `src/3 - statistics/*`
- Contains: Global aggregation (`src/3 - statistics/global/*`), squad aggregation (`src/3 - statistics/squads/*`), and rotation grouping (`src/3 - statistics/rotations/*`).
- Depends on: Parsed replay results plus shared helpers such as `src/0 - utils/pipe.ts`, `src/0 - utils/dayjs.ts`, and `src/0 - utils/filterPlayersByTotalPlayedGames.ts`.
- Used by: `src/index.ts` and `src/!yearStatistics/index.ts`.
- Purpose: Serialize statistics, generate archives, and atomically replace the current results directory.
- Location: `src/4 - output/*`
- Contains: Output coordinator (`src/4 - output/index.ts`), JSON generation (`src/4 - output/json.ts`, `src/4 - output/rotationsJSON.ts`), and archiving (`src/4 - output/archiveFiles.ts`).
- Depends on: Statistics output shape plus runtime paths from `src/0 - utils/paths.ts`.
- Used by: `src/index.ts`.
- Purpose: Maintain external derived artifacts that are outside the main parse pipeline.
- Location: `src/jobs/generateMissionMakersList/*`, `src/jobs/generateMaceListHTML/*`, `src/jobs/updateNameChangesCsv/index.ts`
- Contains: HTML generation and remote CSV synchronization.
- Depends on: Shared request/logger/path utilities.
- Used by: `src/schedule.ts` and their respective `start.ts` entry files.
- Purpose: Run a separate annual analysis flow over SG replays and produce nomination-style outputs.
- Location: `src/!yearStatistics/*`
- Contains: Pipeline entry (`src/!yearStatistics/index.ts`), nomination calculators (`src/!yearStatistics/nominations/*`), output formatting (`src/!yearStatistics/output/*`), and year-specific helpers (`src/!yearStatistics/utils/*`).
- Depends on: The same replay-selection and worker-parse layers used by the main pipeline.
- Used by: `npm run parse-new-year`.
## Data Flow
- Persistent state is file-based, not database-backed. `src/0 - utils/paths.ts` places runtime data under `~/sg_stats`.
- Mutable in-memory singleton state exists for player-name mappings in `src/0 - utils/namesHelper/*`; the cache is explicitly reset by `src/jobs/updateNameChangesCsv/index.ts`.
- Worker state is isolated per thread, coordinated by message passing in `src/1 - replays/workers/types.ts`.
## Key Abstractions
- Purpose: Keep a fixed-size pool of worker threads and queue replay parse tasks.
- Examples: `src/1 - replays/workers/workerPool.ts`, `src/1 - replays/workers/types.ts`, `src/1 - replays/workers/workerData.ts`
- Pattern: In-process producer/consumer queue with per-task correlation IDs and worker respawn on exit.
- Purpose: Represent one parsed replay as `{ date, missionName, result }` for downstream aggregation.
- Examples: Consumed in `src/1 - replays/parseReplays.ts`, `src/3 - statistics/global/index.ts`, `src/3 - statistics/rotations/index.ts`, and `src/3 - statistics/squads/index.ts`
- Pattern: Shared ambient TypeScript type carried across parse, aggregate, and output stages.
- Purpose: Resolve stable player IDs and normalize names across nickname changes.
- Examples: `src/0 - utils/namesHelper/prepareNamesList.ts`, `src/0 - utils/namesHelper/getId.ts`, `src/0 - utils/namesHelper/findNameInfo.ts`
- Pattern: Module-level singleton cache loaded from `nameChanges.csv` and reused until `resetNamesList()` is called.
- Purpose: Centralize the on-disk contract for all runtime artifacts.
- Examples: `src/0 - utils/paths.ts`, `src/0 - utils/generateBasicFolders.ts`
- Pattern: Constants module exporting absolute paths consumed across all jobs.
## Entry Points
- Location: `src/start.ts`
- Triggers: `npm run parse`
- Responsibilities: Invoke `src/index.ts`, catch top-level errors, and emit fatal logs with non-zero exit code.
- Location: `src/index.ts`
- Triggers: `src/start.ts` and direct imports from tests.
- Responsibilities: Folder setup, names setup, replay selection, worker-pool creation, progress logging, statistics calculation, output generation, and parsing-status commit.
- Location: `src/jobs/prepareReplaysList/start.ts`
- Triggers: `npm run generate-replays-list`
- Responsibilities: Run replay-list preparation with top-level fatal logging.
- Location: `src/jobs/prepareReplaysList/index.ts`
- Triggers: `src/jobs/prepareReplaysList/start.ts` and `src/schedule.ts`
- Responsibilities: Read existing metadata/config, crawl replay pages, download raw JSON, validate results, and write `replaysList.json`.
- Location: `src/schedule.ts`
- Triggers: `npm run schedule`, `npm run schedule-prod`
- Responsibilities: Register cron jobs, serialize overlapping replay-fetch and parse runs, handle Cloudflare-ban branching, and execute support jobs.
- Location: `src/!yearStatistics/index.ts`
- Triggers: `npm run parse-new-year`
- Responsibilities: Filter SG replays to the configured year, parse them with a single-worker pool, calculate nominations, and print annual output.
## Error Handling
- Entrypoints wrap the full run in `try/catch` and set `process.exitCode = 1` after `logger.fatal(...)` in `src/start.ts` and `src/jobs/prepareReplaysList/start.ts`.
- Scheduler callbacks in `src/schedule.ts` catch job-level exceptions and special-case Cloudflare-ban detection through `isCloudflareBanError`.
- Worker-thread failures are normalized into `status: 'error'` messages in `src/1 - replays/workers/parseReplayWorker.ts` and `src/1 - replays/workers/workerPool.ts`; `src/1 - replays/parseReplays.ts` logs them and continues.
- File reads that represent optional or bootstrapping state fall back to defaults in `src/jobs/prepareReplaysList/index.ts` and `src/0 - utils/parsingStatus.ts`.
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
