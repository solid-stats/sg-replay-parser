# Replay Parser Scaling (25,000–50,000 Replays) Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Process 50,000 replays in under 5 minutes total (parsing + statistics + output), down from 18 minutes for 25,000 replays, with support for future replay result corrections.

**Architecture:** Worker pool (already implemented) + replay parse cache + statistics hot-path algorithmic overhaul + parallel statistics via Map-Reduce + async output I/O.

**Tech Stack:** Node.js, TypeScript, worker_threads, fs-extra, lodash.

---

## Context

The pipeline has two major stages:

1. `prepareReplaysList`: collect replay metadata + download raw JSON.
2. `startParsingReplays`: parse raw JSON into `PlayersGameResult[]`, then calculate statistics.

Current state after prior optimization work:

1. **Worker pool** is implemented — replay parsing runs in `worker_threads` with `WorkerPool` class (`WORKER_COUNT` configurable via env, defaults to `cpus - 1`, clamped 1-64).
2. **Hot-path replay reads** are async (`fs.readJson` in worker).
3. **Concurrent game type parsing** — all 3 game types (`sg`, `mace`, `sm`) share one `WorkerPool` via `Promise.all`.

### Current performance at 25,000 replays

| Stage | Time | % | Thread |
|-------|------|---|--------|
| Replay parsing (worker pool) | ~5 min | 28% | Multi-core |
| Statistics generation | ~13 min | 72% | **Single-threaded** |
| **Total** | **~18 min** | | |

**Statistics is the dominant bottleneck**, not parsing.

### Remaining bottlenecks

1. Every parse run re-parses **all** 25,000 replays from raw JSON (no caching of parse results).
2. Statistics inner loop runs ~1.8M iterations (25K replays × ~40 players × (1 global + 19 rotations)):
   - `excludePlayers.json` re-read from disk on **every iteration** (~1.8M `readFileSync` calls).
   - `globalStatistics.slice()` copies the full player array on every iteration (~1.8M copies of ~800-element arrays).
   - `mergeOtherPlayers` calls `cloneDeep` + `findIndex` **7.2M times** (4 fields × 1.8M).
   - `unionWeaponsStatistic` calls `.slice()` + `findIndex` **3.6M times** (2 fields × 1.8M).
   - `addToResultsByWeek` calls `.slice()` + `findIndex` 1.8M times.
   - `findNameInfo` does `Object.keys().filter()` scan ~2.6M times.
   - `findIndex` for player lookup in global array — O(800) × 1.8M.
3. `getReplaysGroupByRotation` does `cloneDeep` of all 20K SG replays (multi-GB deep copy).
4. Entity/vehicle lookups inside replay parsing are O(n) per event.
5. Output writes ~53K files synchronously (`writeFileSync` for every player × every context).
6. All statistics run on **one thread** — `Promise.all` over synchronous functions provides zero parallelism.
7. `saveReplayFile` in `prepareReplaysList` still uses sync I/O.
8. `prepareReplaysList` iterates all pages even when all replays are already known.

### Estimated time breakdown at 25,000 replays (statistics only)

| Hot spot | Est. time | Calls |
|----------|-----------|-------|
| `mergeOtherPlayers` (cloneDeep × 7.2M) | 2–3 min | 7.2M |
| `readExcludePlayer` (readFileSync × 1.8M) | 1.5–2 min | 1.8M |
| `globalStatistics.slice()` (array copy × 1.8M) | 1–2 min | 1.8M |
| `findNameInfo` (Object.keys().filter × 2.6M) | 1–2 min | 2.6M |
| `unionWeaponsStatistic` (slice + findIndex × 3.6M) | 0.5–1 min | 3.6M |
| `addToResultsByWeek` (slice + findIndex × 1.8M) | 0.5–1 min | 1.8M |
| `getReplaysGroupByRotation` (cloneDeep of 20K replays) | 0.5–1 min | 1 |
| `findIndex` for player in global array × 1.8M | 0.5 min | 1.8M |
| Output: ~53K writeFileSync + JSON.stringify | 0.5–1 min | 53K |
| GC pressure from massive allocations | 1–2 min | — |
| **Total** | **~10–16 min** | |

## Problem Statement

Processing 25,000 replays takes 18 minutes. At 50,000 replays, statistics time would roughly double to ~26 minutes. Target: full pipeline in under 5 minutes for 50,000 replays.

## Goals

1. Process 25,000 replays in under 3 minutes total.
2. Scale to 50,000 replays with total time under 5 minutes.
3. Preserve current functional correctness of statistics.
4. Support future ability to manually correct individual replay parse results.

## Non-Goals

1. Full replacement of the statistics domain model.
2. Horizontal scaling across multiple hosts.
3. Output JSON/HTML format changes.
4. Implementing the replay correction UI/workflow (only designing cache to support it).

## Constraints

1. `sg.zone` is Cloudflare/rate-limit constrained; some requests go through relay.
2. Existing cron behavior must remain compatible.
3. Raw replay JSON files are immutable after download (corrections affect parse results, not source data).
4. Statistics require replays processed in date-ascending order (for `byWeeks`, `lastPlayedGameDate`, rotation grouping).

---

## 1) Replay Parse Cache

### Current pain

Every parse run re-parses **all** replays from raw JSON. With worker pool this is parallelized, but still wasteful:

- ~4000 replays × CPU parsing per replay = minutes of redundant work on every 20-minute cron cycle.
- Most replays never change — their parse results are deterministic from the raw JSON.

### Design

Cache `PlayersGameResult` per replay to disk. On subsequent runs, read from cache instead of re-parsing.

#### Cache location

`~/sg_stats/parsed_cache/<filename>.json`

Each file contains the serialized `PlayersGameResult` for one replay (or a skip marker).

#### Cache entry structure

```typescript
type ParseCacheEntry =
  | { version: number; status: 'success'; data: PlayersGameResult }
  | { version: number; status: 'skipped'; reason: ParseReplayTaskSkippedReason };
```

`version` is a schema version number. When parsing logic changes (e.g. new fields, bug fix in kill counting), bump the version. Entries with old version are treated as cache miss and re-parsed.

#### Cache key

File name: `<replay_filename>.json` (same as raw replay file name). One cache file per replay.

#### Read/write flow

Worker-level change (in `parseReplayWorker.ts`):

1. Before parsing, check if `parsed_cache/<filename>.json` exists.
2. If exists and `entry.version === CURRENT_VERSION`, return cached result directly (no raw JSON read, no `parseReplayInfo` call).
3. If missing or version mismatch, parse normally, then write result to cache.
4. Cache write uses atomic pattern: write to `.tmp` file, then rename.

#### Cache version constant

```typescript
// src/1 - replays/workers/cacheVersion.ts
export const PARSE_CACHE_VERSION = 1;
```

Bump this constant when:

- `parseReplayInfo` logic changes.
- `PlayerInfo` / `PlayersGameResult` type shape changes.
- `nameChanges.csv` processing inside worker changes.

#### Important: nameChanges.csv and cache validity

`prepareNamesList()` is called in the worker and affects `getPlayerId` results inside `parseReplayInfo`. If `nameChanges.csv` changes, cached results with old name resolutions become stale.

Two options:

**Option A (recommended): Do not resolve player IDs during parsing.**
`parseReplayInfo` currently returns raw player names without ID resolution. The `getPlayerId` call happens downstream in statistics. If this is already the case, the cache is safe — name changes only affect statistics aggregation, not the cached parse result.

**Option B: Include nameChanges hash in cache key.**
If worker does name resolution, compute a hash of `nameChanges.csv` content and store it in the cache entry. Invalidate if hash changes. This is more complex and less efficient.

Verify which option applies by checking whether `parseReplayInfo` calls `getPlayerId` or only `getPlayerName`.

#### Future corrections support

The cache design must support a future workflow where an operator can manually correct a replay's parse result (e.g. fix misattributed kills, override a player name).

**Correction mechanism (design only, not implemented now):**

A corrections file `~/sg_stats/config/replayCorrections.json` will contain per-replay overrides:

```typescript
type ReplayCorrection = {
  filename: string;
  // Which stage the correction applies at is TBD.
  // Possible approaches:
  // A) Pre-parse: patch raw ReplayInfo before parsing (e.g. fix entity names)
  // B) Post-parse: patch PlayersGameResult after parsing (e.g. override kills)
  // C) Post-statistics: patch GlobalPlayerStatistics after aggregation
  action: 'invalidate_cache' | 'override_result';
  // For 'invalidate_cache': forces re-parse from raw JSON
  // For 'override_result': provides partial PlayersGameResult patch
  patch?: Partial<PlayersGameResult>;
};
```

**Cache interaction with corrections:**

1. When correction has `action: 'invalidate_cache'` — delete the cache file for that replay, forcing re-parse on next run.
2. When correction has `action: 'override_result'` — the correction is applied **after** cache read, so the cache stores the clean parse result and correction is layered on top. This keeps corrections separate from parsing and allows removing a correction without re-parsing.

**For now:** Add the `parsed_cache` directory to `basicPaths` (auto-created). Do not implement corrections — only ensure the cache design does not prevent future correction support.

#### Cache invalidation summary

A cache entry is invalid (re-parsed) when:

1. Cache file does not exist.
2. `entry.version !== PARSE_CACHE_VERSION`.
3. A future correction with `action: 'invalidate_cache'` targets this replay.
4. Raw replay file is re-downloaded (operator manually deletes and re-fetches).

#### Performance impact

With cache warm:

- Worker skips `fs.readJson` of large raw replay (tens of MB) — reads small cache file instead.
- Worker skips all CPU parsing (`getEntities`, `getKillsAndDeaths`, `combineSamePlayersInfo`).
- Expected speedup: 10-50x per replay on cache hit.

With cache cold (first run or version bump):

- Same as current behavior + one extra cache write per replay.
- Negligible overhead.

#### Code touchpoints

1. Create: `src/1 - replays/workers/cacheVersion.ts`
2. Create: `src/1 - replays/workers/parseCache.ts` (read/write/invalidate helpers)
3. Modify: `src/1 - replays/workers/parseReplayWorker.ts` (check cache before parse)
4. Modify: `src/0 - utils/paths.ts` (add `parsedCachePath`)
5. Modify: `src/0 - utils/generateBasicFolders.ts` (add `parsedCachePath` to `basicPaths`)

---

## 2) Statistics Hot-Path Algorithmic Optimizations

These optimizations target the inner loop of `addPlayerGameResultToGlobalStatistics` which executes ~1.8M times at 25K replays (~3.6M at 50K). Each optimization eliminates per-call overhead that compounds across millions of iterations.

### 2.1 Cache exclude players once

#### Current pain

`excludePlayers.json` is read via `fs.readFileSync` in `addPlayerGameResultToGlobalStatistics` — called for every player in every replay. At 25K replays: ~1.8M `readFileSync` + `JSON.parse` calls of the same unchanging file. Estimated cost: **1.5–2 min**.

#### Design

1. Load exclude list once at start of statistics calculation.
2. Pass as parameter to `addPlayerGameResultToGlobalStatistics`.

#### Code touchpoints

1. Modify: `src/3 - statistics/global/index.ts` (read once, pass down)
2. Modify: `src/3 - statistics/global/add.ts` (accept as parameter, remove `readExcludePlayer`)

### 2.2 Mutable accumulator with Map for global statistics

#### Current pain

`addPlayerGameResultToGlobalStatistics` does two expensive operations on every call:

1. `globalStatistics.slice()` — copies the entire ~800-element player array. Cost: **1–2 min** at 1.8M calls.
2. `findIndex(p => p.id === id)` — O(800) linear scan per call. Cost: **~30 sec** at 1.8M calls.

#### Design

1. Replace the array with `Map<PlayerId, GlobalPlayerStatistics>` as internal accumulator.
2. O(1) lookup and in-place mutation per player update.
3. No `.slice()`, no `findIndex`.
4. Convert `Map → Array` only once in finalization step (sort/limit/output).

#### Code touchpoints

1. Modify: `src/3 - statistics/global/add.ts` (mutate Map entry in place)
2. Modify: `src/3 - statistics/global/index.ts` (create Map, convert to Array at end)

### 2.3 Replace mergeOtherPlayers cloneDeep with Map merge

#### Current pain

`mergeOtherPlayers` uses `cloneDeep(first)` + `findIndex` per element. Called for 4 fields (killed, killers, teamkilled, teamkillers) × 1.8M = **7.2M calls**. Each call deep-copies the accumulated list (growing to 50–200 entries for veteran players) and does quadratic scan. This is the single most expensive operation. Estimated cost: **2–3 min**.

#### Design

1. Use `Map<PlayerId, OtherPlayer>` merge — O(n + m), no cloning.
2. Mutate in place since caller owns the data.
3. Convert back to arrays only at finalization.

Alternative: keep arrays but use `find` + direct mutation instead of `cloneDeep` + `findIndex`. Simpler change, still eliminates the clone cost.

#### Code touchpoints

1. Modify: `src/0 - utils/mergeOtherPlayers.ts`

### 2.4 Replace unionWeaponsStatistic slice + findIndex with Map

#### Current pain

`unionWeaponsStatistic` uses `.slice()` + `findIndex` per weapon. Called for 2 fields (weapons, vehicles) × 1.8M = **3.6M calls**. Each copies the array and does linear scan per new weapon. Estimated cost: **0.5–1 min**.

#### Design

1. Use `Map<WeaponName, WeaponStatistic>` merge — O(n + m).
2. Mutate in place.
3. Convert to sorted array only at finalization.

#### Code touchpoints

1. Modify: `src/0 - utils/weaponsStatistic.ts`

### 2.5 Replace addToResultsByWeek slice + findIndex with Map

#### Current pain

`addToResultsByWeek` uses `.slice()` + `findIndex(w => w.week === weekStr)` on every call. Called 1.8M times. Week arrays grow to ~260 entries for players with 5 years of history. Estimated cost: **0.5–1 min**.

#### Design

1. Use `Map<WeekNumber, GlobalPlayerWeekStatistics>` as internal structure.
2. O(1) lookup per week.
3. Convert to array at finalization.

#### Code touchpoints

1. Modify: `src/3 - statistics/global/addToResultsByWeek.ts`

### 2.6 Pre-index namesList for O(1) lookup

#### Current pain

`findNameInfo` does `Object.keys(namesList).filter(name => name.split(delimiter)[0] === playerName)` on every call — full key scan with string split. Called ~2.6M times (from global stats + squad stats). Estimated cost: **1–2 min**.

#### Design

1. Pre-build `Map<playerName, NameInfo[]>` once in `prepareNamesList()`.
2. Use `map.get(playerName)` — O(1) lookup.
3. `findIndex` with `isInInterval` remains (small array per player), but the `Object.keys().filter()` is eliminated.

#### Code touchpoints

1. Modify: `src/0 - utils/namesHelper/findNameInfo.ts`
2. Modify: `src/0 - utils/namesHelper/prepareNamesList.ts` (build indexed Map)

### 2.7 Replace getReplaysGroupByRotation cloneDeep with filter

#### Current pain

`getReplaysGroupByRotation` calls `cloneDeep(replays)` on the full SG replay array (~20K replays, each containing ~40 player results with nested arrays). This is a multi-GB deep copy. Then `remove()` is called 19 times. Estimated cost: **0.5–1 min**.

#### Design

1. Replace with simple `filter` per rotation — create array views by date range.
2. Replays are never mutated, so cloning is unnecessary.
3. Each rotation gets a filtered `PlayersGameResult[]` without any copying.

#### Code touchpoints

1. Modify: `src/3 - statistics/rotations/getReplaysGroupByRotation.ts`

### 2.8 Pre-index entities in replay parsing

#### Current pain

`entities.find((entity) => entity.id === id)` inside `connected` event processing — O(n) per event.

#### Design

1. Build `Map<EntityId, PlayerEntity | VehicleEntity>` before iterating events.
2. Use `map.get(id)` — O(1) lookup.

#### Code touchpoints

1. Modify: `src/2 - parseReplayInfo/getEntities.ts`

### 2.9 Avoid rebuild of vehiclesByName on each kill

#### Current pain

Inside `processPlayerKilled` (called per kill event):

```typescript
const vehiclesList = Object.values(entities);
const vehiclesByName = keyBy(vehiclesList, 'name');
```

Rebuilds the full index on every kill.

#### Design

1. Build `vehiclesByName: Map<string, VehicleInfo>` once before kill loop.
2. Pass as parameter to `processPlayerKilled`.

#### Code touchpoints

1. Modify: `src/2 - parseReplayInfo/getKillsAndDeaths.ts`

### Expected combined impact of algorithmic fixes

| Optimization | Current cost | After fix |
|--------------|-------------|-----------|
| readExcludePlayer ×1.8M | 1.5–2 min | ~0 (single read) |
| globalStatistics.slice() ×1.8M | 1–2 min | ~0 (Map in place) |
| mergeOtherPlayers cloneDeep ×7.2M | 2–3 min | ~5 sec (Map merge) |
| findNameInfo Object.keys ×2.6M | 1–2 min | ~5 sec (pre-indexed) |
| unionWeaponsStatistic ×3.6M | 0.5–1 min | ~3 sec (Map merge) |
| addToResultsByWeek ×1.8M | 0.5–1 min | ~2 sec (Map lookup) |
| getReplaysGroupByRotation | 0.5–1 min | ~1 sec (filter) |
| GC pressure reduction | 1–2 min | ~10 sec |
| **Statistics total** | **~10–16 min** | **~1–2 min** |

These optimizations alone should bring statistics from ~13 min to ~1–2 min for 25K replays, making the 5-minute target achievable for 50K replays **without** statistics parallelization.

---

## 3) Async I/O Migration (Remaining)

### Current pain

`saveReplayFile` in `prepareReplaysList` still uses `fs.accessSync` + `fs.writeFileSync`.

### Design

1. `await fs.pathExists(file)` instead of `accessSync`.
2. Write to temp file + `await fs.move(tmp, final, { overwrite: true })` for atomicity.

### Code touchpoints

1. Modify: `src/jobs/prepareReplaysList/saveReplayFile.ts`

---

## 4) prepareReplaysList Early Termination

### Current pain

`prepareReplaysList` iterates all pages (currently ~150+) even when no new replays exist. Each page requires an HTTP request to `sg.zone`. On a typical 20-minute cron cycle, maybe 0-2 new replays appear — but the job still fetches all pages.

### Design

Pages on `sg.zone/replays` are ordered newest-first. If all replays on a page are already in `parsedReplays`, all subsequent (older) pages will also be known.

Algorithm change in `startFetchingReplays`:

1. For each page, after `parseReplaysOnPage`, check if `newReplays.parsedReplays.length === 0`.
2. If zero new replays found, increment a `consecutiveEmptyPages` counter.
3. If `consecutiveEmptyPages >= EARLY_STOP_THRESHOLD` (default: `3`), stop page iteration.
4. Log the early stop with page number and total pages.

The threshold of 3 (instead of 1) provides a safety margin for edge cases where a replay might be inserted out of order or a page had a transient parsing error.

### Code touchpoints

1. Modify: `src/jobs/prepareReplaysList/index.ts` (add early termination logic to page loop)
2. Optionally: add `FETCH_EARLY_STOP_PAGES` to `runtimeConfig.ts`

### Benefit

Reduces typical cron-cycle `prepareReplaysList` from ~150 HTTP requests to ~5-10.

---

## 5) Avoid Redundant Rotation Recalculation

### Current pain

Global statistics for SG are calculated from scratch **twice**: once for all-time, and once per-rotation (19 rotations × full `calculateGlobalStatistics` pass). The per-rotation passes collectively re-process the same replays as the all-time pass. With algorithmic fixes this is tolerable (each pass is fast), but it is still ~20× redundant work.

### Design

During the single all-time pass, each player update also determines which rotation(s) the replay belongs to, and updates the rotation-specific accumulator in the same loop.

```typescript
// Pseudo-code for combined pass:
for (const gameResult of replays) {
  const rotationId = getRotationId(gameResult.date);

  for (const player of gameResult.result) {
    globalAccumulator.update(player, gameResult);
    if (rotationId !== null) {
      rotationAccumulators.get(rotationId).update(player, gameResult);
    }
  }
}
```

This reduces total iterations from ~1.8M to ~900K (one pass instead of 1 + 19).

### Code touchpoints

1. Modify: `src/3 - statistics/rotations/index.ts` (integrate into single pass)
2. Modify: `src/3 - statistics/global/index.ts` (accept rotation context)
3. Remove: `src/3 - statistics/rotations/getReplaysGroupByRotation.ts` (no longer needed)

---

## 6) Async Output I/O

### Current pain

Output generation writes ~53,000 files synchronously (`writeFileSync` + `mkdirSync`). For SG with 19 rotations + 1 all-time: 20 contexts × ~2,400 files each = ~48,000 files. Plus MACE and SM: ~5,000 more. Plus zip archive. Estimated cost: **0.5–1 min**.

At 50K replays with ~30+ rotations and more unique players, output files will grow proportionally.

### Design

1. Replace `writeFileSync` with `await fs.writeFile` + bounded concurrency (`pLimit(50)`).
2. Replace `mkdirSync` with `await fs.ensureDir`.
3. Use `JSON.stringify` without pretty-printing for per-player detail files (smaller files, faster serialize).
4. Keep pretty-printing for top-level files (`global_statistics.json`, `squad_statistics.json`) for debugging readability.

### Code touchpoints

1. Modify: `src/4 - output/json.ts` (async writes with concurrency limit)
2. Modify: `src/4 - output/index.ts` (await async output)
3. Modify: `src/4 - output/rotationsJSON.ts` (async writes)

---

## 7) Statistics Parallelization via Map-Reduce (Conditional)

This section is conditional — implement only if algorithmic fixes (section 2) don't meet the 5-minute target for 50K replays. With the estimated impact table, single-threaded statistics should take ~2–4 min for 50K replays after algorithmic fixes. If measurements confirm this, skip this section.

### Design (if needed)

Split replays into N batches. Each worker builds a partial `Map<PlayerId, MutableGlobalStats>`. Main thread merges N partial maps.

#### Worker contract for statistics

Input:

- `replays: PlayersGameResult[]` (batch)
- `excludePlayers: ConfigExcludePlayer[]`
- `rotationRanges: RotationRange[]`

Output:

- `globalByPlayerId: Map<PlayerId, GlobalPlayerStatistics>`
- `rotationsById: Map<RotationId, Map<PlayerId, GlobalPlayerStatistics>>`

#### Main thread merge

For each `PlayerId` present in any partial map:

- Sum numeric fields: `kills`, `deaths`, `teamkills`, `totalPlayedGames`, `score`, etc.
- Merge `byWeeks` by `WeekNumber` key (sum fields).
- Merge `weapons`/`vehicles` by name (sum `kills`, take `max(maxDistance)`).
- Merge `killers`/`killed`/`teamkilled`/`teamkillers` by `id` (sum `count`).
- Take `max(lastPlayedGameDate)`.

#### Serialization concern

Partial accumulators must be serialized for worker→main IPC. With `Map`-based accumulators, convert to plain objects before `postMessage` and reconstruct on receipt. For 50K replays with ~1,500 unique players, each partial accumulator is ~2–5 MB — acceptable IPC overhead.

### Code touchpoints (if implemented)

1. Create: `src/3 - statistics/workers/statsWorker.ts`
2. Create: `src/3 - statistics/workers/mergePartialStats.ts`
3. Modify: `src/index.ts` (dispatch batches to workers, merge results)

---

## 8) Runtime Memory and Process Limits

### Design

1. Add `max_memory_restart: '1G'` to `ecosystem.config.cjs`.
2. Add `NODE_OPTIONS=--max-old-space-size=1024` to process env.
3. Tune based on measurements after cache and algorithmic optimizations.

### Code touchpoints

1. Modify: `ecosystem.config.cjs`

---

## Alternative Architectures Considered

### A) Only increase memory limits

Pros: trivial change.
Cons: does not fix the 13-min statistics bottleneck or redundant re-parsing.
Decision: necessary but insufficient alone.

### B) Checkpoint/resume for streaming aggregation

Pros: can resume after crash mid-run.
Cons: significant complexity (schema versioning, atomic writes, corruption handling). With replay parse cache, a restart is cheap — re-aggregation from cached results takes seconds.
Decision: deferred. Cache makes full re-runs fast enough that checkpoint/resume has low ROI.

### C) Incremental statistics (only process new replays)

Pros: minimal work per cron cycle.
Cons: requires maintaining serialized aggregator state across runs. Name changes, exclude player list changes, or corrections would require full re-aggregation anyway. Complex invalidation logic.
Decision: deferred. Cache + algorithmic fixes should bring full re-aggregation under 5 minutes. Revisit only if 100K+ replays become a target.

### D) Statistics parallelization (Map-Reduce) as first step

Pros: multi-core for statistics immediately.
Cons: does not fix per-call algorithmic waste — parallelizing slow code gives linear speedup but leaves quadratic algorithms in place. With 8 cores, 13 min → ~2 min, but algorithmic fixes alone achieve the same without complexity.
Decision: conditional. Implement only if algorithmic fixes don't meet the target after measurement.

---

## Migration Plan (Phased)

### Phase 1: Statistics Algorithmic Overhaul (highest impact)

This phase alone should reduce statistics from ~13 min to ~1–2 min for 25K replays.

1. Cache `excludePlayers` once (2.1).
2. Mutable `Map<PlayerId, Stats>` accumulator — eliminates `slice()` + `findIndex` (2.2).
3. Replace `mergeOtherPlayers` `cloneDeep` + `findIndex` with direct mutation or Map merge (2.3).
4. Replace `unionWeaponsStatistic` `slice` + `findIndex` with Map merge (2.4).
5. Replace `addToResultsByWeek` `slice` + `findIndex` with Map lookup (2.5).
6. Pre-index `findNameInfo` with Map (2.6).
7. Replace `getReplaysGroupByRotation` `cloneDeep` with filter (2.7).

Success criteria:

1. All unit tests pass.
2. Statistics for 25K replays completes in under 2 minutes.
3. Output is byte-identical to pre-optimization run.

### Phase 2: Replay Parse Cache

1. Add `parsedCachePath` to paths and `basicPaths`.
2. Implement cache read/write in worker.
3. Add `PARSE_CACHE_VERSION` constant.
4. Verify output equivalence with golden test.

Success criteria:

1. Second parse run (cache warm) completes parsing stage in under 30 seconds.
2. Output is byte-identical to non-cached run.
3. All existing tests pass.

### Phase 3: Single-Pass Rotation Accumulation

1. Combine all-time and per-rotation statistics into one loop (section 5).
2. Remove `getReplaysGroupByRotation`.

Success criteria:

1. Statistics for 25K replays completes in under 1 minute.
2. Output is identical to pre-optimization.

### Phase 4: prepareReplaysList Optimizations

1. Early termination on consecutive empty pages (section 4).
2. Async I/O in `saveReplayFile` (section 3).

Success criteria:

1. Typical cron-cycle `prepareReplaysList` completes in under 30 seconds.
2. All tests pass.

### Phase 5: Async Output + Memory Tuning

1. Async output I/O with bounded concurrency (section 6).
2. Set PM2 and Node memory limits (section 8).
3. Measure full pipeline at 25K replays.

Success criteria:

1. Full pipeline (parse + statistics + output) for 25K replays under 3 minutes.
2. No OOM/restart.

### Phase 6: 50K Validation and Conditional Parallelization

1. Run full pipeline at 50K replays, measure.
2. If under 5 minutes — done.
3. If over 5 minutes — implement statistics Map-Reduce (section 7).

Success criteria:

1. 50K replays with total time under 5 minutes.
2. Predictable runtime (variance ≤ 20% across 3 runs).

---

## Observability Changes

Add structured logs for:

1. Stage start/end with duration (parsing, statistics, output — each separately).
2. Cache hit/miss ratio per run.
3. Replay counters: total/cached/parsed/skipped/failed.
4. Statistics timing breakdown: global accumulation, rotation processing, finalization, squad stats.
5. Memory snapshots (`rss`, `heapUsed`) at run start/end and between stages.
6. `prepareReplaysList` early termination: at which page, how many pages skipped.
7. Output file count and write duration.

## Testing Strategy

1. Unit tests:
   - cache read/write/invalidation,
   - Map-based accumulator consume/finalize invariants,
   - Map-based merge helpers (mergeOtherPlayers, unionWeaponsStatistic),
   - entity/vehicle Map indexing,
   - pre-indexed namesList lookup.
2. Regression tests:
   - golden output compare "optimized vs original" on fixed dataset.
   - golden output compare "cached vs fresh" on fixed dataset.
3. Cache correctness:
   - version bump triggers full re-parse.
   - deleted cache file triggers re-parse for that replay only.

## Risks and Mitigations

1. Risk: statistics output diverges after algorithmic refactors.
   Mitigation: golden tests comparing byte-identical output at each phase. Run both old and new code paths on same input.
2. Risk: cached result diverges from fresh parse after code change without version bump.
   Mitigation: CI check that `PARSE_CACHE_VERSION` is bumped when `src/2 - parseReplayInfo/**` files change. Golden tests.
3. Risk: cache disk usage at 50K replays.
   Mitigation: cache files are small (~2–5 KB each). 50,000 replays ≈ 100–250 MB total. Acceptable.
4. Risk: Map-based accumulators produce different sort/limit results due to insertion order.
   Mitigation: finalization step sorts deterministically by `totalScore`/`totalPlayedGames`/`kills`. Order-independence is verified by golden tests.
5. Risk: future corrections mechanism adds complexity to cache invalidation.
   Mitigation: design corrections as a layer on top of cache (not inside it). Cache stores clean parse results; corrections are applied separately.

## Open Questions

1. Does `parseReplayInfo` call `getPlayerId` (name resolution), or is that done downstream in statistics? This determines whether `nameChanges.csv` affects cache validity.
2. What is the preferred stage for replay corrections: pre-parse (patch raw data), post-parse (patch result), or post-statistics (patch aggregated stats)?
3. What is the CPU/RAM profile of the production host (cores, memory)?
4. How many rotations will exist at 50K replays? (Currently 19 — each new rotation adds ~proportional overhead to statistics.)

## Decision

Recommended approach, prioritized by impact:

1. **Statistics algorithmic overhaul** (Phase 1) — targets the dominant 72% bottleneck. Estimated improvement: 13 min → 1–2 min for 25K replays.
2. **Replay parse cache** (Phase 2) — eliminates redundant parsing on cron cycles. Estimated improvement: 5 min → <30 sec for cached runs.
3. **Single-pass rotation accumulation** (Phase 3) — further reduces statistics by ~50%.
4. **Output async I/O** (Phase 5) — modest improvement but removes sync I/O blocking.
5. **Statistics parallelization** (Phase 6, conditional) — only if prior phases don't meet the 5-min target for 50K.

Expected total pipeline times:

| Scale | Current | After Phase 1+2 | After Phase 3+5 |
|-------|---------|-----------------|-----------------|
| 25K replays | 18 min | ~2–3 min | ~1.5–2 min |
| 50K replays | ~36 min (projected) | ~4–6 min | ~3–4 min |
