# Replay Parser Scaling (1000-5000 Replays) Design

## Context

- The current pipeline has two major stages:

1. `prepareReplaysList`: collect replay metadata + download raw JSON (`src/jobs/prepareReplaysList/index.ts`, `src/jobs/prepareReplaysList/parseReplaysOnPage.ts`, `src/jobs/prepareReplaysList/saveReplayFile.ts`).
2. `startParsingReplays`: parse raw JSON into `PlayersGameResult[]`, then calculate statistics (`src/index.ts`, `src/1 - replays/parseReplays.ts`, `src/3 - statistics/global/index.ts`).

- In production, the process runs as a single instance (`ecosystem.config.cjs`) with `max_memory_restart: '300M'`.
- Current parallel processing ceiling is constrained by code-level limits:

1. `pLimit(gameType === 'mace' ? 50 : 25)` (`src/1 - replays/parseReplays.ts`).
2. Only 3 game types run concurrently (`sg`, `mace`, `sm`) (`src/index.ts`).
3. `pLimit(1)` while downloading new replays from each page (`src/jobs/prepareReplaysList/parseReplaysOnPage.ts`).

## Problem Statement

We need stable processing of thousands of replays (minimum 1000, target 5000) without:

- out-of-memory,
- runtime degrading into unpredictable durations,
- increased failure rate due to event loop / disk / network overload.

## Goals

1. Reliably process 1000 replays in a single run on production-like configuration.
2. Scale to 5000 replays with predictable runtime and controlled memory usage.
3. Preserve current functional correctness of statistics.
4. Add measurable and repeatable performance-regression control.

## Non-Goals

1. Full replacement of the statistics domain model.
2. Horizontal scaling across multiple hosts.
3. Output JSON/HTML format changes.

## Constraints

1. `sg.zone` is Cloudflare/rate-limit constrained; some requests go through relay.
2. Codebase is Node.js/TypeScript; hot paths are heavily synchronous.
3. Existing cron behavior must remain compatible.

## Baseline Bottlenecks (as-is)

1. Pseudo-parallelism in one event loop.
   `Promise` + high `p-limit` does not provide true multi-core speedup for CPU-heavy logic.
2. High amount of sync I/O.
   `readJsonSync`, `writeFileSync`, `accessSync` block the loop in hot sections.
3. Redundant recomputation/copying in loops:
   - `excludePlayers.json` is read for every player update.
   - `vehiclesByName` is rebuilt for every kill event.
   - `cloneDeep` + `findIndex` in merge functions.
4. "Accumulate everything, then calculate everything" architecture.
   Large intermediate arrays increase RAM usage and GC pressure.
5. Low PM2 memory ceiling (`300M`) for this workload size.

## Design Overview

The solution is built around 7 directions, implemented in phases:

1. Config-driven concurrency model.
2. True CPU parallelism via worker pool.
3. Async migration for hot-path I/O.
4. Algorithmic hot-path optimizations.
5. Streaming aggregation instead of load-all-then-aggregate.
6. Runtime memory tuning (PM2 + Node).
7. Load verification and SLO gating.

---

## 1) Config-Driven Concurrency

### Current pain

- Limits are hardcoded and not host/load adaptive.
- Throughput cannot be tuned safely without a release.

### Design

Introduce centralized runtime config:

- `FETCH_PAGE_CONCURRENCY` (default: `2`)
- `FETCH_REPLAY_CONCURRENCY` (default: `2`)
- `PARSE_REPLAY_CONCURRENCY` (default: `min(2 * CPU, 64)`)
- `WORKER_COUNT` (default: `max(1, CPU - 1)`)
- `AGGREGATOR_QUEUE_MAX` (default: `200`)
- `STATS_FINALIZE_CONCURRENCY` (default: `2`)

Add safety clamps:

- min/max per parameter,
- fallback to defaults for invalid env values,
- log effective values at startup.

### Code touchpoints

1. Create: `src/0 - utils/runtimeConfig.ts`
2. Modify: `src/1 - replays/parseReplays.ts`
3. Modify: `src/jobs/prepareReplaysList/parseReplaysOnPage.ts`
4. Modify: `src/index.ts`

### Rollout note

Keep conservative defaults in the first step so behavior remains close to current production.

---

## 2) True Parallelism via Worker Pool

### Current pain

- `parseReplayInfo` is CPU-heavy but runs in main thread.
- Increasing `p-limit` hurts latency due to contention/GC instead of scaling linearly.

### Design

Move CPU replay parsing into worker threads:

- Main thread: orchestration + I/O + aggregation.
- Worker: `ReplayInfo -> PlayersGameResult`.
- Bounded fixed-size pool (`WORKER_COUNT`).
- Backpressure: main thread does not submit more than `inFlight + queueLimit`.

### Worker contract

Input message:

- `filename`
- `replayDate`
- `replayInfo` (or file path if worker reads file itself)
- `gameType`

Output message:

- `{ ok: true, data: PlayersGameResult }`
- `{ ok: true, data: null }` (filtered out by business rule)
- `{ ok: false, error: SerializedError }`

### Error handling

1. Worker error does not automatically crash the whole process.
2. Task is marked failed and logged with filename.
3. Worker restarts after N consecutive failures.
4. Job stops gracefully after global error threshold is exceeded.

### Code touchpoints

1. Create: `src/1 - replays/workers/parseReplayWorker.ts`
2. Create: `src/1 - replays/workers/workerPool.ts`
3. Modify: `src/1 - replays/parseReplays.ts`
4. Possible update: `tsconfig.build.json` (if worker entrypoint build handling is needed)

### Tradeoffs

1. Pro: real multi-core throughput.
2. Con: more complex debugging and serialization.
3. Risk: overhead when passing large payloads between threads.

### Mitigation

Benchmark and pick one of two models:

1. Main thread reads JSON and sends object to worker.
2. Worker reads JSON from file path itself (lower IPC payload, higher disk contention).

Recommended starting point: option 2, to reduce IPC overhead on large replay JSON payloads.

---

## 3) Async I/O Migration in Hot Path

### Current pain

Sync operations inside loops block event loop:

- `fs.readJsonSync` in `fetchReplayInfo`.
- `fs.accessSync` + `fs.writeFileSync` in `saveReplayFile`.

### Design

1. Move to async APIs (`fs.promises` / async fs-extra methods).
2. Eliminate double-check race (`accessSync -> write`) via:
   - write to temp file,
   - atomic rename.
3. Add bounded concurrency for disk writes.

### Concrete changes

1. `fetchReplayInfo`: `await fs.readJson(...)`.
2. `saveReplayFile`:
   - `await fs.pathExists(file)` instead of `accessSync`,
   - `await fs.outputFile(tmp, data)` + `await fs.move(tmp, final, { overwrite: true })`.
3. Replace all critical `writeFileSync` calls in runtime hot path with async equivalents.

### Benefits

1. Less main-thread freezing.
2. More predictable latency under load.
3. Better composability with worker/backpressure architecture.

---

## 4) Hot Path Algorithmic Optimizations

### 4.1 Cache exclude players once

#### Current pain

`excludePlayers.json` is read in `addPlayerGameResultToGlobalStatistics` for every update.

#### Design

1. Load exclude list once at start of statistics calculation.
2. Pass list into update function via parameter/closure.

### 4.2 Pre-index entities

#### Current pain

`entities.find((entity) => entity.id === id)` inside `events.forEach` (`getEntities`).

#### Design

1. Build `Map<id, entity>` before iterating events.
2. Use O(1) `map.get(id)` lookups.

### 4.3 Avoid rebuild of `vehiclesByName` on each kill

#### Current pain

`Object.values(entities)` + `keyBy` are rebuilt for every kill event.

#### Design

1. Build `Set`/`Map` of vehicle names once per replay.
2. Use `vehicleNameSet.has(weapon)` in kill loop.

### 4.4 Replace clone-heavy merge paths

#### Current pain

`cloneDeep` + `findIndex` in `mergeOtherPlayers` and similar union operations.

#### Design

1. Use `Map<id, OtherPlayer>` merge in O(n + m).
2. Convert back to arrays only at finalization.

### 4.5 Reduce full-array copy on each player update

#### Current pain

`globalStatistics.slice()` and immutable copies in tight loop create GC pressure.

#### Design

1. Use mutable internal accumulator.
2. Keep immutability only at API boundaries/final output.

---

## 5) Streaming Aggregation (Key Architecture Shift)

### Current pain

Pipeline keeps large intermediate arrays in RAM:

1. Parse all replays -> `PlayersGameResult[]`.
2. Iterate all results for global/squad/rotation stats.

### Target data flow

1. Producer: reads/parses replay.
2. Worker pool: transforms replay into `PlayersGameResult`.
3. Bounded queue: sends result to aggregator.
4. Aggregator: updates cumulative state immediately.
5. Finalizer: sorts/limits/formats once.

### Aggregator model

Use map-based state instead of arrays:

- `globalByPlayerId: Map<PlayerId, MutableGlobalStats>`
- `rotationsById: Map<RotationId, Map<PlayerId, MutableGlobalStats>>`
- `squadById: ...` (as needed)
- `meta`: processed count, failed count, timings

### API sketch

1. `createAggregator(context) -> Aggregator`
2. `aggregator.consume(gameResult)`
3. `aggregator.snapshot()` (optional checkpoint)
4. `aggregator.finalize() -> Statistics`

### Backpressure

1. Queue upper bound (`AGGREGATOR_QUEUE_MAX`).
2. Producer waits when queue is full.
3. This stabilizes RAM usage during parse bursts.

### Checkpoint strategy

1. Save snapshot every `N` replays (`N=100` by default).
2. Snapshot includes:
   - progress by filename/date,
   - serialized accumulator state,
   - format version.
3. On restart:
   - resume if snapshot schema version is compatible,
   - otherwise do clean restart.

### Idempotency

For safe resume, deduplicate by replay key:

- key: `filename` (fallback: `replayLink`),
- skip if already processed.

### Finalization stage

At the end:

1. Convert `Map -> Array`.
2. Apply sorting and top limits.
3. Normalize names/prefixes.
4. Generate output in current format (API/file compatibility preserved).

### Code touchpoints

1. Create: `src/3 - statistics/aggregator/index.ts`
2. Create: `src/3 - statistics/aggregator/types.ts`
3. Create: `src/3 - statistics/aggregator/checkpoint.ts`
4. Modify: `src/index.ts`
5. Modify: `src/3 - statistics/global/index.ts` (reuse logic as finalize helper)
6. Modify: `src/3 - statistics/rotations/index.ts` (incremental mode)

### Main tradeoff

1. Pro: strong reduction in peak RAM and unnecessary allocations.
2. Con: more complex state lifecycle.

### Mitigation

1. Explicit module boundaries (`consume`, `finalize`, `snapshot`).
2. Snapshot schema versioning.
3. Golden tests for output equivalence before/after refactor.

---

## 6) Runtime Memory and Process Limits

### Current pain

- PM2 restarts process at `300M`, too aggressive for target workload.

### Design

1. Increase `max_memory_restart` (initially `1G`, then tune via measurements).
2. Add `NODE_OPTIONS=--max-old-space-size=<MB>` to process env.
3. Treat limits as part of a documented perf profile (dev/stage/prod).

### Notes

This is not a substitute for optimizations in sections 1-5; it is a guardrail against premature restarts.

---

## 7) Load Testing and Performance Gates

### Why required

Without automated perf-regression control, optimization claims stay subjective.

### Design

Add dedicated performance harness:

1. Dataset profiles:
   - `small`: 100 replays
   - `medium`: 1000 replays
   - `large`: 5000 replays
2. Metrics:
   - wall-clock duration
   - p95 replay parse latency
   - peak RSS
   - GC pause (optional)
   - error rate
3. Save results as JSON + summary markdown in `temp/perf`.

### Gating (targets)

1. `1000` replays:
   - error rate <= 0.5%
   - peak RSS <= 70% of process limit
2. `5000` replays:
   - error rate <= 1%
   - no OOM/restart
   - predictable runtime (variance <= 20% across 3 runs)

### Tooling

1. Script: `npm run perf:replays -- --dataset=medium`
2. Optional CI: nightly perf job (non-blocking at first).

---

## Alternative Architectures Considered

## A) Keep current architecture, only increase concurrency

Pros:

1. Fastest to implement.
Cons:
1. Hits event loop/GC/RAM bottlenecks.
1. Unstable at 5000 scale.
Decision: rejected as insufficient.

## B) Multi-process sharding only by game type

Pros:

1. Simple isolation.
Cons:
1. Limited gain (only 3 shards).
1. Does not fix load-all-then-aggregate memory pattern.
Decision: partially useful, but not the primary path.

## C) Worker pool + streaming aggregation (recommended)

Pros:

1. Real CPU throughput improvement.
2. RAM control via bounded queue.
3. Scales better to 5000.
Cons:
4. Higher implementation complexity.
Decision: choose as primary architecture.

---

## Migration Plan (Phased)

## Phase 0: Safety Net + Metrics

1. Introduce runtime config and log effective values.
2. Add baseline perf metrics to logs.
3. Increase PM2/Node memory limits.

Success criteria:

1. No functional behavior change.
2. Baseline metrics are available before major refactors.

## Phase 1: Low-risk Hotspot Fixes

1. Async I/O in hot path.
2. Cache `excludePlayers`.
3. Pre-index entities/vehicles.
4. Remove obvious clone-heavy merges.

Success criteria:

1. Full unit test pass.
2. Measurable speedup on dataset=1000 without architecture changes.

## Phase 2: Worker Pool

1. Move CPU replay parsing into workers.
2. Add bounded submit queue + retry/restart policy.

Success criteria:

1. Throughput increases on multi-core host.
2. Deterministic worker error handling.

## Phase 3: Streaming Aggregation

1. Introduce accumulator + consume/finalize flow.
2. Remove full `PlayersGameResult[]` retention.
3. Add checkpoint/resume.

Success criteria:

1. Significant peak RSS reduction.
2. Stable 1000 replay runs in production mode.

## Phase 4: Hardening for 5000

1. Fine-tune concurrency/memory.
2. Run 5000 replay load tests x 3.
3. Final calibration of limits and watchdog alerts.

Success criteria:

1. 5000 replay runs with no OOM/restart.
2. Error rate and runtime variance within target.

---

## Observability Changes

Add structured logs for:

1. Stage start/end with duration.
2. Replay counters: total/processed/skipped/failed.
3. Queue depth (worker queue, aggregator queue).
4. Memory snapshots (`rss`, `heapUsed`) every N seconds/batches.
5. Worker lifecycle events (spawn/restart/crash).

## Testing Strategy

1. Unit tests:
   - aggregator consume/finalize invariants,
   - worker pool scheduling and retry logic,
   - checkpoint serialize/restore compatibility.
2. Regression tests:
   - golden output compare "old vs new" on fixed dataset.
3. Stress tests:
   - synthetic large replay JSON,
   - forced worker failures.
4. End-to-end:
   - `prepareReplaysList` + parse + output with mock data.

## Risks and Mitigations

1. Risk: output statistics diverge after refactor.
   Mitigation: golden tests + double-run diff tool.
2. Risk: race conditions in worker/queue logic.
   Mitigation: bounded queues, explicit state machine, integration tests.
3. Risk: checkpoint corruption.
   Mitigation: atomic checkpoint writes + schema version + checksum.
4. Risk: maintenance complexity growth.
   Mitigation: strict module boundaries and technical documentation.

## Rollback Plan

1. Feature flags for:
   - worker mode on/off,
   - streaming aggregator on/off.
2. In case of issues:
   - switch to legacy mode without full release rollback.
3. Keep legacy pipeline for at least 2 releases after rollout.

## Open Questions

1. What is the real CPU/RAM profile of the target production host (cores, memory)?
2. Do any statistics require strict replay ordering, or can consume be unordered?
3. Is cross-release resume compatibility required when checkpoint schemas change?
4. What are acceptable SLA targets for full run duration (1000/5000)?

## Decision

Recommended architecture:

1. Worker pool for CPU hot path.
2. Streaming aggregator with bounded queue and checkpointing.
3. Configurable concurrency plus mandatory performance gates.

This is the minimum sufficient design for stable transition from hundreds to thousands of replays without reliability degradation.
