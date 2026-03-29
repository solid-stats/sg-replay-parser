# Project Research Summary

**Project:** Replay Parser Modernization
**Domain:** Single-host replay parsing and statistics pipeline modernization
**Researched:** 2026-03-29
**Confidence:** HIGH

## Executive Summary

This project is a brownfield modernization of a production replay-processing pipeline, not a greenfield analytics product. The correct expert approach is to preserve the file-backed runtime contract under `~/sg_stats`, keep published outputs stable, and modernize around it: upgrade the Node/TypeScript toolchain, introduce durable orchestration state, reduce upstream scraping risk, and attack the real throughput bottlenecks in parsing and statistics. The architecture research is consistent on one point: the right target is a single-host control plane plus file-backed data plane, not a distributed rewrite.

The recommended path is pragmatic rather than fashionable. Move to Node 24 LTS, TypeScript 5.9, pnpm 10, ESLint 9 flat config, `tsx` for source entrypoints, and Vitest 4. Treat ESM-first source as the default direction. Keep build output generation, but do not make bundling the center of the modernization; plain `tsc` emit or `tsdown` is strategically cleaner, while `tsup` is acceptable only as a milestone compatibility bridge because the active project brief still names it explicitly.

The main risks are behavioral drift, not dependency churn. The pipeline can fail by silently changing outputs, increasing Cloudflare pressure, introducing overlapping loop ownership, or shipping stale cache/correction behavior. The roadmap should therefore phase work around control-plane safety first, anti-ban discovery second, replay-level caching and correction layering third, and deep statistics/publish hardening after those foundations are in place. Every major phase should preserve output parity with golden-corpus checks.

## Key Findings

### Recommended Stack

The modernization stack should optimize for a long-lived Node service, not for frontend conventions and not for library packaging. The strongest recommendation is Node 24 LTS, TS 5.9, ESM-first source, pnpm 10, `tsx` for runtime execution, ESLint 9 flat config with `typescript-eslint`, and Vitest 4. The provided reusable configs in `new_config_files` are useful only as donors of strictness; they must be trimmed heavily for a backend parser.

The only pragmatic exception is build tooling. Research says `tsup` is no longer the strategic default, but the active milestone already names `tsup`. That makes the correct planning stance: allow `tsup` only as a bounded compatibility step if required by roadmap continuity, while designing the rest of the system so the build tool can later move to plain `tsc` or `tsdown` without architectural fallout.

**Core technologies:**
- Node.js 24 LTS: production runtime baseline for the modernization window.
- TypeScript 5.9: strict typing with modern Node module support and better long-term defaults.
- ESM-first source: aligns the repo with modern Node, `tsx`, Vitest, and ESLint 9 workflows.
- pnpm 10: stricter dependency hygiene and lower-friction future repo growth.
- `tsx`: fast TypeScript entrypoint execution for local and operational scripts, but not a typecheck replacement.
- ESLint 9 flat config + `typescript-eslint`: current typed-linting standard for Node TypeScript apps.
- Vitest 4: lowest-friction Jest replacement for a brownfield TS/ESM codebase.
- SQLite control store: recommended durable metadata layer for leases, runs, replay catalog, cooldowns, cache index, and publish history.
- `pino`: keep structured logging; it already fits the workload.

### Expected Features

This milestone is not judged by UI or product breadth. It is judged by whether the existing replay pipeline becomes safer, more resumable, more correct under reprocessing, and able to scale higher without breaking the current results contract.

**Must have (table stakes):**
- Rate-limited replay discovery with recent-page refresh plus slower full sweep.
- Durable job state, resumability, and explicit overlap control.
- Replay-level parse cache with versioning and atomic writes.
- Deterministic reprocessing and output contract preservation checks.
- Replay correction support as backend/runtime capability.
- Immutable raw replay storage with derived correction layering.
- Backoff, retry, cooldown, and ban-aware failure handling.
- Separate throughput controls for discovery, download, parse, and publish lanes.
- Structured observability for request budget, retries, cache hit rate, backlog depth, and stage timing.
- Atomic publish of generated results.

**Should have (differentiators):**
- Fine-grained correction model with auditability.
- Per-replay provenance and explainability.
- Targeted backfills by replay subset/date range/correction scope.
- Queue and backlog visibility for operators.
- Dry-run or verification mode for migration and correction rollout.
- Multi-tier freshness policy beyond the minimum hot/cold sweep split.

**Defer (v2+):**
- Replay-correction UI.
- Distributed multi-host processing.
- Advanced anomaly detection.
- Fully adaptive throttling beyond fixed budgets and cooldowns.
- Incremental aggregate mutation or parallel map-reduce stats until replay-level cache and statistics internals are stable.

### Architecture Approach

The target architecture should keep raw payloads, parsed artifacts, and published results on disk while adding a small durable control plane for runtime state. The core split is network-bound discovery/download under a central request budget versus CPU-bound parse/statistics work under replay-level idempotency and cache/version control. This preserves the existing `~/sg_stats` contract while removing cron timing as the hidden state machine.

**Major components:**
1. Continuous Supervisor: owns singleton runtime loops, sleep/backoff, and recovery.
2. Run/Lease Manager: prevents overlap and persists run lifecycle state.
3. Discovery Controller + Request Budget Store: controls hot-path refreshes, cold sweeps, rate limits, and cooldowns.
4. Replay Catalog: canonical operational record for replay identity, freshness, raw status, parse status, and effective version.
5. Raw Downloader: fetches replay pages/raw JSON idempotently into the existing raw store.
6. Parse Planner + Worker Pool: computes parse-needed tasks and performs CPU-bound parsing only.
7. Parsed Cache Store + Correction Overlay Store: separates base parse truth from operator/runtime corrections.
8. Statistics Builder: generates deterministic aggregates from effective replay results.
9. Staging Publisher + Publish Switch: validates staging output and performs atomic publish/rollback-safe swaps.
10. Observability/Recovery layer: metrics, logs, dead-letter/problem lists, and health markers.

### Critical Pitfalls

1. **Treating modernization as a tooling swap** — prevent this with golden-corpus parity checks and explicit output-contract sign-off after each phase.
2. **Switching to pnpm without auditing dependency assumptions** — isolate the package-manager migration, run fresh-install verification, and fix undeclared dependencies before mixing in parser logic changes.
3. **Letting `tsx` replace real type safety** — keep `tsc --noEmit` mandatory and model worker/config/run-state contracts explicitly.
4. **Replacing cron with a forever loop before durable run-state exists** — introduce leases, resumable checkpoints, idempotent stage ownership, and graceful recovery first.
5. **Improving throughput in ways that increase Cloudflare risk** — centralize request budgeting, keep separate budgets per request type, and validate pacing with deterministic tests.
6. **Adding caches without invalidation/versioning** — version parse cache and correction schema from day one, and test warm, cold, and invalidated paths against identical expected outputs.
7. **Parallelizing parsing while leaving statistics as the dominant bottleneck** — do profile-guided statistics redesign before expensive concurrency work in aggregation.

## Implications for Roadmap

Based on the combined research, the roadmap should be structured around safety boundaries and dependency order, not around the repository’s current folders or isolated tooling tasks.

### Phase 1: Verification Baseline and Tooling Foundation
**Rationale:** The first risk is silent drift during modernization. The stack can change only after parity checks exist and the repo can be upgraded safely.
**Delivers:** Golden-corpus/output diff verification, pinned Node/pnpm versions, TS 5.9 config trimmed for Node, ESLint 9 flat config, Vitest migration plan or implementation, `tsx` entrypoint adoption, and explicit `typecheck`.
**Addresses:** Output contract preservation, runtime config hygiene, deterministic reprocessing.
**Avoids:** Tooling-swap drift, pnpm migration surprises, `tsx` masking type regressions.

### Phase 2: Durable Control Plane and Continuous Supervisor
**Rationale:** Every later change depends on explicit run ownership and durable metadata. Continuous orchestration is unsafe until the control plane exists.
**Delivers:** SQLite control DB, run/lease records, replay catalog skeleton, singleton supervisor loops, resumable checkpoints, and overlap protection.
**Implements:** Control-plane/data-plane split, run/lease manager, continuous loop model.
**Avoids:** Cron-coupled fragility, duplicate runs, stale lock ownership, unsafe temp cleanup.

### Phase 3: Anti-Ban Discovery and Catalog Promotion
**Rationale:** Upstream safety is a hard operational constraint and must land before any throughput-oriented discovery changes.
**Delivers:** Central request budget, 15/min replay-list enforcement, cooldown/backoff/jitter, recent-page hot path, six-hour cold sweep, replay catalog as operational truth, and compatibility export to `replaysList.json`.
**Addresses:** Rate-limited replay discovery, ban-aware handling, durable replay discovery state.
**Avoids:** Cloudflare risk regressions and over-aggressive full-site sweeps.

### Phase 4: Replay-Level Parse Cache and Correction Layer
**Rationale:** Replay-level idempotency is the first major throughput unlock, and correction support is active milestone scope. These two concerns should be designed together so cache semantics do not harden prematurely.
**Delivers:** Parse planner, versioned parsed cache index, cache invalidation rules, correction overlay store, effective replay composition, targeted reparse/backfill semantics, and correction observability.
**Addresses:** Replay parse cache, deterministic reprocessing, correction support, targeted invalidation.
**Avoids:** Stale cache truth, raw-data mutation, full rebuild dependency for small fixes.

### Phase 5: Statistics Throughput and Publish Hardening
**Rationale:** Research shows the main scaling ceiling is statistics and publish safety, not raw parsing. This work should happen only after replay-level cache and effective replay streams are stable.
**Delivers:** Statistics hot-path redesign, cached immutable config loading, reduced sync I/O in aggregation/output, staging manifest validation, atomic publish swap, rollback snapshot retention, and stage-level metrics.
**Addresses:** Incremental statistics regeneration minimum path, structured observability, atomic publish, throughput scaling.
**Avoids:** More-workers-same-bottleneck failure mode and half-published outputs.

### Phase 6: Advanced Scaling and Operator Ergonomics
**Rationale:** Only after correctness, safety, and replay-level caching are stable should the project consider deeper optimization or richer operator features.
**Delivers:** Targeted backfills, dry-run mode, backlog visibility, optional advanced stats parallelization, and evidence-based tuning from metrics.
**Implements:** Differentiators that become valuable once the core loop is stable.
**Avoids:** Premature complexity and hard-to-debug scaling layers.

### Phase Ordering Rationale

- Control-plane work comes before orchestration because loops without durable state are strictly less safe than cron.
- Anti-ban discovery comes before discovery throughput or concurrency changes because upstream safety is a hard external constraint.
- Replay-level cache and corrections belong together because invalidation semantics are shared.
- Statistics optimization is intentionally later because research consistently identifies algorithmic and publication issues as more important than raw worker count.
- Publish hardening belongs before high-frequency continuous operation so the system always exposes either the previous good snapshot or the next complete one.
- Advanced operator features and deeper scaling are postponed until the output contract, correction model, and control plane are stable enough to support them safely.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** control-store schema and lease semantics need implementation-specific planning because they reshape runtime ownership and recovery.
- **Phase 3:** anti-ban discovery policy needs careful planning around request classes, cooldown thresholds, and replay freshness heuristics.
- **Phase 4:** correction overlay rules and cache invalidation boundaries need targeted planning because they directly affect trust and rerun semantics.
- **Phase 5:** statistics internals should be planned from profiling evidence to avoid optimizing the wrong structures.

Phases with standard patterns (likely skip separate research-phase):
- **Phase 1:** Node/pnpm/TS/ESLint/Vitest migration patterns are well-documented and already strongly researched.
- **Parts of Phase 5:** atomic staging/publish semantics are standard once the repo-specific output set is enumerated.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based mostly on official Node, TypeScript, ESLint, and Vitest guidance, with one pragmatic exception around `tsup` vs long-term build strategy. |
| Features | HIGH | Strongly grounded in the project brief, current architecture, and explicit milestone scope rather than speculative product ideas. |
| Architecture | HIGH | Multiple project documents converge on the same single-host control-plane direction and on the same main bottlenecks. |
| Pitfalls | MEDIUM-HIGH | Most pitfalls are well supported by the project’s current behavior and modernization scope; exact implementation failure modes still need phase-level validation. |

**Overall confidence:** HIGH

### Gaps to Address

- `tsup` vs `tsdown` vs plain `tsc`: the milestone brief still says `tsup`, but research favors avoiding strategic dependence on it. Planning should decide whether to keep `tsup` as a compatibility checkpoint or narrow the requirement to “build-dist modernization.”
- SQLite schema shape and migration policy: architecture direction is clear, but table design and retention/checkpoint strategy need concrete phase planning.
- Correction overlay scope: the minimum actions are clear, but the exact patch schema and operator workflow should be defined before implementation starts.
- Statistics bottleneck prioritization: research says statistics are the real scaling ceiling, but the first implementation plan should confirm hot spots with fresh profiling on representative corpora.
- Output parity harness: the summary assumes golden-corpus verification becomes the gate for each phase, but the exact representative corpus and comparison boundaries still need to be defined.

## Sources

### Primary (HIGH confidence)
- `/home/afgan0r/Projects/SolidGames/replays-parser/.planning/PROJECT.md` — milestone scope, active requirements, constraints.
- `/home/afgan0r/Projects/SolidGames/replays-parser/docs/architecture.md` — current runtime flow, storage contract, scheduler, parse/statistics/output behavior.
- `/home/afgan0r/Projects/SolidGames/replays-parser/.planning/research/STACK.md` — modernization stack recommendation and migration constraints.
- `/home/afgan0r/Projects/SolidGames/replays-parser/.planning/research/FEATURES.md` — table stakes, differentiators, anti-features, and dependency chains.
- `/home/afgan0r/Projects/SolidGames/replays-parser/.planning/research/ARCHITECTURE.md` — target architecture, component boundaries, patterns, and build order.
- `/home/afgan0r/Projects/SolidGames/replays-parser/.planning/research/PITFALLS.md` — phase-specific risks and mitigation patterns.
- https://nodejs.org/en/about/previous-releases — Node release status.
- https://nodejs.org/api/typescript.html — Node TypeScript runtime guidance.
- https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html — TS 5.9 capabilities and defaults.
- https://eslint.org/docs/latest/use/configure/configuration-files — ESLint 9 flat config.
- https://typescript-eslint.io/getting-started/typed-linting/ — typed linting guidance.
- https://vitest.dev/ — test runner capabilities and ESM/TS fit.

### Secondary (MEDIUM confidence)
- `https://pnpm.io/` — package manager positioning and migration context.
- `https://github.com/rolldown/tsdown` — successor build-tool migration path from `tsup`.
- `https://www.sqlite.org/wal.html` — SQLite WAL concurrency model for local control-store use.
- `https://docs.bullmq.io/guide/rate-limiting` — rate-limiting pattern reference, used as pattern inspiration rather than as a required dependency.
- Cloudflare retry/rate-limit guidance cited in research docs — upstream-safe retry and budget patterns.

### Tertiary (LOW confidence)
- Generic Node job orchestration material cited in `PITFALLS.md` — useful as supporting pattern language, but the roadmap should rely primarily on project-specific evidence and official docs.

---
*Research completed: 2026-03-29*
*Ready for roadmap: yes*
