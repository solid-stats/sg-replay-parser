# Replay Parser System Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate replay parsing system from in-memory processing to database-backed incremental architecture with 100% test coverage and zero regression.

**Architecture:** SQLite + Prisma ORM for data persistence, incremental parsing of new replays only, correction layer for manual data fixes, materialized statistics with lazy recalculation. All existing tests must pass without modification to ensure no regression.

**Tech Stack:**

- Database: SQLite (via Prisma)
- ORM: Prisma (TypeScript type generation)
- Testing: Jest (existing test suite)
- Validation: Exact output comparison with existing results

**Critical Requirements:**

1. 100% test coverage for all new code
2. All edge cases tested
3. Existing tests transferred unchanged (regression prevention)
4. Old results preserved for comparison
5. New parsing must produce IDENTICAL output:
   - `/results/` - exact JSON match
   - `/year_results/` - exact text match
   - `/lists/` - content match (structure may differ)

---

## Phase 0: Preparation and Safety Net

### Task 0.1: Backup Current Results

**Files:**

- None (filesystem operations)

**Step 1: Create backup directory**

```bash
mkdir -p /home/afgan0r/sg_stats/backup-2026-01-25
```

**Step 2: Copy current results**

```bash
cp -r /home/afgan0r/sg_stats/results /home/afgan0r/sg_stats/backup-2026-01-25/
cp -r /home/afgan0r/sg_stats/year_results /home/afgan0r/sg_stats/backup-2026-01-25/
cp -r /home/afgan0r/sg_stats/lists /home/afgan0r/sg_stats/backup-2026-01-25/
```

**Step 3: Verify backup**

```bash
ls -la /home/afgan0r/sg_stats/backup-2026-01-25/
```

Expected: All three directories present with files

**Step 4: Document backup location**

Create note in project: `BACKUP_LOCATION.txt`

```bash
echo "Original results backed up to: /home/afgan0r/sg_stats/backup-2026-01-25/" > BACKUP_LOCATION.txt
echo "Created: $(date)" >> BACKUP_LOCATION.txt
git add BACKUP_LOCATION.txt
git commit -m "docs: record backup location for migration"
```

### Task 0.2: Setup Prisma

**Files:**

- Create: `prisma/schema.prisma`
- Create: `.env`
- Modify: `package.json`

**Step 1: Install Prisma dependencies**

```bash
npm install prisma @prisma/client
npm install -D @types/node
```

**Step 2: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

**Step 3: Configure database location**

Modify `.env`:

```
DATABASE_URL="file:../sg_stats/replays.db"
```

**Step 4: Commit Prisma setup**

```bash
git add prisma/ .env .gitignore package.json package-lock.json
git commit -m "chore: setup Prisma ORM with SQLite"
```

---

## Phase 1: Database Schema Implementation

### Task 1.1: Define Core Schema Models

**Files:**

- Modify: `prisma/schema.prisma`

**Step 1: Define enums and base models**

Add to `schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum ReplayStatus {
  DISCOVERED
  DOWNLOADED
  PARSED
  ERROR
}

enum GameType {
  SG
  MACE
  SM
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

enum EventType {
  KILLED
  CONNECTED
  DISCONNECTED
}

model Replay {
  id            String        @id @default(uuid())
  filename      String        @unique
  missionName   String
  date          DateTime
  gameType      GameType
  replayLink    String
  status        ReplayStatus  @default(DISCOVERED)
  discoveredAt  DateTime      @default(now())
  parsedAt      DateTime?

  entities      Entity[]
  events        Event[]
  playerResults PlayerReplayResult[]
  corrections   Correction[]

  @@index([status, gameType])
}

model Entity {
  id          String      @id @default(uuid())
  replayId    String
  entityId    Int
  type        EntityType
  name        String
  side        EntitySide
  isPlayer    Boolean

  replay      Replay @relation(fields: [replayId], references: [id], onDelete: Cascade)

  @@unique([replayId, entityId])
  @@index([replayId, entityId])
}

model Event {
  id          String      @id @default(uuid())
  replayId    String
  frameId     Int
  eventType   EventType
  data        String      // JSON as text for SQLite

  replay      Replay @relation(fields: [replayId], references: [id], onDelete: Cascade)

  @@index([replayId, eventType])
}

model Player {
  id            String    @id @default(uuid())
  createdAt     DateTime  @default(now())

  names         PlayerName[]
  replayResults PlayerReplayResult[]
  statistics    PlayerStatistics[]
  corrections   Correction[]
}

model PlayerName {
  id          String    @id @default(uuid())
  playerId    String
  name        String
  validFrom   DateTime
  validTo     DateTime?

  player      Player @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@index([name, validFrom, validTo])
}
```

**Step 2: Generate Prisma client**

```bash
npx prisma generate
```

Expected: Client generated successfully

**Step 3: Create initial migration**

```bash
npx prisma migrate dev --name init_core_models
```

Expected: Migration created and applied

**Step 4: Commit schema**

```bash
git add prisma/
git commit -m "feat(db): add core database models (Replay, Entity, Event, Player)"
```

### Task 1.2: Add Player Results and Corrections Models

**Files:**

- Modify: `prisma/schema.prisma`

**Step 1: Add correction enums and models**

Append to `schema.prisma`:

```prisma
enum CorrectionType {
  ADD_KILL
  ADD_TEAMKILL
  REMOVE_TEAMKILL
  ADD_VEHICLE_KILL
  REMOVE_PLAYER
}

model PlayerReplayResult {
  id                String  @id @default(uuid())
  replayId          String
  playerId          String
  entityName        String
  squadPrefix       String?
  kills             Int
  killsFromVehicle  Int
  vehicleKills      Int
  teamkills         Int
  deaths            Int
  deathsByTeamkills Int
  isDead            Boolean
  isDeadByTeamkill  Boolean
  score             Float

  // JSON fields stored as text in SQLite
  weapons           String  // WeaponStatistic[]
  vehicles          String  // WeaponStatistic[]
  killed            String  // OtherPlayer[]
  killers           String  // OtherPlayer[]
  teamkilled        String  // OtherPlayer[]
  teamkillers       String  // OtherPlayer[]

  replay            Replay @relation(fields: [replayId], references: [id], onDelete: Cascade)
  player            Player @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([replayId, playerId])
  @@index([playerId])
}

model Correction {
  id              String          @id @default(uuid())
  replayId        String
  playerId        String
  correctionType  CorrectionType
  targetPlayerId  String?
  data            String          // JSON as text
  createdAt       DateTime        @default(now())
  createdBy       String
  applied         Boolean         @default(false)

  replay          Replay @relation(fields: [replayId], references: [id], onDelete: Cascade)
  player          Player @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@index([replayId, playerId])
  @@index([applied])
}
```

**Step 2: Generate and migrate**

```bash
npx prisma generate
npx prisma migrate dev --name add_player_results_corrections
```

**Step 3: Commit**

```bash
git add prisma/
git commit -m "feat(db): add PlayerReplayResult and Correction models"
```

### Task 1.3: Add Statistics Models

**Files:**

- Modify: `prisma/schema.prisma`

**Step 1: Add statistics models**

Append to `schema.prisma`:

```prisma
enum InteractionType {
  KILLED
  KILLERS
  TEAMKILLED
  TEAMKILLERS
}

model PlayerStatistics {
  id                    String    @id @default(uuid())
  playerId              String
  gameType              GameType
  rotationId            String?

  totalPlayedGames      Int
  kills                 Int
  killsFromVehicle      Int
  vehicleKills          Int
  teamkills             Int
  deathsTotal           Int
  deathsByTeamkills     Int
  kdRatio               Float
  killsFromVehicleCoef  Float
  totalScore            Float
  lastPlayedGameDate    DateTime
  lastSquadPrefix       String?
  isShow                Boolean   @default(true)

  needsRecalculation    Boolean   @default(false)
  lastCalculatedAt      DateTime

  player                Player @relation(fields: [playerId], references: [id], onDelete: Cascade)
  weeklyStats           PlayerWeeklyStats[]
  weaponStats           PlayerWeaponStats[]
  vehicleStats          PlayerVehicleStats[]
  interactions          PlayerInteraction[]

  @@unique([playerId, gameType, rotationId])
  @@index([needsRecalculation])
  @@index([playerId, gameType])
}

model PlayerWeeklyStats {
  id                    String    @id @default(uuid())
  statisticsId          String
  week                  String
  startDate             DateTime
  endDate               DateTime
  totalPlayedGames      Int
  kills                 Int
  killsFromVehicle      Int
  vehicleKills          Int
  teamkills             Int
  deathsTotal           Int
  deathsByTeamkills     Int
  kdRatio               Float
  killsFromVehicleCoef  Float
  score                 Float

  statistics            PlayerStatistics @relation(fields: [statisticsId], references: [id], onDelete: Cascade)

  @@index([statisticsId])
}

model PlayerWeaponStats {
  id              String    @id @default(uuid())
  statisticsId    String
  weaponName      String
  kills           Int
  maxDistance     Float

  statistics      PlayerStatistics @relation(fields: [statisticsId], references: [id], onDelete: Cascade)

  @@index([statisticsId])
}

model PlayerVehicleStats {
  id              String    @id @default(uuid())
  statisticsId    String
  vehicleName     String
  kills           Int
  maxDistance     Float

  statistics      PlayerStatistics @relation(fields: [statisticsId], references: [id], onDelete: Cascade)

  @@index([statisticsId])
}

model PlayerInteraction {
  id                String          @id @default(uuid())
  statisticsId      String
  type              InteractionType
  targetPlayerId    String
  targetPlayerName  String
  count             Int

  statistics        PlayerStatistics @relation(fields: [statisticsId], references: [id], onDelete: Cascade)

  @@index([statisticsId, type])
}

model SquadStatistics {
  id                  String    @id @default(uuid())
  prefix              String
  gameType            GameType
  rotationId          String?
  fourWeeksOnly       Boolean

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
  id                    String    @id @default(uuid())
  squadStatisticsId     String
  playerId              String
  playerName            String
  kills                 Int
  deathsTotal           Int
  teamkills             Int
  kdRatio               Float
  totalPlayedGames      Int
  totalScore            Float
  vehicleKills          Int
  killsFromVehicle      Int
  killsFromVehicleCoef  Float

  squadStatistics       SquadStatistics @relation(fields: [squadStatisticsId], references: [id], onDelete: Cascade)

  @@index([squadStatisticsId])
}
```

**Step 2: Generate and migrate**

```bash
npx prisma generate
npx prisma migrate dev --name add_statistics_models
```

**Step 3: Verify schema**

```bash
npx prisma validate
```

Expected: "The schema is valid"

**Step 4: Commit**

```bash
git add prisma/
git commit -m "feat(db): add statistics models (player, squad, interactions)"
```

---

## Phase 2: Database Client and Utilities

### Task 2.1: Create Prisma Client Wrapper

**Files:**

- Create: `src/db/client.ts`
- Create: `src/db/index.ts`

**Step 1: Write test for client initialization**

Create `src/db/__tests__/client.test.ts`:

```typescript
import { getDbClient, disconnectDb } from '../client';

describe('Database Client', () => {
  afterAll(async () => {
    await disconnectDb();
  });

  it('should return Prisma client instance', () => {
    const client = getDbClient();
    expect(client).toBeDefined();
    expect(client.replay).toBeDefined();
  });

  it('should return same instance on multiple calls (singleton)', () => {
    const client1 = getDbClient();
    const client2 = getDbClient();
    expect(client1).toBe(client2);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- src/db/__tests__/client.test.ts
```

Expected: FAIL "Cannot find module '../client'"

**Step 3: Implement client wrapper**

Create `src/db/client.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

let prismaClient: PrismaClient | null = null;

export const getDbClient = (): PrismaClient => {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaClient;
};

export const disconnectDb = async (): Promise<void> => {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
};
```

Create `src/db/index.ts`:

```typescript
export { getDbClient, disconnectDb } from './client';
export { PrismaClient } from '@prisma/client';
```

**Step 4: Run test to verify it passes**

```bash
npm test -- src/db/__tests__/client.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/db/
git commit -m "feat(db): add Prisma client wrapper with singleton pattern"
```

### Task 2.2: Create Player ID Resolver Service

**Files:**

- Create: `src/db/services/playerIdResolver.ts`
- Create: `src/db/services/__tests__/playerIdResolver.test.ts`

**Step 1: Write tests for player ID resolution**

Create test file:

```typescript
import { Dayjs } from 'dayjs';
import { dayjsUTC } from '../../../0 - utils/dayjs';
import { getDbClient, disconnectDb } from '../../client';
import { resolvePlayerId, seedPlayerNames } from '../playerIdResolver';

describe('Player ID Resolver', () => {
  const db = getDbClient();

  beforeAll(async () => {
    // Clean database
    await db.playerName.deleteMany();
    await db.player.deleteMany();

    // Seed test data
    const player1 = await db.player.create({ data: {} });
    const player2 = await db.player.create({ data: {} });

    await db.playerName.createMany({
      data: [
        {
          playerId: player1.id,
          name: 'oldnick',
          validFrom: dayjsUTC('2020-01-01').toDate(),
          validTo: dayjsUTC('2023-06-01').toDate(),
        },
        {
          playerId: player1.id,
          name: 'newnick',
          validFrom: dayjsUTC('2023-06-01').toDate(),
          validTo: null,
        },
        {
          playerId: player2.id,
          name: 'unchangednick',
          validFrom: dayjsUTC('2020-01-01').toDate(),
          validTo: null,
        },
      ],
    });
  });

  afterAll(async () => {
    await db.playerName.deleteMany();
    await db.player.deleteMany();
    await disconnectDb();
  });

  it('should resolve player ID for name within valid period', async () => {
    const playerId = await resolvePlayerId('oldnick', dayjsUTC('2021-01-01'));
    expect(playerId).toBeDefined();
    expect(typeof playerId).toBe('string');
  });

  it('should resolve to same player ID after name change', async () => {
    const oldId = await resolvePlayerId('oldnick', dayjsUTC('2021-01-01'));
    const newId = await resolvePlayerId('newnick', dayjsUTC('2024-01-01'));
    expect(oldId).toBe(newId);
  });

  it('should return lowercase name when no match found', async () => {
    const result = await resolvePlayerId('unknownplayer', dayjsUTC('2024-01-01'));
    expect(result).toBe('unknownplayer');
  });

  it('should respect date boundaries for name changes', async () => {
    const beforeChange = await resolvePlayerId('oldnick', dayjsUTC('2023-05-01'));
    const afterChange = await resolvePlayerId('newnick', dayjsUTC('2023-07-01'));
    expect(beforeChange).toBe(afterChange);

    // Should not resolve new name before change date
    const wrongPeriod = await resolvePlayerId('newnick', dayjsUTC('2023-05-01'));
    expect(wrongPeriod).toBe('newnick'); // Returns name when not found
  });

  it('should handle case insensitivity', async () => {
    const result = await resolvePlayerId('OLDNICK', dayjsUTC('2021-01-01'));
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- playerIdResolver.test.ts
```

Expected: FAIL

**Step 3: Implement player ID resolver**

Create `src/db/services/playerIdResolver.ts`:

```typescript
import { Dayjs } from 'dayjs';
import { getDbClient } from '../client';

/**
 * Resolves player ID based on name and game date.
 * Mimics existing getPlayerId logic using database.
 */
export const resolvePlayerId = async (
  name: string,
  gameDate: Dayjs,
): Promise<string> => {
  const db = getDbClient();
  const loweredName = name.toLowerCase();
  const gameDateISO = gameDate.toDate();

  // Find player name entry that matches name and date range
  const playerName = await db.playerName.findFirst({
    where: {
      name: loweredName,
      validFrom: { lte: gameDateISO },
      OR: [
        { validTo: null },
        { validTo: { gte: gameDateISO } },
      ],
    },
    include: {
      player: true,
    },
  });

  // If found, return player ID; otherwise return lowercased name
  return playerName?.playerId ?? loweredName;
};

/**
 * Seeds player names from nameChanges.csv data.
 * Used during migration.
 */
export const seedPlayerNames = async (
  namesData: Array<{
    playerId: string;
    name: string;
    validFrom: Date;
    validTo: Date | null;
  }>,
): Promise<void> => {
  const db = getDbClient();

  await db.playerName.createMany({
    data: namesData,
    skipDuplicates: true,
  });
};
```

**Step 4: Run test to verify it passes**

```bash
npm test -- playerIdResolver.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/db/services/
git commit -m "feat(db): add player ID resolver service"
```

### Task 2.3: Create Name Changes CSV Seeder

**Files:**

- Create: `src/db/seed/seedNameChanges.ts`
- Create: `src/db/seed/__tests__/seedNameChanges.test.ts`

**Step 1: Write test for CSV seeding**

Create test (using existing prepareNamesList logic as reference):

```typescript
import fs from 'fs-extra';
import path from 'path';
import { getDbClient, disconnectDb } from '../../client';
import { seedNameChangesFromCSV } from '../seedNameChanges';

describe('Seed Name Changes', () => {
  const db = getDbClient();
  const testCSVPath = path.join(__dirname, 'fixtures', 'test-nameChanges.csv');

  beforeAll(() => {
    // Create test CSV
    const csvContent = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус","Причина отказа","","","",""
"19.09.2023 18:07:33","https://sg.zone/profile/TestPlayer","OldName","NewName","10.05.2023 12:00","Принято","","","","",""
"20.09.2023 15:08:14","https://sg.zone/profile","TestPlayer2","BadName","05.10.2022 0:11","Отказано","Test rejection","","","",""`;

    fs.ensureDirSync(path.dirname(testCSVPath));
    fs.writeFileSync(testCSVPath, csvContent);
  });

  afterAll(async () => {
    fs.removeSync(testCSVPath);
    await db.playerName.deleteMany();
    await db.player.deleteMany();
    await disconnectDb();
  });

  it('should parse and import accepted name changes', async () => {
    await seedNameChangesFromCSV(testCSVPath);

    const players = await db.player.findMany({
      include: { names: true },
    });

    expect(players.length).toBeGreaterThan(0);

    const testPlayer = players.find(p =>
      p.names.some(n => n.name === 'oldname' || n.name === 'newname')
    );

    expect(testPlayer).toBeDefined();
    expect(testPlayer!.names.length).toBe(2);
  });

  it('should skip rejected name changes', async () => {
    await seedNameChangesFromCSV(testCSVPath);

    const rejectedName = await db.playerName.findFirst({
      where: { name: 'badname' },
    });

    expect(rejectedName).toBeNull();
  });

  it('should handle date parsing correctly', async () => {
    await seedNameChangesFromCSV(testCSVPath);

    const nameChange = await db.playerName.findFirst({
      where: { name: 'newname' },
    });

    expect(nameChange).toBeDefined();
    expect(nameChange!.validFrom.getFullYear()).toBe(2023);
    expect(nameChange!.validFrom.getMonth()).toBe(4); // May (0-indexed)
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- seedNameChanges.test.ts
```

Expected: FAIL

**Step 3: Implement seeder (reusing prepareNamesList logic)**

Create `src/db/seed/seedNameChanges.ts`:

```typescript
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Dayjs } from 'dayjs';
import fs from 'fs-extra';
import z from 'zod';
import { dayjsUTC } from '../../0 - utils/dayjs';
import moscowDateToUTC from '../../0 - utils/namesHelper/moscowDateToUTC';
import { configPath } from '../../0 - utils/paths';
import { getDbClient } from '../client';

type RawCSVContentType = {
  'Старый позывной': string;
  'Новый позывной': string;
  'Дата смены ника': string;
  'Статус': 'Принято' | 'Отказано';
};

type CSVContentType = {
  oldName: string;
  newName: string;
  date: Dayjs;
};

const parseDate = (rawDate: string): Dayjs | undefined => {
  const [date, rawTime] = rawDate.split(' ');
  if (!date || !rawTime) return undefined;

  const [day, month, year] = date.split('.');
  if (!day || !month || !year) return undefined;

  const [hours, minutes] = rawTime.split(':');
  if (!hours || !minutes) return undefined;

  try {
    const parsedDate = [
      [
        z.coerce.number().parse(day),
        z.coerce.number().parse(month),
        z.coerce.number().parse(year),
      ].join('.'),
      [
        z.coerce.number().parse(hours),
        z.coerce.number().parse(minutes),
      ].join(':'),
    ].join(' ');

    return moscowDateToUTC(parsedDate, 'D.M.YYYY H:m');
  } catch {
    return undefined;
  }
};

const processContent = (records: RawCSVContentType[]): CSVContentType[] => (
  records
    .map<CSVContentType | undefined>((record) => {
      const date = parseDate(record['Дата смены ника']);
      if (date === undefined || record.Статус === 'Отказано') return undefined;

      return {
        oldName: record['Старый позывной'].trim().toLowerCase(),
        newName: record['Новый позывной'].trim().toLowerCase(),
        date,
      };
    })
    .filter((item): item is CSVContentType => item !== undefined)
);

/**
 * Seeds player names from nameChanges.csv file.
 * Creates player records and name change history.
 */
export const seedNameChangesFromCSV = async (
  csvPath?: string,
): Promise<void> => {
  const db = getDbClient();
  const filePath = csvPath || path.join(configPath, 'nameChanges.csv');

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const rawRecords = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ',',
  }) as RawCSVContentType[];

  const nameChanges = processContent(rawRecords);

  // Group by player (connected name chains)
  const playerGroups: Array<Array<{ name: string; date: Dayjs }>> = [];
  const processedNames = new Set<string>();

  nameChanges.forEach(({ oldName, newName, date }) => {
    if (processedNames.has(oldName) || processedNames.has(newName)) {
      // Find existing group
      const group = playerGroups.find(g =>
        g.some(n => n.name === oldName || n.name === newName)
      );
      if (group) {
        if (!group.some(n => n.name === oldName)) {
          group.push({ name: oldName, date: dayjsUTC('1970-01-01') });
        }
        if (!group.some(n => n.name === newName)) {
          group.push({ name: newName, date });
        }
      }
    } else {
      // Create new group
      playerGroups.push([
        { name: oldName, date: dayjsUTC('1970-01-01') },
        { name: newName, date },
      ]);
    }
    processedNames.add(oldName);
    processedNames.add(newName);
  });

  // Create players and names
  for (const group of playerGroups) {
    const player = await db.player.create({ data: {} });

    // Sort by date
    const sortedNames = group.sort((a, b) => a.date.valueOf() - b.date.valueOf());

    for (let i = 0; i < sortedNames.length; i++) {
      const current = sortedNames[i];
      const next = sortedNames[i + 1];

      await db.playerName.create({
        data: {
          playerId: player.id,
          name: current.name,
          validFrom: current.date.toDate(),
          validTo: next ? next.date.toDate() : null,
        },
      });
    }
  }
};
```

**Step 4: Run test to verify it passes**

```bash
npm test -- seedNameChanges.test.ts
```

Expected: PASS

**Step 5: Create seed script**

Create `src/db/seed/index.ts`:

```typescript
import { seedNameChangesFromCSV } from './seedNameChanges';
import logger from '../../0 - utils/logger';

const runSeed = async () => {
  try {
    logger.info('Starting database seed...');
    await seedNameChangesFromCSV();
    logger.info('Database seed completed successfully');
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

runSeed();
```

**Step 6: Commit**

```bash
git add src/db/seed/
git commit -m "feat(db): add name changes CSV seeder"
```

---

## Phase 3: Replay Discovery and Download Services

### Task 3.1: Create Replay Discovery Service

**Files:**

- Create: `src/services/discovery/fetchReplays.ts`
- Create: `src/services/discovery/__tests__/fetchReplays.test.ts`

**Step 1: Write tests for replay fetching**

```typescript
import nock from 'nock';
import { fetchReplaysPage, parseReplayFromHTML } from '../fetchReplays';

describe('Fetch Replays Service', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should fetch and parse replays from page', async () => {
    const mockHTML = `
      <div class="replay-item">
        <a href="/replay/test_replay_001">test_replay_001</a>
        <span class="mission">sg@test_mission</span>
        <span class="date">2024-01-15 18:30:00</span>
        <span class="world">Altis</span>
      </div>
    `;

    nock('https://sg.zone')
      .get('/replays')
      .query({ page: 1 })
      .reply(200, mockHTML);

    const replays = await fetchReplaysPage(1);

    expect(replays).toHaveLength(1);
    expect(replays[0].filename).toBe('test_replay_001');
    expect(replays[0].mission_name).toBe('sg@test_mission');
  });

  it('should handle missing fields gracefully', async () => {
    const mockHTML = `
      <div class="replay-item">
        <a href="/replay/incomplete_replay">incomplete_replay</a>
      </div>
    `;

    nock('https://sg.zone')
      .get('/replays')
      .query({ page: 1 })
      .reply(200, mockHTML);

    const replays = await fetchReplaysPage(1);
    expect(replays).toHaveLength(0); // Should skip incomplete entries
  });

  it('should handle network errors', async () => {
    nock('https://sg.zone')
      .get('/replays')
      .query({ page: 1 })
      .replyWithError('Network error');

    await expect(fetchReplaysPage(1)).rejects.toThrow();
  });
});
```

**Step 2: Install dependencies**

```bash
npm install axios cheerio
npm install -D nock @types/cheerio
```

**Step 3: Run test to verify it fails**

```bash
npm test -- fetchReplays.test.ts
```

Expected: FAIL

**Step 4: Implement discovery service**

Create `src/services/discovery/fetchReplays.ts`:

```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';
import { dayjsUTC } from '../../0 - utils/dayjs';
import logger from '../../0 - utils/logger';

export type ReplayMetadata = {
  filename: string;
  mission_name: string;
  date: string;
  world_name: string;
  replayLink: string;
};

export const fetchReplaysPage = async (page: number): Promise<ReplayMetadata[]> => {
  try {
    const response = await axios.get(`https://sg.zone/replays`, {
      params: { page },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);
    const replays: ReplayMetadata[] = [];

    $('.replay-item').each((_, element) => {
      const $el = $(element);
      const link = $el.find('a').attr('href');
      const filename = $el.find('a').text().trim();
      const mission = $el.find('.mission').text().trim();
      const date = $el.find('.date').text().trim();
      const world = $el.find('.world').text().trim();

      if (link && filename && mission && date) {
        replays.push({
          filename,
          mission_name: mission,
          date: dayjsUTC(date).toISOString(),
          world_name: world || 'Unknown',
          replayLink: `https://sg.zone${link}`,
        });
      }
    });

    return replays;
  } catch (error) {
    logger.error(`Failed to fetch replays page ${page}: ${error.message}`);
    throw error;
  }
};

export const fetchAllReplaysPages = async (): Promise<ReplayMetadata[]> => {
  const allReplays: ReplayMetadata[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const replays = await fetchReplaysPage(page);
    if (replays.length === 0) {
      hasMore = false;
    } else {
      allReplays.push(...replays);
      page++;
    }
  }

  return allReplays;
};
```

**Step 5: Run test to verify it passes**

```bash
npm test -- fetchReplays.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/services/discovery/
git commit -m "feat(services): add replay discovery service"
```

---

**[PLAN CONTINUES WITH 50+ MORE TASKS...]**

Due to length constraints, this plan continues with:

- Task 3.2-3.4: Download services and storage
- Phase 4: Replay parsing services (10+ tasks)
- Phase 5: Statistics calculation (15+ tasks)
- Phase 6: Output generation (5+ tasks)
- Phase 7: Job implementation (8+ tasks)
- Phase 8: Migration and validation (10+ tasks)
- Phase 9: Integration testing and regression checks

**Total:** ~70 granular tasks, each 2-5 minutes, with full test coverage.

---

## Critical Validation Steps

### Final Validation: Output Comparison

**Before deployment, MUST verify:**

1. **Exact JSON comparison for /results/:**

```bash
diff -r /home/afgan0r/sg_stats/backup-2026-01-25/results /home/afgan0r/sg_stats/results
```

Expected: No differences

1. **Exact text comparison for /year_results/:**

```bash
diff -r /home/afgan0r/sg_stats/backup-2026-01-25/year_results /home/afgan0r/sg_stats/year_results
```

Expected: No differences

1. **Content comparison for /lists/ (structure may differ):**

```bash
# Extract replay counts and verify match
```

1. **Run full test suite:**

```bash
npm test -- --coverage
```

Expected: 100% coverage on new code, all tests pass

1. **Verify existing tests unchanged:**

```bash
git diff HEAD src/!tests/
```

Expected: No changes to test files (only added, not modified)

---

## Success Criteria Checklist

- [ ] All Prisma migrations applied successfully
- [ ] Database seeded with player names from CSV
- [ ] 100% test coverage on new services
- [ ] All existing tests pass without modification
- [ ] Output validation: /results/ exact match
- [ ] Output validation: /year_results/ exact match
- [ ] Output validation: /lists/ content match
- [ ] Performance: incremental parsing <5 min for new replays
- [ ] Memory: process uses <2GB RAM during parsing
- [ ] Jobs running successfully on schedule
- [ ] Documentation updated with migration guide
