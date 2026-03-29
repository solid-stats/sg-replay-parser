# Codebase Structure

**Analysis Date:** 2026-03-29

## Directory Layout

```text
replays-parser/
├── src/                    # TypeScript source for the parser, jobs, yearly flow, and tests
├── config/                 # Repository copies of JSON config inputs
├── docs/                   # Project-level documentation and implementation plans
├── deploy/                 # Deployment helper scripts
├── scripts/                # Standalone utility scripts
├── dist/                   # Compiled JavaScript output from `npm run build-dist`
├── coverage/               # Jest coverage output
├── new_config_files/       # Alternative or in-progress linter/tsconfig setup
├── sg_stats/               # Local runtime data mirror used in this workspace
├── package.json            # npm scripts and dependency manifest
├── tsconfig.json           # Main TypeScript config
├── tsconfig.build.json     # Build-specific TypeScript override
├── jest.config.js          # Jest configuration
├── babel.config.js         # Babel config for Jest transpilation
└── ecosystem.config.cjs    # PM2 runtime configuration
```

## Directory Purposes

**`src/`:**
- Purpose: All maintained application code.
- Contains: Entrypoints, runtime utilities, parsing stages, statistics, output writers, support jobs, yearly statistics flow, and tests.
- Key files: `src/index.ts`, `src/start.ts`, `src/schedule.ts`, `src/jobs/prepareReplaysList/index.ts`, `src/!yearStatistics/index.ts`

**`src/0 - consts/`:**
- Purpose: Shared constants used across the pipeline.
- Contains: Cross-cutting constant definitions.
- Key files: `src/0 - consts/gameTypesArray.ts`

**`src/0 - types/`:**
- Purpose: Ambient type declarations for replay, statistics, output, and shared types.
- Contains: `.d.ts` declaration files referenced through `typeRoots` in `tsconfig.json`.
- Key files: `src/0 - types/replay.d.ts`, `src/0 - types/statistics.d.ts`, `src/0 - types/output.d.ts`, `src/0 - types/types.d.ts`

**`src/0 - utils/`:**
- Purpose: Shared non-domain-specific helpers and runtime infrastructure.
- Contains: Logger, HTTP requests, date helpers, path helpers, names cache, pipes, scoring utilities, and runtime config.
- Key files: `src/0 - utils/logger.ts`, `src/0 - utils/request.ts`, `src/0 - utils/paths.ts`, `src/0 - utils/runtimeConfig.ts`, `src/0 - utils/namesHelper/prepareNamesList.ts`

**`src/1 - replays/`:**
- Purpose: Replay list reading, filtering, and worker-thread parse dispatch.
- Contains: Replay selection, worker coordination, worker protocol types, and worker implementation.
- Key files: `src/1 - replays/getReplays.ts`, `src/1 - replays/parseReplays.ts`, `src/1 - replays/workers/workerPool.ts`, `src/1 - replays/workers/parseReplayWorker.ts`

**`src/2 - parseReplayInfo/`:**
- Purpose: Transform one raw replay JSON into per-player match results.
- Contains: Entity extraction, kill/death logic, and duplicate-player merging.
- Key files: `src/2 - parseReplayInfo/index.ts`, `src/2 - parseReplayInfo/getEntities.ts`, `src/2 - parseReplayInfo/getKillsAndDeaths.ts`, `src/2 - parseReplayInfo/combineSamePlayersInfo.ts`

**`src/3 - statistics/`:**
- Purpose: Aggregate parsed replay results into final statistics.
- Contains: Global, squad, and rotation-based aggregators plus small internal utilities.
- Key files: `src/3 - statistics/global/index.ts`, `src/3 - statistics/squads/index.ts`, `src/3 - statistics/rotations/index.ts`, `src/3 - statistics/consts/index.ts`

**`src/4 - output/`:**
- Purpose: Serialize and publish generated statistics to runtime output folders.
- Contains: JSON writers, archive generation, and result-folder swap logic.
- Key files: `src/4 - output/index.ts`, `src/4 - output/json.ts`, `src/4 - output/rotationsJSON.ts`, `src/4 - output/archiveFiles.ts`

**`src/jobs/`:**
- Purpose: Auxiliary jobs outside the main parse stage.
- Contains: Replay discovery, mission-maker HTML generation, MACE HTML generation, and name-change CSV sync.
- Key files: `src/jobs/prepareReplaysList/index.ts`, `src/jobs/updateNameChangesCsv/index.ts`, `src/jobs/generateMissionMakersList/index.ts`, `src/jobs/generateMaceListHTML/index.ts`

**`src/!yearStatistics/`:**
- Purpose: Separate annual-report pipeline.
- Contains: Yearly orchestration, nomination calculators, and text output formatters.
- Key files: `src/!yearStatistics/index.ts`, `src/!yearStatistics/processRawReplays.ts`, `src/!yearStatistics/output/index.ts`

**`src/!tests/`:**
- Purpose: Jest unit-test suite and test-only helpers.
- Contains: Unit tests grouped by runtime stage plus shared generators and fixtures.
- Key files: `src/!tests/unit-tests/index.test.ts`, `src/!tests/unit-tests/schedule.test.ts`, `src/!tests/utils/generators/generateReplay.ts`

**`config/`:**
- Purpose: Repository-stored examples/reference config files.
- Contains: Include/exclude lists for replay preparation.
- Key files: `config/includeReplays.json`, `config/excludeReplays.json`, `config/excludePlayers.json`

**`docs/`:**
- Purpose: Maintained documentation and planning records.
- Contains: Architecture reference and dated plan documents.
- Key files: `docs/architecture.md`, `docs/plans/2026-02-15-worker-pool-replay-parsing-design.md`

## Key File Locations

**Entry Points:**
- `src/start.ts`: Manual parse CLI wrapper for `src/index.ts`
- `src/index.ts`: Main parse/statistics/output orchestrator
- `src/schedule.ts`: Cron-based production runtime
- `src/jobs/prepareReplaysList/start.ts`: Manual replay-discovery wrapper
- `src/jobs/generateMissionMakersList/start.ts`: Manual mission-makers job wrapper
- `src/jobs/generateMaceListHTML/start.ts`: Manual MACE HTML job wrapper
- `src/!yearStatistics/index.ts`: Yearly nominations runner

**Configuration:**
- `package.json`: Scripts and dependency manifest
- `tsconfig.json`: Compiler baseline
- `tsconfig.build.json`: Excludes `src/!tests` from build output
- `jest.config.js`: Test runner config
- `babel.config.js`: Jest transpilation config
- `ecosystem.config.cjs`: PM2 configuration for schedule runtime

**Core Logic:**
- `src/jobs/prepareReplaysList/index.ts`: Replay crawling and metadata persistence
- `src/1 - replays/parseReplays.ts`: Replay-task dispatch and result collation
- `src/1 - replays/workers/workerPool.ts`: Worker queue implementation
- `src/2 - parseReplayInfo/index.ts`: Single-replay parser coordinator
- `src/3 - statistics/global/index.ts`: Global player statistics aggregation
- `src/3 - statistics/squads/index.ts`: Squad statistics aggregation
- `src/3 - statistics/rotations/index.ts`: Rotation statistics aggregation
- `src/4 - output/index.ts`: Output generation and final folder swap

**Testing:**
- `src/!tests/unit-tests/`: Main unit-test directory
- `src/!tests/utils/`: Shared test generators and helpers

## Naming Conventions

**Files:**
- Numeric stage prefixes are used for main runtime layers: `src/0 - utils/*`, `src/1 - replays/*`, `src/2 - parseReplayInfo/*`, `src/3 - statistics/*`, `src/4 - output/*`.
- Special-purpose top-level areas use `!` prefixes to force ordering and visibility: `src/!tests/*`, `src/!yearStatistics/*`.
- Most implementation files use `camelCase.ts` names for functions or concepts, such as `src/0 - utils/runtimeConfig.ts`, `src/jobs/prepareReplaysList/parseReplaysOnPage.ts`, and `src/3 - statistics/global/addToResultsByWeek.ts`.
- Coordinator modules often use `index.ts` within a directory, such as `src/3 - statistics/global/index.ts` and `src/jobs/generateMissionMakersList/index.ts`.
- Type declaration files use `*.d.ts`, such as `src/0 - types/replay.d.ts` and `src/jobs/prepareReplaysList/types.d.ts`.
- Test files end with `.test.ts`, matching the source concern rather than using separate `__tests__` directories.

**Directories:**
- Source directories are grouped by pipeline responsibility first, then by subdomain. Example: `src/3 - statistics/global/` and `src/jobs/prepareReplaysList/utils/`.
- Utility subdirectories use descriptive names instead of barrels. Example: `src/0 - utils/namesHelper/utils/`.

## Where to Add New Code

**New main-pipeline feature:**
- Primary orchestration changes: `src/index.ts` or the relevant `src/jobs/*/index.ts`
- Replay-ingestion logic: `src/jobs/prepareReplaysList/*`
- Replay parsing logic for one replay: `src/2 - parseReplayInfo/*`
- Aggregation logic after parsing: `src/3 - statistics/*`
- Output serialization: `src/4 - output/*`
- Tests: mirror the stage under `src/!tests/unit-tests/`

**New support job:**
- Implementation: create a new directory or file under `src/jobs/`
- Manual wrapper: add a `start.ts` beside the job if it needs a dedicated npm script, following `src/jobs/prepareReplaysList/start.ts`
- Scheduler hookup: register it in `src/schedule.ts` only if it belongs in recurring runtime

**New worker-based parse behavior:**
- Message shape: `src/1 - replays/workers/types.ts`
- Worker-side implementation: `src/1 - replays/workers/parseReplayWorker.ts`
- Queue/lifecycle changes: `src/1 - replays/workers/workerPool.ts`

**New shared utility:**
- Generic helper: `src/0 - utils/`
- Shared constant: `src/0 - consts/`
- Shared ambient type: `src/0 - types/`

**New yearly-only feature:**
- Keep it inside `src/!yearStatistics/` unless the code is clearly reusable by the main parser.

## Special Directories

**`dist/`:**
- Purpose: Build artifacts compiled from `src/`
- Generated: Yes
- Committed: Yes

**`coverage/`:**
- Purpose: Jest coverage reports
- Generated: Yes
- Committed: Yes in current repository state

**`.planning/codebase/`:**
- Purpose: Generated codebase reference documents for GSD workflows
- Generated: Yes
- Committed: Intended to be committed when refreshed

**`new_config_files/`:**
- Purpose: Alternate or staged config files not used by the active npm scripts
- Generated: No
- Committed: Yes

**`sg_stats/`:**
- Purpose: Workspace-local runtime data mirror; production/runtime code still resolves paths via `os.homedir()` in `src/0 - utils/paths.ts`
- Generated: Mixed
- Committed: Yes in current repository state

## Practical Placement Rules

- Put entrypoint wrappers in the same directory as the job they start, using `start.ts`.
- Keep cross-stage helpers out of stage folders; if more than one stage imports it, place it under `src/0 - utils/` or `src/0 - consts/`.
- Follow the existing relative-import style. The current codebase does not use TypeScript path aliases.
- Add tests beside the existing stage-focused test group, not in a new top-level test tree.
- Do not place runtime-write logic under `config/`; runtime code reads from `~/sg_stats/config` through `src/0 - utils/paths.ts` and `src/jobs/prepareReplaysList/consts.ts`.

---

*Structure analysis: 2026-03-29*
