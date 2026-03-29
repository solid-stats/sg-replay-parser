# Architecture

This document was restored during Phase 1 toolchain modernization after the repository lost its runtime architecture reference. The goal of the recovery is to preserve the brownfield parser's existing behavior and output contract while the toolchain is modernized.

## Pattern Overview

- Runtime orchestration is centralized in a small set of entry files: `src/start.ts`, `src/index.ts`, `src/schedule.ts`, `src/jobs/prepareReplaysList/start.ts`, and `src/!yearStatistics/index.ts`.
- The main parse pipeline is stage-based: replay discovery and download in `src/jobs/prepareReplaysList/*`, replay parsing in `src/1 - replays/*` and `src/2 - parseReplayInfo/*`, aggregation in `src/3 - statistics/*`, and publishing in `src/4 - output/*`.
- Shared infrastructure is implemented as plain utilities and ambient types under `src/0 - utils`, `src/0 - consts`, and `src/0 - types`.
- Runtime state is file-backed under `~/sg_stats`, with path ownership centralized in `src/0 - utils/paths.ts`.

## Runtime Model

The parser is a brownfield file-oriented pipeline, not a database-backed service. Its operational contract is rooted at `~/sg_stats`, including replay metadata, downloaded raw replay JSON files, transient output directories, logs, and published result artifacts.

Phase 1 modernization must preserve these brownfield runtime semantics. Tooling, package management, and execution surfaces may change, but the runtime folder contract and published outputs must remain stable unless a later phase explicitly documents a required change.

## Layers

### Entrypoints and orchestration

- `src/start.ts` is the main parse entrypoint used to run the full parser pipeline.
- `src/schedule.ts` registers recurring jobs and coordinates replay refresh, support jobs, and parse execution.
- `src/jobs/prepareReplaysList/start.ts` starts replay discovery and raw replay acquisition.
- `src/!yearStatistics/index.ts` runs the dedicated yearly analysis flow.
- Related support entrypoints exist under `src/jobs/*/start.ts` for supplementary jobs.

These files own top-level execution, fatal logging, and process-level failure handling.

### Shared runtime utilities

`src/0 - utils/*`, `src/0 - consts/*`, and `src/0 - types/*` provide the shared runtime substrate: logging, filesystem path definitions, HTTP helpers, runtime config, parsing status persistence, and player-name normalization.

### Replay discovery and raw data acquisition

`src/jobs/prepareReplaysList/*` builds `replaysList.json`, crawls replay pages, normalizes replay metadata, and stores raw replay JSON files under the `~/sg_stats` runtime tree.

### Replay selection and worker dispatch

`src/1 - replays/*` selects prepared replays, filters them by game type, and dispatches parse work to worker threads. Replay parsing uses worker threads through `src/1 - replays/workers/parseReplayWorker.ts`, coordinated by `src/1 - replays/workers/workerPool.ts`.

### Single-replay parsing

`src/2 - parseReplayInfo/*` converts one raw replay JSON structure into per-player match results for downstream aggregation.

### Statistics aggregation

`src/3 - statistics/*` turns parsed match results into global, squad, and rotation statistics used by the published outputs.

### Output publishing

`src/4 - output/*` serializes results, generates archives, and atomically replaces the current published results directory.

## Data Flow

### Main parse flow

1. `src/start.ts` invokes the main parser pipeline in `src/index.ts`.
2. `src/index.ts` prepares folders, initializes shared data, selects replays, and creates a worker pool.
3. Replay parse tasks are executed in worker threads via `src/1 - replays/workers/parseReplayWorker.ts`.
4. Successful replay results are aggregated by the statistics modules under `src/3 - statistics/*`.
5. `src/4 - output/*` writes the next result set into the `~/sg_stats` runtime tree and updates parsing status after a successful publish.

### Scheduled production flow

1. `src/schedule.ts` initializes folders and registers cron-driven jobs.
2. Replay refresh runs through `src/jobs/prepareReplaysList/start.ts` and the underlying replay-list job modules.
3. Support jobs such as name-change updates and list generation are coordinated around the parse schedule.
4. The parser run publishes refreshed outputs without changing the brownfield runtime contract.

### Yearly analysis flow

`src/!yearStatistics/index.ts` reuses the replay-selection and worker-parse layers to build year-specific nomination outputs while remaining dependent on the same `~/sg_stats` runtime model.

## Brownfield Preservation Rules

- Phase 1 must preserve published outputs and brownfield runtime semantics while modernizing the toolchain.
- The recovered architecture reference is a source of truth for later phases and should be updated immediately if responsibilities, flow, or runtime ownership change.
- Any tooling change must be evaluated against the existing file-backed runtime rooted at `~/sg_stats`, not against an invented replacement architecture.
