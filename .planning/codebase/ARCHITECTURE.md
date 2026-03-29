# Architecture

**Analysis Date:** 2026-03-29

## Pattern Overview

**Overall:** File-oriented batch pipeline with staged processing and cron/manual entry points.

**Key Characteristics:**
- Runtime orchestration is centralized in a small set of entry files: `src/start.ts`, `src/index.ts`, `src/schedule.ts`, `src/jobs/prepareReplaysList/start.ts`, and `src/!yearStatistics/index.ts`.
- The main parse pipeline is stage-based: replay discovery/download in `src/jobs/prepareReplaysList/*`, replay parsing in `src/1 - replays/*` and `src/2 - parseReplayInfo/*`, aggregation in `src/3 - statistics/*`, and publishing in `src/4 - output/*`.
- Shared infrastructure is implemented as plain utilities and ambient types under `src/0 - utils`, `src/0 - consts`, and `src/0 - types`; there is no DI container, service registry, or framework-level module system.
- Runtime state is mostly file-backed under `~/sg_stats`, with paths defined in `src/0 - utils/paths.ts`.

## Layers

**Entrypoints / Orchestration:**
- Purpose: Start jobs, sequence stages, and apply top-level fatal logging.
- Location: `src/start.ts`, `src/index.ts`, `src/schedule.ts`, `src/jobs/prepareReplaysList/start.ts`, `src/jobs/generateMissionMakersList/start.ts`, `src/jobs/generateMaceListHTML/start.ts`, `src/!yearStatistics/index.ts`
- Contains: Cron registration, run setup, progress logging, worker-pool lifecycle, and top-level `try/catch`.
- Depends on: Shared utilities from `src/0 - utils/*` plus stage modules below.
- Used by: npm scripts in `package.json` and compiled runtime in `dist/*`.

**Shared Runtime Utilities:**
- Purpose: Provide filesystem paths, logging, HTTP, date helpers, normalization, and runtime config.
- Location: `src/0 - utils/*`, `src/0 - consts/*`, `src/0 - types/*`
- Contains: Logger (`src/0 - utils/logger.ts`), request wrapper (`src/0 - utils/request.ts`), runtime path definitions (`src/0 - utils/paths.ts`), worker count config (`src/0 - utils/runtimeConfig.ts`), parsing status persistence (`src/0 - utils/parsingStatus.ts`), and names cache helpers in `src/0 - utils/namesHelper/*`.
- Depends on: Node APIs and small libraries such as `fs-extra`, `dayjs`, `lodash`, `pino`, and `zod`.
- Used by: Every other layer.

**Replay Discovery and Raw Data Acquisition:**
- Purpose: Build `replaysList.json`, normalize replay metadata, and download raw replay JSON files.
- Location: `src/jobs/prepareReplaysList/*`
- Contains: Page fetching (`src/jobs/prepareReplaysList/utils/fetchReplaysPage.ts`), DOM parsing (`src/jobs/prepareReplaysList/utils/parseDOM.ts`), row parsing (`src/jobs/prepareReplaysList/parseReplaysOnPage.ts`), replay-card fetching (`src/jobs/prepareReplaysList/parseReplay.ts`), raw JSON download (`src/jobs/prepareReplaysList/saveReplayFile.ts`), and result post-processing (`src/jobs/prepareReplaysList/utils/*`).
- Depends on: Shared request/logger/path helpers and config file paths from `src/jobs/prepareReplaysList/consts.ts`.
- Used by: `src/jobs/prepareReplaysList/index.ts` and `src/schedule.ts`.

**Replay Selection and Worker Dispatch:**
- Purpose: Read prepared replay metadata, filter by game type, and distribute parse work to worker threads.
- Location: `src/1 - replays/*`
- Contains: Replay selection (`src/1 - replays/getReplays.ts`), worker submission and result collation (`src/1 - replays/parseReplays.ts`), worker protocol (`src/1 - replays/workers/types.ts`, `src/1 - replays/workers/workerData.ts`), worker implementation (`src/1 - replays/workers/parseReplayWorker.ts`), and worker lifecycle management (`src/1 - replays/workers/workerPool.ts`).
- Depends on: Shared paths/logger/names helpers and `src/2 - parseReplayInfo/index.ts`.
- Used by: `src/index.ts` and `src/!yearStatistics/index.ts`.

**Single-Replay Domain Parsing:**
- Purpose: Convert one raw replay JSON structure into per-player results for a single match.
- Location: `src/2 - parseReplayInfo/*`
- Contains: Entity extraction (`src/2 - parseReplayInfo/getEntities.ts`), kill/death computation (`src/2 - parseReplayInfo/getKillsAndDeaths.ts`), same-player merge (`src/2 - parseReplayInfo/combineSamePlayersInfo.ts`), and the stage coordinator in `src/2 - parseReplayInfo/index.ts`.
- Depends on: Shared date/name helpers and ambient replay/player types.
- Used by: `src/1 - replays/workers/parseReplayWorker.ts`.

**Statistics Aggregation:**
- Purpose: Turn parsed match results into global, squad, and rotation statistics.
- Location: `src/3 - statistics/*`
- Contains: Global aggregation (`src/3 - statistics/global/*`), squad aggregation (`src/3 - statistics/squads/*`), and rotation grouping (`src/3 - statistics/rotations/*`).
- Depends on: Parsed replay results plus shared helpers such as `src/0 - utils/pipe.ts`, `src/0 - utils/dayjs.ts`, and `src/0 - utils/filterPlayersByTotalPlayedGames.ts`.
- Used by: `src/index.ts` and `src/!yearStatistics/index.ts`.

**Output Publishing:**
- Purpose: Serialize statistics, generate archives, and atomically replace the current results directory.
- Location: `src/4 - output/*`
- Contains: Output coordinator (`src/4 - output/index.ts`), JSON generation (`src/4 - output/json.ts`, `src/4 - output/rotationsJSON.ts`), and archiving (`src/4 - output/archiveFiles.ts`).
- Depends on: Statistics output shape plus runtime paths from `src/0 - utils/paths.ts`.
- Used by: `src/index.ts`.

**Supplementary Jobs:**
- Purpose: Maintain external derived artifacts that are outside the main parse pipeline.
- Location: `src/jobs/generateMissionMakersList/*`, `src/jobs/generateMaceListHTML/*`, `src/jobs/updateNameChangesCsv/index.ts`
- Contains: HTML generation and remote CSV synchronization.
- Depends on: Shared request/logger/path utilities.
- Used by: `src/schedule.ts` and their respective `start.ts` entry files.

**Yearly Statistics Branch:**
- Purpose: Run a separate annual analysis flow over SG replays and produce nomination-style outputs.
- Location: `src/!yearStatistics/*`
- Contains: Pipeline entry (`src/!yearStatistics/index.ts`), nomination calculators (`src/!yearStatistics/nominations/*`), output formatting (`src/!yearStatistics/output/*`), and year-specific helpers (`src/!yearStatistics/utils/*`).
- Depends on: The same replay-selection and worker-parse layers used by the main pipeline.
- Used by: `npm run parse-new-year`.

## Data Flow

**Scheduled Production Flow:**

1. `src/schedule.ts` calls `generateBasicFolders()` once, then registers recurring jobs with `croner`.
2. The replay-refresh cron job runs `src/jobs/prepareReplaysList/index.ts` through `startFetchingReplays()` and then calls `src/jobs/generateMaceListHTML/index.ts`.
3. The parse cron job waits until the replay-refresh job is idle, then runs `src/jobs/updateNameChangesCsv/index.ts`, removes `temp_results`, and calls `src/index.ts`.
4. `src/index.ts` loads replay metadata, creates a shared `WorkerPool`, parses all game types concurrently, computes statistics, writes new output in `temp_results`, archives it, and moves the finished tree into `results`.

**Manual Replay Parse Flow:**

1. `src/start.ts` wraps `src/index.ts` with top-level fatal logging.
2. `src/index.ts` calls `generateBasicFolders()`, `fs.emptyDirSync(tempResultsPath)`, and `prepareNamesList()`.
3. `src/1 - replays/getReplays.ts` reads `replaysList.json`, deduplicates by `filename`, and filters by `mission_name`.
4. `src/1 - replays/parseReplays.ts` submits one worker task per replay to `src/1 - replays/workers/workerPool.ts`.
5. Each worker in `src/1 - replays/workers/parseReplayWorker.ts` reads `~/sg_stats/raw_replays/<filename>.json`, reinitializes the names cache, runs `src/2 - parseReplayInfo/index.ts`, and returns `success`, `skipped`, or `error`.
6. `src/3 - statistics/global/index.ts`, `src/3 - statistics/rotations/index.ts`, and `src/3 - statistics/squads/index.ts` aggregate the successful replay results.
7. `src/4 - output/index.ts` writes structured JSON into `temp_results`, archives it, removes the old `results`, and moves the completed temp tree into place.
8. `src/0 - utils/parsingStatus.ts` stores `updateTime` derived from the replay-list snapshot after output generation succeeds.

**Replay Discovery Flow:**

1. `src/jobs/prepareReplaysList/index.ts` reads the existing output file from `replaysListPath` and runtime config files from the paths exported by `src/jobs/prepareReplaysList/consts.ts`.
2. `src/jobs/prepareReplaysList/utils/fetchReplaysPage.ts` and `src/jobs/prepareReplaysList/utils/parseDOM.ts` fetch and parse replay index pages.
3. `src/jobs/prepareReplaysList/parseReplaysOnPage.ts` walks replay table rows and gates row work with `p-limit(1)`.
4. `src/jobs/prepareReplaysList/parseReplay.ts` extracts a replay filename from the replay page, and `src/jobs/prepareReplaysList/saveReplayFile.ts` downloads raw JSON into `raw_replays`.
5. `src/jobs/prepareReplaysList/utils/unionReplaysInfo.ts`, `src/jobs/prepareReplaysList/utils/problematicReplays.ts`, and `src/jobs/prepareReplaysList/utils/checks.ts` merge old/new metadata and validate the result.
6. `src/jobs/prepareReplaysList/index.ts` writes the final `replaysList.json` snapshot.

**State Management:**
- Persistent state is file-based, not database-backed. `src/0 - utils/paths.ts` places runtime data under `~/sg_stats`.
- Mutable in-memory singleton state exists for player-name mappings in `src/0 - utils/namesHelper/*`; the cache is explicitly reset by `src/jobs/updateNameChangesCsv/index.ts`.
- Worker state is isolated per thread, coordinated by message passing in `src/1 - replays/workers/types.ts`.

## Key Abstractions

**WorkerPool:**
- Purpose: Keep a fixed-size pool of worker threads and queue replay parse tasks.
- Examples: `src/1 - replays/workers/workerPool.ts`, `src/1 - replays/workers/types.ts`, `src/1 - replays/workers/workerData.ts`
- Pattern: In-process producer/consumer queue with per-task correlation IDs and worker respawn on exit.

**PlayersGameResult:**
- Purpose: Represent one parsed replay as `{ date, missionName, result }` for downstream aggregation.
- Examples: Consumed in `src/1 - replays/parseReplays.ts`, `src/3 - statistics/global/index.ts`, `src/3 - statistics/rotations/index.ts`, and `src/3 - statistics/squads/index.ts`
- Pattern: Shared ambient TypeScript type carried across parse, aggregate, and output stages.

**Names Helper Cache:**
- Purpose: Resolve stable player IDs and normalize names across nickname changes.
- Examples: `src/0 - utils/namesHelper/prepareNamesList.ts`, `src/0 - utils/namesHelper/getId.ts`, `src/0 - utils/namesHelper/findNameInfo.ts`
- Pattern: Module-level singleton cache loaded from `nameChanges.csv` and reused until `resetNamesList()` is called.

**Runtime Path Registry:**
- Purpose: Centralize the on-disk contract for all runtime artifacts.
- Examples: `src/0 - utils/paths.ts`, `src/0 - utils/generateBasicFolders.ts`
- Pattern: Constants module exporting absolute paths consumed across all jobs.

## Entry Points

**Main Parse Entrypoint:**
- Location: `src/start.ts`
- Triggers: `npm run parse`
- Responsibilities: Invoke `src/index.ts`, catch top-level errors, and emit fatal logs with non-zero exit code.

**Main Parse Orchestrator:**
- Location: `src/index.ts`
- Triggers: `src/start.ts` and direct imports from tests.
- Responsibilities: Folder setup, names setup, replay selection, worker-pool creation, progress logging, statistics calculation, output generation, and parsing-status commit.

**Replay Discovery Entrypoint:**
- Location: `src/jobs/prepareReplaysList/start.ts`
- Triggers: `npm run generate-replays-list`
- Responsibilities: Run replay-list preparation with top-level fatal logging.

**Replay Discovery Orchestrator:**
- Location: `src/jobs/prepareReplaysList/index.ts`
- Triggers: `src/jobs/prepareReplaysList/start.ts` and `src/schedule.ts`
- Responsibilities: Read existing metadata/config, crawl replay pages, download raw JSON, validate results, and write `replaysList.json`.

**Scheduler Entrypoint:**
- Location: `src/schedule.ts`
- Triggers: `npm run schedule`, `npm run schedule-prod`
- Responsibilities: Register cron jobs, serialize overlapping replay-fetch and parse runs, handle Cloudflare-ban branching, and execute support jobs.

**Yearly Analysis Entrypoint:**
- Location: `src/!yearStatistics/index.ts`
- Triggers: `npm run parse-new-year`
- Responsibilities: Filter SG replays to the configured year, parse them with a single-worker pool, calculate nominations, and print annual output.

## Error Handling

**Strategy:** Fail fast at entry points, but downgrade many per-item replay failures to logs so long-running batch jobs continue.

**Patterns:**
- Entrypoints wrap the full run in `try/catch` and set `process.exitCode = 1` after `logger.fatal(...)` in `src/start.ts` and `src/jobs/prepareReplaysList/start.ts`.
- Scheduler callbacks in `src/schedule.ts` catch job-level exceptions and special-case Cloudflare-ban detection through `isCloudflareBanError`.
- Worker-thread failures are normalized into `status: 'error'` messages in `src/1 - replays/workers/parseReplayWorker.ts` and `src/1 - replays/workers/workerPool.ts`; `src/1 - replays/parseReplays.ts` logs them and continues.
- File reads that represent optional or bootstrapping state fall back to defaults in `src/jobs/prepareReplaysList/index.ts` and `src/0 - utils/parsingStatus.ts`.

## Cross-Cutting Concerns

**Logging:** `src/0 - utils/logger.ts` is the central logging surface. All layers import it directly.

**Validation:** Validation is mostly ad hoc and file-specific. Examples are result checks in `src/jobs/prepareReplaysList/utils/checks.ts` and worker-data schema validation in `src/1 - replays/workers/workerData.ts`.

**Authentication:** Not detected as an application-layer auth system. Remote services are accessed directly through HTTP requests in files such as `src/0 - utils/request.ts` and `src/jobs/updateNameChangesCsv/index.ts`.

**Configuration:** Runtime filesystem configuration is centralized in `src/0 - utils/paths.ts`. Parse concurrency is environment-driven in `src/0 - utils/runtimeConfig.ts`. Replay include/exclude lists are loaded from runtime config paths declared in `src/jobs/prepareReplaysList/consts.ts`.

---

*Architecture analysis: 2026-03-29*
