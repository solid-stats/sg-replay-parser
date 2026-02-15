# Committed Update Time Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish `/parsing_status.update_date` only after a successful full parse run, while preserving the original replay-list snapshot timestamp (`replaysListPreparedAt`) used by that run.

**Architecture:** Capture run-local `replaysListPreparedAt` at parse start in `replays-parser`, commit it into `results/parsing_status.json` only after successful output generation, and make `server` read update time from that committed artifact. Keep strict fallback behavior for bootstrap and corrupted metadata cases.

**Tech Stack:** TypeScript (replays-parser), Node.js CommonJS (server), Jest, node:test, fs-extra.

---

### Task 1: Add committed parsing status utilities in replays-parser

**Files:**
- Create: `/home/afgan0r/Projects/SolidGames/replays-parser/src/0 - utils/parsingStatus.ts`
- Modify: `/home/afgan0r/Projects/SolidGames/replays-parser/src/0 - utils/paths.ts`

**Step 1: Write the failing test**

- Create parser utility tests that expect:
1. read run snapshot from `replaysList.json.replaysListPreparedAt`
2. write `results/parsing_status.json` atomically

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/!tests/unit-tests/0 - utils/parsingStatus.test.ts`
Expected: FAIL (module/functions missing)

**Step 3: Write minimal implementation**

- Add `parsingStatusPath` in `paths.ts` pointing to `results/parsing_status.json`.
- Implement in `parsingStatus.ts`:
1. `readRunReplayListPreparedAt(): string | null`
2. `commitParsingStatus(updateTime: string | null): void`
3. Atomic write via temp file + rename.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/!tests/unit-tests/0 - utils/parsingStatus.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/0\ -\ utils/parsingStatus.ts src/0\ -\ utils/paths.ts src/!tests/unit-tests/0\ -\ utils/parsingStatus.test.ts
git commit -m "feat: add committed parsing status utility"
```

### Task 2: Wire committed status into parse pipeline

**Files:**
- Modify: `/home/afgan0r/Projects/SolidGames/replays-parser/src/index.ts`
- Test: `/home/afgan0r/Projects/SolidGames/replays-parser/src/!tests/unit-tests/schedule.test.ts`

**Step 1: Write the failing test**

- Add test that on successful parse run status commit is called with run snapshot.
- Add test that on failure commit is not called.

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/!tests/unit-tests/schedule.test.ts`
Expected: FAIL (missing commit behavior)

**Step 3: Write minimal implementation**

In `src/index.ts`:
1. read run snapshot before heavy parsing starts
2. after successful `generateOutput`, call `commitParsingStatus(runSnapshot)`
3. keep failure path unchanged (no commit)

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/!tests/unit-tests/schedule.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/index.ts src/!tests/unit-tests/schedule.test.ts
git commit -m "feat: commit update time only after successful parse"
```

### Task 3: Switch server update_date to committed status artifact

**Files:**
- Modify: `/home/afgan0r/Projects/SolidGames/server/src/utils/date.js`
- Modify: `/home/afgan0r/Projects/SolidGames/server/src/server.js`
- Test: `/home/afgan0r/Projects/SolidGames/server/src/utils/date.test.js`

**Step 1: Write the failing test**

Add/adjust tests for `getParsingStatusUpdateDate(listsPath, resultsPath)`:
1. returns `parsing_status.json.updateTime` when valid
2. falls back to `stats.zip` mtime when status file missing/invalid
3. falls back to `new Date()` when all unavailable

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL on old fallback logic

**Step 3: Write minimal implementation**

In `date.js`:
1. read `results/parsing_status.json`
2. validate `updateTime` as date
3. fallback chain: status file -> `stats.zip` mtime -> now

In `server.js`:
- keep `/parsing_status` using `getParsingStatusUpdateDate(listsPath, resultsPath)`

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/date.js src/server.js src/utils/date.test.js
git commit -m "feat: read parsing update time from committed status file"
```

### Task 4: Cross-repo verification and docs refresh

**Files:**
- Modify: `/home/afgan0r/Projects/SolidGames/replays-parser/docs/architecture.md`
- Modify (if needed): `/home/afgan0r/Projects/SolidGames/replays-parser/docs/plans/2026-02-15-committed-update-time-design.md`

**Step 1: Write failing verification expectation**

- Define acceptance criteria:
1. During parsing: `status=parsing`, `update_date` unchanged from previous success
2. After successful run: `update_date` equals committed run snapshot (`replaysListPreparedAt` captured at run start)

**Step 2: Run verification commands**

Replays parser:
- `npm run lint`
- `npm run test`
- `npm run build-dist`

Server:
- `npm test`

Expected: all PASS

**Step 3: Update architecture docs**

- Document committed status artifact and fallback chain.

**Step 4: Re-run verification**

Run same commands as step 2.
Expected: all PASS

**Step 5: Commit**

```bash
git add docs/architecture.md docs/plans/2026-02-15-committed-update-time-design.md
git commit -m "docs: describe committed update time semantics"
```
