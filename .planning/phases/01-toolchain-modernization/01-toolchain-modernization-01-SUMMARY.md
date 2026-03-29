---
phase: 01-toolchain-modernization
plan: 01
subsystem: infra
tags: [pnpm, tsx, documentation, runtime, nodejs]
requires: []
provides:
  - Restored `docs/architecture.md` as the brownfield runtime source of truth.
  - Enforced pnpm-only installs with a committed `pnpm-lock.yaml`.
  - Added `tsx` source-mode scripts and safe `--help` exits for all plan entrypoints.
affects: [phase-01-plan-02, phase-01-plan-04, deploy, ci, pm2]
tech-stack:
  added: [pnpm, tsx, only-allow]
  patterns: [pnpm-only package management, source-mode tsx entrypoints, deterministic CLI help guards]
key-files:
  created: [docs/architecture.md, pnpm-lock.yaml, src/0 - utils/cliHelp.ts]
  modified: [package.json, README.md, src/start.ts, src/schedule.ts, src/jobs/prepareReplaysList/start.ts, src/jobs/updateNameChangesCsv/start.ts, src/jobs/generateMissionMakersList/start.ts, src/jobs/generateMaceListHTML/start.ts, src/!yearStatistics/index.ts]
key-decisions:
  - "Use `npx only-allow pnpm` plus `packageManager` metadata to reject non-pnpm installs."
  - "Add a shared CLI help guard so source-mode smoke verification stays non-destructive."
patterns-established:
  - "Runtime architecture documentation must explicitly preserve the existing `~/sg_stats` contract during modernization."
  - "Source entrypoints should expose a script-first `pnpm run ...` interface backed by `tsx`."
requirements-completed: [TOOL-01, TOOL-02]
duration: 4min
completed: 2026-03-29
---

# Phase 01 Plan 01: Toolchain Modernization Summary

**Restored the brownfield runtime architecture reference and moved local source entrypoints to pnpm-only `tsx` scripts with smoke-safe help handling**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-29T05:16:17Z
- **Completed:** 2026-03-29T05:20:10Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Restored `docs/architecture.md` from the planning baseline with explicit `~/sg_stats`, entrypoint, and worker-thread coverage.
- Enforced pnpm-only installs through `package.json` metadata, `only-allow`, and a committed `pnpm-lock.yaml`.
- Replaced the brownfield source-mode commands with `tsx`-backed `pnpm run ...` scripts and deterministic `--help` exits for verification.

## Task Commits

Each task was committed atomically:

1. **Task 1: Restore `docs/architecture.md` from the planning baseline** - `dda9009` (feat)
2. **Task 2: Convert the manifest to pnpm-only and define the script-first `tsx` entry surface** - `3f1c810` (feat)

## Files Created/Modified

- `docs/architecture.md` - Restored runtime architecture source of truth for the parser pipeline.
- `package.json` - Enforced pnpm-only package management and added `tsx` source-mode scripts.
- `pnpm-lock.yaml` - Captured deterministic pnpm dependency resolution.
- `README.md` - Switched local source-mode examples from npm to pnpm.
- `src/0 - utils/cliHelp.ts` - Added a shared non-destructive help guard for source entrypoints.
- `src/start.ts` - Added help handling for the main parse entrypoint.
- `src/schedule.ts` - Added help handling for the scheduler entrypoint.
- `src/jobs/prepareReplaysList/start.ts` - Added help handling for replay-list preparation.
- `src/jobs/updateNameChangesCsv/start.ts` - Added help handling for the name-change refresh entrypoint.
- `src/jobs/generateMissionMakersList/start.ts` - Added help handling for the mission-makers entrypoint.
- `src/jobs/generateMaceListHTML/start.ts` - Added help handling for the MACE list entrypoint.
- `src/!yearStatistics/index.ts` - Added help handling for the yearly statistics entrypoint.

## Decisions Made

- Used `packageManager` plus `npx only-allow pnpm` as the explicit package-manager gate so install policy is enforced locally.
- Implemented a shared CLI help helper instead of bespoke guards per file to keep smoke verification consistent across all source entrypoints.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `rg "npm run"` matched `pnpm run` during verification, so the package-script check was rerun with an exact pattern.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The repository now has the missing architecture reference and a pnpm-first source execution surface required by later build and runtime rewiring work.
- Phase `01-02` can build on the committed `pnpm-lock.yaml`, `tsx` entrypoints, and smoke-safe CLI behavior without reintroducing npm-era scripts.

## Self-Check

PASSED

- Verified created artifacts exist: `docs/architecture.md`, `pnpm-lock.yaml`, and this summary file.
- Verified task commits exist in git history: `dda9009`, `3f1c810`.

---
*Phase: 01-toolchain-modernization*
*Completed: 2026-03-29*
