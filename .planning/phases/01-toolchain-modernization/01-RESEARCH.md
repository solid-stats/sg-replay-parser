# Phase 1: Toolchain Modernization - Research

**Researched:** 2026-03-29
**Domain:** Node.js backend toolchain modernization for a brownfield TypeScript parser
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Package manager policy
- **D-01:** `pnpm` is the only supported package manager after Phase 1. Existing `npm` artifacts and workflows should be removed rather than kept as a transition path.
- **D-02:** The migration should make `pnpm` usage explicit in documentation and scripts, and planners should prefer fail-fast behavior over silent compatibility with `npm`.

### Operator command surface
- **D-03:** Phase 1 may replace the current operator-facing command shape with a cleaner modern command surface instead of preserving npm-era command semantics.
- **D-04:** Planner should treat documented replacements as sufficient; compatibility wrappers are not required for this phase.

### Runtime/build module stance
- **D-05:** Phase 1 should actively move the repository toward modern ESM-oriented tooling rather than defaulting to conservative CommonJS-only output semantics.
- **D-06:** Research and planning should still account for the repository's production entrypoints and determine the safest ESM-compatible build/runtime arrangement, but the target direction is modernization, not preserving legacy module behavior by default.

### TypeScript and lint strictness
- **D-07:** Apply the strongest practical strictness in Phase 1 instead of deferring most cleanup to later phases.
- **D-08:** Planner may break the work into migration and cleanup tasks, but the end state of Phase 1 should reflect a genuinely strict modern TypeScript and ESLint baseline, not a lightly upgraded legacy setup.

### Test runner migration
- **D-09:** Phase 1 must migrate the repository from Jest to Vitest instead of retaining Jest on the modernized toolchain.
- **D-10:** The Vitest migration must preserve deterministic, behavior-focused tests and maintain equivalent or better verification confidence for existing parser behavior.

### Risk posture
- **D-11:** Treat Phase 1 as a clean baseline reset. A cleaner long-term toolchain is more important than keeping temporary compatibility layers for old commands or module assumptions.

### the agent's Discretion
- Exact `pnpm` enforcement mechanism (`only-allow`, CI guard, script guard, or equivalent)
- Whether `tsx` is used only for source-mode entrypoints or also in auxiliary tooling/scripts
- Exact `tsup` output shape, as long as it aligns with the chosen ESM-forward direction and remains operationally usable
- Exact Vitest configuration details, provided they preserve deterministic execution and cover the current test surface
- How to stage strictness cleanup across sub-plans inside Phase 1

### Claude's Discretion
- Exact `pnpm` enforcement mechanism (`only-allow`, CI guard, script guard, or equivalent)
- Whether `tsx` is used only for source-mode entrypoints or also in auxiliary tooling/scripts
- Exact `tsup` output shape, as long as it aligns with the chosen ESM-forward direction and remains operationally usable
- Exact Vitest configuration details, provided they preserve deterministic execution and cover the current test surface
- How to stage strictness cleanup across sub-plans inside Phase 1

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TOOL-01 | Developer can install and run the project with `pnpm` as the only supported package manager | `packageManager` pin, `pnpm-lock.yaml`, `only-allow pnpm`, CI/deploy script migration, doc updates |
| TOOL-02 | Developer can run TypeScript entrypoints directly with `tsx` for local and operational source-mode workflows | `tsx` runtime scripts for `src/start.ts`, `src/schedule.ts`, `src/jobs/*/start.ts`, `src/!yearStatistics/index.ts` |
| TOOL-03 | Developer can build production-ready output with the new build pipeline while preserving current runtime entrypoint behavior | `tsup` multi-entry build preserving `dist/start.js`, `dist/schedule.js`, `dist/jobs/*/start.js`, worker-path verification |
| TOOL-04 | Developer can typecheck the repository with a modern strict TypeScript configuration trimmed for a backend Node.js parser | split strict base/build config, Node-oriented module settings, staged strictness cleanup, no React/Next/browser assumptions |
| TOOL-05 | Developer can lint the repository with an ESLint flat config derived from `new_config_files` without React, Next.js, JSX, or browser-only rules | flat config trimmed to backend TS, `@eslint/js` + `typescript-eslint` typed rules, import handling, ignore migration |
| TOOL-06 | Developer can run the test suite on Vitest as part of the modernized toolchain with deterministic behavior and no loss of verification quality | Jest-to-Vitest parity work: mocks, hoisting, timers, `requireActual`, coverage config, file layout and setup changes |
| TOOL-07 | Operator can run the existing production commands or their documented replacements without depending on npm-specific behavior | PM2/deploy/README command migration from `npm` to `pnpm` and from legacy script chains to documented direct replacements |
</phase_requirements>

## Summary

Phase 1 should be planned as a coordinated toolchain migration, not a dependency bump. The repo currently couples `npm` scripts, CommonJS `tsc` output, Jest + `ts-jest`, Airbnb ESLint config, and PM2/deploy flows around compiled `dist/*.js` entrypoints. The brownfield risk is not the compiler itself; it is preserving those operational entrypoints while moving development, tests, linting, and builds to an ESM-forward stack.

The safest Phase 1 architecture is: `pnpm` as the only package manager, `tsx` for source-mode execution, `tsup` for multi-entry production builds into `dist/`, strict TypeScript with backend-only settings, ESLint flat config with typed rules, and Vitest with explicit compatibility work for the current Jest-heavy suite. This should be paired with explicit command-surface rewrites in `package.json`, `.github/workflows/ci.yml`, `deploy/remote-deploy.sh`, `ecosystem.config.cjs`, and `README.md`.

The highest planning risk is TOOL-06. This repo has 38 test files, 57 `jest.mock(...)` calls, 58 `jest.spyOn(...)` calls, 4 `jest.resetModules(...)` calls, 1 `jest.requireActual(...)` call, 1 fake-timer use, 1 `setSystemTime`, and 3 snapshot files. Vitest can cover this surface, but planners should assume at least one dedicated migration/cleanup sub-plan for module-mock hoisting, import-order sensitivity, and coverage-threshold configuration changes.

**Primary recommendation:** Plan Phase 1 around a strict `pnpm` + `tsx` + `tsup` + ESLint flat config + Vitest stack, with separate tasks for command-surface migration, build/entrypoint preservation, and Jest-to-Vitest test conversion.

## User Constraints

The planner must honor the `<user_constraints>` block above exactly. No compatibility path for `npm` should be retained, and Jest must not survive Phase 1.

## Project Constraints (from CLAUDE.md)

- Preserve output contracts and runtime folder semantics.
- Do not increase Cloudflare/rate-limit risk through modernization work.
- Respect the file-backed runtime model under `~/sg_stats`.
- Treat this as brownfield modernization, not a rewrite.
- Keep tests deterministic, readable, and meaningful.
- Keep or improve type safety during migration.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `pnpm` | `10.33.0` | Single supported package manager | Fast, deterministic installs; supports `packageManager` pinning and clean lockfile migration |
| `tsx` | `4.21.0` | Run TS entrypoints directly in Node workflows | Standard low-friction TS runtime for backend scripts and operators |
| `tsup` | `8.5.1` | Multi-entry production build to `dist/` | Simple esbuild-based build for Node apps with entry preservation and declaration generation |
| `typescript` | `6.0.2` | Strict typecheck baseline | Current strict TS features and better ESM/Node interop options |
| `vitest` | `4.1.2` | Test runner replacing Jest | Fast Vite-powered runner with Jest-like API and strong TS support |
| `@vitest/coverage-v8` | `4.1.2` | Coverage provider for Vitest | Recommended Vitest coverage provider with current accuracy parity |
| `eslint` | `10.1.0` | Lint engine | Current flat-config-first ESLint baseline |
| `@eslint/js` | `10.0.1` | Core JS flat config presets | Standard base for flat config migration |
| `typescript-eslint` | `8.57.2` | TS parser, plugin, and typed flat configs | Standard backend TS lint stack for flat config |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `only-allow` | `1.2.2` | Fail fast when user installs with non-`pnpm` manager | Use in `preinstall` to enforce TOOL-01 locally and in CI |
| `vite-tsconfig-paths` | current if needed | Resolves TS path aliases in Vitest/Vite | Use only if Phase 1 adds aliases; current repo does not require it |
| `c8` | not recommended here | Standalone coverage tool | Only if Vitest coverage proves incompatible, which is unlikely |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `tsup` | `tsc` only | Preserves current behavior but does not satisfy the modernized build direction cleanly |
| `tsup` | `tsdown` | `tsup` itself points users toward `tsdown`, but Phase 1 explicitly calls for `tsup`; stick to scope |
| `tsx` | `ts-node` | More legacy friction and weaker fit for ESM-forward source-mode execution |
| Vitest | Jest | Rejected by locked decision D-09 |

**Installation:**
```bash
pnpm add -D typescript tsx tsup vitest @vitest/coverage-v8 eslint @eslint/js typescript-eslint only-allow
pnpm remove jest ts-jest babel-jest @types/jest @babel/core @babel/preset-env @babel/preset-typescript eslint-config-airbnb-base eslint-config-airbnb-typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

**Version verification:** Verified from the npm registry on 2026-03-29.

```bash
npm view pnpm version
npm view tsx version
npm view tsup version
npm view typescript version
npm view vitest version
npm view @vitest/coverage-v8 version
npm view eslint version
npm view @eslint/js version
npm view typescript-eslint version
npm view only-allow version
```

## Architecture Patterns

### Recommended Project Structure

```text
.
├── src/                       # Runtime entrypoints and parser code
├── dist/                      # Built output from tsup
├── eslint.config.mjs          # Flat ESLint config
├── tsconfig.json              # Strict no-emit typecheck config
├── tsconfig.build.json        # Build-oriented config consumed by tsup if needed
├── vitest.config.ts           # Vitest + coverage config
├── package.json               # pnpm-only scripts and packageManager pin
└── .github/workflows/ci.yml   # pnpm-based CI
```

### Pattern 1: Split Source-Mode and Build-Mode Entry Surfaces
**What:** Use `tsx` for local/operator source-mode execution and `tsup` for production `dist/` builds, but preserve the same logical entrypoints.
**When to use:** Always in this phase. The repo has multiple operational entrypoints and a worker-thread script path that currently assumes compiled JS output.
**Example:**
```json
{
  "scripts": {
    "parse": "tsx src/start.ts",
    "schedule": "tsx src/schedule.ts",
    "build": "tsup src/start.ts src/schedule.ts src/jobs/prepareReplaysList/start.ts src/jobs/updateNameChangesCsv/start.ts src/!yearStatistics/index.ts --format esm --out-dir dist --clean",
    "parse:dist": "node dist/start.js",
    "schedule:dist": "node dist/schedule.js"
  }
}
```

### Pattern 2: Keep Typecheck as `noEmit`, Let Build Own Emission
**What:** The main `tsconfig.json` should be strict and `noEmit`; build output should come from `tsup`, not from `tsc`.
**When to use:** For TOOL-03 and TOOL-04. This avoids mixed ownership between `tsc` and `tsup`.
**Example:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "vitest.config.ts", "eslint.config.mjs"]
}
```

### Pattern 3: Multi-Entry `tsup` Build That Preserves Operational Paths
**What:** Build each production entry explicitly so `dist/schedule.js`, `dist/start.js`, and job entrypoints still exist at predictable paths.
**When to use:** Mandatory. `ecosystem.config.cjs` and deploy scripts currently rely on `dist/schedule.js`.
**Example:**
```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/start.ts',
    'src/schedule.ts',
    'src/jobs/prepareReplaysList/start.ts',
    'src/jobs/updateNameChangesCsv/start.ts',
    'src/!yearStatistics/index.ts',
    'src/1 - replays/workers/parseReplayWorker.ts',
  ],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  dts: false,
  shims: false,
})
```

### Pattern 4: Backend-Only ESLint Flat Config
**What:** Start from `new_config_files/eslint.config.ts`, but strip React, Next, JSX, browser globals, and frontend-only plugins entirely.
**When to use:** Mandatory. The reusable config is frontend-heavy.
**Example:**
```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
)
```

### Pattern 5: Explicit Vitest Compatibility Layer
**What:** Convert Jest-specific globals and mocks deliberately instead of relying on implicit compatibility.
**When to use:** Mandatory for TOOL-06. This suite relies heavily on mocked modules and a few reset/timer APIs.
**Example:**
```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('fs-extra', () => ({
  readFileSync: vi.fn(),
  ensureDirSync: vi.fn(),
  writeFileSync: vi.fn(),
  moveSync: vi.fn(),
}))

beforeEach(() => {
  vi.restoreAllMocks()
})
```

### Anti-Patterns to Avoid

- **Keep `tsc` and `tsup` both emitting production JS:** This creates double-build drift and makes debugging runtime entrypoints harder.
- **Adopt `"moduleResolution": "bundler"` for the backend app by default:** This is optimized for bundler semantics, not Node runtime correctness.
- **Leave PM2/deploy scripts on `npm`:** That would fail TOOL-01 and TOOL-07 even if local scripts were updated.
- **Attempt a blind Jest-to-Vitest rename:** This repo has enough mocking edge cases that mechanical replacement is not safe.
- **Carry frontend rules from `new_config_files/eslint.config.ts`:** React/Next/browser assumptions are noise in this backend.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Package-manager enforcement | Custom shell guards | `packageManager` + `only-allow pnpm` | Simpler and standard |
| TS runtime execution | Custom loader scripts | `tsx` | Better ESM/TS ergonomics with less maintenance |
| Production bundling | Bespoke esbuild script | `tsup` | Handles multi-entry Node builds with minimal config |
| Test runner compatibility | Custom Jest shim layer | Vitest native APIs | Fewer surprises long-term |
| ESLint flat-config translation | Manual legacy compatibility forever | Native flat config + `typescript-eslint` configs | Keeps Phase 1 modern instead of transitional |
| Coverage instrumentation | Separate Babel/Istanbul stack | `@vitest/coverage-v8` | Recommended by Vitest and accurate in current versions |

**Key insight:** The repo’s real complexity is in runtime seams and test behavior, not in inventing tooling glue. Standard tools already solve the package-manager, TS runtime, bundling, and coverage problems better than custom scripts.

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None relevant to toolchain identity in `~/sg_stats` were found in the repo-scoped research. Runtime files store parser outputs and status, not package-manager or test-runner identity. | None — verified by architecture docs and current entrypoints. |
| Live service config | GitHub Actions uses `npm ci` and `npm run ...`; production deploy script also uses `npm ci`; PM2 runtime is started from `ecosystem.config.cjs` and saved server-side with current script assumptions. | Code edit plus operator redeploy. No data migration. |
| OS-registered state | PM2 saved process state likely still references the current schedule command and compiled path on the production host. | Re-register or `pm2 startOrReload` with updated config after Phase 1. No data migration. |
| Secrets/env vars | `.env` relay settings and GitHub secrets do not encode `npm`/Jest identity. Secret names can remain stable. | None, unless deploy instructions change server bootstrap steps. |
| Build artifacts | `package-lock.json`, current `dist/`, current coverage output, and server `node_modules` are legacy artifacts. Local/global CLI availability also shows `tsx`, `vitest`, `eslint`, `tsc`, `jest`, and `pm2` are not currently on shell `PATH`. | Code edit plus clean reinstall/rebuild. No data migration. |

**Nothing found in category:** Stored-data migration is not required for this phase based on repo-visible runtime contracts.

## Common Pitfalls

### Pitfall 1: ESM flip breaks worker-thread script loading
**What goes wrong:** `WorkerPool` currently constructs workers from `path.join(__dirname, '1 - replays/workers/parseReplayWorker.js')`. An ESM/package-type change can break `__dirname` assumptions or cause the worker output path to disappear.
**Why it happens:** The current build is CommonJS `tsc` output. `tsup` and package `"type"` settings change runtime semantics.
**How to avoid:** Preserve a built worker entry in `dist/1 - replays/workers/parseReplayWorker.js` and validate runtime creation in both source mode and built mode.
**Warning signs:** Worker startup failures, `ERR_WORKER_PATH`, `ReferenceError: __dirname is not defined`, missing parse output.

### Pitfall 2: Vitest module mocks are not a mechanical Jest swap
**What goes wrong:** Tests depending on Jest hoisting, `jest.requireActual`, and module-reset timing behave differently after a simple rename.
**Why it happens:** Vitest supports Jest-like APIs, but mock evaluation and Vite module loading are not identical.
**How to avoid:** Migrate the suite category-by-category, starting with pure unit tests, then module-mock-heavy files like `schedule.test.ts`, `parsingStatus.test.ts`, and helper utilities.
**Warning signs:** Mocked module imports resolving before `vi.mock`, unexpected real implementations, flaky failures only under watch mode.

### Pitfall 3: Coverage drops after Vitest v4 if `coverage.include` is omitted
**What goes wrong:** The suite may stop enforcing the same coverage surface currently defined in `jest.config.js`.
**Why it happens:** Vitest v4 no longer defaults to including all files in coverage; uncovered files are excluded unless `coverage.include` is set explicitly.
**How to avoid:** Port `collectCoverageFrom` semantics into explicit `coverage.include` and `coverage.exclude`.
**Warning signs:** Coverage reports look smaller or suddenly easier to satisfy without code changes.

### Pitfall 4: ESLint flat config migration accidentally keeps browser/frontend assumptions
**What goes wrong:** Node parser files get browser globals, React settings, or import-resolution rules copied from `new_config_files`.
**Why it happens:** The reusable config is designed for a frontend app.
**How to avoid:** Rebuild the flat config around Node globals and TypeScript only; do not start from the frontend plugin list.
**Warning signs:** Unused React/JSX plugins, browser globals in server files, lint config depending on nonexistent frontend files.

### Pitfall 5: TOOL-07 fails because docs and deployment are left behind
**What goes wrong:** Local scripts work, but CI, remote deploy, README bootstrap steps, or PM2 instructions still require `npm`.
**Why it happens:** Current operator surface is spread across `README.md`, `.github/workflows/ci.yml`, `deploy/remote-deploy.sh`, and `ecosystem.config.cjs`.
**How to avoid:** Treat command-surface migration as a first-class sub-plan, not documentation cleanup.
**Warning signs:** Green local runs but broken CI or production bootstrap.

### Pitfall 6: Strict TypeScript gets blocked by test-only legacy patterns
**What goes wrong:** Phase 1 stalls because strictness changes are mixed with runtime build changes and mock-heavy tests all at once.
**Why it happens:** The repo currently uses ambient types and older TS defaults.
**How to avoid:** Stage strictness cleanup after basic build/test boot is restored, but keep the final phase state strict.
**Warning signs:** Large volumes of `any` casts added “temporarily”, or strict flags being disabled to unblock build migration.

## Code Examples

Verified patterns from official sources and adapted to this phase:

### pnpm enforcement
```json
{
  "packageManager": "pnpm@10.33.0",
  "scripts": {
    "preinstall": "only-allow pnpm"
  }
}
```

### Vitest timer migration
```ts
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('advances scheduled work deterministically', () => {
  const mock = vi.fn()
  executeAfterDelay(mock)
  vi.runAllTimers()
  expect(mock).toHaveBeenCalledTimes(1)
})
```

### Vitest coverage configuration matching old Jest intent
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/!tests/**/*.ts',
        'src/jobs/**/*.ts',
        'src/!yearStatistics/**/*.ts',
      ],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
})
```

### Flat ESLint backend baseline
```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `npm` + `package-lock.json` | `pnpm` + `packageManager` pin + fail-fast enforcement | current ecosystem baseline | Cleaner lockfile and explicit package-manager policy |
| `tsc` as app build pipeline | `tsup` for build, `tsc --noEmit` for typecheck | modern Node TS workflows | Separates build emission from type analysis |
| Jest + `ts-jest` + Babel Jest | Vitest + V8 coverage | current Vite/Vitest ecosystem | Faster test runs and simpler config, but migration work needed |
| `.eslintrc` legacy config | ESLint flat config | ESLint v9 era | Better composability; legacy shareable configs need translation or replacement |
| CommonJS-only output default | ESM-forward Node tooling | modern Node ecosystem | Better alignment with current tooling, but worker/deploy seams must be handled explicitly |

**Deprecated/outdated:**
- `babel-jest` in this repo: only serves the Jest stack and should be removed with Jest.
- Airbnb TypeScript config for this phase: not aligned with flat-config-first modernization and adds unnecessary migration drag.
- `npm ci` in CI/deploy/docs: directly conflicts with D-01 and TOOL-01.

## Open Questions

1. **Should Phase 1 target package `"type": "module"` immediately, or keep package type neutral while still shipping ESM output?**
   - What we know: locked decisions require ESM-forward direction, but the repo has `__dirname`-based worker entry resolution and PM2 executes `dist/schedule.js`.
   - What's unclear: whether one phase can safely absorb the required import-path and runtime-semantics edits without destabilizing operations.
   - Recommendation: plan an explicit spike/task to validate the built worker and PM2 entrypoints under the chosen package type before broad source rewrites.

2. **Does the repo need TS path aliases during Phase 1?**
   - What we know: current imports are relative and work today; no alias system exists.
   - What's unclear: whether planners will introduce aliases while modernizing config.
   - Recommendation: do not add aliases in Phase 1. They create unnecessary Vitest/Vite resolver work.

3. **Will PM2 remain the operator’s documented production path after the command rewrite?**
   - What we know: current README, deploy script, and ecosystem file are PM2-based.
   - What's unclear: whether the user wants PM2 preserved or just functional documented replacements.
   - Recommendation: keep PM2 working in Phase 1 unless a different operator path is explicitly chosen in planning.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `node` | all tooling | ✓ | `v22.16.0` | use `.nvmrc` to switch if Phase 1 pins another version |
| `pnpm` | TOOL-01, CI, deploy | ✓ | `10.26.1` on host | install/pin exact repo version via `packageManager` |
| `npm` | legacy only | ✓ | `10.9.2` | none; should be removed from workflows |
| `tsx` | TOOL-02 | ✗ on PATH | — | repo-local devDependency via `pnpm exec tsx` |
| `tsup` | TOOL-03 | ✗ on PATH | — | repo-local devDependency via `pnpm exec tsup` |
| `typescript` / `tsc` | TOOL-04 | ✗ on PATH | — | repo-local devDependency via `pnpm exec tsc` |
| `eslint` | TOOL-05 | ✗ on PATH | — | repo-local devDependency via `pnpm exec eslint` |
| `vitest` | TOOL-06 | ✗ on PATH | — | repo-local devDependency via `pnpm exec vitest` |
| `jest` | current legacy tests | ✗ on PATH | — | repo-local install exists today; will be removed |
| `pm2` | current operator workflow | ✗ on PATH | — | keep config/docs only; production host install still required |

**Missing dependencies with no fallback:**
- None for planning. All missing toolchain CLIs can be provided as repo-local devDependencies and executed through `pnpm exec`.

**Missing dependencies with fallback:**
- `pm2` is not available in the current shell, but Phase 1 can still update config/docs without executing production PM2 locally.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Current: Jest 28 + `ts-jest`; Target: Vitest 4 + `@vitest/coverage-v8` |
| Config file | Current: `jest.config.js`; Target gap: `vitest.config.ts` |
| Quick run command | `pnpm exec vitest run --reporter=dot` |
| Full suite command | `pnpm exec vitest run --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOOL-01 | `pnpm` is the only supported manager | smoke | `pnpm install --frozen-lockfile` | ❌ Wave 0 |
| TOOL-02 | source-mode TS entrypoints run under `tsx` | smoke | `pnpm exec tsx src/start.ts --help` or equivalent harmless entry smoke | ❌ Wave 0 |
| TOOL-03 | build preserves required `dist/` entrypoints | smoke | `pnpm build && test -f dist/schedule.js && test -f dist/start.js` | ❌ Wave 0 |
| TOOL-04 | strict TS passes | typecheck | `pnpm typecheck` | ❌ Wave 0 |
| TOOL-05 | flat-config ESLint passes | lint | `pnpm lint` | ❌ Wave 0 |
| TOOL-06 | tests run on Vitest with deterministic behavior | unit | `pnpm test` and `pnpm exec vitest run --coverage` | ❌ Wave 0 |
| TOOL-07 | documented operator command replacements work without `npm` | smoke/manual | `pnpm build` plus command docs verification in README/deploy files | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm exec vitest run src/!tests/unit-tests/...` or nearest affected subset plus `pnpm typecheck`
- **Per wave merge:** `pnpm lint && pnpm typecheck && pnpm exec vitest run`
- **Phase gate:** `pnpm lint && pnpm typecheck && pnpm exec vitest run --coverage && pnpm build`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — required for TOOL-06
- [ ] `eslint.config.mjs` or `eslint.config.ts` — required for TOOL-05
- [ ] `pnpm-lock.yaml` — required for TOOL-01
- [ ] `package.json` script rewrite to `pnpm`/`tsx`/`tsup`/Vitest — required across TOOL-01..07
- [ ] CI workflow migration from `npm ci` to `pnpm` — required for TOOL-01 and TOOL-07
- [ ] Deploy script migration from `npm ci`/`npm run` to `pnpm` equivalents — required for TOOL-07
- [ ] Targeted Vitest migration coverage for module-mock-heavy tests like `src/!tests/unit-tests/schedule.test.ts` — required for TOOL-06

## Sources

### Primary (HIGH confidence)

- npm registry package metadata verified via `npm view` on 2026-03-29 for `pnpm`, `tsx`, `tsup`, `typescript`, `vitest`, `eslint`, `@eslint/js`, `typescript-eslint`, and `only-allow`
- Vitest Migration Guide: https://vitest.dev/guide/migration.html
- Vitest Mocking Modules: https://vitest.dev/guide/mocking/modules
- Vitest Timers: https://vitest.dev/guide/mocking/timers
- Vitest Coverage: https://vitest.dev/guide/coverage.html
- Vitest Common Errors: https://vitest.dev/guide/common-errors.html
- ESLint flat-config migration guide: https://eslint.org/docs/latest/use/configure/migration-guide
- `typescript-eslint` getting started / flat config: https://typescript-eslint.io/getting-started/
- TypeScript TSConfig reference: https://www.typescriptlang.org/tsconfig/
- TypeScript module compiler options guide: https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html
- Node.js package module docs: https://nodejs.org/api/packages.html
- pnpm installation docs: https://pnpm.io/installation

### Secondary (MEDIUM confidence)

- `tsx` project docs/site: https://tsx.is/
- `tsx` repository: https://github.com/privatenumber/tsx
- `tsup` repository: https://github.com/egoist/tsup

### Tertiary (LOW confidence)

- None needed for the primary recommendations.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH for `pnpm`, `tsx`, Vitest, ESLint flat config, and strict TS; MEDIUM for exact `tsup` output tuning because worker/runtime seams still need repo-specific validation.
- Architecture: MEDIUM because the build/runtime arrangement must preserve current `dist/` entrypoints and worker-thread loading under an ESM-forward direction.
- Pitfalls: HIGH because they are directly supported by current repo inspection plus official migration docs.

**Research date:** 2026-03-29
**Valid until:** 2026-04-28
