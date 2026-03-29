# Architecture Patterns

**Domain:** Replay parsing/statistics pipeline modernization
**Researched:** 2026-03-29

## Recommended Architecture

The right target architecture is a **single-host control plane + file-backed data plane**.

Do not jump to a distributed queue, workflow platform, or database-first rewrite. This repository already has the correct durable artifacts and output contract in `~/sg_stats`: raw replays, replay list snapshots, parsed/cache files, and published results. The missing piece is a **durable orchestration state model** that can coordinate continuous work, throttling, retries, corrections, and safe publication without relying on brittle cron timing.

Recommended structure:

```text
sg.zone / relay
  -> Discovery Controller
  -> Replay Catalog + Request Budget Store
  -> Download Queue
  -> Raw Replay Store (existing file-backed contract)
  -> Parse Queue
  -> Parsed Replay Cache + Correction Overlay
  -> Statistics Builder
  -> Staging Publisher
  -> Atomic Publish Boundary
  -> results/ + parsing_status.json
```

### Architectural Direction

1. Keep **payloads and published artifacts** on disk:
   - `raw_replays/`
   - `parsed_cache/`
   - `results/`
   - staging/output temp directories
2. Add a small **durable metadata/control store** for orchestration state:
   - replay catalog
   - discovery cursors
   - run records
   - parse/cache version state
   - correction metadata
   - publish locks and last successful commit markers
3. Split the runtime into two lanes:
   - **Network-bound lane:** replay discovery and raw download, globally rate-limited and backoff-aware
   - **CPU-bound lane:** parsing and statistics, driven by idempotent work items and versioned caches
4. Move from cron-coupled batch windows to a **continuous supervisor loop** with explicit sleep/backoff states.

This is the lowest-risk modernization because it preserves current output semantics while fixing the actual architectural failures: weak run state, weak throttling control, no correction layering, and large recomputation boundaries.

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Continuous Supervisor | Long-lived process owner. Starts loops, acquires singleton lease, reacts to success/failure/rate-limit state. | Run store, all controllers |
| Run/Lease Manager | Prevent overlapping active runs, persist run lifecycle, expose last successful publish and in-progress stage. | Supervisor, Publisher, workers |
| Discovery Controller | Decides when to do incremental page refresh vs full sweep, maintains cursors and freshness rules. | Request budget store, replay catalog, downloader |
| Request Budget / Throttler | Enforces `<= 15 replay-list requests/min`, cooldowns after 429/Cloudflare, jitter, and source-specific concurrency. | Discovery Controller |
| Replay Catalog | Durable canonical metadata for each replay: link, filename, mission, dates, status, discovery source, first/last seen. | Discovery, Downloader, Parse Planner, Publisher |
| Raw Downloader | Fetches replay card and raw JSON idempotently, validates payload size/basic shape, stores raw file, updates catalog state. | Replay Catalog, raw store |
| Parse Planner | Computes which replays need parsing or re-parsing based on new raw files, cache version bumps, or corrections. | Replay Catalog, cache store, correction store |
| Parse Worker Pool | CPU-bound replay parsing only. Reads raw files or cache, emits replay-level parsed results or skip/error records. | Parse Planner, parsed cache |
| Parsed Cache Store | Versioned per-replay parse result store. Holds parse output independent from statistics. | Parse Planner, Parse Worker Pool, Statistics Builder |
| Correction Overlay Store | Stores replay-specific corrections as layered overrides, invalidations, or metadata patches. | Parse Planner, Statistics Builder |
| Statistics Builder | Builds aggregate datasets from effective replay results in deterministic order. Owns global/squad/rotation outputs. | Parsed cache, corrections, staging publisher |
| Snapshot Builder | Produces an immutable run snapshot manifest: input replay set, versions, correction set, timestamps. | Replay Catalog, Statistics Builder, Publisher |
| Staging Publisher | Writes outputs to a fresh staging directory, verifies completeness, archives if needed. | Snapshot Builder, results store |
| Publish Switch | Performs final publish only after staging is complete and validated; updates committed parsing status after publish. | Run/Lease Manager, Staging Publisher |
| Observability/Recovery | Structured logs, counters, per-stage timings, dead-letter/problematic replay lists, operator-facing health markers. | All components |

## Data Flow

### Direction

```text
External HTML/JSON
  -> discovery state
  -> replay catalog
  -> raw replay files
  -> parse planning
  -> parsed replay cache
  -> correction overlay
  -> effective replay result stream
  -> aggregate statistics
  -> staged output snapshot
  -> committed published results
```

### Detailed Flow

1. **Supervisor boot**
   - Acquire singleton lease.
   - Recover any unfinished run state.
   - Resume loops from durable cursors instead of starting blind.

2. **Discovery cycle**
   - Run a lightweight incremental refresh frequently.
   - Run a full replay-list sweep every 6 hours.
   - Persist page cursors, replay-page freshness timestamps, and ban/cooldown state.

3. **Catalog update**
   - Upsert replay metadata into a canonical replay catalog.
   - Mark replay states such as `discovered`, `raw_missing`, `raw_ready`, `parse_needed`, `parsed`, `corrected`, `problematic`.

4. **Raw acquisition**
   - Download replay-card details and raw JSON only when catalog says they are missing or stale.
   - Write raw payload to disk first, then mark catalog row `raw_ready`.

5. **Parse planning**
   - Compare each replay against parse cache version, raw file fingerprint/mtime, and correction state.
   - Create a bounded list of replay parse tasks.

6. **Replay parsing**
   - Worker pool handles only CPU-heavy parse logic.
   - Cache hits bypass parse CPU.
   - Cache misses produce versioned parse entries.

7. **Correction layering**
   - Do not mutate raw payloads or overwrite clean cache entries for operator corrections.
   - Build an effective replay result as:
     - `effective = base parsed cache + correction overlay`
   - Use invalidation only when a correction truly requires re-parsing.

8. **Statistics build**
   - Read effective replay results in stable date order.
   - Build mutable internal accumulators keyed by player/replay/rotation.
   - Only materialize final arrays/JSON at the end.

9. **Snapshot + publish**
   - Build a run manifest with replay set, cache version, correction version, and source snapshot timestamp.
   - Write outputs to a fresh staging dir.
   - Validate completeness.
   - Swap publish pointer/directory only after validation succeeds.
   - Commit `parsing_status.json` only after publish succeeds.

## Patterns to Follow

### Pattern 1: Control Plane vs Data Plane
**What:** Keep large immutable payloads and outputs on disk, but move orchestration metadata into a durable store.
**When:** Immediately. This is the foundational architecture change.
**Why:** The current file-only state model is too weak for safe continuous operation. Replay catalog state, leases, cooldowns, and run records are relational metadata, not payloads.
**Recommendation:** Use a local SQLite control database on the same host.

Why SQLite here:

1. Single-host scope matches project constraints.
2. It adds transactional state without forcing a service dependency.
3. SQLite WAL mode is designed for better concurrency, where readers do not block writers and writers do not block readers, with application-managed checkpointing available when needed. This fits a local control plane well.

**Suggested tables:**

```text
runs
leases
replays
replay_discovery_pages
download_attempts
parse_tasks
parse_cache_index
corrections
publish_history
problem_replays
request_budget_events
```

### Pattern 2: Continuous Supervisor, Not Cron-Coupled Stage Handoffs
**What:** Replace independent cron jobs with one long-running supervisor process containing explicit loops.
**When:** Before adding more orchestration logic.
**Why:** The current scheduler correctness depends on job timing and manual temp cleanup. Continuous loops make backpressure, cooldowns, and catch-up behavior explicit.

Recommended loop split:

1. `discoveryLoop`
2. `downloadLoop`
3. `parseLoop`
4. `publishLoop`
5. `maintenanceLoop`

Each loop should:

1. read durable state
2. claim a bounded batch
3. process idempotently
4. persist state transition
5. sleep with jitter/backoff

Cron can remain only as an outer watchdog that ensures the supervisor is running.

### Pattern 3: Global Request Budget With Adaptive Cooldown
**What:** Centralize replay-list and replay-page request decisions behind a single budget manager.
**When:** Before increasing discovery concurrency.
**Why:** The anti-ban requirement is architectural, not just a retry setting.

Required behavior:

1. Hard-cap replay-list page fetches at `15/min`.
2. Separate budgets for:
   - replay-list index pages
   - replay detail pages
   - raw JSON downloads
3. If Cloudflare/429 occurs:
   - record the event durably
   - put the source into cooldown
   - stop issuing matching requests until cooldown expires
4. Use jitter and backoff, not fixed immediate retries.

This is where a queue abstraction is useful. BullMQ’s docs are a good reference for the pattern: rate limiting can be global across workers, and workers can manually rate-limit after an upstream throttling response. The exact implementation does not need BullMQ if Redis is undesirable; the architectural property is what matters.

### Pattern 4: Replay Catalog as the Source of Operational Truth
**What:** Promote replay identity/state into a catalog instead of deriving operational state from a single mutable `replaysList.json`.
**When:** Early.
**Why:** Continuous operation needs replay-level transitions and targeted recovery.

Canonical replay identity:

1. `replayLink`
2. `filename` once known
3. `missionName`
4. `date`
5. `sourceSeenAt`
6. `rawStatus`
7. `parseStatus`
8. `effectiveVersion`

`replaysList.json` should become a **derived export** from the catalog for compatibility, not the system of record.

### Pattern 5: Replay-Level Idempotency
**What:** Every stage should be safe to retry for one replay without corrupting global state.
**When:** Across downloader, parser, and corrections.
**Why:** Continuous systems survive by replay-level reprocessing, not by rerunning everything.

Rules:

1. Raw download is idempotent by replay identity + content/fingerprint.
2. Parse cache is idempotent by replay filename + parse schema version.
3. Statistics inputs are idempotent by effective replay result version.
4. Publish is idempotent by run snapshot manifest hash.

### Pattern 6: Layered Corrections
**What:** Treat corrections as a separate overlay store, not edits to raw files or silent cache rewrites.
**When:** Before correction rollout.
**Why:** Corrections are operational policy and audit history, not parser truth.

Correction layers:

1. `invalidate_parse`
2. `patch_parsed_result`
3. `exclude_replay`
4. `metadata_override`

Processing order:

```text
raw replay
  -> parsed cache
  -> correction overlay
  -> effective replay result
  -> statistics
```

This preserves auditability and lets operators remove or amend corrections without losing the original parsed artifact.

### Pattern 7: Cache Versioning by Boundary
**What:** Version caches separately for parser logic, correction model, and statistics schema.
**When:** Before aggressive cache use.
**Why:** One global “clear all caches” flag is too blunt once the system runs continuously.

Recommended versions:

1. `raw_schema_version`
2. `parse_cache_version`
3. `correction_schema_version`
4. `stats_schema_version`
5. `publish_contract_version`

Replay effective version can be derived from:

```text
hash(raw fingerprint, parse_cache_version, correction revision)
```

Statistics snapshot version can be derived from:

```text
hash(input replay set, effective replay versions, stats_schema_version)
```

### Pattern 8: CPU Workers Only for CPU Work
**What:** Keep worker threads focused on replay parse and possibly map-reduce style statistics chunks.
**When:** During throughput work.
**Why:** Node’s official docs are explicit: worker threads help CPU-intensive JavaScript, not I/O-heavy work, and worker pools should be reused instead of spawning per task.

So:

1. discovery/download stays async I/O on the main runtime lane
2. parsing stays in a shared worker pool
3. statistics can later add a second worker-pool stage only after accumulator redesign removes current algorithmic waste

### Pattern 9: Immutable Staging + Safe Publish
**What:** Build results in a new staging directory, validate, then publish via a same-volume rename/swap sequence.
**When:** Before introducing continuous publishing.
**Why:** Current delete-then-move behavior can remove the last good results before the new set is ready.

Publish rules:

1. Never delete the current published tree first.
2. Write to `results_staging/<run-id>/`.
3. Validate expected files and manifests.
4. Switch published directory pointer with rename-based swap on the same filesystem.
5. Keep one previous snapshot for rollback.
6. Only after the switch succeeds, update committed `parsing_status.json`.

Inference from Node filesystem semantics: a rename-based same-filesystem publish boundary is the right primitive here; it is much safer than the current remove-then-move sequence.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Keep Cron As the Real State Machine
**What:** More cron entries, sleeps, and “wait until the other job finishes” logic.
**Why bad:** It hides state transitions in timing rather than data. Recovery becomes guesswork.
**Instead:** One supervisor with persisted run state and explicit loops.

### Anti-Pattern 2: Let `replaysList.json` Remain the Operational Database
**What:** Store replay lifecycle, cursor state, error state, and freshness solely inside one large JSON file.
**Why bad:** Poor concurrency, weak recovery semantics, expensive rewrites, no targeted claiming.
**Instead:** Use a catalog store and export compatibility JSON from it.

### Anti-Pattern 3: Bake Corrections Into Raw Files
**What:** Edit raw replay JSON or overwrite cached parse files with operator fixes.
**Why bad:** Destroys provenance and makes parser fixes indistinguishable from manual interventions.
**Instead:** Layer corrections after base parse and record revision history.

### Anti-Pattern 4: Recompute Full Statistics for Every Small Change Forever
**What:** Trigger a full end-to-end rebuild after every newly discovered replay once volume grows.
**Why bad:** Wastes CPU and raises publish frequency risk.
**Instead:** First build replay-level caching and replay catalog state. Then decide whether to keep full rebuild snapshots or introduce incremental aggregate maintenance for only the hottest outputs.

### Anti-Pattern 5: Use Worker Threads for Network Scheduling
**What:** Move discovery/download into workers.
**Why bad:** It burns complexity without solving the bottleneck. The network lane is throttling-bound, not CPU-bound.
**Instead:** Keep I/O async, centralized, and budget-controlled.

## Continuous Loop Runtime vs Cron

### Recommended Runtime Model

Use a **continuous daemon with internal loops**.

Cron should only do one of these:

1. ensure the process is running
2. restart it if it exits
3. launch a rare maintenance task if truly separate

Do not use cron as the normal handoff between discovery and parse anymore.

### Why

1. Discovery must react to cooldown windows and budget exhaustion, not wall-clock minute boundaries.
2. Parsing should start as soon as durable work exists, not when a future cron slot arrives.
3. Publish should depend on snapshot readiness, not job ordering luck.

### Minimal Loop Policy

1. `discoveryLoop`: frequent incremental refresh, full sweep every 6h
2. `downloadLoop`: drain raw-missing tasks within budget
3. `parseLoop`: drain parse-needed tasks continuously
4. `publishLoop`: coalesce work and publish on stable boundaries
5. `maintenanceLoop`: checkpoint SQLite, compact caches, rotate logs, prune stale staging dirs

## Throttling Model

### Required Policy

1. Replay-list requests: hard cap `15/min`
2. Replay detail page requests: low bounded concurrency
3. Raw JSON downloads: separate bounded concurrency
4. Backoff on Cloudflare/429 with durable cooldown state
5. Add jitter to avoid mechanical cadence

### Discovery Strategy

Use a two-tier discovery plan:

1. **Hot path**
   - refresh page 1 and a small recent-page window frequently
   - stop once pages are unchanged or older than current frontier
2. **Cold path**
   - full sweep every 6 hours
   - reconcile missing/problematic rows and historical drifts

This is materially safer than repeatedly crawling every page and still converges on correctness.

## Correction Layering

### Recommended Model

Corrections should be stored as durable records with:

1. replay identity
2. correction type
3. payload
4. author/source
5. created-at
6. supersedes/revision pointer

### Application Order

1. Load base parsed cache.
2. Apply replay exclusion if configured.
3. Apply parsed-result patch if present.
4. Emit effective replay result.
5. Mark statistics snapshot with correction revision used.

### When to Invalidate Cache

Invalidate only if the correction changes something that belongs in parse semantics:

1. entity mapping
2. player attribution before aggregation
3. event interpretation rules

For output-only or aggregation-only overrides, do not reparse.

## Cache and Versioning Notes

### Replay-Level Cache

Keep per-replay cached parse artifacts on disk. Maintain an index in the control store so planning queries are cheap.

Cache metadata should track:

1. filename
2. parse version
3. raw fingerprint
4. produced-at
5. status: success/skipped/error
6. effective correction revision if materialized

### Statistics Snapshot Cache

Do not start with fine-grained incremental aggregate mutation as phase 1. It increases correctness risk.

Safer sequence:

1. add replay-level parse cache
2. redesign statistics internals to use mutable maps and no repeated sync I/O
3. publish full snapshots from cached replay inputs
4. only then evaluate incremental aggregate caching if rebuild cost is still too high

## Publish Safety

### Required Boundary

Published outputs must always satisfy one of these states:

1. previous complete snapshot
2. next complete snapshot

Never “half new, half missing”.

### Recommended Publish Steps

1. Build `run-manifest.json` in staging.
2. Write all output files.
3. Verify manifest and expected file set.
4. Optionally archive.
5. Rename current `results` to `results_prev`.
6. Rename staging snapshot to `results`.
7. Write committed `parsing_status.json`.
8. Remove old rollback snapshot after retention window.

If step 6 fails, the previous snapshot still exists.

## Suggested Build Order With Dependencies

1. **Introduce durable control plane**
   - Build: SQLite control DB, leases, runs, replay catalog tables
   - Depends on: nothing
   - Why first: every other improvement needs durable state

2. **Replace cron coupling with continuous supervisor**
   - Build: singleton runtime, loops, sleep/backoff, stage ownership
   - Depends on: control plane
   - Why second: stops timing-based fragility early

3. **Implement request budget and safer discovery**
   - Build: throttler, incremental recent-page refresh, 6h full sweep, cooldown logic
   - Depends on: control plane, supervisor
   - Why third: external risk reduction is a project priority

4. **Promote replay catalog and compatibility export**
   - Build: canonical replay state model and `replaysList.json` exporter
   - Depends on: control plane, discovery
   - Why fourth: parsing/planning should stop depending on ad hoc JSON mutations

5. **Add replay-level parse planning and cache indexing**
   - Build: parse task planner, cache metadata, version invalidation rules
   - Depends on: replay catalog
   - Why fifth: unlocks continuous parse throughput without full rescans

6. **Add correction overlay model**
   - Build: correction store, effective replay result composition, targeted invalidation
   - Depends on: parse cache index, replay catalog
   - Why sixth: must be designed before more caching assumptions harden

7. **Redesign statistics internals for throughput**
   - Build: map-based mutable accumulators, one-time config loading, better rotation grouping, async output writes
   - Depends on: parse cache and correction-effective result stream
   - Why seventh: biggest throughput gain after orchestration safety is in aggregation

8. **Harden staged publishing**
   - Build: staging manifests, validation, rename-based publish swap, rollback snapshot
   - Depends on: snapshot builder
   - Why eighth: publishing must become safe before continuous high-frequency operation

9. **Only then consider incremental aggregate updates or parallel statistics**
   - Build: map-reduce stats workers or partial snapshot updates
   - Depends on: corrected replay stream, stable publish semantics, optimized accumulators
   - Why last: otherwise complexity lands on top of unstable foundations

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Replay discovery pressure | Current host easily handles it | Needs strict budget and recent-page strategy | Upstream source risk dominates; multi-host adds little unless acquisition source changes |
| Parse throughput | Existing worker pool is enough | Replay cache + planning becomes essential | Single-host CPU/disk limits emerge; shard only after local architecture is clean |
| Statistics cost | Full rebuild acceptable | Hot-path redesign required | May need chunked map-reduce or incremental aggregate maintenance |
| Operational recovery | Manual reruns still tolerable | Durable run state becomes necessary | Without formal control plane, incidents become opaque and expensive |
| Publish safety | Occasional manual recovery possible | Atomic snapshot publish required | Snapshot manifests and rollback retention become mandatory |

## Roadmap Implications

1. The first roadmap phases should be **state/control-plane work**, not parser micro-optimizations.
2. Anti-ban discovery changes belong **before** scaling discovery concurrency.
3. Correction support should land **before** statistics caching becomes more sophisticated.
4. Statistics parallelization should be delayed until after:
   - replay-level caching
   - accumulator redesign
   - publish hardening
5. Output contract preservation is easiest if:
   - `raw_replays/`, `results/`, and compatibility `replaysList.json` stay in place
   - internal orchestration state moves elsewhere

## Confidence

**Overall:** HIGH for the control-plane/data-plane split, continuous-loop runtime, throttled discovery model, correction layering, and publish safety ordering.

**Lower-confidence edge:** whether the control plane should be SQLite or Redis-backed queue primitives in the first milestone. Recommendation remains SQLite-first because the project is explicitly single-host and file-backed today; adding Redis/BullMQ now would solve less than it adds operationally.

## Sources

- Project architecture and constraints:
  - `docs/architecture.md`
  - `.planning/PROJECT.md`
  - `.planning/codebase/ARCHITECTURE.md`
  - `.planning/codebase/CONCERNS.md`
  - `docs/plans/2026-02-15-replay-parser-scaling-1000-5000-design.md`
- SQLite WAL docs: https://www.sqlite.org/wal.html
- Node.js worker threads docs: https://nodejs.org/api/worker_threads.html
- BullMQ rate limiting docs: https://docs.bullmq.io/guide/rate-limiting
- BullMQ deduplication docs: https://docs.bullmq.io/guide/jobs/deduplication
