# Requirements: Replay Parser Modernization

**Defined:** 2026-03-29
**Core Value:** The parser must produce stable, correct statistics continuously, with much lower operational risk and much higher throughput than the current implementation.

## v1 Requirements

### Tooling

- [ ] **TOOL-01**: Developer can install and run the project with `pnpm` as the only supported package manager
- [ ] **TOOL-02**: Developer can run TypeScript entrypoints directly with `tsx` for local and operational source-mode workflows
- [ ] **TOOL-03**: Developer can build production-ready output with the new build pipeline while preserving current runtime entrypoint behavior
- [ ] **TOOL-04**: Developer can typecheck the repository with a modern strict TypeScript configuration trimmed for a backend Node.js parser
- [ ] **TOOL-05**: Developer can lint the repository with an ESLint flat config derived from `new_config_files` without React, Next.js, JSX, or browser-only rules
- [ ] **TOOL-06**: Developer can run the test suite on the modernized toolchain with deterministic behavior and no loss of verification quality
- [ ] **TOOL-07**: Operator can run the existing production commands or their documented replacements without depending on npm-specific behavior

### Verification

- [ ] **VER-01**: Maintainer can verify that tooling/runtime modernization preserves the published output contract for representative replay corpora
- [ ] **VER-02**: Maintainer can compare old and new pipeline behavior through automated parity checks for replay discovery, parsed replay results, and final statistics outputs
- [ ] **VER-03**: Maintainer can validate worker, config, and persisted-state contracts with explicit tests instead of relying on implicit runtime compatibility

### Runtime Control Plane

- [ ] **CTRL-01**: Operator can run the parser as a long-lived continuous supervisor instead of waiting for cron start boundaries
- [ ] **CTRL-02**: The runtime can prevent overlapping active runs through durable lease or run-ownership state
- [ ] **CTRL-03**: The runtime can resume safely after crash or restart using persisted run-state and stage checkpoints
- [ ] **CTRL-04**: The runtime can persist replay catalog, run metadata, throttling state, and publish history separately from large replay payload files
- [ ] **CTRL-05**: The runtime can represent replay-level operational state transitions explicitly rather than deriving them only from `replaysList.json`

### Discovery and Anti-Ban

- [ ] **DISC-01**: The replay discovery flow can refresh only the first replay-list page during normal polling instead of sweeping the full catalog every cycle
- [ ] **DISC-02**: The replay discovery flow can perform a full replay-list sweep every 6 hours
- [ ] **DISC-03**: The runtime enforces a hard limit of at most 15 replay-list page requests per minute
- [ ] **DISC-04**: The runtime applies bounded retries with cooldown/backoff behavior when Cloudflare or upstream throttling is detected
- [ ] **DISC-05**: The runtime records discovery freshness, request-budget usage, and degraded-mode/banned-state signals in structured logs or durable state
- [ ] **DISC-06**: The runtime can keep replay metadata synchronized without increasing Cloudflare-ban risk relative to the current system

### Replay Parsing and Corrections

- [ ] **PARSE-01**: The runtime can cache replay parse results per replay with explicit versioning and safe atomic writes
- [ ] **PARSE-02**: The runtime can invalidate parse cache entries when parser schema/version or replay-correction rules require reprocessing
- [ ] **PARSE-03**: Operator can define replay corrections outside immutable raw replay files
- [ ] **PARSE-04**: Operator can invalidate a single replay parse result without forcing a blind full historical reparse
- [ ] **PARSE-05**: Operator can apply a replay-result correction layer after cache read so corrected output remains auditable
- [ ] **PARSE-06**: Maintainer can observe whether a replay result came from raw parse, cache hit, correction overlay, or invalidated reparse

### Statistics and Publishing

- [ ] **STAT-01**: The statistics pipeline can process much larger replay volumes with materially lower total runtime than the current implementation
- [ ] **STAT-02**: The statistics pipeline removes documented hot-path bottlenecks such as repeated config reads, repeated deep clones, and repeated linear lookups in inner loops
- [ ] **STAT-03**: The statistics pipeline preserves deterministic ordering and correctness of aggregated outputs while changing internal data structures
- [ ] **STAT-04**: The output publish flow can replace results atomically without exposing partial output states to consumers
- [ ] **STAT-05**: The runtime can regenerate only the replay-dependent derived results that changed when cache invalidation or corrections occur, or explicitly document where full regeneration is still required
- [ ] **STAT-06**: The runtime records per-stage throughput and cache-hit metrics so operators can see whether scaling changes are actually working

## v2 Requirements

### Operations

- **OPS-01**: Operator can run targeted backfills for a replay subset, date range, or game type
- **OPS-02**: Operator can run a dry-run verification mode that computes outputs without publishing them
- **OPS-03**: Operator can inspect backlog depth, parse lag, and correction impact through dedicated health/status views

### Scaling

- **SCAL-01**: The statistics pipeline can use deeper map-reduce style parallel aggregation beyond the first performance overhaul
- **SCAL-02**: The runtime can adapt discovery throttling dynamically based on ban signals and recent source health
- **SCAL-03**: The system can perform anomaly detection on replay outputs or parser behavior automatically

## Out of Scope

| Feature | Reason |
|---------|--------|
| Replay correction UI | Correction support is required, but UI would expand scope beyond backend/runtime modernization |
| Distributed multi-host processing | The current milestone should exhaust safer single-host scaling gains first |
| Default output format redesign | Existing consumers rely on current published contracts |
| Editing raw replay JSON in place | Raw inputs should remain immutable for provenance and debuggability |
| Real-time streaming architecture | A safe continuous loop is sufficient; a streaming rewrite is unnecessary complexity |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOOL-01 | Phase 1 | Pending |
| TOOL-02 | Phase 1 | Pending |
| TOOL-03 | Phase 1 | Pending |
| TOOL-04 | Phase 1 | Pending |
| TOOL-05 | Phase 1 | Pending |
| TOOL-06 | Phase 1 | Pending |
| TOOL-07 | Phase 1 | Pending |
| VER-01 | Phase 2 | Pending |
| VER-02 | Phase 2 | Pending |
| VER-03 | Phase 2 | Pending |
| CTRL-01 | Phase 3 | Pending |
| CTRL-02 | Phase 3 | Pending |
| CTRL-03 | Phase 3 | Pending |
| CTRL-04 | Phase 3 | Pending |
| CTRL-05 | Phase 3 | Pending |
| DISC-01 | Phase 4 | Pending |
| DISC-02 | Phase 4 | Pending |
| DISC-03 | Phase 4 | Pending |
| DISC-04 | Phase 4 | Pending |
| DISC-05 | Phase 4 | Pending |
| DISC-06 | Phase 4 | Pending |
| PARSE-01 | Phase 5 | Pending |
| PARSE-02 | Phase 5 | Pending |
| PARSE-03 | Phase 5 | Pending |
| PARSE-04 | Phase 5 | Pending |
| PARSE-05 | Phase 5 | Pending |
| PARSE-06 | Phase 5 | Pending |
| STAT-01 | Phase 6 | Pending |
| STAT-02 | Phase 6 | Pending |
| STAT-03 | Phase 6 | Pending |
| STAT-04 | Phase 6 | Pending |
| STAT-05 | Phase 6 | Pending |
| STAT-06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 after roadmap creation*
