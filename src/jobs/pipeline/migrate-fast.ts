/**
 * Migration Job: Import existing replays using better-sqlite3
 *
 * This job bypasses Prisma/libsql to avoid timeout issues.
 * Uses better-sqlite3 for direct SQLite access which is much faster
 * for bulk operations.
 *
 * Usage:
 *   npm run build-dist && node dist/jobs/pipeline/migrate-fast.js
 *   npm run build-dist && node dist/jobs/pipeline/migrate-fast.js --limit=100
 *   npm run build-dist && node dist/jobs/pipeline/migrate-fast.js --status
 */

import path from 'path';
import fs from 'fs-extra';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

import { rawReplaysPath } from '../../shared/utils/paths';
import { prepareNamesList } from '../../shared/utils/namesHelper/prepareNamesList';
import { dayjsUTC } from '../../shared/utils/dayjs';
import getPlayerName from '../../shared/utils/getPlayerName';
import parseReplayInfo from '../../modules/parsing';
import calculateScore from '../../shared/utils/calculateScore';

type ParsedPlayerResult = {
  entityName: string;
  squadPrefix: string | null;
  kills: number;
  killsFromVehicle: number;
  vehicleKills: number;
  teamkills: number;
  isDead: boolean;
  isDeadByTeamkill: boolean;
  weapons: WeaponStatistic[];
  vehicles: WeaponStatistic[];
  killed: OtherPlayer[];
  killers: OtherPlayer[];
  teamkilled: OtherPlayer[];
  teamkillers: OtherPlayer[];
};

type MigrationStats = {
  total: number;
  skipped: number;
  imported: number;
  failed: number;
  errors: string[];
};

/**
 * Extracts squad prefix from player name (e.g., "[WOG] Player" -> "WOG")
 */
const extractSquadPrefix = (name: string): string | null => {
  const match = name.match(/^\[([^\]]+)\]/);

  return match ? match[1] : null;
};

/**
 * Get game type from mission name
 */
const getGameType = (missionName: string): 'SG' | 'MACE' | 'SM' => {
  const lowerName = missionName.toLowerCase();

  if (lowerName.startsWith('sg@')) return 'SG';
  if (lowerName.startsWith('mace@')) return 'MACE';
  if (lowerName.startsWith('sm@')) return 'SM';

  return 'SG'; // Default
};

/**
 * Parse date from filename (e.g., 2024_01_15__20_30_00_ocap.json)
 */
const parseDateFromFilename = (filename: string): Date => {
  const match = filename.match(/^(\d{4})_(\d{2})_(\d{2})__(\d{2})_(\d{2})_(\d{2})/);

  if (!match) {
    return new Date(); // Fallback to current date
  }

  const [, year, month, day, hour, minute, second] = match;

  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
};

/**
 * Convert PlayerInfo to ParsedPlayerResult
 */
const convertPlayerInfo = (player: PlayerInfo): ParsedPlayerResult => {
  const [name] = getPlayerName(player.name);
  const squadPrefix = extractSquadPrefix(player.name);

  return {
    entityName: name,
    squadPrefix,
    kills: player.kills,
    killsFromVehicle: player.killsFromVehicle,
    vehicleKills: player.vehicleKills,
    teamkills: player.teamkills,
    isDead: player.isDead,
    isDeadByTeamkill: player.isDeadByTeamkill,
    weapons: player.weapons,
    vehicles: player.vehicles,
    killed: player.killed,
    killers: player.killers,
    teamkilled: player.teamkilled,
    teamkillers: player.teamkillers,
  };
};

// Cache for player ID lookups (name -> playerId)
const playerIdCache = new Map<string, string>();

/**
 * Resolves player ID synchronously using better-sqlite3
 * Creates new player if not found
 */
const createResolvePlayerId = (db: Database.Database) => {
  // Prepare statements
  const findPlayerName = db.prepare(`
    SELECT playerId FROM PlayerName
    WHERE name = ? AND validFrom <= ? AND (validTo IS NULL OR validTo >= ?)
    LIMIT 1
  `);

  const insertPlayer = db.prepare(`
    INSERT INTO Player (id, createdAt)
    VALUES (?, ?)
  `);

  const insertPlayerName = db.prepare(`
    INSERT INTO PlayerName (id, playerId, name, validFrom, validTo)
    VALUES (?, ?, ?, ?, ?)
  `);

  return (name: string, gameDate: Date): string => {
    const loweredName = name.toLowerCase();
    const cacheKey = loweredName;

    // Check cache first
    if (playerIdCache.has(cacheKey)) {
      return playerIdCache.get(cacheKey)!;
    }

    const dateStr = gameDate.toISOString();

    // Try to find existing player
    const existing = findPlayerName.get(loweredName, dateStr, dateStr) as { playerId: string } | undefined;

    if (existing) {
      playerIdCache.set(cacheKey, existing.playerId);

      return existing.playerId;
    }

    // Create new player
    const playerId = uuidv4();
    const now = new Date().toISOString();

    insertPlayer.run(playerId, now);
    insertPlayerName.run(uuidv4(), playerId, loweredName, dateStr, null);

    playerIdCache.set(cacheKey, playerId);

    return playerId;
  };
};

/**
 * Main migration with better-sqlite3
 */
const migrate = async (): Promise<void> => {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const statusOnly = args.includes('--status');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || '/home/afgan0r/sg_stats/replays.db';

  console.log(`Opening database: ${dbPath}\n`);

  const db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  if (statusOnly) {
    const totalFiles = (await fs.readdir(rawReplaysPath)).filter((f) => f.endsWith('.json')).length;
    const dbStats = db.prepare('SELECT status, COUNT(*) as count FROM Replay GROUP BY status').all() as { status: string; count: number }[];

    const statusCounts = dbStats.reduce(
      (acc, s) => {
        acc[s.status] = s.count;

        return acc;
      },
      {} as Record<string, number>,
    );

    const totalInDb = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    console.log('=========================================');
    console.log('MIGRATION STATUS');
    console.log('=========================================');
    console.log(`\nFiles in raw_replays: ${totalFiles}`);
    console.log(`\nDatabase status:`);
    console.log(`  - DISCOVERED: ${statusCounts.DISCOVERED || 0}`);
    console.log(`  - DOWNLOADED: ${statusCounts.DOWNLOADED || 0}`);
    console.log(`  - PARSED: ${statusCounts.PARSED || 0}`);
    console.log(`  - ERROR: ${statusCounts.ERROR || 0}`);
    console.log(`  ─────────────────`);
    console.log(`  TOTAL: ${totalInDb}`);
    console.log(`\nRemaining to import: ${totalFiles - totalInDb}`);
    console.log('=========================================\n');

    db.close();

    return;
  }

  console.log('Initializing names list...');
  prepareNamesList();

  console.log('Scanning raw_replays folder...');
  const files = (await fs.readdir(rawReplaysPath))
    .filter((f) => f.endsWith('.json'))
    .sort();

  // Get existing filenames
  const existingRows = db.prepare('SELECT filename FROM Replay').all() as { filename: string }[];
  const existingFilenames = new Set(existingRows.map((r) => r.filename));

  const stats: MigrationStats = {
    total: files.length,
    skipped: 0,
    imported: 0,
    failed: 0,
    errors: [],
  };

  const filesToProcess = limit ? files.slice(0, limit) : files;

  console.log(`Found ${files.length} files, processing ${filesToProcess.length}...`);
  console.log(`Already in database: ${existingFilenames.size}`);
  console.log('');

  // Prepare statements for bulk inserts
  const insertReplay = db.prepare(`
    INSERT INTO Replay (id, filename, missionName, date, replayLink, status, gameType, discoveredAt, parsedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPlayerResult = db.prepare(`
    INSERT INTO PlayerReplayResult (id, replayId, playerId, entityName, squadPrefix, kills, killsFromVehicle, vehicleKills, teamkills, deaths, deathsByTeamkills, isDead, isDeadByTeamkill, score, weapons, vehicles, killed, killers, teamkilled, teamkillers)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Initialize player ID resolver
  const resolvePlayerId = createResolvePlayerId(db);

  let lastProgressTime = Date.now();
  const PROGRESS_INTERVAL = 5000;
  const BATCH_SIZE = 100;

  // Process in batches for transaction efficiency
  for (let batchStart = 0; batchStart < filesToProcess.length; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, filesToProcess.length);
    const batch = filesToProcess.slice(batchStart, batchEnd);

    // Start transaction for batch
    const transaction = db.transaction(() => {
      for (const file of batch) {
        const filenameWithoutExt = file.replace('.json', '');

        // Skip if already exists
        if (existingFilenames.has(filenameWithoutExt)) {
          stats.skipped += 1;
          continue;
        }

        try {
          const filePath = path.join(rawReplaysPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const replayData = JSON.parse(content) as ReplayInfo;

          const missionName = replayData.missionName;
          const gameType = getGameType(missionName);
          const date = parseDateFromFilename(file);
          const replayLink = `https://replays.solidgames.ru/?${filenameWithoutExt}`;

          const replayId = uuidv4();
          const now = new Date().toISOString();

          // Insert replay
          insertReplay.run(
            replayId,
            filenameWithoutExt,
            missionName,
            date.toISOString(),
            replayLink,
            'PARSED',
            gameType,
            now,
            now,
          );

          // Parse player data
          const dateString = dayjsUTC(date.toISOString()).format('YYYY-MM-DD');
          const playersList = parseReplayInfo(replayData, dateString);
          const playersArray = Object.values(playersList);
          const parsedPlayers = playersArray.map(convertPlayerInfo);

          // Insert player results
          for (const player of parsedPlayers) {
            const playerId = resolvePlayerId(player.entityName, date);
            const deaths = player.isDead ? 1 : 0;
            const deathsByTeamkills = player.isDeadByTeamkill ? 1 : 0;
            const score = calculateScore(
              1, // totalPlayedGames for this single replay
              player.kills,
              player.teamkills,
              { total: deaths, byTeamkills: deathsByTeamkills },
            );

            insertPlayerResult.run(
              uuidv4(),
              replayId,
              playerId,
              player.entityName,
              player.squadPrefix,
              player.kills,
              player.killsFromVehicle,
              player.vehicleKills,
              player.teamkills,
              deaths,
              deathsByTeamkills,
              player.isDead ? 1 : 0,
              player.isDeadByTeamkill ? 1 : 0,
              score,
              JSON.stringify(player.weapons),
              JSON.stringify(player.vehicles),
              JSON.stringify(player.killed),
              JSON.stringify(player.killers),
              JSON.stringify(player.teamkilled),
              JSON.stringify(player.teamkillers),
            );
          }

          stats.imported += 1;
          existingFilenames.add(filenameWithoutExt);
        } catch (error) {
          stats.failed += 1;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          if (stats.errors.length < 100) {
            stats.errors.push(`${filenameWithoutExt}: ${errorMessage}`);
          }
        }
      }
    });

    // Execute transaction
    transaction();

    // Progress update
    const now = Date.now();

    if (now - lastProgressTime >= PROGRESS_INTERVAL) {
      const progress = ((batchEnd) / filesToProcess.length * 100).toFixed(1);

      console.log(`Progress: ${batchEnd}/${filesToProcess.length} (${progress}%) - Imported: ${stats.imported}, Skipped: ${stats.skipped}, Failed: ${stats.failed}`);
      lastProgressTime = now;
    }
  }

  // Final summary
  console.log('\n=========================================');
  console.log('MIGRATION COMPLETE');
  console.log('=========================================');
  console.log(`\nResults:`);
  console.log(`  - Total files: ${stats.total}`);
  console.log(`  - Processed: ${filesToProcess.length}`);
  console.log(`  - Imported: ${stats.imported}`);
  console.log(`  - Skipped (already exists): ${stats.skipped}`);
  console.log(`  - Failed: ${stats.failed}`);

  if (stats.errors.length > 0) {
    console.log(`\nFirst 10 errors:`);
    stats.errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
  }

  console.log('=========================================\n');

  db.close();
};

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
