# Name Changes CSV Schedule Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Перед каждым запуском парсинга автоматически обновлять `nameChanges.csv` из Google Sheets CSV, не блокируя парсинг при ошибках загрузки.

**Architecture:** В `src/schedule.ts` добавить helper `downloadNameChangesCsv`, который скачивает CSV, сохраняет его в `configPath`, сбрасывает кэш `namesHelper`, затем parsing cron-job запускает парсер. Ошибки загрузки не прерывают parsing flow.

**Tech Stack:** TypeScript, Croner, fs-extra, существующий HTTP helper `request`, Jest.

---

### Task 1: Cover Schedule Flow With Failing Tests

**Files:**
- Modify: `src/!tests/unit-tests/schedule.test.ts`

**Step 1: Write failing test for successful CSV refresh before parsing**
- Add test that executes parsing cron callback (`cronJobs[2]`) and expects:
  - `request(googleCsvUrl)` called
  - `fs.ensureDirSync(configPath)` and `fs.writeFileSync(...nameChanges.csv...)` called
  - `resetNamesList()` called
  - `startParsingReplays()` called after CSV refresh

**Step 2: Run test to verify it fails**
Run: `npm test -- --runInBand src/!tests/unit-tests/schedule.test.ts`
Expected: FAIL because schedule currently has no CSV refresh step.

**Step 3: Write failing test for download failure fallback**
- Add test for `request` rejection.
- Assert `startParsingReplays()` is still called.
- Assert `logger.error` contains CSV update failure marker.

**Step 4: Run test to verify it fails**
Run: `npm test -- --runInBand src/!tests/unit-tests/schedule.test.ts`
Expected: FAIL for missing fallback log/flow.

**Step 5: Commit (optional checkpoint)**
```bash
git add src/!tests/unit-tests/schedule.test.ts
git commit -m "test: cover nameChanges CSV refresh in schedule"
```

### Task 2: Implement CSV Refresh In Parsing Cron Job

**Files:**
- Modify: `src/schedule.ts`

**Step 1: Add helper constants/imports**
- Add Google Sheets CSV URL constant.
- Import `path`, `configPath`, `request`, and `resetNamesList`.

**Step 2: Implement minimal `downloadNameChangesCsv` helper**
- `request(url)`
- guard `null` response
- `await response.text()`
- `fs.ensureDirSync(configPath)`
- `fs.writeFileSync(path.join(configPath, 'nameChanges.csv'), csvContent, 'utf8')`
- `resetNamesList()` on success
- catch/log errors and return without throw

**Step 3: Call helper in parsing cron callback before parsing starts**
- Keep existing waiting logic (`waitReplaysFetchingToFinish`) unchanged.
- Call `await downloadNameChangesCsv();` immediately before `fs.removeSync(tempResultsPath)` / `startParsingReplays()`.

**Step 4: Run tests to verify green**
Run: `npm test -- --runInBand src/!tests/unit-tests/schedule.test.ts`
Expected: PASS.

**Step 5: Commit (optional checkpoint)**
```bash
git add src/schedule.ts src/!tests/unit-tests/schedule.test.ts
git commit -m "feat: refresh nameChanges csv before scheduled parsing"
```

### Task 3: Regression Check

**Files:**
- Modify: none

**Step 1: Run broader unit check for safety**
Run: `npm test -- --runInBand src/!tests/unit-tests/0\ -\ utils/namesHelper.test.ts`
Expected: PASS and no behavior regression in names cache utilities.

**Step 2: Run lint for touched files (optional)**
Run: `npm run lint-files`
Expected: PASS.

**Step 3: Final status review**
Run: `git status --short`
Expected: only intended files changed.
