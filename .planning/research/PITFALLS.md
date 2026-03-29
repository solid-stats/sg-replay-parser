# Domain Pitfalls

**Domain:** Replay parser modernization for a Cloudflare-constrained Node.js statistics pipeline
**Researched:** 2026-03-29
**Overall confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: Treating the modernization as a tooling swap instead of a behavioral-preservation project
**What goes wrong:** teams upgrade package manager, runtime entrypoints, linting, and build output in one pass and assume green startup logs mean the migration is safe.
**Why it happens:** the migration work looks operational, but this codebase is really an output-contract pipeline. Small runtime changes can reorder replay handling, change error propagation, or alter generated artifacts.
**Consequences:** silent drift in `~/sg_stats/results`, replay-list snapshots, cache invalidation behavior, or scheduler sequencing; operators discover it only after downstream consumers ingest different data.
**Warning signs:**
- Snapshot or fixture assertions focus on “file exists” instead of semantic parity.
- Build/runtime migration PRs also change parsing/statistics logic.
- Result ordering, timestamp fields, or published directory layout start changing without an explicit decision.
- Verification only covers unit tests and not stable output comparisons against representative replay corpora.
**Prevention:** split modernization into compatibility-preserving phases; create golden dataset verification for replay list, parsed replay outputs, and final published results; require explicit sign-off for any output-contract change; compare old vs new runs on the same replay corpus before switching production orchestration.
**Detection:** diff of generated `~/sg_stats/results`, replay counts per game type, weekly buckets, and player IDs diverges between old and new pipelines.
**Phase:** Tooling Modernization Foundation
**Testing/type-safety migration pitfall:** do not weaken types or snapshots just to “get the migration through”; if stricter TypeScript exposes unsafe assumptions, fix the assumptions instead of casting through them.

### Pitfall 2: Underestimating pnpm strictness and symlinked `node_modules`
**What goes wrong:** the codebase works under npm but breaks after moving to pnpm because undeclared transitive dependencies, lifecycle assumptions, or workspace/package-lock habits were masking problems.
**Why it happens:** pnpm deliberately installs dependencies differently and more strictly; migration often gets scoped as “replace lockfile and scripts”.
**Consequences:** runtime module resolution failures, Jest/ts-jest edge cases, broken scripts in CI/pm2, or partial installs on production hosts.
**Warning signs:**
- Code imports packages not declared in the local `package.json`.
- CI depends on `npm ci` semantics or production hosts deploy from `package-lock.json`.
- Scripts assume flat `node_modules` layout or shell out to binaries that are only transitively present.
- Migration plan does not include lockfile/import validation on a clean machine.
**Prevention:** use `pnpm import` to create the first lockfile from `package-lock.json`; run installs on a clean environment; audit undeclared dependencies; pin Node and pnpm versions; update CI, pm2/service scripts, and documentation together; keep the package-manager switch isolated from parser logic changes.
**Detection:** clean-install smoke tests fail, production boot cannot resolve modules, or local success depends on a previously populated npm `node_modules`.
**Phase:** Package Manager Migration
**Testing/type-safety migration pitfall:** test runners often hide missing dependency declarations because the developer machine already has them. Run tests from a fresh install and keep type-only packages explicitly declared where the compiler relies on them.

### Pitfall 3: Using `tsx` as if it provides safety equivalent to a full TypeScript compile
**What goes wrong:** teams switch entrypoints to `tsx` and silently lose the habit of running a real type-check, because scripts execute fine while types have already regressed.
**Why it happens:** `tsx` is excellent for execution ergonomics, but execution is not type validation.
**Consequences:** invalid worker payload shapes, scheduler/runtime config mismatches, and unsafe parsing-state changes make it to production even though scripts still start.
**Warning signs:**
- `tsx` replaces `tsc --noEmit` in verification or CI.
- Type errors are handled with `as`, `unknown`, or broad `any` during migration.
- Worker message schemas and config readers rely more on trust than on typed validation.
- Build passes but editor and CI type diagnostics are diverging.
**Prevention:** keep a dedicated typecheck command in CI and local verification; preserve runtime schema validation at process boundaries; treat `tsx` as a runtime convenience only; make type regressions blocking during the migration.
**Detection:** TypeScript reports new errors after the runtime swap, or runtime crashes appear in workers/scheduler paths that were “working” under `tsx`.
**Phase:** Tooling Modernization Foundation
**Testing/type-safety migration pitfall:** explicit. `tsx` should not become a substitute for strict compiler enforcement on worker contracts, parsing status files, config loading, and output payload types.

### Pitfall 4: Standardizing on `tsup` without accounting for its current maintenance posture and Node-specific runtime needs
**What goes wrong:** teams adopt `tsup` because it is familiar, but treat it like a neutral long-term default for a Node service with worker threads, file-backed runtime paths, and PM2/service deployment.
**Why it happens:** bundler choice gets collapsed into “fast enough”, while Node runtime semantics, sourcemaps, externalization, and worker entrypoint behavior are left implicit.
**Consequences:** bundled workers fail to locate runtime files, stack traces degrade, dynamic imports or path assumptions break, and future tool maintenance becomes a surprise.
**Warning signs:**
- Build design does not spell out what stays external versus bundled.
- Worker thread entrypoints are not tested from built artifacts.
- Sourcemaps and stack traces are not verified in production-like runs.
- The team is unaware that the `tsup` repository now recommends considering `tsdown`.
**Prevention:** keep the bundler adoption narrow and explicitly Node-oriented; verify built worker entrypoints, external dependencies, sourcemaps, and output paths under `build-dist`; if `tsup` is kept, treat it as a tactical fit, not an unexamined default; document why it is still acceptable for this milestone.
**Detection:** `build-dist` succeeds but `schedule-prod` or built worker execution fails, or production errors no longer map cleanly back to source.
**Phase:** Build Runtime Migration
**Testing/type-safety migration pitfall:** run tests against source and at least one built-artifact smoke path; otherwise type-safe source can still ship a broken bundle.

### Pitfall 5: Replacing cron with a continuous loop without adding durable run-state, idempotency, and overlap control
**What goes wrong:** teams remove cron boundaries and introduce a forever loop, but keep the same assumptions about process lifetime and single-run ownership.
**Why it happens:** continuous looping feels simpler than scheduling, yet it changes failure recovery, shutdown behavior, duplicate-run protection, and run visibility.
**Consequences:** two loops process the same replay set, temp directories are cleaned by the wrong owner, partial failures are retried unsafely, or a stuck loop keeps reusing stale state forever.
**Warning signs:**
- Loop ownership is in memory only.
- There is no lease/lock with timeout and owner identity.
- Replay discovery, parse, and publish all share the same monolithic loop without durable checkpoints.
- The system cannot answer “what did the last run process, skip, and fail?”
**Prevention:** introduce durable run metadata before replacing cron; define single-owner locking, resumable checkpoints, explicit no-op runs, graceful shutdown handling, and idempotent publish semantics; separate trigger/orchestration from heavy work where possible.
**Detection:** duplicate processing, overlapping output generation, repeated temp directory wipes, or operators cannot reconstruct what a failed loop iteration actually did.
**Phase:** Continuous Orchestration Redesign
**Testing/type-safety migration pitfall:** add deterministic tests for overlap prevention, shutdown/resume, and stuck-lock recovery. Types should model run states explicitly rather than encoding them as loose JSON blobs.

### Pitfall 6: Optimizing replay throughput without preserving external-rate safety
**What goes wrong:** modernization speeds up replay discovery or raw replay fetching but accidentally increases request burstiness against `sg.zone`.
**Why it happens:** teams focus on local performance metrics and forget the source of truth is Cloudflare-constrained and operationally hostile to aggressive sweeps.
**Consequences:** Cloudflare bans, elevated failure rate, stale replay lists, and production instability exactly when continuous orchestration is supposed to improve freshness.
**Warning signs:**
- Concurrency changes are justified only by CPU or wall-clock gains.
- There is no request budget, jitter, backoff, or six-hour full-sweep guardrail.
- Discovery and raw replay download concurrency are tuned independently with no shared rate limit.
- Retry logic still uses immediate retries with no delay.
**Prevention:** build a central request budget for all `sg.zone` list/card/data requests; enforce the 15-requests-per-minute cap at one layer; add jitter and backoff; treat replay-page refresh and full sweep as separate strategies; emit metrics for request rate, ban events, and replay freshness.
**Detection:** ban frequency rises after “performance” work, request logs show spikes, or replay freshness drops even while the loop is running continuously.
**Phase:** Anti-Ban Discovery Redesign
**Testing/type-safety migration pitfall:** use fake timers and deterministic rate-limit tests so request pacing logic does not become timing-flaky.

### Pitfall 7: Parallelizing the hot path but leaving the real bottlenecks and memory shape intact
**What goes wrong:** projects add more workers or loop-level concurrency, but the dominant costs remain statistics hot-path cloning, repeated config reads, non-atomic output publication, and huge in-memory transforms.
**Why it happens:** worker-thread success on parsing creates the false impression that “more concurrency” is the next step everywhere.
**Consequences:** CPU goes up while total throughput barely improves, memory pressure spikes, GC pauses worsen, and single-threaded statistics still dominate end-to-end time.
**Warning signs:**
- Performance plans mention worker count before algorithmic hot spots.
- Benchmarks are collected only at total runtime, not by stage.
- Statistics still use repeated array copying, repeated lookup scans, or repeated config disk reads in inner loops.
- Output generation remains synchronous and non-atomic.
**Prevention:** optimize by profile, not intuition; fix algorithmic hot spots first; cache immutable config once per run; move to map-based mutable accumulators where appropriate; benchmark parse, statistics, and publish separately; validate memory usage, not just runtime.
**Detection:** more workers increase CPU but not throughput, or statistics still consume the majority of wall-clock time after “parallelization” work.
**Phase:** Statistics Scalability Overhaul
**Testing/type-safety migration pitfall:** large-volume benchmark fixtures need correctness assertions, not only timing assertions. Preserve exact aggregation semantics while changing data structures.

### Pitfall 8: Introducing caches without a full invalidation story
**What goes wrong:** parse-result caches or replay-correction layers improve warm-run performance, but stale cache entries survive logic changes, config changes, or operator corrections.
**Why it happens:** caching is added to fix throughput first, while invalidation is postponed as “future cleanup”.
**Consequences:** corrected replays remain wrong, parser bug fixes do not apply to old cached entries, and operators lose trust because reruns do not actually recompute what they think they recomputed.
**Warning signs:**
- Cache keys only include filename.
- There is no schema/version constant or correction-aware invalidation path.
- Operators have no explicit command/path to invalidate one replay or a version cohort.
- Warm-cache and cold-cache outputs are not compared in tests.
**Prevention:** version cache entries; define invalidation triggers up front; keep corrections logically separate from clean parse cache; test cold, warm, and invalidated runs against the same corpus; expose cache state in logs/metrics.
**Detection:** rerunning after a parser fix leaves historical outputs unchanged, or corrected replay results differ depending on cache temperature.
**Phase:** Replay Cache and Correction Support
**Testing/type-safety migration pitfall:** test both cache-hit and cache-miss branches with the same expected outputs; type cache payloads and invalidation reasons explicitly.

## Moderate Pitfalls

### Pitfall 9: Migrating tests and linting in a way that preserves passing status but lowers real protection
**What goes wrong:** teams modernize Jest/ESLint/TS configs, keep the pipeline green, but coverage exclusions, brittle fixtures, and missing operational tests remain untouched or get worse.
**Prevention:** keep behavior-first deterministic tests, add direct regression tests for known fragile areas, and treat operational entrypoints/build artifacts as first-class verification targets during migration.
**Warning signs:**
- Coverage still excludes the same high-risk jobs and output code.
- Migration removes tests that are “hard to port” without replacing them.
- Lint/type rules are relaxed globally to unblock the transition.
**Phase:** Verification Hardening

### Pitfall 10: Breaking worker/process contracts during runtime and build migration
**What goes wrong:** worker payloads, `workerData`, env/config parsing, or parsing-status files drift during refactors, especially when entrypoints and bundling change together.
**Prevention:** keep shared schemas for worker messages and persisted state; validate at runtime; use strict typing for discriminated unions and run states; test source-mode and built-mode worker execution.
**Warning signs:**
- Duplicated worker payload types in multiple files.
- New optional fields appear without discriminants or migration handling.
- Persisted JSON formats change without backward-compatibility tests.
**Phase:** Build Runtime Migration

### Pitfall 11: Improving throughput while leaving publication and recovery non-atomic
**What goes wrong:** faster parsing/statistics still publish results through a delete-then-move sequence, or loop restarts clean temp directories at unsafe times.
**Prevention:** use atomic publish semantics, richer run-state markers, and single ownership of temp directory lifecycle.
**Warning signs:**
- Publish step can remove the previous good results before the new publish is durable.
- Recovery from mid-publish failure is manual.
- Temp directory cleanup happens in multiple layers.
**Phase:** Continuous Orchestration Redesign

## Minor Pitfalls

### Pitfall 12: Chasing the newest stack without controlling migration scope
**What goes wrong:** package manager, Node version, TypeScript major version, test runner changes, bundler, and runtime orchestration all move together.
**Prevention:** one risky axis per phase, with a rollback plan and parity verification after each phase.
**Phase:** Tooling Modernization Foundation

### Pitfall 13: Measuring only average runtime and missing operational health signals
**What goes wrong:** teams report “faster” runs while ignoring Cloudflare failures, cache-hit rates, publish failures, skipped replays, and memory growth.
**Prevention:** instrument stage durations, replay counts, cache hit/miss, request budget usage, ban events, and publish outcomes; alert on sustained failures, not isolated blips.
**Phase:** Observability and Operations Hardening

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Tooling modernization | Output-contract drift hidden behind “successful” dependency upgrades | Golden corpus diff tests before and after each tooling change |
| Package manager migration | pnpm reveals undeclared deps and script assumptions | Fresh-install CI on pinned Node/pnpm; audit imports and binaries |
| Build/runtime migration | `tsx` masks type regressions; bundled workers fail only after `build-dist` | Keep separate typecheck; smoke-test built entrypoints and workers |
| Continuous loop orchestration | Overlap, stale locks, temp dir ownership conflicts | Durable run-state, leases, resumable checkpoints, graceful shutdown tests |
| Anti-ban redesign | Local throughput tuning increases Cloudflare risk | Central request budget, jitter, backoff, replay freshness metrics |
| Statistics scaling | More workers, same bottlenecks | Profile-guided optimization and per-stage benchmarks |
| Cache/corrections | Fast warm runs, stale historical truth | Versioned cache plus explicit invalidation and warm/cold parity tests |
| Verification hardening | Green CI with weaker real protection | Direct tests for fragile jobs, known bugs, output publishing, and worker contracts |

## Sources

- Project context and architecture:
  - `/home/afgan0r/Projects/SolidGames/replays-parser/.planning/PROJECT.md`
  - `/home/afgan0r/Projects/SolidGames/replays-parser/docs/architecture.md`
  - `/home/afgan0r/Projects/SolidGames/replays-parser/docs/plans/2026-02-15-replay-parser-scaling-1000-5000-design.md`
  - `/home/afgan0r/Projects/SolidGames/replays-parser/.planning/codebase/CONCERNS.md`
- pnpm official docs:
  - https://pnpm.io/cli/import (HIGH confidence for lockfile migration details)
  - https://pnpm.io/ (MEDIUM confidence for current package-manager positioning)
- TypeScript official docs:
  - https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html (HIGH confidence for stricter migration implications)
- tsx docs:
  - https://tsx.is/node-enhancement (MEDIUM confidence for current runtime usage; execution ergonomics, not type-checking)
- tsup official repository:
  - https://github.com/egoist/tsup (HIGH confidence for current maintenance warning and install guidance)
- Node/job orchestration guidance:
  - https://www.projektid.co/lectures/website/course-fourteen/nodejs/lecture-six/jobs-scheduling-and-reliability (LOW-MEDIUM confidence; used for generic overlap/idempotency/reliability patterns, verified against this project’s architecture rather than treated as authoritative alone)
