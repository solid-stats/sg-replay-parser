# Codebase Concerns

**Analysis Date:** 2026-03-29

## Tech Debt

**Problematic replay cleanup rewrites the pre-cleanup state:**
- Issue: `processProblematicReplays()` mutates `newResult.parsedReplays` and `newResult.replays`, then replaces `newResult` with `{ ...result, problematicReplays }`, which restores the original arrays and drops the removals.
- Files: `src/jobs/prepareReplaysList/utils/problematicReplays.ts`, `src/jobs/prepareReplaysList/index.ts`
- Impact: Replays with empty filenames remain in the persisted replay list even after the cleanup pass, so follow-up checks and manual triage operate on inconsistent state.
- Fix approach: Build the cleaned arrays once from the mutated working copy, or return a new object derived from `newResult` instead of `result`.

**Operational code still relies on synchronous filesystem I/O in hot paths:**
- Issue: replay fetching, parsing status commits, config reads, and output generation use `readFileSync`, `writeFileSync`, `accessSync`, `mkdirSync`, `moveSync`, and `removeSync` directly.
- Files: `src/jobs/prepareReplaysList/index.ts`, `src/jobs/prepareReplaysList/saveReplayFile.ts`, `src/0 - utils/parsingStatus.ts`, `src/4 - output/index.ts`, `src/4 - output/json.ts`, `src/jobs/updateNameChangesCsv/index.ts`
- Impact: The scheduler and replay-list builder block the main thread during disk-heavy work, which increases latency and makes runtime behavior more brittle under large replay batches.
- Fix approach: Move hot-path file operations to async `fs-extra` APIs and keep sync I/O only for process bootstrap.

## Known Bugs

**Teamkiller aggregation appends into the wrong collection:**
- Symptoms: when a non-suicide teamkill is processed, the killed player's `teamkillers` array is merged with the current `killers` array instead of the existing `teamkillers` array.
- Files: `src/2 - parseReplayInfo/getKillsAndDeaths.ts`
- Trigger: any replay event where `killer.side === killed.side` and `killer.id !== killed.id`.
- Workaround: none in runtime; the parser must be fixed to merge against `teamkillers`.

**Replay-list integrity check can log an error without fixing the underlying mismatch:**
- Symptoms: `checks()` only logs when `replays.length !== parsedReplays.length`; it does not fail the job or repair the snapshot.
- Files: `src/jobs/prepareReplaysList/utils/checks.ts`, `src/jobs/prepareReplaysList/index.ts`
- Trigger: any replay-list inconsistency, including the `problematicReplays` cleanup bug.
- Workaround: inspect `~/sg_stats/lists/replaysList.json` manually and rerun the fetch job after correcting the source issue.

## Security Considerations

**External data is trusted with minimal validation before persistence and parsing:**
- Risk: downloaded replay JSON and the Google Sheets CSV are written to disk and consumed without schema validation or content-size checks.
- Files: `src/jobs/prepareReplaysList/saveReplayFile.ts`, `src/1 - replays/workers/parseReplayWorker.ts`, `src/jobs/updateNameChangesCsv/index.ts`
- Current mitigation: request timeouts and retries exist in `src/0 - utils/request.ts`; relay requests are restricted to `https://sg.zone` in `src/0 - utils/getProxiedRequest.ts`.
- Recommendations: validate upstream payload shape before saving or parsing, cap accepted payload size, and fail closed on malformed config data instead of silently continuing.

## Performance Bottlenecks

**Replay discovery is serialized per page:**
- Problem: `parseReplaysOnPage()` wraps every row task in `pLimit(1)`, so replay-card parsing and raw replay downloads run one at a time.
- Files: `src/jobs/prepareReplaysList/parseReplaysOnPage.ts`, `src/jobs/prepareReplaysList/parseReplay.ts`, `src/jobs/prepareReplaysList/saveReplayFile.ts`
- Cause: per-row concurrency is hardcoded to `1`, and `saveReplayFile()` adds synchronous existence checks and writes.
- Improvement path: make row concurrency configurable, keep Cloudflare handling at the request layer, and switch file writes to async APIs.

**Per-event parsing rebuilds lookup structures repeatedly:**
- Problem: `getEntities()` does `entities.find(...)` for every `connected` event, and `getKillsAndDeaths()` rebuilds `vehiclesByName` from `Object.values(entities)` on every kill event.
- Files: `src/2 - parseReplayInfo/getEntities.ts`, `src/2 - parseReplayInfo/getKillsAndDeaths.ts`
- Cause: lookup maps are recomputed inside event loops instead of once per replay.
- Improvement path: precompute `entitiesById` and `vehiclesByName` once before iterating events.

## Fragile Areas

**Final result publication is non-atomic from the consumer perspective:**
- Files: `src/4 - output/index.ts`
- Why fragile: `generateOutput()` deletes `resultsPath` before moving `temp_results` into place. If archiving or the move fails after removal, the previous published results are gone.
- Safe modification: keep the current temp directory workflow, but replace the final publish step with an atomic directory swap or a backup-and-rename sequence.
- Test coverage: output code is excluded from Jest coverage in `jest.config.js`.

**Scheduler correctness depends on manual cleanup and timing interactions:**
- Files: `src/schedule.ts`, `src/index.ts`, `src/0 - utils/parsingStatus.ts`
- Why fragile: the parse cron removes `temp_results` before `startParsingReplays()`, the parser empties it again, and the only persisted run marker is `parsing_status.json` written after a full successful output cycle.
- Safe modification: keep a single owner for temp directory lifecycle and persist a richer run state before long-running parse work starts.
- Test coverage: `src/schedule.ts` is excluded from coverage thresholds in `jest.config.js`, even though there is a targeted test file at `src/!tests/unit-tests/schedule.test.ts`.

## Scaling Limits

**Storage growth is bounded only by local disk capacity:**
- Current capacity: runtime data is stored under `~/sg_stats`, with raw replays in `~/sg_stats/raw_replays` and no retention or pruning logic.
- Limit: long-running deployments accumulate replay JSON, logs, and generated archives until the host filesystem fills up.
- Scaling path: add retention policies for raw replays and logs, and move large artifacts to managed object storage if the dataset keeps growing.

**Parsing throughput is limited to a single host:**
- Current capacity: one process uses `WORKER_COUNT` clamped to `1..64` and reads all inputs from the local filesystem.
- Limit: throughput scales only up to local CPU and disk bandwidth; there is no sharding or distributed work queue.
- Scaling path: partition replay batches explicitly and run independent workers against shared storage or queue-backed work dispatch.

## Dependencies at Risk

**Core tooling is pinned to an older Node/TypeScript/Jest generation:**
- Risk: the project still uses `typescript@^4.6.3`, `jest@28.1.3`, `ts-jest@^28.0.7`, and `node-fetch@2.x.x` in `package.json`.
- Impact: newer Node runtimes, stricter typings, and ecosystem updates are more likely to require compatibility fixes all at once.
- Migration plan: upgrade TypeScript and Jest in small steps, replace `node-fetch` v2 with the platform fetch or a current maintained client, and keep worker/runtime tests green during each bump.

## Missing Critical Features

**There is no strong failure boundary around replay-list and parse-state corruption:**
- Problem: replay-list validation only logs, parsing status stores a single `updateTime`, and parse failures can leave operators with no durable indication of which replays were successfully processed in the failed run.
- Blocks: safe recovery after partial failures and confident operational debugging.

**Network retries have no backoff or jitter:**
- Problem: `request()` retries recursively with the same timeout and no delay.
- Blocks: graceful recovery during upstream throttling or intermittent `sg.zone` instability.

## Test Coverage Gaps

**Operational entrypoints and jobs are outside enforced coverage:**
- What's not tested: coverage thresholds intentionally exclude `src/jobs/**/*.ts`, `src/schedule.ts`, `src/start.ts`, `src/4 - output/**/*.ts`, and the entire `src/!yearStatistics/**/*.ts` tree.
- Files: `jest.config.js`, `src/schedule.ts`, `src/start.ts`, `src/jobs/updateNameChangesCsv/index.ts`, `src/4 - output/index.ts`, `src/!yearStatistics/index.ts`
- Risk: the reported 100% global coverage does not protect several failure-prone production paths.
- Priority: High

**Concern-specific regressions are not isolated by direct tests:**
- What's not tested: there is no focused test for `src/jobs/prepareReplaysList/utils/problematicReplays.ts`, and current tests do not directly assert the `teamkillers` branch in `src/2 - parseReplayInfo/getKillsAndDeaths.ts`.
- Files: `src/jobs/prepareReplaysList/utils/problematicReplays.ts`, `src/2 - parseReplayInfo/getKillsAndDeaths.ts`, `src/!tests/unit-tests/2 - parseReplayInfo/parseReplayInfo.test.ts`
- Risk: both bugs can persist behind broader integration fixtures without a precise failing test.
- Priority: High

---

*Concerns audit: 2026-03-29*
