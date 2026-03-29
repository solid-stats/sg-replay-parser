---
phase: 1
slug: toolchain-modernization
status: ready_for_execution
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-29
updated: 2026-03-29
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Current: Jest 28 + `ts-jest`; Target: Vitest 4 + `@vitest/coverage-v8` |
| **Config file** | Current: `jest.config.js`; Target gap: `vitest.config.ts` |
| **Quick run command** | `pnpm exec vitest run --reporter=dot` |
| **Full suite command** | `pnpm exec vitest run --coverage` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After Plan 01:** Run `pnpm install --frozen-lockfile` and the source-entry smokes from Plan 01
- **After Plan 02:** Run `pnpm build` plus the built-runtime smokes from Plan 02
- **After Plan 03:** Run `pnpm typecheck && pnpm lint`
- **After Plan 04:** Run `pnpm lint && pnpm typecheck && pnpm test && pnpm exec vitest run --coverage && pnpm build`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | TOOL-01 | file/doc smoke | `test -f docs/architecture.md && rg -n "~/sg_stats|src/start.ts|src/schedule.ts|parseReplayWorker" docs/architecture.md` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | TOOL-01, TOOL-02 | install + source runtime smoke | `pnpm install --frozen-lockfile && pnpm run parse --help >/dev/null 2>&1 && pnpm run generate-replays-list --help >/dev/null 2>&1` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | TOOL-03 | build artifact smoke | `pnpm build && test -f dist/start.js && test -f dist/schedule.js && test -f "dist/1 - replays/workers/parseReplayWorker.js"` | ✅ | ⬜ pending |
| 01-02-02 | 02 | 2 | TOOL-03 | fail-fast built runtime smoke | `pnpm build && pnpm run parse:dist --help >/dev/null 2>&1 && node dist/jobs/prepareReplaysList/start.js --help >/dev/null 2>&1 && timeout 5s node dist/schedule.js >/dev/null 2>&1` | ✅ | ⬜ pending |
| 01-03-01 | 03 | 3 | TOOL-05 | lint | `pnpm lint` | ✅ | ⬜ pending |
| 01-03-02 | 03 | 3 | TOOL-04 | typecheck | `pnpm typecheck` | ✅ | ⬜ pending |
| 01-04-01 | 04 | 4 | TOOL-06 | unit + coverage | `pnpm test && pnpm exec vitest run --coverage` | ✅ | ⬜ pending |
| 01-04-02 | 04 | 4 | TOOL-07 | full toolchain + docs smoke | `pnpm lint && pnpm typecheck && pnpm test && pnpm build && ! rg -n "npm (run|ci)|\\bnpm\\b" README.md .github/workflows/ci.yml deploy/remote-deploy.sh ecosystem.config.cjs` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Plan / Wave Graph

| Wave | Plan | Depends On | Focus |
|------|------|------------|-------|
| 1 | `01-01` | — | Restore `docs/architecture.md`, enforce pnpm-only manifest, define `tsx` source scripts |
| 2 | `01-02` | `01-01` | Add `tsup` build, preserve `dist/*` entrypoints, rewire worker paths and PM2 |
| 3 | `01-03` | `01-02` | Apply strict TypeScript and backend-only flat ESLint |
| 4 | `01-04` | `01-02`, `01-03` | Migrate Jest to Vitest and finish README/CI/deploy/operator command migration |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Operator-facing command replacements remain understandable and complete across docs and deploy assets | TOOL-07 | The requirement spans README, CI, deploy, and PM2 semantics as one human-facing command surface | Read `README.md`, `.github/workflows/ci.yml`, `deploy/remote-deploy.sh`, and `ecosystem.config.cjs`; verify every required operator invocation uses `pnpm` and that PM2 still points at `dist/schedule.js` |
| ESM-forward build preserves usable runtime entrypoints and worker startup behavior | TOOL-03 | The built smokes prove execution succeeds, but a quick human audit still checks that the emitted layout matches the documented runtime surface | Compare `tsup.config.ts`, `package.json` `parse:dist` / `schedule:dist`, `ecosystem.config.cjs`, and `src/1 - replays/workers/workerPool.ts` to confirm the same emitted `dist/*.js` paths are used everywhere |

---

## Validation Sign-Off

- [ ] All tasks have explicit `<automated>` verification commands
- [ ] Every plan/task pair in `01-01` through `01-04` appears in the table above
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] No generic Wave 0 placeholders remain
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
