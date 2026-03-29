# Phase 1: Toolchain Modernization - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Move the repository to a modern `pnpm`/`tsx`/strict-TypeScript toolchain, replace the legacy Jest and npm-centered workflow, and keep the parser operational without changing its published output contract or `~/sg_stats` runtime semantics.

</domain>

<decisions>
## Implementation Decisions

### Package manager policy
- **D-01:** `pnpm` is the only supported package manager after Phase 1.
- **D-02:** The migration should remove npm-specific workflow assumptions instead of preserving them as a long-term compatibility path.

### Operator command surface
- **D-03:** Phase 1 may replace the current npm-era operator command shape with cleaner documented replacements.
- **D-04:** The primary documented interface should remain script-first through `pnpm run ...`, not raw `node` or `tsx` commands as the main UX.
- **D-05:** Deploy, PM2, CI, and README updates are part of the command-surface migration, not follow-up work.

### Runtime and build direction
- **D-06:** Phase 1 should move the repository toward modern ESM-oriented tooling rather than optimizing for conservative CommonJS preservation.
- **D-07:** The migration may reshape built entrypoint paths such as `dist/schedule.js` and `dist/start.js` if that produces a cleaner toolchain result.
- **D-08:** Any built-entrypoint path changes must be reflected consistently in deploy scripts, PM2 runtime config, and documentation within the same phase.

### TypeScript and lint strictness
- **D-09:** Phase 1 should end at the strongest practical TypeScript and ESLint strictness the repo can support.
- **D-10:** The planner may use staged cleanup sub-plans inside Phase 1, but the final state must still be genuinely strict rather than a partially upgraded baseline.

### Test runner migration
- **D-11:** Phase 1 must fully replace Jest with Vitest; Jest should not remain as a supported fallback at phase completion.
- **D-12:** Temporary migration scaffolding is acceptable during execution only if the final Phase 1 state is Vitest-only and preserves deterministic, behavior-focused verification confidence.

### the agent's Discretion
- Exact `pnpm` enforcement mechanism, such as `preinstall` guards or CI enforcement
- Exact `tsx` and `tsup` script layout, as long as it matches the locked script-first command posture
- Exact ESM build output arrangement and worker-entry handling
- Exact strict-TypeScript and ESLint flat-config rule set needed to reach the agreed end state
- Exact Vitest compatibility techniques and migration sequencing

</decisions>

<specifics>
## Specific Ideas

- The repo should treat Phase 1 as a baseline reset, not as a compatibility museum for npm-era tooling.
- Script-first ergonomics still matter even if the underlying runtime shifts to `tsx`, `tsup`, and ESM-oriented Node tooling.
- Built output may change shape if that is what the cleaner modernized toolchain requires, but operational docs and automation must move in lockstep.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition
- `.planning/ROADMAP.md` — Phase 1 scope, success criteria, and dependency position in the milestone
- `.planning/REQUIREMENTS.md` — TOOL-01 through TOOL-07 requirements that Phase 1 must satisfy
- `.planning/PROJECT.md` — Brownfield constraints, output-contract stability, runtime semantics, and project-level modernization posture
- `.planning/STATE.md` — Current project focus and cross-phase concerns still active during Phase 1

### Existing phase research
- `.planning/phases/01-toolchain-modernization/01-RESEARCH.md` — Existing research synthesis for the toolchain migration and recommended modernization stack

### Architecture and implementation constraints
- `docs/architecture.md` — Current system architecture and runtime responsibilities that Phase 1 must not accidentally break
- `.agents/skills/dependency-upgrade/SKILL.md` — Required repository-local guidance for dependency sequencing and upgrade risk handling
- `.agents/skills/javascript-testing-patterns/SKILL.md` — Required repository-local guidance for deterministic test migration and runner replacement

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `package.json` scripts already define the current operator and developer command surface, so Phase 1 can rewrite one central entrypoint map instead of inventing a new command layer elsewhere.
- `new_config_files/` already contains a reusable modern ESLint/TypeScript starting point that can be trimmed for a backend-only repo.
- `src/!tests/` already centralizes the test suite, which makes Vitest migration easier to stage without changing the project test layout.

### Established Patterns
- The current toolchain is npm + `tsc` + Jest + Airbnb ESLint, with compiled `dist/*` entrypoints used for operational flows.
- Production automation is script-driven: `deploy/remote-deploy.sh`, `ecosystem.config.cjs`, and README usage currently assume npm commands and built JS entrypoints.
- The repo favors deterministic, behavior-focused tests with extensive `jest.mock(...)` and `jest.spyOn(...)` usage, so Vitest compatibility work is a real migration concern, not a drop-in swap.

### Integration Points
- `package.json` controls the developer and operator command surface that must shift to `pnpm`.
- `deploy/remote-deploy.sh`, `.github/workflows/ci.yml`, and `ecosystem.config.cjs` must be updated together with any build-output or command changes.
- `tsconfig.json`, `tsconfig.build.json`, `.eslintrc`, `jest.config.js`, and `babel.config.js` are the main legacy toolchain integration points to replace or retire.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-toolchain-modernization*
*Context gathered: 2026-03-29*
