# Replay Parser System Redesign

**Date:** 2026-01-25
**Status:** Design validated

## Overview

Redesign of the replay parsing system to improve performance, enable incremental processing, and support manual data corrections through a database-backed architecture.

## Problem Statement

Current system issues:

1. **Performance:** Full re-parsing of all replays on every run (10,000+ replays)
2. **Memory usage:** Entire dataset passed around in giant variables
3. **No correction mechanism:** Cannot fix incorrect kills, teamkills, or remove invalid games
4. **No incremental updates:** Must process everything each time

## Goals

1. Store parsed data in SQLite database
2. Parse only new, unprocessed replays
3. Support manual corrections (add/remove kills, teamkills, vehicle kills, players)
4. Corrections must affect both regular and yearly statistics
5. Maintain existing output format (JSON files for server)
6. Support future runtime API with caching

## Technology Stack

- **Database:** SQLite (local deployment, zero configuration)
- **ORM:** Prisma (100% TypeScript type safety, excellent testability)
- **Reasoning:** 10,000 replays is not a large dataset; SQLite provides simplicity with adequate performance

## Database Schema

### Core Data Storage

**replays** - Replay metadata and status

```prisma
model Replay {
  id              String        @id @default(uuid())
  filename        String        @unique
  missionName     String
  date            DateTime
  gameType        GameType      // sg, mace, sm
  replayLink      String
  status          ReplayStatus  @default(DISCOVERED)
  discoveredAt    DateTime      @default(now())
  parsedAt        DateTime?

  entities        Entity[]
  events          Event[]
  playerResults   PlayerReplayResult[]
  corrections     Correction[]

  @@index([status, gameType])
}

enum ReplayStatus {
  DISCOVERED  // Found on sg.zone
  DOWNLOADED  // JSON file saved locally
  PARSED      // Fully processed
  ERROR       // Failed processing
}

enum GameType {
  SG
  MACE
  SM
}
```

**entities** - All entities from replays (players, vehicles)

```prisma
model Entity {
  id          String      @id @default(uuid())
  replayId    String
  entityId    Int         // Original entity ID from replay
  type        EntityType  // unit, vehicle
  name        String
  side        EntitySide  // EAST, WEST, GUER, CIV, UNKNOWN
  isPlayer    Boolean

  replay      Replay @relation(fields: [replayId], references: [id])

  @@unique([replayId, entityId])
  @@index([replayId, entityId])
}

enum EntityType {
  UNIT
  VEHICLE
}

enum EntitySide {
  EAST
  WEST
  GUER
  CIV
  UNKNOWN
}
```

**events** - All events from replays (kills, connections)

```prisma
model Event {
  id          String      @id @default(uuid())
  replayId    String
  frameId     Int
  eventType   EventType
  data        Json        // Flexible storage for different event types

  replay      Replay @relation(fields: [replayId], references: [id])

  @@index([replayId, eventType])
}

enum EventType {
  KILLED
  CONNECTED
  DISCONNECTED
}
```

### Player Identity System

**players** - Unique player accounts

```prisma
model Player {
  id            String    @id @default(uuid())
  createdAt     DateTime  @default(now())

  names         PlayerName[]
  replayResults PlayerReplayResult[]
  statistics    PlayerStatistics[]
  corrections   Correction[]
}
```

**player_names** - Name change history (from nameChanges.csv)

```prisma
model PlayerName {
  id          String    @id @default(uuid())
  playerId    String
  name        String    // Lowercase
  validFrom   DateTime
  validTo     DateTime?

  player      Player @relation(fields: [playerId], references: [id])

  @@index([name, validFrom, validTo])
}
```

**Logic:** Player identification uses existing `getPlayerId(name, date)` logic:

1. Parse replay → get entity name + replay date
2. Search `player_names` for matching name during time period
3. Return associated `player_id`
4. Save to `player_replay_results` with resolved `player_id`

### Player Results

**player_replay_results** - Player performance in specific replay

```prisma
model PlayerReplayResult {
  id              String  @id @default(uuid())
  replayId        String
  playerId        String
  entityName      String  // Original name from replay
  squadPrefix     String?
  kills           Int
  killsFromVehicle Int
  vehicleKills    Int
  teamkills       Int
  deaths          Int
  deathsByTeamkills Int
  isDead          Boolean
  isDeadByTeamkill Boolean
  score           Float

  // JSON fields for complex data
  weapons         Json    // WeaponStatistic[]
  vehicles        Json    // WeaponStatistic[]
  killed          Json    // OtherPlayer[]
  killers         Json    // OtherPlayer[]
  teamkilled      Json    // OtherPlayer[]
  teamkillers     Json    // OtherPlayer[]

  replay          Replay @relation(fields: [replayId], references: [id])
  player          Player @relation(fields: [playerId], references: [id])

  @@unique([replayId, playerId])
}
```

### Correction System

**corrections** - Manual data corrections

```prisma
model Correction {
  id              String          @id @default(uuid())
  replayId        String
  playerId        String          // Player being corrected
  correctionType  CorrectionType
  targetPlayerId  String?         // Victim/target (for kill corrections)
  data            Json            // Type-specific data
  createdAt       DateTime        @default(now())
  createdBy       String
  applied         Boolean         @default(false)

  replay          Replay @relation(fields: [replayId], references: [id])
  player          Player @relation(fields: [playerId], references: [id])
}

enum CorrectionType {
  ADD_KILL
  ADD_TEAMKILL
  REMOVE_TEAMKILL
  ADD_VEHICLE_KILL
  REMOVE_PLAYER
}
```

**Correction data structures:**

- `ADD_KILL`: `{ weapon?: string, distance?: number }`
- `ADD_TEAMKILL`: `{ weapon?: string, distance?: number }`
- `REMOVE_TEAMKILL`: `{ targetPlayerId: string }`
- `ADD_VEHICLE_KILL`: `{ vehicleType: string, weapon?: string }`
- `REMOVE_PLAYER`: `{}` (removes entire player_replay_result)

**Correction workflow:**

1. Create correction → `applied = false`
2. Mark affected players: `player_statistics.needsRecalculation = true`
3. Cron job recalculates statistics with corrections applied
4. Mark `applied = true` after successful recalculation

**Benefits:**

- Full audit history of all changes
- Rollback capability (delete correction record)
- Non-destructive to original data

### Materialized Statistics

**player_statistics** - Aggregated player statistics

```prisma
model PlayerStatistics {
  id                  String    @id @default(uuid())
  playerId            String
  gameType            GameType
  rotationId          String?   // For rotation-specific stats

  // Core metrics
  totalPlayedGames    Int
  kills               Int
  killsFromVehicle    Int
  vehicleKills        Int
  teamkills           Int
  deathsTotal         Int
  deathsByTeamkills   Int
  kdRatio             Float
  killsFromVehicleCoef Float
  totalScore          Float
  lastPlayedGameDate  DateTime
  lastSquadPrefix     String?
  isShow              Boolean   @default(true)

  needsRecalculation  Boolean   @default(false)
  lastCalculatedAt    DateTime

  player              Player @relation(fields: [playerId], references: [id])
  weeklyStats         PlayerWeeklyStats[]
  weaponStats         PlayerWeaponStats[]
  vehicleStats        PlayerVehicleStats[]
  interactions        PlayerInteraction[]

  @@unique([playerId, gameType, rotationId])
  @@index([needsRecalculation])
}
```

**player_weekly_stats** - Statistics by week

```prisma
model PlayerWeeklyStats {
  id                  String    @id @default(uuid())
  statisticsId        String
  week                String    // "2024-35"
  startDate           DateTime
  endDate             DateTime
  totalPlayedGames    Int
  kills               Int
  killsFromVehicle    Int
  vehicleKills        Int
  teamkills           Int
  deathsTotal         Int
  deathsByTeamkills   Int
  kdRatio             Float
  killsFromVehicleCoef Float
  score               Float

  statistics          PlayerStatistics @relation(fields: [statisticsId], references: [id], onDelete: Cascade)

  @@index([statisticsId])
}
```

**player_weapon_stats** - Weapon statistics (top 25)

```prisma
model PlayerWeaponStats {
  id                  String    @id @default(uuid())
  statisticsId        String
  weaponName          String
  kills               Int
  maxDistance         Float

  statistics          PlayerStatistics @relation(fields: [statisticsId], references: [id], onDelete: Cascade)

  @@index([statisticsId])
}
```

**player_vehicle_stats** - Vehicle statistics (top 25)

```prisma
model PlayerVehicleStats {
  id                  String    @id @default(uuid())
  statisticsId        String
  vehicleName         String
  kills               Int
  maxDistance         Float

  statistics          PlayerStatistics @relation(fields: [statisticsId], references: [id], onDelete: Cascade)

  @@index([statisticsId])
}
```

**player_interaction** - Player-to-player interactions (top 10 each)

```prisma
model PlayerInteraction {
  id                  String          @id @default(uuid())
  statisticsId        String
  type                InteractionType // killed, killers, teamkilled, teamkillers
  targetPlayerId      String
  targetPlayerName    String
  count               Int

  statistics          PlayerStatistics @relation(fields: [statisticsId], references: [id], onDelete: Cascade)

  @@index([statisticsId, type])
}

enum InteractionType {
  KILLED
  KILLERS
  TEAMKILLED
  TEAMKILLERS
}
```

**squad_statistics** - Squad/prefix statistics

```prisma
model SquadStatistics {
  id                  String    @id @default(uuid())
  prefix              String
  gameType            GameType
  rotationId          String?
  fourWeeksOnly       Boolean   // squad vs squadFull

  averagePlayersCount Float
  kills               Int
  averageKills        Float
  teamkills           Int
  averageTeamkills    Float
  score               Float

  players             SquadPlayer[]

  @@unique([prefix, gameType, rotationId, fourWeeksOnly])
}

model SquadPlayer {
  id                  String    @id @default(uuid())
  squadStatisticsId   String
  playerId            String
  playerName          String
  kills               Int
  deathsTotal         Int
  teamkills           Int
  kdRatio             Float
  totalPlayedGames    Int
  totalScore          Float
  vehicleKills        Int
  killsFromVehicle    Int
  killsFromVehicleCoef Float

  squadStatistics     SquadStatistics @relation(fields: [squadStatisticsId], references: [id], onDelete: Cascade)

  @@index([squadStatisticsId])
}
```

## Job Architecture

### Job 1: Quick Discovery (every 30 seconds)

```
1. Fetch first page of sg.zone/replays
2. For each replay:
   - Check if exists in DB by filename
   - If not found:
     - INSERT with status='DISCOVERED'
     - Trigger parallel download of JSON file (10-20 MB)
     - After download complete → status='DOWNLOADED'
     - Set flag: last_discovery_found_new = true
3. If no new replays found:
   - last_discovery_found_new = false
4. After completion: generateMaceList()
```

### Job 2: Full Scan (every 10 minutes)

```
Same as Job 1, but fetch ALL pages from sg.zone/replays
Ensures no replays missed if >1 page added in 30 seconds
```

### Job 3: Mission Makers List (every 5 minutes)

```
1. Fetch sg.zone/team page
2. Extract mission makers and junior mission makers
3. Generate HTML list
4. Save to /lists/mission_makers_list.html

Independent of parsing pipeline
```

### Job 4: Parse and Calculate (continuous)

```
1. Check for replays with status='DOWNLOADED'
   - If none → sleep, goto 1

2. If found:
   - Wait 30 seconds for next Job 1 run
   - Check: last_discovery_found_new == false?

3. If Job 1 found new replays:
   - goto 1 (wait for more)

4. If Job 1 found no new replays:
   - Parse all status='DOWNLOADED' replays:
     * Read local /raw_replays/{filename}.json
     * Extract entities → DB
     * Extract events → DB
     * Calculate player_replay_results → DB
     * status → 'PARSED'

   - Recalculate statistics:
     * Find players with needsRecalculation=true
     * For each player:
       - Read all player_replay_results
       - Apply active corrections
       - Calculate aggregated statistics
       - Save to player_statistics and related tables
       - needsRecalculation = false

   - Generate JSON output files (as current system)
```

**Key optimization:** Delayed statistics calculation ensures we process batches of new replays together, avoiding expensive recalculation after each individual replay.

## Statistics Calculation

### Regular Statistics

**Process:**

1. Query all `player_replay_results` for player
2. Apply active `corrections` (where `applied = false`)
3. Aggregate:
   - Sum: kills, deaths, teamkills, games played
   - Calculate: KD ratio, score, coefficients
   - Merge: weapons, vehicles (top 25), interactions (top 10)
   - Group: weekly stats
4. Save to `player_statistics` and related tables

### Yearly Statistics

**Process (dynamic calculation):**

1. Query `player_replay_results` filtered by year from replay date
2. Read `entities` and `events` from DB for those replays
3. Run nomination calculations (as current system does with raw data)
4. Generate yearly results on demand

**Note:** Raw data (`entities`, `events`) stored in DB enables yearly statistics to access detailed information needed for special nominations without re-downloading files.

## Data Migration

Initial setup requires:

1. Parse `nameChanges.csv` → populate `players` and `player_names` tables
2. One-time full parse of existing replays:
   - Read all files from `/raw_replays/`
   - Process into normalized DB structure
   - Mark all as status='PARSED'
3. Calculate initial statistics for all players

After migration, system operates incrementally.

## Code Structure

```
src/
  db/
    client.ts                 # Prisma client initialization
    schema.prisma            # Database schema
    seed.ts                  # Import nameChanges.csv

  services/
    discovery/
      fetch-replays.ts       # Fetch from sg.zone
      download-replay.ts     # Download JSON files

    parser/
      parse-replay.ts        # Main parsing orchestration
      extract-entities.ts    # Process entities
      extract-events.ts      # Process events
      calculate-player-results.ts  # Calculate player results

    statistics/
      calculate-statistics.ts      # Main stats calculation
      apply-corrections.ts         # Apply correction layer
      generate-output.ts           # Generate JSON files

    yearly/
      # Existing yearly statistics code
      # Adapted to read from DB instead of memory

  jobs/
    quick-discovery.ts       # Job 1
    full-discovery.ts        # Job 2
    mission-makers.ts        # Job 3
    parse-and-calculate.ts   # Job 4

  utils/
    player-id-resolver.ts    # getPlayerId logic using DB

  migrations/
    # Prisma migrations
```

## Testing Strategy

**Database testability:**

- Use in-memory SQLite for tests (`:memory:`)
- Prisma provides excellent test support
- Each test gets fresh DB instance

**Test coverage:**

1. Player ID resolution with name changes
2. Correction application logic
3. Statistics aggregation with corrections
4. Incremental parsing workflow
5. Edge cases (missing data, malformed replays)

## Future Enhancements

**Runtime API (planned):**

- Query statistics directly from DB
- Apply filters (date range, game type, rotation)
- Cache results in memory
- Real-time statistics without file regeneration

**Benefits of new architecture:**

- API queries become SQL queries
- Filtering and pagination built-in
- No need to load entire dataset
- Corrections applied transparently

## Success Criteria

1. ✅ Only new replays parsed (not full re-parse)
2. ✅ Memory usage reduced (no giant in-memory arrays)
3. ✅ Support for manual corrections
4. ✅ Corrections affect both regular and yearly statistics
5. ✅ Existing JSON output format maintained
6. ✅ Foundation for future runtime API
7. ✅ 100% TypeScript type safety
8. ✅ Testable architecture

## Notes

- Local `/raw_replays/` files preserved for yearly statistics
- Existing jobs (generateMaceList, generateMissionMakersList) remain functional
- Backward compatible output format
- Database file can be backed up by simple file copy
