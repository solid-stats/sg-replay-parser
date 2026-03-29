# Replay Parser Modernization

## What This Is

This repository is a production replay-statistics pipeline for `sg.zone` replays. It collects replay metadata and raw JSON files, parses match events into per-player results, aggregates statistics for multiple game types, and publishes generated result artifacts from the local runtime storage under `~/sg_stats`.

This milestone is not about inventing a new product. It is a brownfield modernization of the existing parser so it can keep producing the same outputs while upgrading its toolchain, reducing operational risk around Cloudflare and scheduling, and scaling the parsing/statistics pipeline much further.

## Core Value

The parser must produce stable, correct statistics continuously, with much lower operational risk and much higher throughput than the current implementation.

## Requirements

### Validated

- ✓ Replay metadata can be collected from `sg.zone` and persisted into `~/sg_stats/lists/replaysList.json` — existing
- ✓ Raw replay JSON files can be downloaded and stored under `~/sg_stats/raw_replays` — existing
- ✓ Raw replays can be parsed into per-player match results for `sg`, `mace`, and `sm` game types — existing
- ✓ Aggregated statistics can be generated from parsed replays and published under `~/sg_stats/results` — existing
- ✓ Production scheduling can orchestrate replay fetching, name-change updates, and parsing jobs — existing
- ✓ Name-change data can be loaded from runtime config and applied during statistics aggregation — existing
- ✓ Yearly statistics can be generated through the dedicated year-end pipeline — existing

### Active

- [ ] Upgrade the project dependencies and core tooling to current maintained versions without breaking the existing output contract
- [ ] Replace the current TypeScript and ESLint setup with the reusable configs from `new_config_files`, trimmed for this non-React Node.js parser
- [ ] Migrate package management and scripts from npm to pnpm
- [ ] Migrate the test runner from Jest to Vitest as an explicit part of Phase 1 modernization
- [ ] Adopt `tsx` for TypeScript runtime entrypoints and `tsup` for build output generation
- [ ] Redesign runtime orchestration so parsing runs in a continuous loop instead of waiting for the next cron boundary
- [ ] Reduce Cloudflare-ban risk by using a lightweight replay-page refresh strategy with a full replay-list sweep every 6 hours and a hard limit of 15 replay-list requests per minute
- [ ] Implement replay-correction support in the active roadmap rather than leaving it as design-only future work
- [ ] Substantially improve parser and statistics scalability based on the existing scaling design so the system can handle much larger replay volumes safely
- [ ] Preserve existing output semantics and runtime folder contracts unless a change is clearly required and documented
- [ ] Keep test quality high using behavior-focused, deterministic tests and maintain strong type safety during modernization work

### Out of Scope

- Replacing the parser with a new product or a different business domain — this is a modernization of an existing production pipeline
- Changing published statistics/output formats by default — current consumers depend on the existing contract
- Building a replay-correction UI — correction support should be implemented as backend/runtime capability first
- Horizontal multi-host distributed processing — the current milestone should push single-host architecture much further before considering distributed execution

## Context

The repository is a brownfield Node.js + TypeScript batch pipeline with staged replay discovery, parsing, aggregation, and output publishing. Runtime state is primarily file-backed under `~/sg_stats`, not in the repository itself. Existing code already includes a worker-pool based replay parsing path, but architecture and codebase audits show that the dominant bottlenecks now sit in statistics generation, synchronous hot-path filesystem access, serialized replay discovery, and fragile orchestration boundaries.

Operationally, the `sg.zone` source is Cloudflare-constrained. Current scheduling relies on cron jobs, and the existing replay-list collector still walks all replay pages too aggressively for long-term safety. The modernization must therefore balance three goals that can conflict with each other: upgrade tooling, preserve current outputs, and reduce external rate-limit risk while still improving total throughput.

Two mandatory project-level practices must shape implementation:

1. Testing changes should follow the repository's deterministic, behavior-first unit testing style.
2. TypeScript refactors should keep or improve type safety instead of relying on broad casts during migration.

Local repo skills are also an explicit planning input for this milestone. When relevant, planning and execution should reference the repository-scoped guides under `.agents/skills/`, especially `dependency-upgrade` for toolchain changes and `javascript-testing-patterns` for test-runner migration and compatibility work.

## Constraints

- **Compatibility**: Output contracts and runtime folder semantics should remain stable — downstream consumers already rely on the current JSON/results structure
- **Operational Risk**: `sg.zone` is Cloudflare/rate-limit constrained — replay discovery must become less aggressive, not more
- **Runtime Architecture**: The system persists its operational state under `~/sg_stats` — modernization must respect and evolve that file-based runtime model
- **Brownfield Scope**: Existing validated capabilities must keep working while tooling and orchestration change — this is not a greenfield rewrite
- **Testing**: Future code changes must preserve deterministic, readable tests and keep verification meaningful — modernization without regression coverage is too risky
- **Type Safety**: Tooling upgrades must not reduce TypeScript rigor — the migration is a chance to improve type guarantees, not weaken them

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prioritize tooling modernization first | The user wants dependency, package-manager, TS, ESLint, `tsx`, and `tsup` modernization as the first major track | — Pending |
| Keep published outputs stable | The parser already has consumers and validated behavior; modernization should not casually change the external contract | — Pending |
| Treat replay corrections as active roadmap scope | The user explicitly wants correction support included now instead of leaving it as future design work | — Pending |
| Use a fine-grained roadmap | Tooling migration, runtime orchestration, anti-ban strategy, corrections, and deep scaling work should be split into focused phases | — Pending |
| Use research-heavy planning with plan checking and verification | The work touches architecture, performance, and operational behavior, so higher planning rigor is justified even with YOLO execution mode | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-29 after initialization*
