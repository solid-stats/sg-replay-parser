# Technology Stack

**Project:** Replay Parser Modernization
**Researched:** 2026-03-29

## Recommended Stack

This is a brownfield Node.js batch parser, not a frontend app and not a published reusable library. The standard 2026 modernization path is therefore:

1. move the repo to **Node.js 24 LTS**
2. pin **pnpm 10** via `packageManager`
3. run TypeScript entrypoints with **tsx**
4. switch the codebase to **ESM-first source**
5. use **TypeScript 5.9** with a Node-focused config, not the provided frontend-oriented `bundler`/React config
6. use **ESLint 9 flat config** with `typescript-eslint` typed linting
7. replace `jest` + `ts-jest` with **Vitest 4**
8. keep a build step for production output, but treat **tsup as transitional**, not strategic

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Node.js | 24 LTS | Production runtime | As of March 29, 2026, Node 24 (`Krypton`) is the current Active LTS. That is the correct production target for a long-lived parser. Node 22 remains acceptable during migration, but 24 is the modern default. | HIGH |
| TypeScript | 5.9.x | Static typing and build-time validation | TS 5.9 is current, fast, and aligns with current Node module modes (`node20`/`nodenext`). Its newer defaults are closer to what this repo now needs than the current TS 4.6 config. | HIGH |
| ESM source layout | `type: "module"` in app code | Runtime/module model | Modern Node tooling is ESM-first. Staying on CommonJS keeps the repo fighting current tooling rather than using it. For this parser, ESM reduces friction with `tsx`, Vitest, and modern lint/build tooling. | HIGH |

### Tooling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| pnpm | 10.x | Package manager | `pnpm` is the current default choice for serious Node projects because installs are faster, storage-efficient, and stricter about dependency shape than npm. This is a straightforward upgrade from the current single-package npm setup. | MEDIUM |
| tsx | current stable | Dev/runtime execution for `.ts` entrypoints | Node’s own docs explicitly recommend a third-party runner for full TypeScript support and name `tsx` as the example. It is the cleanest replacement for “compile first, then run JS” during local/dev orchestration. | HIGH |
| ESLint | 9.x | Lint runner | Flat config is the default in ESLint 9. Migrating now avoids preserving a legacy `.eslintrc` model that the ecosystem is actively moving away from. | HIGH |
| typescript-eslint | 8.x | Type-aware TS linting | The maintained current path is the unified `typescript-eslint` package with `projectService` for typed linting. This is cleaner than the repo’s old split parser/plugin stack. | HIGH |
| Vitest | 4.x | Unit/integration tests | For Node TypeScript apps in 2026, Vitest is the standard Jest replacement when you want fast execution, native ESM/TS support, and a mostly familiar API. It removes the need for `ts-jest`. | HIGH |

### Build and Distribution

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `tsup` | 8.x only if required for roadmap compatibility | Transitional dist build | `tsup` still works, but its own repository warns that it is not actively maintained and recommends `tsdown`. Use `tsup` only if the milestone must land it for compatibility with the existing roadmap wording. | HIGH |
| `tsdown` | current stable | Preferred long-term build tool if a bundler is still wanted | `tsdown` is the successor path from the `tsup` ecosystem and explicitly supports migration from `tsup`. If you are making a fresh 2026 bundler decision, choose `tsdown`, not `tsup`. | MEDIUM |
| Plain `tsc` build | TS 5.9 | Production JS output for server app | Because this repo is an internal batch app, not a package for npm consumers, bundling is optional. For many parser entrypoints, plain transpilation with `tsc` is simpler and more debuggable than bundling. | HIGH |

### Infrastructure / Runtime Operations

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `systemd` service on Linux host | distro-managed | Process supervision | For a single-host batch parser, `systemd` is the standard production supervisor. It is simpler and more native than keeping PM2 as the long-term process manager. | MEDIUM |
| In-process continuous polling loop with explicit rate limiting | app-level | Replace cron-bound orchestration | The parser should run continuously and decide when to do light refreshes, full six-hour sweeps, parsing, and backoff. Cron can still exist for a safety trigger, but not as the primary orchestration model. | MEDIUM |
| `pino` | keep current major or upgrade to latest supported | Structured logging | `pino` is already a good fit for a CPU/file-heavy parser. Keep it; do not replace logging during the tooling migration unless a real problem appears. | MEDIUM |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| `@types/node` | match Node 24 line | Node API typings | Required once TS is upgraded; keep this aligned with the runtime major. | HIGH |
| `@eslint/js` | current | Base ESLint rules | Use as the base layer in flat config instead of legacy shareable configs like Airbnb. | HIGH |
| `globals` | current | Node/test globals for flat config | Use in ESLint config to scope globals cleanly per file set. | HIGH |
| `@vitest/coverage-v8` | current | Coverage provider | Use if coverage remains a requirement. It avoids Babel/Istanbul complexity. | MEDIUM |
| `tsx` test mode only for experiments | current | Node built-in test runner enhancement | Useful for small experiments, but do not split the repo between Vitest and Node test runner. Pick one runner. | MEDIUM |

## Prescriptive Decisions

### 1. Runtime target

Adopt **Node.js 24 LTS** as the runtime baseline.

Why:
- Node’s release policy explicitly says production apps should use Active LTS or Maintenance LTS.
- On **2026-03-29**, Node **24.x** is Active LTS and Node **22.x** is Maintenance LTS.
- That makes Node 24 the correct modernization target, while Node 22 is only a short-term compatibility waypoint.

### 2. Package manager

Adopt **pnpm 10** and pin it in `package.json`:

```json
{
  "packageManager": "pnpm@10"
}
```

Why:
- It gives reproducible installs and better workspace/dependency hygiene than the current npm setup.
- This repo is still single-package, so migration cost is low.
- It also makes future subpackages or split worker/shared packages easier if the codebase grows.

Do not keep both lockfiles. Remove `package-lock.json` once the migration is complete and checked in.

### 3. Module system

Move source to **ESM-first** and stop treating CommonJS output as the default target.

Why:
- `tsx`, Vitest, current TypeScript guidance, and current ESLint examples all assume modern ESM workflows.
- The project is an application, not a package with legacy external consumers. That removes the main reason to preserve CJS as the primary format.
- Current build output can still emit CJS temporarily if deployment needs it, but that should be a migration bridge, not the destination.

Recommendation:
- set `"type": "module"` in `package.json`
- use explicit Node imports such as `node:fs`, `node:path`, `node:worker_threads`
- prefer `module: "node20"` or `module: "nodenext"` in TS, not `commonjs`

### 4. TypeScript config

Do **not** copy `new_config_files/tsconfig.json` as-is.

That file is frontend/Next-oriented. For this parser it includes the wrong assumptions:
- `lib: ["dom", "dom.iterable", "esnext"]` is frontend noise
- `moduleResolution: "bundler"` is wrong for a Node app that runs on Node
- `jsx: "preserve"` is irrelevant
- Next.js plugin/config includes are irrelevant
- `.next` types and Vite config entries are irrelevant

Use a backend parser config closer to:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "node20",
    "moduleResolution": "node20",
    "lib": ["ES2023"],
    "types": ["node"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "declaration": false,
    "incremental": true,
    "noEmit": true
  },
  "include": ["src", "eslint.config.ts", "vitest.config.ts"]
}
```

Add a separate `tsconfig.build.json` for emit if the repo keeps a production build step.

### 5. ESLint config

Use **ESLint 9 flat config**, but trim the provided `new_config_files/eslint.config.ts` aggressively.

Keep:
- flat config structure
- `typescript-eslint`
- `eslint-plugin-import` if import hygiene remains valuable
- `eslint-plugin-unicorn` only if the ruleset stays pragmatic
- `globals`

Remove:
- `@next/eslint-plugin-next`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-jsx-a11y`
- `eslint-plugin-mobx`
- all React/JSX/Next settings
- `.tsx`, `.css.ts`, `.next`, `next-env.d.ts`, `vite-env.d.ts` assumptions

Recommended base approach:
- `@eslint/js` recommended
- `typescript-eslint` recommended + strict-type-checked
- `parserOptions.projectService: true`
- Node globals for source files
- test globals for Vitest files

Avoid reviving `eslint-config-airbnb-base` and `eslint-config-airbnb-typescript`. Those were common in older repos, but they are not the modern default and add migration friction in flat-config setups.

### 6. Test stack

Replace **Jest + ts-jest** with **Vitest 4**.

Why:
- `ts-jest` exists to patch TypeScript into Jest’s older execution model. That is unnecessary complexity in 2026.
- Vitest handles ESM and TypeScript cleanly and keeps much of the Jest-style ergonomics.
- The project already has a mostly unit-test-oriented structure, so migration is manageable.

Recommended test stack:
- `vitest`
- `@vitest/coverage-v8` if coverage is needed
- `vi.mock`, `vi.spyOn`, `expect` replacements for Jest API

Migration expectation:
- most `jest.fn`, `jest.spyOn`, `jest.mock` usage ports directly
- snapshot files need review
- fake timers and module mocks need targeted migration passes
- worker-thread tests should be run under actual Node environment, not jsdom

Do **not** migrate to Node’s built-in test runner for this repo unless you want to rewrite large parts of the mocking style. It is viable, but for a Jest-heavy brownfield parser it is not the lowest-risk migration path.

### 7. `tsx` usage

Adopt `tsx` for runtime entrypoints in development and operational scripts.

Recommended script pattern:

```json
{
  "scripts": {
    "dev:parse": "tsx src/start.ts",
    "dev:replays": "tsx src/jobs/prepareReplaysList/start.ts",
    "dev:schedule": "tsx src/schedule.ts",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

Important compatibility note:
- `tsx` does **not** type-check. Keep `tsc --noEmit` as a separate required verification step.

### 8. Build output

For this project, the correct 2026 answer is:

- **development/runtime:** `tsx`
- **typechecking:** `tsc --noEmit`
- **production artifact:** either plain `tsc` emit or `tsdown`

`tsup` is acceptable only as a compatibility bridge if the modernization phase already committed to it.

Why this is the recommendation:
- The `tsup` repository now says it is **not actively maintained** and explicitly tells users to consider `tsdown`.
- This repo is not shipping a public library where advanced bundle shaping is essential.
- Plain emitted JS is easier to debug for worker threads, file-path logic, and operational scripts.

Practical recommendation:
- If you need the lowest-risk migration: **emit with `tsc`**
- If you need faster/dist-friendly bundling and still want a modern bundler: **use `tsdown`**
- If the current milestone insists on `tsup`: use it only as a staged migration step and plan a follow-up move away from it

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Runtime | Node 24 LTS | Node 22 LTS | 22 is still valid, but on 2026-03-29 it is Maintenance LTS, not the default modernization target. |
| Package manager | pnpm 10 | npm 11 | npm is viable, but does not materially improve the repo’s dependency hygiene or install model enough to justify staying on the old path. |
| TS execution | tsx | ts-node | Node’s own learning docs show `tsx` as the straightforward modern runner. `ts-node` remains usable but is no longer the clean default. |
| Test runner | Vitest 4 | Jest 30 + ts-jest | Staying on Jest keeps the main legacy pain point alive. `ts-jest` is exactly the layer this modernization should remove. |
| Build tool | plain `tsc` or tsdown | tsup | `tsup` still works, but its own repo now marks it as not actively maintained. |
| Lint presets | `@eslint/js` + `typescript-eslint` | Airbnb legacy configs | Airbnb-based lint stacks are no longer the easiest or standard path in flat-config TypeScript repos. |
| Module model | ESM-first | CommonJS-first | CommonJS keeps the repo aligned to the older toolchain it is trying to leave. |
| Process supervisor | systemd | PM2 | PM2 is workable, but on a single Linux host `systemd` is the more standard, lower-complexity production answer. |

## Migration Guidance

### pnpm migration

1. Add `"packageManager": "pnpm@10"` to `package.json`.
2. Remove `package-lock.json`.
3. Run `pnpm import` only if you need a bootstrap from the npm lockfile, then generate a clean `pnpm-lock.yaml`.
4. Replace `npm run ...` documentation and CI commands with `pnpm ...`.

Compatibility note:
- Script semantics are mostly unchanged.
- Any tooling that shells out to `npm` directly should be updated explicitly.

### `tsx` migration

1. Stop compiling before every local/dev run.
2. Replace `node dist/...` dev flows with `tsx src/...`.
3. Keep production deploy scripts on built JS until runtime migration is stable.

Compatibility note:
- top-level await and ESM imports become easier
- path assumptions that relied on transpiled `dist` locations need review

### `tsup` migration

If the roadmap forces `tsup` adoption:
1. use it only for `build-dist`
2. keep config minimal
3. do not center the architecture around bundler-specific behavior

If the roadmap allows the better 2026 choice:
1. replace `tsup` with `tsdown` or plain `tsc`
2. keep one emitted format for the app unless deployment explicitly needs both

### TypeScript migration

1. upgrade to TS 5.9
2. switch from `commonjs` to `node20` or `nodenext`
3. add `types: ["node"]`
4. remove DOM/JSX/frontend-only settings
5. add `exactOptionalPropertyTypes`
6. keep `verbatimModuleSyntax`

Compatibility note:
- expect real type breakage from the jump from TS 4.6 to 5.9
- Buffer/typed-array typing got stricter in newer TS versions
- some implicit CJS patterns will fail once ESM is enabled

### ESLint migration

1. move to `eslint.config.ts` flat config
2. replace legacy parser/plugin packages with `typescript-eslint`
3. enable `projectService: true`
4. split source/test overrides cleanly
5. drop every React/Next/MobX rule or setting from the imported template

Compatibility note:
- some older plugins may need ESLint 9 compatibility review
- if a plugin is not flat-config ready, replace it rather than freezing ESLint at v8

### Test migration

1. install `vitest` and `@vitest/coverage-v8`
2. convert `jest.config.js` to `vitest.config.ts`
3. port mocks incrementally
4. migrate one test directory at a time
5. delete `ts-jest`, `babel-jest`, `@babel/*`, and Jest-specific typings after parity is reached

Compatibility note:
- this repo’s heavy mocking of `fs-extra`, `os`, and internal modules should migrate cleanly, but the exact hoisting behavior of mocks must be validated file by file

## Backend-Specific Trim From The Provided Frontend Config

Use the provided config files only as a donor of strictness, not as a template to copy wholesale.

Trim from `new_config_files/tsconfig.json`:
- remove `dom`, `dom.iterable`
- remove `jsx`
- remove `moduleResolution: "bundler"`
- remove Next/Vite includes
- remove the Next plugin entry
- remove any `.tsx`/CSS module assumptions

Trim from `new_config_files/eslint.config.ts`:
- remove Next plugin and rules
- remove React plugin and rules
- remove React Hooks rules
- remove jsx-a11y plugin and component mapping
- remove MobX plugin and rules
- change globals from browser to Node
- change resolver assumptions from frontend aliases to Node/TS app paths only

Keep from the donor config:
- strict TS rule philosophy
- flat config layout
- `unicorn` only if it remains pragmatic
- import hygiene rules that help batch/backend code

## Installation

```bash
# Core runtime/tooling
pnpm add -D typescript@^5.9 @types/node tsx eslint @eslint/js typescript-eslint globals vitest @vitest/coverage-v8

# Transitional only if roadmap requires tsup specifically
pnpm add -D tsup

# Preferred bundler alternative if bundling is still wanted
pnpm add -D tsdown
```

## Sources

- HIGH: Node.js release policy and current release table: https://nodejs.org/en/about/previous-releases
- HIGH: Node.js Release WG schedule showing 24.x Active LTS and 22.x Maintenance LTS on 2026-03-29: https://github.com/nodejs/Release
- HIGH: Node.js TypeScript docs recommending third-party runners for full TS support and noting `tsconfig.json` is not supported by built-in type stripping: https://nodejs.org/api/typescript.html
- HIGH: Node.js Learn docs showing `tsx` as a recommended TS runner: https://nodejs.org/en/learn/typescript/run
- HIGH: TypeScript 5.9 release notes, including updated `tsc --init` defaults and `node20` support: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html
- HIGH: ESLint flat config docs: https://eslint.org/docs/latest/use/configure/configuration-files
- HIGH: ESLint migration guide stating flat config is the default in ESLint 9: https://eslint.org/docs/latest/use/configure/migration-guide
- HIGH: typescript-eslint getting started and config guidance: https://typescript-eslint.io/getting-started/
- HIGH: typescript-eslint typed linting guidance and `projectService` recommendation: https://typescript-eslint.io/getting-started/typed-linting/ and https://typescript-eslint.io/packages/parser/
- HIGH: Vitest 4 site and feature overview, including backend support and Jest compatibility: https://vitest.dev/
- HIGH: `tsup` repository warning that the project is not actively maintained and recommending `tsdown`: https://github.com/egoist/tsup
- MEDIUM: `tsdown` repository stating compatibility with tsup and providing migration path: https://github.com/rolldown/tsdown
- MEDIUM: pnpm official site for current ecosystem guidance: https://pnpm.io/
- HIGH: Node package metadata docs for `packageManager` and `type`: https://nodejs.org/api/packages.html
