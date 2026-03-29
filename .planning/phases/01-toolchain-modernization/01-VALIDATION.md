---
phase: 1
slug: toolchain-modernization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
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

- **After every task commit:** Run `pnpm exec vitest run src/!tests/unit-tests/...` or the nearest affected subset plus `pnpm typecheck`
- **After every plan wave:** Run `pnpm lint && pnpm typecheck && pnpm exec vitest run`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | TOOL-01 | smoke | `pnpm install --frozen-lockfile` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 0 | TOOL-02 | smoke | `pnpm exec tsx src/start.ts --help` or equivalent harmless entry smoke | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 0 | TOOL-03 | smoke | `pnpm build && test -f dist/schedule.js && test -f dist/start.js` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 0 | TOOL-04 | typecheck | `pnpm typecheck` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 0 | TOOL-05 | lint | `pnpm lint` | ❌ W0 | ⬜ pending |
| 01-01-06 | 01 | 0 | TOOL-06 | unit | `pnpm test && pnpm exec vitest run --coverage` | ❌ W0 | ⬜ pending |
| 01-01-07 | 01 | 0 | TOOL-07 | smoke/manual | `pnpm build` plus command docs verification in README/deploy files | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — required for TOOL-06
- [ ] `eslint.config.mjs` or `eslint.config.ts` — required for TOOL-05
- [ ] `package.json` `packageManager` pin and `preinstall` enforcement — required for TOOL-01
- [ ] `tsup` build entry configuration and `pnpm build` script — required for TOOL-03
- [ ] `pnpm-lock.yaml` — required for deterministic installs under TOOL-01

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Operator-facing command replacements remain understandable and complete across docs and deploy assets | TOOL-07 | The requirement spans README, CI, deploy, and PM2 semantics rather than one runtime assertion | Read `README.md`, `.github/workflows/ci.yml`, `deploy/remote-deploy.sh`, and `ecosystem.config.cjs`; verify every documented/operator invocation uses `pnpm` or the documented replacement command surface and no required operational step still depends on `npm` |
| ESM-forward build still preserves usable runtime entrypoints and worker startup behavior | TOOL-03 | Built files can exist while runtime semantics are still broken | Run the built schedule/parse entry smoke commands and verify worker-thread startup paths still resolve under the emitted build layout |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
