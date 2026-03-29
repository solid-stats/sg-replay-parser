# Roadmap: Replay Parser Modernization

## Overview

This roadmap modernizes the existing replay pipeline without changing its published contract by first stabilizing the developer toolchain, then adding explicit parity verification, durable runtime ownership, Cloudflare-safe discovery, replay-level cache and correction handling, and finally higher-throughput statistics generation with safer publishing.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Toolchain Modernization** - Move the repo to the new Node/TypeScript/pnpm runtime toolchain without breaking operator entrypoints.
- [ ] **Phase 2: Contract Verification Harness** - Make output, state, and runtime compatibility checks explicit and repeatable.
- [ ] **Phase 3: Durable Control Plane** - Replace cron-bound orchestration assumptions with resumable, non-overlapping runtime ownership.
- [ ] **Phase 4: Anti-Ban Discovery Flow** - Reduce replay-list pressure with first-page polling, six-hour sweeps, and enforced request budgeting.
- [ ] **Phase 5: Replay Cache and Corrections** - Add replay-level cache semantics and auditable correction overlays without mutating raw inputs.
- [ ] **Phase 6: Statistics Scaling and Safe Publish** - Remove current aggregation bottlenecks and publish results atomically at larger replay volumes.

## Phase Details

### Phase 1: Toolchain Modernization
**Goal**: Developers and operators can use the modernized pnpm/tsx/strict-TypeScript toolchain while preserving the existing runtime entrypoint behavior expected by this brownfield parser.
**Depends on**: Nothing (first phase)
**Requirements**: TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05, TOOL-06, TOOL-07
**Success Criteria** (what must be TRUE):
  1. Developer can install dependencies and run the repository using `pnpm` as the only supported package manager.
  2. Developer can execute operational and local TypeScript entrypoints through `tsx` and build distributable output with the modernized build pipeline.
  3. Maintainer can run strict typecheck, lint, tests, and build verification on the new toolchain without weakening TypeScript rigor or deterministic test behavior.
  4. Operator can invoke the production commands or their documented replacements without depending on npm-specific script semantics.
**Plans**: 4 plans
Plans:
- [ ] 01-01-PLAN.md — Restore `docs/architecture.md`, enforce pnpm-only package management, and define the `tsx` source-entry script surface
- [ ] 01-02-PLAN.md — Add the `tsup` build, preserve `dist/*` entrypoints, and rewire worker/PM2 runtime paths with fail-fast smokes
- [ ] 01-03-PLAN.md — Migrate the repo to strict Node-focused TypeScript and backend-only ESLint flat config
- [ ] 01-04-PLAN.md — Replace Jest with Vitest and finish the pnpm-based README, CI, deploy, and PM2 command surface

### Phase 2: Contract Verification Harness
**Goal**: Maintainers can prove that modernization preserves replay discovery, parse outputs, statistics outputs, and runtime compatibility on representative corpora before deeper runtime changes land.
**Depends on**: Phase 1
**Requirements**: VER-01, VER-02, VER-03
**Success Criteria** (what must be TRUE):
  1. Maintainer can run automated parity checks that compare old and new behavior for replay discovery, parsed replay results, and published statistics.
  2. Maintainer can verify the output contract against representative replay corpora and detect behavioral drift before shipping a modernization change.
  3. Maintainer can validate worker contracts, config contracts, and persisted-state contracts through explicit tests instead of relying on manual confidence.
**Plans**: TBD

### Phase 3: Durable Control Plane
**Goal**: The parser can run as a long-lived, resumable supervisor with explicit runtime ownership and durable operational state instead of implicit cron timing.
**Depends on**: Phase 2
**Requirements**: CTRL-01, CTRL-02, CTRL-03, CTRL-04, CTRL-05
**Success Criteria** (what must be TRUE):
  1. Operator can run the parser continuously, and the system no longer depends on waiting for the next cron boundary to make progress.
  2. System prevents overlapping active runs through durable lease or run-ownership state that survives process restarts.
  3. System can resume safely after crash or restart using persisted run metadata, checkpoints, and replay-level operational state.
  4. Operator and maintainer can inspect durable control-plane data for replay catalog state, throttling state, run metadata, and publish history separately from raw replay payload files.
**Plans**: TBD

### Phase 4: Anti-Ban Discovery Flow
**Goal**: Replay metadata stays fresh while the runtime materially lowers Cloudflare-ban risk through explicit polling strategy, rate limits, and degraded-mode behavior.
**Depends on**: Phase 3
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05, DISC-06
**Success Criteria** (what must be TRUE):
  1. System polls only the first replay-list page during normal refresh cycles and performs a full replay-list sweep every 6 hours.
  2. System enforces a hard cap of 15 replay-list page requests per minute and records request-budget usage durably or in structured logs.
  3. System enters bounded retry, cooldown, or degraded behavior when Cloudflare or upstream throttling signals appear instead of continuing aggressive fetches.
  4. Operator can confirm replay discovery freshness and replay catalog synchronization without increasing upstream ban risk relative to the current production flow.
**Plans**: TBD

### Phase 5: Replay Cache and Corrections
**Goal**: Replay processing becomes replay-addressable, cache-aware, and correction-capable so operators can fix or invalidate specific replays without mutating raw data or forcing blind full reparses.
**Depends on**: Phase 4
**Requirements**: PARSE-01, PARSE-02, PARSE-03, PARSE-04, PARSE-05, PARSE-06
**Success Criteria** (what must be TRUE):
  1. System stores replay parse results with explicit versioning and atomic writes, and invalidates them when parser or correction schema changes require reprocessing.
  2. Operator can define replay corrections outside immutable raw replay files and apply them as an auditable correction layer after cache read.
  3. Operator can invalidate one replay or a bounded replay subset without triggering a blind full historical reparse.
  4. Maintainer can observe whether an effective replay result came from a fresh parse, cache hit, correction overlay, or invalidated reparse path.
**Plans**: TBD

### Phase 6: Statistics Scaling and Safe Publish
**Goal**: The statistics pipeline can handle much larger replay volumes with deterministic outputs, targeted regeneration semantics, throughput observability, and atomic result publication.
**Depends on**: Phase 5
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06
**Success Criteria** (what must be TRUE):
  1. System processes materially larger replay corpora faster than the current implementation while preserving deterministic ordering and output correctness.
  2. Maintainer can verify that documented hot-path bottlenecks such as repeated config reads, deep clones, and linear inner-loop lookups are removed or isolated from aggregation hot paths.
  3. System regenerates only the replay-dependent derived results affected by invalidation or correction, or explicitly documents the remaining cases that still require full regeneration.
  4. Operator sees stage throughput and cache-hit metrics, and published results switch atomically so consumers never observe partial output states.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Toolchain Modernization | 0/0 | Not started | - |
| 2. Contract Verification Harness | 0/0 | Not started | - |
| 3. Durable Control Plane | 0/0 | Not started | - |
| 4. Anti-Ban Discovery Flow | 0/0 | Not started | - |
| 5. Replay Cache and Corrections | 0/0 | Not started | - |
| 6. Statistics Scaling and Safe Publish | 0/0 | Not started | - |
