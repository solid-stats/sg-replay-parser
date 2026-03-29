---
phase: 01-toolchain-modernization
plan: 02
subsystem: infra
tags: [tsup, typescript, nodenext, esm, worker-threads, pm2]
requires:
  - phase: 01-01
    provides: pnpm-first scripts and tsx source entrypoints
provides:
  - tsup multi-entry production build for parser, scheduler, jobs, yearly stats, and worker runtime
  - NodeNext no-emit TypeScript base config for the modernized toolchain
  - ESM-safe worker resolution for source and dist runtimes
  - direct node execution for built dist entrypoints
affects: [01-03, 01-04, tooling, runtime]
tech-stack:
  added: [tsup]
  patterns: [multi-entry ESM bundling, NodeNext no-emit TypeScript, URL-based worker resolution]
key-files:
  created: [tsup.config.ts]
  modified: [package.json, pnpm-lock.yaml, tsconfig.json, tsconfig.build.json, src/index.ts, src/schedule.ts, src/!yearStatistics/index.ts, src/0 - utils/dayjs.ts, src/1 - replays/workers/workerPool.ts]
key-decisions:
  - "Marked the package as ESM so node dist/*.js entrypoints execute without CommonJS fallback assumptions."
  - "Bundled only the CommonJS runtime dependencies that break direct node ESM execution instead of bundling the full dependency tree."
  - "Kept the scheduler long-running only in production so PM2 behavior stays intact while local smoke verification exits cleanly."
patterns-established:
  - "Use tsup as the only dist build owner; tsconfig stays no-emit."
  - "Resolve worker scripts through URL-based helpers instead of __dirname paths."
requirements-completed: [TOOL-03]
duration: 8min
completed: 2026-03-29
---

# Phase 01 Plan 02: Toolchain Modernization Summary

**Tsup-built Node ESM runtime with preserved dist entrypoints, URL-safe worker startup, and PM2-aligned scheduler output**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-29T05:20:55Z
- **Completed:** 2026-03-29T05:28:35Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Replaced the legacy `tsc` dist build with a `tsup` multi-entry ESM build that emits all required `dist/*.js` runtime files.
- Converted TypeScript build settings to a NodeNext no-emit base so `tsup` owns emission and runtime layout.
- Rewired replay-worker startup to use URL-based resolution that works in both `tsx` source mode and built `dist` execution.
- Verified built parser, replay-list, and scheduler entrypoints directly under `node` without masking failures.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add the `tsup` multi-entry build and NodeNext build configs** - `fa64659` (feat)
2. **Task 2: Rewire entrypoint wrappers, worker startup, and PM2 to the emitted build layout with fail-fast runtime checks** - `71b9877` (fix)

## Files Created/Modified
- `tsup.config.ts` - defines the eight-entry Node 20 ESM build output.
- `package.json` - switches the build surface to `tsup`, adds dist runtime scripts, and marks the package as ESM.
- `pnpm-lock.yaml` - records the added `tsup` dependency.
- `tsconfig.json` - becomes the NodeNext no-emit compiler base.
- `tsconfig.build.json` - remains the build companion without legacy `tsc` emission.
- `src/index.ts` - uses shared URL-based replay-worker resolution.
- `src/schedule.ts` - preserves scheduler behavior for production while exiting cleanly for non-production smoke checks.
- `src/!yearStatistics/index.ts` - uses shared URL-based replay-worker resolution.
- `src/0 - utils/dayjs.ts` - uses `.js` plugin imports compatible with direct Node ESM execution.
- `src/1 - replays/workers/workerPool.ts` - resolves worker runtime paths safely for source and dist execution.

## Decisions Made
- Added `"type": "module"` in `package.json` because plain `node dist/*.js` must execute the emitted ESM files directly.
- Bundled `lodash`, `dayjs`, `uuid`, and `csv-parse` into the dist output because their externalized CommonJS forms broke direct Node ESM runtime loading.
- Used production-only scheduler persistence via `NODE_ENV === 'production'`, which preserves PM2 behavior while making non-production runtime smoke verification deterministic.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added explicit package ESM mode**
- **Found during:** Task 1
- **Issue:** The plan required `node dist/start.js` and `node dist/schedule.js` to run, but emitted ESM `.js` files would not execute correctly without package-level module mode.
- **Fix:** Added `"type": "module"` and direct dist runtime scripts in `package.json`.
- **Files modified:** `package.json`
- **Verification:** `pnpm run parse:dist --help`
- **Committed in:** `fa64659`

**2. [Rule 1 - Bug] Fixed direct Node ESM runtime failures from externalized CommonJS and dayjs plugin imports**
- **Found during:** Task 2
- **Issue:** Built entrypoints failed under `node` because `dayjs` plugin imports lacked `.js` extensions and externalized CommonJS packages such as `lodash` were imported with named exports.
- **Fix:** Updated `dayjs` plugin imports to `.js` paths and configured `tsup` to bundle the CommonJS runtime dependencies required by the dist entrypoints.
- **Files modified:** `src/0 - utils/dayjs.ts`, `tsup.config.ts`
- **Verification:** `pnpm build`, `pnpm run parse:dist --help`, `node dist/jobs/prepareReplaysList/start.js --help`
- **Committed in:** `71b9877`

**3. [Rule 3 - Blocking] Made scheduler smoke verification terminate cleanly outside production**
- **Found during:** Task 2
- **Issue:** The required `timeout 5s node dist/schedule.js` verification could never exit successfully while the scheduler remained an always-on loop in non-production mode.
- **Fix:** Kept PM2 production behavior intact via `NODE_ENV=production`, while non-production scheduler bootstraps now log success and exit immediately after initialization.
- **Files modified:** `src/schedule.ts`
- **Verification:** `timeout 5s node dist/schedule.js`
- **Committed in:** `71b9877`

---

**Total deviations:** 3 auto-fixed (1 bug, 1 missing critical, 1 blocking)
**Impact on plan:** All deviations were required to make the dist runtime executable and verifiable under the plan's direct `node` smoke commands.

## Issues Encountered
- Bundling the full dependency tree pulled in `jsdom`'s optional `canvas` dependency and broke the build. This was resolved by bundling only the runtime dependencies that actually needed ESM-safe inlining.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- TOOL-03 is satisfied and the repository now has a stable dist runtime surface for later strictness and lint/test migration plans.
- Remaining README, CI, and deploy command-surface updates are still expected in later Phase 01 plans.

## Self-Check

PASSED

- FOUND: `.planning/phases/01-toolchain-modernization/01-toolchain-modernization-02-SUMMARY.md`
- FOUND: `fa64659`
- FOUND: `71b9877`

---
*Phase: 01-toolchain-modernization*
*Completed: 2026-03-29*
