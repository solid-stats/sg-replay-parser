/**
 * Pipeline Job: Status
 *
 * Shows current status of the replay pipeline.
 *
 * Usage:
 *   npm run build-dist && node dist/jobs/pipeline/status.js
 */

import logger from '../../shared/utils/logger';
import { initDbClient, getDbClient } from '../../db/client';
import { ReplayStatus, GameType } from '../../generated/prisma/enums';

const getStatusCounts = async () => {
  const db = getDbClient();

  const [discovered, downloaded, parsed, error] = await Promise.all([
    db.replay.count({ where: { status: ReplayStatus.DISCOVERED } }),
    db.replay.count({ where: { status: ReplayStatus.DOWNLOADED } }),
    db.replay.count({ where: { status: ReplayStatus.PARSED } }),
    db.replay.count({ where: { status: ReplayStatus.ERROR } }),
  ]);

  return {
    discovered, downloaded, parsed, error, total: discovered + downloaded + parsed + error,
  };
};

const getGameTypeBreakdown = async () => {
  const db = getDbClient();

  const [sg, mace, sm] = await Promise.all([
    db.replay.count({ where: { gameType: GameType.SG } }),
    db.replay.count({ where: { gameType: GameType.MACE } }),
    db.replay.count({ where: { gameType: GameType.SM } }),
  ]);

  return { sg, mace, sm };
};

const getRecentReplays = async (limit = 5) => {
  const db = getDbClient();

  return db.replay.findMany({
    select: {
      filename: true,
      missionName: true,
      date: true,
      status: true,
      gameType: true,
    },
    orderBy: { date: 'desc' },
    take: limit,
  });
};

const runStatus = async () => {
  try {
    initDbClient();

    const counts = await getStatusCounts();
    const gameTypes = await getGameTypeBreakdown();
    const recentReplays = await getRecentReplays();

    // eslint-disable-next-line no-console
    console.log(`
=========================================
REPLAY PIPELINE STATUS
=========================================

BY STATUS:
  - Discovered (pending download): ${counts.discovered}
  - Downloaded (pending parse): ${counts.downloaded}
  - Parsed: ${counts.parsed}
  - Error: ${counts.error}
  ─────────────────
  TOTAL: ${counts.total}

BY GAME TYPE:
  - SG: ${gameTypes.sg}
  - MACE: ${gameTypes.mace}
  - SM: ${gameTypes.sm}

RECENT REPLAYS:
${recentReplays.map((r) => `  - [${r.status}] ${r.date.toISOString().slice(0, 10)} | ${r.gameType} | ${r.missionName}`).join('\n') || '  (no replays yet)'}

=========================================
`);

    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // eslint-disable-next-line no-console
    console.error(`Status check failed: ${errorMessage}`);
    process.exit(1);
  }
};

runStatus();
