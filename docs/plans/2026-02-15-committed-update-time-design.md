# Committed Update Time Design

## Context
Current `update_time` can move forward too early because `replaysList.json` is refreshed before parsing finishes. This creates a mismatch between displayed update timestamp and actually published statistics.

## Goal
Expose `update_time` as the `prepareReplaysList` start timestamp of the replay list actually used by the last successful full parsing run, and publish it only after successful parsing completion.

## Confirmed Semantics
1. `update_time` value source: `replaysListPreparedAt` captured from `replaysList.json` at parse-run start.
2. Visibility rule: publish this value only after full run success (`parse + stats + output`).
3. Failure rule: if run fails, keep previously published `update_time` unchanged.

## Considered Approaches
1. Use `stats.zip` mtime only.
   - Pros: minimal changes.
   - Cons: wrong semantics (file timestamp != replay list snapshot timestamp).
2. Read live `replaysList.json` from server.
   - Pros: easy implementation.
   - Cons: timestamp can advance before parsing completes.
3. Persist committed parsing status artifact after successful run.
   - Pros: correct semantics and stable behavior during long/failed runs.
   - Cons: adds one metadata file.

## Selected Approach
Use a committed metadata artifact in `results`, e.g. `results/parsing_status.json`, written only after successful full run.

## Data Model
`results/parsing_status.json`:

```json
{
  "updateTime": "2026-02-15T12:34:56.000Z"
}
```

## Runtime Flow
1. Parse run starts.
2. Parser reads `replaysList.json` and snapshots `replaysListPreparedAt` into run-local variable.
3. Parser completes full run and publishes output.
4. Parser writes `results/parsing_status.json` atomically with `updateTime` from step 2.
5. Server `/parsing_status` returns `update_date` from `results/parsing_status.json`.

## Fallback Policy (Server)
1. `results/parsing_status.json.updateTime` when valid.
2. `results/stats.zip` mtime when status file missing/invalid.
3. `new Date()` as final fallback.

## Error Handling
1. Missing/invalid `replaysListPreparedAt` at parse start: parser writes `null` or omits update in committed status based on implementation policy.
2. Parsing failure: do not update committed status file.
3. Corrupted status file: server falls back safely.

## Testing Scope
1. Parser unit tests for status commit on success only.
2. Parser failure-path test: committed status unchanged.
3. Server date utility tests for normal path and all fallback branches.
4. Schedule-level behavior check: while parsing, `status=parsing` but `update_date` stays previous committed value.

## Non-Goals
1. Changing replay list collection timing.
2. Redefining parsing job orchestration.
3. Adding new API fields beyond current `update_date` requirement.
