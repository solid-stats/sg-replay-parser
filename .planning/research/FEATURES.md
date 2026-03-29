# Feature Landscape

**Domain:** Production replay parsing and statistics pipeline modernization
**Researched:** 2026-03-29

## Scope

This document focuses on the feature dimension for modernizing the existing `sg.zone` replay pipeline. The goal is not to invent a new analytics product. The goal is to keep the current output contract while making the system safer to operate, more correct over time, and able to handle much larger replay volumes.

## Table Stakes

Features a mature production pipeline of this kind is expected to have. Missing any of these means the modernization is incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Rate-limited replay discovery with bounded refresh windows | The source is Cloudflare-constrained. A mature collector must trade freshness for survivability instead of sweeping the full catalog continuously. | Medium | Use a lightweight recent-page refresh loop, a slower full sweep, and a hard request budget. This is core scope, not optional hardening. |
| Idempotent collection and parsing | Production pipelines must tolerate reruns, restarts, and partial failures without duplicating work or corrupting outputs. | Medium | Existing file-backed runtime model already points in this direction; modernization should make it explicit across fetch, parse, and publish stages. |
| Durable job state and resumability | Long-running pipelines need to resume from known state after crashes or bans. | Medium | Includes persisted replay-list timestamps, known replay registry, cache state, and safe restart behavior. |
| Replay parse cache | Re-parsing all historical raw replays on every cycle is not acceptable at target scale. | Medium | Cache parsed replay results per file with explicit versioning and atomic writes. This is foundational for higher throughput. |
| Deterministic reprocessing | Operators need to rerun the same data and get the same results unless corrections or code/version changes intentionally alter them. | Medium | Required for debugging, trust, and regression testing. |
| Correction support for individual replays | Mature stats systems need a controlled path to fix bad replay outcomes without rebuilding the whole system around manual edits. | Medium | Support backend/runtime correction overlays or targeted cache invalidation first. UI is explicitly out of scope. |
| Separation of immutable raw data from derived outputs | Raw replay JSON should remain the source snapshot; corrections should be layered into derived state. | Low | Prevents “silent edits” to raw evidence and keeps correction provenance sane. |
| Backoff, retry, and ban-aware failure handling | High-volume collectors must react to transient failures and bans without amplifying them. | Medium | Exponential backoff with jitter, stop conditions for suspected bans, and no aggressive retry storms. |
| Safe scheduler/orchestrator with overlap control | The current cron-boundary behavior is fragile for scaling. Mature pipelines prevent overlapping fetch/parse/publish runs and coordinate stage handoff explicitly. | Medium | Continuous-loop orchestration is appropriate, but only with single-flight protections and bounded concurrency. |
| Throughput controls per stage | Collection, parsing, aggregation, and output have different bottlenecks. Mature systems expose separate concurrency and rate controls. | Medium | One global “worker count” is not enough once scraping risk and aggregation costs diverge. |
| Incremental statistics regeneration | At high volume, the pipeline should avoid unnecessary full recomputation where correctness rules allow it. | High | Minimum acceptable form: parsed replay cache plus targeted invalidation boundaries. More advanced incremental aggregation can follow later. |
| Structured observability | Operators need logs and metrics that explain where time, failures, and bans are happening. | Medium | Include stage durations, request counts, retry counts, cache hit rate, correction count, and backlog depth. |
| Output contract preservation checks | Brownfield modernization must prove that current consumers still get compatible artifacts. | Medium | Requires golden-output or snapshot-style regression verification around results. |
| Runtime configuration hygiene | Production collectors need validated runtime config for include/exclude lists, name changes, schedules, rate limits, and future corrections. | Low | Config drift should fail fast, not produce silent bad stats. |
| Atomic publish of generated results | Readers should never see partially written outputs. | Medium | Preserve temp-to-final publish semantics and extend them where needed. |

## Differentiators

Advanced capabilities that materially improve operations or performance, but are not required to call the modernization successful on day one.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Fine-grained correction model | Lets operators invalidate cache, override parsed replay results, and preserve a clear audit trail per replay. | High | Strong differentiator because this system already knows replay corrections are needed; the advanced version is typed, versioned, and auditable. |
| Per-replay provenance and explainability | Makes every output traceable to replay file, parser version, correction layer, and generation run. | Medium | Very useful when users dispute stats or when parser logic changes. |
| Targeted backfills | Reprocess only a date range, game type, replay subset, or correction-affected set instead of the full corpus. | Medium | Speeds operations and reduces unnecessary load on both local resources and upstream source pages. |
| Stage-level adaptive throttling | Automatically slows discovery when ban/risk signals increase and speeds up when the system is healthy. | High | Valuable, but a fixed hard budget plus backoff is sufficient for the first modernization pass. |
| Queue/backlog visibility | Gives operators a clear picture of discovery lag, parse backlog, cache warmness, and publish lag. | Medium | Not essential for correctness, but important once throughput grows. |
| Parallel map-reduce style statistics generation | Addresses the documented real bottleneck in aggregation, not only parsing. | High | Important differentiator because the current scaling ceiling is statistics, not worker-thread parsing. |
| Data quality anomaly detection | Flags suspicious replay outcomes, parse skips, schema drift, or impossible player stats automatically. | Medium | Useful for catching upstream or parser issues before bad outputs spread. |
| Historical replay-source risk analytics | Tracks request volume, ban events, and recovery windows over time so operators can tune schedules safely. | Medium | Helps make Cloudflare-risk mitigation evidence-based instead of guess-based. |
| Dry-run / verification mode | Lets operators validate new parser versions, correction rules, or scheduler policies against existing data without publishing. | Medium | Valuable for brownfield migrations where output stability matters. |
| Multi-tier freshness policy | Keeps newest pages highly fresh while older pages are refreshed rarely unless corrections or gaps demand it. | Medium | Strong fit for this domain because replay discovery value decays sharply with age. |

## Anti-Features

Capabilities to deliberately avoid in this milestone because they add cost or risk before the core modernization is stable.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Full distributed multi-host processing | Adds operational complexity before the single-host pipeline has exhausted simpler scaling wins. | Push the current single-host architecture much further with cache, orchestration fixes, and statistics optimization. |
| Replay-correction UI | Expands scope into product/UI work before the correction model is stable. | Implement backend correction files, validation, and targeted invalidation first. |
| Aggressive full-site re-scraping for freshness | Directly conflicts with the Cloudflare-risk constraint and offers poor operational leverage. | Use recent-page polling, bounded full sweeps, and request budgets. |
| Rewriting raw replay JSON in place | Destroys provenance and makes debugging correction behavior harder. | Keep raw files immutable and apply corrections in derived layers. |
| Premature schema/output redesign | Existing consumers depend on the current contract. | Preserve outputs and add compatibility tests around them. |
| Generic “real-time” streaming architecture | The source and workload do not justify moving to a streaming system yet. | Use a safe continuous loop with explicit checkpoints and bounded batch work. |
| Feature work that hides correctness regressions behind speed gains | Faster wrong stats are worse than slower correct stats. | Gate performance work with deterministic regression tests and output comparisons. |

## Replay Correction Support

Replay correction support is table stakes for this modernization because it is already active roadmap scope and directly affects trust in published statistics.

Recommended minimum capability:

1. Store corrections outside raw replay JSON in runtime config.
2. Support at least two actions:
   - `invalidate_cache`: force re-parse from immutable raw replay JSON.
   - `override_result`: apply a controlled derived-layer patch after cache read.
3. Record which replays were corrected in logs and run metadata.
4. Ensure corrected replays trigger targeted downstream regeneration instead of requiring a blind full rebuild when not necessary.

Recommended non-goal for now:

1. Manual editing surfaces, approval workflow, or operator UI.

## Cloudflare-Risk Mitigation Tradeoffs

This modernization has an unusual constraint: collection safety is itself a product feature because the upstream source can rate-limit or ban the parser.

Tradeoffs to encode in requirements:

| Tradeoff | Recommended Direction | Reason |
|---------|------------------------|--------|
| Freshness vs safety | Prefer safety | A slightly slower replay appearance is acceptable; bans that stop collection entirely are not. |
| Full sweeps vs recent-page refresh | Prefer recent-page refresh | Most value is in catching new replays quickly; older pages can be revisited on a slower cadence. |
| Retry aggressiveness vs upstream pressure | Prefer bounded retries with backoff and jitter | Retrying too fast raises ban risk and amplifies overload. |
| High collector concurrency vs stable access | Prefer strict request budgeting | Parsing can scale harder locally; scraping cannot. Treat them as separate control planes. |
| Silent partial success vs explicit degraded mode | Prefer explicit degraded mode | Operators need to know when the system intentionally paused or reduced discovery because of ban risk. |

## Feature Dependencies

```text
Rate-limited replay discovery -> Ban-aware retry/backoff -> Safe continuous scheduler
Safe continuous scheduler -> Durable job state -> Resumability
Immutable raw replay storage -> Replay parse cache -> Deterministic reprocessing
Replay parse cache -> Correction support -> Targeted backfills
Correction support -> Incremental statistics regeneration
Throughput controls per stage -> High-volume scaling
Structured observability -> Safe tuning of rate limits, scheduler behavior, and scaling
Output contract preservation checks -> Safe rollout of cache, corrections, and statistics optimizations
```

## MVP Recommendation

Prioritize:

1. Rate-limited replay discovery with bounded refresh windows and explicit Cloudflare-safe request budgeting.
2. Safe continuous orchestration with overlap control, resumability, and ban-aware retry behavior.
3. Replay parse cache plus backend correction support with targeted invalidation semantics.

Defer:

- Full adaptive throttling: fixed budgets and explicit backoff are enough for the first pass.
- Advanced anomaly detection: useful, but correctness and operational safety come first.
- Full map-reduce aggregation redesign: likely required for peak scaling, but it can follow once cache/orchestration/corrections are in place unless profiling proves it is the immediate blocker for the next phase.

## Sources

- Project context: `/home/afgan0r/Projects/SolidGames/replays-parser/.planning/PROJECT.md`
- Architecture reference: `/home/afgan0r/Projects/SolidGames/replays-parser/docs/architecture.md`
- Scaling design: `/home/afgan0r/Projects/SolidGames/replays-parser/docs/plans/2026-02-15-replay-parser-scaling-1000-5000-design.md`
- Cloudflare retry guidance: https://developers.cloudflare.com/agents/api-reference/retries/
- Cloudflare retry best practice example: https://developers.cloudflare.com/d1/best-practices/retry-queries/
- Cloudflare rate-limiting guidance: https://developers.cloudflare.com/waf/rate-limiting-rules/best-practices/
