/**
 * Migration Job: Import existing replays from raw_replays folder
 *
 * This job imports all existing replay JSON files into the database,
 * parses them and calculates statistics.
 *
 * Usage:
 *   npm run build-dist && node dist/jobs/pipeline/migrate.js
 *   npm run build-dist && node dist/jobs/pipeline/migrate.js --limit=100
 *   npm run build-dist && node dist/jobs/pipeline/migrate.js --status
 */

import path from 'path';
import fs from 'fs-extra';

import { initDbClient, getDbClient, disconnectDb } from '../../db/client';
import { rawReplaysPath } from '../../shared/utils/paths';
import { prepareNamesList } from '../../shared/utils/namesHelper/prepareNamesList';
import { dayjsUTC } from '../../shared/utils/dayjs';
import parseReplayInfo from '../../modules/parsing';
import {
  convertPlayerInfo,
  type ParsedReplayResult,
} from '../../services/parse/parseReplayData';
import { saveParsedReplay } from '../../services/parse';
import { GameType } from '../../generated/prisma/enums';

type MigrationStats = {
  total: number;
  skipped: number;
  imported: number;
  failed: number;
  errors: string[];
};

/**
 * Get game type from mission name
 */
const getGameType = (missionName: string): GameType => {
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
 * Check existing replays in database (chunked to avoid timeout)
 */
const getExistingFilenames = async (): Promise<Set<string>> => {
  const db = getDbClient();
  const existingFilenames = new Set<string>();

  // Get count first
  const count = await db.replay.count();

  if (count === 0) {
    return existingFilenames;
  }

  // Fetch in chunks
  const chunkSize = 5000;
  let skip = 0;

  while (skip < count) {
    // eslint-disable-next-line no-await-in-loop
    const replays = await db.replay.findMany({
      select: { filename: true },
      take: chunkSize,
      skip,
    });

    replays.forEach((r) => existingFilenames.add(r.filename));
    skip += chunkSize;
  }

  return existingFilenames;
};

/**
 * Import a single replay file with retry logic
 */
const importReplayFile = async (
  filename: string,
  existingFilenames: Set<string>,
  retries = 3,
): Promise<{ success: boolean; error?: string; skipped?: boolean }> => {
  const db = getDbClient();
  const filenameWithoutExt = filename.replace('.json', '');

  // Skip if already exists
  if (existingFilenames.has(filenameWithoutExt)) {
    return { success: true, skipped: true };
  }

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      // Read and parse replay file
      const filePath = path.join(rawReplaysPath, filename);
      // eslint-disable-next-line no-await-in-loop
      const content = await fs.readFile(filePath, 'utf8');
      const replayData = JSON.parse(content) as ReplayInfo;

      const missionName = replayData.missionName;
      const gameType = getGameType(missionName);
      const date = parseDateFromFilename(filename);
      const replayLink = `https://replays.solidgames.ru/?${filenameWithoutExt}`;

      // Create replay record
      // eslint-disable-next-line no-await-in-loop
      const replay = await db.replay.create({
        data: {
          filename: filenameWithoutExt,
          missionName,
          date,
          gameType,
          replayLink,
          status: 'DOWNLOADED',
        },
      });

      // Parse the replay data
      const dateString = dayjsUTC(date.toISOString()).format('YYYY-MM-DD');
      const playersList = parseReplayInfo(replayData, dateString);
      const playersArray = Object.values(playersList);

      const parsedResult: ParsedReplayResult = {
        missionName: replayData.missionName,
        worldName: replayData.worldName,
        missionAuthor: replayData.missionAuthor,
        playersCount: playersArray.length,
        players: playersArray.map(convertPlayerInfo),
      };

      // Save player results
      // eslint-disable-next-line no-await-in-loop
      await saveParsedReplay(replay.id, parsedResult, date);

      return { success: true };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // If it's a timeout, wait a bit before retry
      if (lastError.message.includes('timed out') && attempt < retries - 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      } else if (!lastError.message.includes('timed out')) {
        // Non-timeout errors - don't retry
        break;
      }
    }
  }

  return { success: false, error: `${filenameWithoutExt}: ${lastError?.message || 'Unknown error'}` };
};

/**
 * Show migration status
 */
const showStatus = async (): Promise<void> => {
  const db = getDbClient();

  const [totalFiles, dbStats] = await Promise.all([
    fs.readdir(rawReplaysPath).then((files) => files.filter((f) => f.endsWith('.json')).length),
    db.replay.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  const statusCounts = dbStats.reduce(
    (acc, s) => {
      acc[s.status] = s._count._all;

      return acc;
    },
    {} as Record<string, number>,
  );

  const totalInDb = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const remaining = totalFiles - totalInDb;

  console.log('\n=========================================');
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
  console.log(`\nRemaining to import: ${remaining}`);
  console.log('=========================================\n');
};

/**
 * Main migration function
 */
const migrate = async (): Promise<void> => {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const statusOnly = args.includes('--status');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

  console.log('Starting migration...\n');

  initDbClient();

  if (statusOnly) {
    await showStatus();
    await disconnectDb();

    return;
  }

  // Initialize names list for player ID resolution
  console.log('Initializing names list...');
  prepareNamesList();

  // Get list of files
  console.log('Scanning raw_replays folder...');
  const files = (await fs.readdir(rawReplaysPath))
    .filter((f) => f.endsWith('.json'))
    .sort(); // Sort by date (filename includes date)

  const existingFilenames = await getExistingFilenames();

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

  let lastProgressTime = Date.now();
  const PROGRESS_INTERVAL = 5000; // 5 seconds

  for (let i = 0; i < filesToProcess.length; i += 1) {
    const file = filesToProcess[i];
    // eslint-disable-next-line no-await-in-loop
    const result = await importReplayFile(file, existingFilenames);

    if (result.skipped) {
      stats.skipped += 1;
    } else if (result.success) {
      stats.imported += 1;
      existingFilenames.add(file.replace('.json', '')); // Add to set

      // Small delay to prevent database timeouts
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 50));
    } else {
      stats.failed += 1;

      if (result.error) {
        stats.errors.push(result.error);
      }
    }

    // Progress update every 5 seconds
    const now = Date.now();

    if (now - lastProgressTime >= PROGRESS_INTERVAL) {
      const progress = ((i + 1) / filesToProcess.length * 100).toFixed(1);

      console.log(`Progress: ${i + 1}/${filesToProcess.length} (${progress}%) - Imported: ${stats.imported}, Skipped: ${stats.skipped}, Failed: ${stats.failed}`);
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

  await showStatus();
  await disconnectDb();
};

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
