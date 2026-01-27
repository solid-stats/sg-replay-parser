# Unified Architecture Design

## Overview

Migrate project from numbered directories (`0-4`) to modern service-based architecture, unifying code style across the application.

## Current State

```
src/
├── 0 - consts/
├── 0 - types/
├── 0 - utils/
├── 1 - replays/
├── 2 - parseReplayInfo/
├── 3 - statistics/
├── 4 - output/
├── !yearStatistics/     # special year-end nominations
├── services/            # new pipeline services
├── db/                  # Prisma + SQLite
└── jobs/
```

## Target State

```
src/
├── consts/              # renamed from 0 - consts/
├── types/               # renamed from 0 - types/
├── utils/               # renamed from 0 - utils/
├── services/
│   ├── discovery/       # existing
│   ├── download/        # existing
│   ├── parse/           # existing
│   ├── statistics/      # existing
│   ├── output/          # existing
│   └── yearStatistics/  # NEW - replaces !yearStatistics
├── db/                  # existing
└── jobs/
    ├── pipeline/        # existing
    └── yearStatistics.ts # NEW - entry point
```

## Service: yearStatistics

### Structure

```
services/yearStatistics/
├── index.ts                    # public API
├── types.ts                    # nomination types
├── fetchYearData.ts            # SQL queries for year data
├── calculateNominations.ts     # orchestrates all nominations
└── nominations/
    ├── index.ts
    ├── teamkills.ts            # teamkill nominations
    ├── performance.ts          # kills, deaths, K/D
    ├── weapons.ts              # weapons and vehicles
    ├── movement.ts             # distance, height
    └── roles.ts                # medic, commander, slots
```

### Data Access Strategy

**Basic nominations** (from DB aggregations):

- Most teamkills
- Death/games ratio
- Most deaths from teamkills

**Advanced nominations** (require raw JSON):

- Best weapon/vehicle
- Most distant kill
- Most AA/AT kills
- Role-based statistics

```typescript
// Basic: SQL aggregation
const fetchYearReplays = async (year: number) => {
  return db.replay.findMany({
    where: {
      date: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
      isParsed: true
    },
    include: { playerResults: { include: { player: true } } }
  });
};

// Advanced: Read raw JSON on demand
const fetchDetailedReplayData = async (replayId: string) => {
  const replay = await db.replay.findUnique({ where: { id: replayId } });
  const rawData = await fs.readJson(replay.filePath);
  return parseDetailedStats(rawData);
};
```

### Types

```typescript
export interface NominationResult {
  nominationId: string;
  title: string;
  winners: NominationWinner[];
}

export interface NominationWinner {
  playerId: string;
  playerName: string;
  value: number;
  details?: string;
}

export interface YearContext {
  year: number;
  replays: Replay[];
  playerResults: Map<string, PlayerYearStats>;
}

export type Nomination = (context: YearContext) => Promise<NominationResult>;
```

## Migration Phases

| Phase | Action | Risk |
|-------|--------|------|
| 1 | Rename `0-*` directories → `consts/`, `types/`, `utils/` | Low |
| 2 | Update all imports across project | Low |
| 3 | Create `services/yearStatistics/` with tests | Medium |
| 4 | Migrate nominations one by one (test → implementation) | Medium |
| 5 | Create `jobs/yearStatistics.ts` entry point | Low |
| 6 | Remove `!yearStatistics/` and legacy directories | Low |

## Testing Strategy

1. **Unit tests** for each nomination with mock data
2. **Integration tests** for fetchYearData with test DB
3. **E2E test** comparing new output to old output

## Success Criteria

- All 328 existing tests pass
- New yearStatistics output matches old output for test year
- No numbered directories remain
- Single consistent import style across project
