# Worker Pool for Replay Parsing (Phase 1) Design

## Status

Approved in chat on February 15, 2026.

## Context

The current replay parsing path executes CPU-heavy `parseReplayInfo` in the main thread with `p-limit` concurrency. This gives pseudo-parallelism but not real multi-core scaling.  
Target is to implement the first high-impact optimization from the scaling plan: move replay parsing to a worker pool.

## Scope

In scope:

1. Worker pool for replay parsing (`sg`, `mace`, `sm`).
2. Replacement of CPU-side `p-limit` in replay parsing.
3. Stable message contract with explicit statuses.
4. Error behavior aligned with current business behavior (failed replay is skipped, run continues).

Out of scope:

1. Streaming statistics aggregation.
2. Retry policy.
3. Feature-flag fallback to legacy single-thread parser.

## Decisions

1. Use one shared worker pool for the entire run, not a separate pool per game type.
2. Worker pool is worker-only mode (no runtime fallback to legacy parser).
3. Workers read replay JSON from disk by `filename` (main thread does not send full JSON payload).
4. Worker result statuses are explicit: `success`, `skipped`, `error`.
5. Replay-level errors do not stop the run; they are logged and skipped.
6. Remove `pLimit` from `parseReplays` CPU parsing path.

## Alternatives Considered

1. Spawn-per-replay workers.
   Rejected due to high thread startup overhead.
2. Separate worker pool per game type.
   Rejected due to CPU oversubscription (`WORKER_COUNT * 3`) and unstable scheduling.
3. Keep `p-limit` + main-thread parsing.
   Rejected because it does not provide real multi-core speedup.

## Architecture

### Components

1. `src/1 - replays/workers/parseReplayWorker.ts`
   - Accepts parse task.
   - Reads `raw_replays/<filename>.json`.
   - Runs `parseReplayInfo`.
   - Applies `mace` minimum players rule.
   - Sends structured result back.

2. `src/1 - replays/workers/workerPool.ts`
   - Creates fixed number of workers (`WORKER_COUNT`).
   - Manages FIFO queue and in-flight tasks.
   - Resolves task promises by `taskId`.
   - Handles worker crashes and task rejection.

3. `src/1 - replays/parseReplays.ts`
   - Submits replay tasks to shared pool.
   - Collects results.
   - Keeps only `success` payloads.
   - Logs `error`.
   - Ignores `skipped`.
   - Returns date-ordered `PlayersGameResult[]`.

4. `src/index.ts`
   - Creates one shared pool for whole parse run.
   - Reuses it across `sg`, `mace`, `sm`.
   - Destroys pool in `finally`.

5. `src/0 - utils/runtimeConfig.ts`
   - Adds `WORKER_COUNT` config with safe clamp/default.

## Message Contract

Main thread -> worker task:

1. `taskId: string`
2. `filename: string`
3. `date: string`
4. `missionName: string`
5. `gameType: GameType`

Worker -> main thread result:

1. Success:
   - `{ taskId, status: 'success', data: PlayersGameResult }`
2. Skipped:
   - `{ taskId, status: 'skipped', reason: 'mace_min_players' | 'empty_replay', filename }`
3. Error:
   - `{ taskId, status: 'error', error: { message: string; stack?: string; filename: string } }`

## Data Flow

1. `startParsingReplays` creates shared `WorkerPool`.
2. `getParsedReplays(gameType)` loads replay list as before.
3. `parseReplays` submits each replay as task to pool.
4. Worker parses and returns `success` / `skipped` / `error`.
5. Main thread aggregates successful results and sorts by `date`.
6. After all game types finish, shared pool is terminated.

## Error Handling and Stability

1. JSON read failure inside worker returns `status: 'error'`.
2. Parsing failure inside worker returns `status: 'error'`.
3. `mace` replay with fewer than 10 players returns `status: 'skipped'`.
4. Worker process crash rejects that worker's in-flight tasks as `error`.
5. Parse run continues unless an unrecoverable orchestration error occurs.

## Testing Strategy

1. Unit tests for worker message mapping:
   - `success`, `skipped`, `error`.
2. Unit tests for pool scheduling:
   - Queue dispatch and task resolution by `taskId`.
3. Integration-level tests for `parseReplays`:
   - Output format unchanged.
   - Date ordering unchanged.
   - Replay-level errors do not fail whole run.
   - `mace` skip logic preserved.

## Expected Impact

1. Real CPU parallelism for replay parsing.
2. Better throughput on multi-core hosts for 1000-5000 replay workloads.
3. Lower event-loop contention compared to high-concurrency main-thread parsing.

## Risks

1. Added concurrency complexity in worker lifecycle code.
2. Potential mismatch between worker output and current parser behavior.
3. Worker crash edge cases affecting task bookkeeping.

## Mitigations

1. Keep worker contract minimal and explicit.
2. Preserve current business rules and output format.
3. Add focused tests for lifecycle and error cases before rollout.
