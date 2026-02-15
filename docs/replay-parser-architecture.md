# Replay Parser: Architecture and Full Parsing Flow

This document is built from the current codebase so you can quickly restore the full mental model of how the pipeline works and where critical nuances live.

## 1. Project Purpose

The project processes replays from `https://sg.zone/replays`, calculates player/squad/rotation statistics, and publishes JSON/archives.

In practice, there are two main stages:

1. Prepare replay metadata and download raw replay JSON (`prepareReplaysList`).
2. Parse raw replay JSON into player game events and aggregate statistics (`startParsingReplays`).

There are also support jobs (name-change CSV update, HTML list generation, yearly nominations).

## 2. Main Entry Points

1. `src/schedule.ts` - production runtime (cron jobs).
2. `src/jobs/prepareReplaysList/start.ts` - manual replay-list preparation run.
3. `src/start.ts` - manual parse/statistics run.
4. `src/!yearStatistics/index.ts` - separate yearly pipeline.

Primary npm scripts:

1. `npm run generate-replays-list`
2. `npm run parse`
3. `npm run schedule`
4. `npm run parse-new-year`

## 3. Source Code Structure

Logical layers in `src`:

1. `src/0 - utils` and `src/0 - types` - base types and shared utilities.
2. `src/1 - replays` - replay list reading and per-replay parsing orchestration.
3. `src/2 - parseReplayInfo` - parsing one replay (`entities` + `events`).
4. `src/3 - statistics` - statistics aggregation.
5. `src/4 - output` - output generation.
6. `src/jobs/*` - background/utility jobs (replay list, CSV, HTML outputs).
7. `src/!yearStatistics` - dedicated year-end statistics branch.

## 4. Runtime Paths and Data on Disk

Paths are defined in `src/0 - utils/paths.ts`, with runtime root at `~/sg_stats`:

1. `~/sg_stats/raw_replays` - raw replay JSON files (`<filename>.json`).
2. `~/sg_stats/lists/replaysList.json` - replay registry.
3. `~/sg_stats/results` - final output.
4. `~/sg_stats/temp_results` - temporary output generation folder.
5. `~/sg_stats/config` - configs and `nameChanges.csv`.
6. `~/sg_stats/logs` - logs.
7. `~/sg_stats/year_results` - yearly nomination output.

Important: most runtime data is written outside the repository.

## 5. Scheduler (Production Flow)

`src/schedule.ts` registers 3 cron jobs:

1. `0 */1 * * *` - refresh mission makers list.
2. `0 */1 * * *` - run `startFetchingReplays()` (replay list prep/update), then generate MACE list.
3. `15 */1 * * *` - update `nameChanges.csv`, then run `startParsingReplays()`.

Additional orchestration details:

1. The parse job waits for `replaysFetcherJob` if it is still busy.
2. Cloudflare errors are handled via `isCloudflareBanError`.
3. `temp_results` is cleaned before parsing.

## 6. Stage A: `prepareReplaysList` (Replay List Collection)

Main file: `src/jobs/prepareReplaysList/index.ts`.

### 6.1 Inputs

1. Existing `replaysList.json` (if present).
2. `config/includeReplays.json` - whitelist for missions without explicit game type prefix.
3. `config/excludeReplays.json` - blacklist of replay links.
4. HTML pages from `https://sg.zone/replays?p=N`.

### 6.2 Algorithm

1. Ensure base runtime folders exist.
2. Fetch page 1 and detect `totalPages` from pagination.
3. Parse each page with `parseReplaysOnPage`.
4. For each replay row:
   - extract `replayLink`;
   - skip if already in `parsedReplays`;
   - derive `mission_name`:
     - if name has no `@`, try `includeReplays` and force `<gameType>@<snake_case(name)>`;
     - otherwise keep source name;
   - open replay card and extract `filename` (`#filename` input or `body[data-ocap]`);
   - download raw JSON from `https://sg.zone/data/<filename>.json` into `raw_replays`.
5. Merge newly collected data with previous `replaysList`.
6. Apply blacklist (`excludeReplays`) by `replayLink`.
7. Mark problematic replays (empty `filename`) as `problematicReplays`.
8. Run `checks()` and write resulting `replaysList.json`.

### 6.3 Nuances and Constraints

1. Row-level concurrency is hardcoded as `pLimit(1)` in `parseReplaysOnPage.ts`.
2. `saveReplayFile` uses sync I/O (`accessSync`, `writeFileSync`).
3. Existing raw files are not re-downloaded.
4. Non-Cloudflare row-level errors are swallowed and replay is skipped.
5. Cloudflare errors stop the job and propagate upward.
6. `utils/problematicReplays.ts` has a behavior trap: after `splice` operations, state is reassigned via `newResult = { ...result, problematicReplays }`, so removals from `replays/parsedReplays` are effectively lost.

## 7. Stage B: `startParsingReplays` (Parsing + Statistics)

Main file: `src/index.ts`.

### 7.1 Pre-run Setup

1. `generateBasicFolders()`.
2. Full cleanup of `temp_results`.
3. `prepareNamesList()` initializes in-memory name-change map.
4. Runtime config is resolved via `getRuntimeConfig()`.
5. One shared `WorkerPool` is created for the whole parse run and destroyed in `finally`.

### 7.2 Replay Selection by Game Type

`getReplays(gameType)`:

1. Reads `replaysList.json`.
2. Deduplicates by `filename` using `uniqBy`.
3. Filters `mission_name.startsWith(gameType)` and excludes `mission_name.startsWith('sgs')`.

Additional `sm` filter:

1. Keep only replays after Jan 2023 (`dayjsUTC(...).isAfter('2023-01-01', 'month')`).

### 7.3 Per-replay Parsing

`parseReplays(replays, gameType, workerPool)`:

1. Submits each replay to shared `WorkerPool` as a task (`filename`, `date`, `missionName`, `gameType`).
2. Worker reads raw JSON from `raw_replays`, initializes names list, and runs `parseReplayInfo`.
3. Worker returns one of: `success`, `skipped`, `error`.
4. Main thread keeps only `success`, ignores `skipped`, logs `error`.
5. Results are sorted by date ascending.

Important: replay parsing now runs in worker threads (real multi-core CPU parallelism), while main thread handles orchestration and statistics.

## 8. Parsing One Raw Replay (`src/2 - parseReplayInfo`)

### 8.1 Step 1: `getEntities`

Builds:

1. `players` - only `unit` entities where `isPlayer`, `description` exists, and `name` exists.
2. `vehicles` - all `vehicle` entities.

Then processes `connected` events:

1. Takes name from event and side from matching entity.
2. Adds/overwrites player if missing in initial entity pass (or slot changed).

Nuance: each `connected` event does linear `entities.find(...)`.

### 8.2 Step 2: `getKillsAndDeaths`

Iterates all `killed` events and updates players:

1. `killInfo === ['null']`:
   - if a vehicle was killed, ignore event;
   - if a player was killed, set `isDead`.
2. Player kills player:
   - classify normal kill / teamkill / suicide;
   - update `kills`, `teamkills`, `isDeadByTeamkill`;
   - update `killed/killers/teamkilled/teamkillers` collections;
   - if weapon name matches replay vehicle name, count as `killsFromVehicle` and store in `vehicles` stats.
3. Player kills vehicle:
   - increment `vehicleKills`.

Nuances:

1. Vehicle lookup map is rebuilt on each kill event (`Object.values` + `keyBy`).
2. In teamkill branch, `teamkillers` is built with `mergeOtherPlayers(killers, ...)`, so it uses current `killers` array instead of `teamkillers`.

### 8.3 Step 3: `combineSamePlayersInfo`

If one nickname appears in multiple entities in the same replay (slot change), entries are merged:

1. Sum kill/death counters.
2. Merge weapons/vehicles/otherPlayers collections.
3. Combine death flags with logical OR.

Merge key is exact `player.name` match.

## 9. Name Normalization and Player Identity

### 9.1 `getPlayerName`

1. Extracts squad prefix in `[]`.
2. Returns `[cleanName, prefix | null]`.

### 9.2 `prepareNamesList` + `getPlayerId`

1. Name-change CSV is read from `~/sg_stats/config/nameChanges.csv`.
2. All timestamps are parsed as Moscow time and converted to UTC.
3. Name-change chains are mapped to a stable player `id`.
4. If name is not found for date interval, fallback `id = loweredName`.

Cache behavior:

1. `namesList` is an in-memory singleton.
2. New CSV content is ignored until `resetNamesList()` is called.

## 10. Statistics Calculation (`src/3 - statistics`)

### 10.1 Global (`global/index.ts`)

For each `PlayerGameResult`:

1. Find/create player aggregate row.
2. Update cumulative metrics (`kills`, `teamkills`, `deaths`, score, etc.).
3. Update weekly breakdown (`byWeeks`).
4. Merge weapons/vehicles/other-player collections.

Important:

1. In top-level output from `src/index.ts`, `squad` and `squadFull` are always empty arrays.
2. Real squad stats are only produced inside `byRotations` for `sg`.

Post-processing:

1. Sort by `totalScore`, `totalPlayedGames`, `kills`.
2. Limit array sizes:
   - `weapons`, `vehicles` up to 25;
   - `killed`, `killers`, `teamkilled`, `teamkillers` up to 10.
3. Replace names in `otherPlayers` using final player names + prefixes.

### 10.2 Exclude Players Logic

In `global/add.ts`, `config/excludePlayers.json` is read on every update:

1. Case-insensitive name match.
2. Exclusion applies only within configured date interval.
3. If matched, player update is skipped.

Performance nuance: file is read from disk per `addPlayerGameResultToGlobalStatistics` call.

### 10.3 Rotations (`rotations/index.ts`)

1. Replays are grouped by configured rotation date ranges (`utils/rotations.ts`).
2. For each rotation, calculate:
   - global stats,
   - squad stats (last 4 weeks),
   - squadFull stats (full rotation range).

Nuances:

1. `getReplaysGroupByRotation` uses `cloneDeep` over full replay array plus repeated `remove` calls.
2. Rotation boundaries are hardcoded in source.

### 10.4 Squads (`squads/*`)

1. A player belongs to a squad only if nickname contains a prefix.
2. Squad and per-player-in-squad stats are calculated.
3. Final filter keeps squads with `players.length > 4` only.

## 11. Output Artifacts (`src/4 - output`)

`generateOutput` writes into `temp_results`, then swaps to `results`:

1. Create folder per game type (`sg`, `mace`, `sm`).
2. Main files:
   - `global_statistics.json`
   - `squad_statistics.json`
   - `squad_full_rotation_statistics.json` (if exists)
3. Per-player subfolders:
   - `weapons_statistics/<player>.json`
   - `weeks_statistics/<player>.json`
   - `other_players_statistics/<player>.json`
4. Additional `sg` structure:
   - `all_time/`
   - `rotation_<N>/...`
   - `rotations_info.json`
5. Build `stats.zip` with game type folders.
6. On success:
   - remove old `results`,
   - move `temp_results` to `results`.

Nuance: output generation is mostly sync (`writeFileSync`, `mkdirSync`, `moveSync`).

## 12. Network Layer and Cloudflare

`src/0 - utils/request.ts`:

1. Retries up to 3 times by default.
2. For `https://sg.zone/*`, detects Cloudflare block page and throws `CloudflareBanError`.
3. Supports relay mode via `.env`:
   - `REPLAYS_RELAY_URL`
   - `REPLAYS_RELAY_TOKEN`
4. Relay is allowed only for `https://sg.zone/*` URLs.

Practical effect:

1. Cloudflare blocks are not masked as generic network failures.
2. Scheduler/jobs can handle Cloudflare failures separately without noisy stack traces.

## 13. Additional Jobs

### 13.1 `updateNameChangesCsv`

1. Downloads CSV from Google Sheets.
2. Saves it to `~/sg_stats/config/nameChanges.csv`.
3. Calls `resetNamesList()`.

### 13.2 `generateMissionMakersList`

1. Parses `https://sg.zone/team`.
2. Extracts `Mission Makers` and `Junior Mission Makers` sections.
3. Writes HTML to `~/sg_stats/lists/mission_makers_list.html`.

### 13.3 `generateMaceListHTML`

1. Reads `replaysList.json`.
2. Filters `mace` missions.
3. Writes HTML to `~/sg_stats/lists/mace_list.html`.

## 14. Separate Yearly Pipeline (`src/!yearStatistics`)

1. Takes SG replays for configured `year` (currently `2025`).
2. Creates its own `WorkerPool` for that run and destroys it in `finally`.
3. Runs standard `parseReplays(replays, 'sg', workerPool)` + `calculateGlobalStatistics`.
4. Re-reads raw replay data for nomination logic that needs low-level replay details (via `src/1 - replays/fetchReplayInfo.ts`).
5. Writes nomination text files to `~/sg_stats/year_results`.

Nuance: this flow relies on sequential `for ... of` + `await` over replays.

## 15. Main Pitfalls for Future Changes

1. Some hot paths still use sync I/O and can block the event loop.
2. `parseReplays` now uses true multi-core execution via worker threads; performance bottlenecks shifted to worker lifecycle/queueing and downstream aggregation.
3. Some sections are algorithmically expensive (`findIndex`, `cloneDeep`, repeated config reads, repeated `keyBy`).
4. Rotation logic depends on manually maintained hardcoded dates.
5. Player identity is sensitive to `nameChanges.csv` quality and timezone conversion correctness.
6. Runtime state lives in `~/sg_stats`, not repo-local paths.
7. Logger clears the daily log folder on process start (`fs.emptyDirSync(logsFolderPath)`), so logs for current date are overwritten.

## 16. Fast Code Reading Order for New Contributors

Recommended reading order to rebuild the full model quickly:

1. `src/schedule.ts`
2. `src/jobs/prepareReplaysList/index.ts`
3. `src/index.ts`
4. `src/1 - replays/parseReplays.ts`
5. `src/2 - parseReplayInfo/index.ts`
6. `src/3 - statistics/global/index.ts`
7. `src/3 - statistics/rotations/index.ts`
8. `src/4 - output/index.ts`
9. `src/0 - utils/request.ts`
10. `src/0 - utils/namesHelper/*`
