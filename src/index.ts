import path from 'path';

import fs from 'fs-extra';

import { gameTypes } from './0 - consts/gameTypesArray';
import { dayjsUTC } from './0 - utils/dayjs';
import filterPlayersByTotalPlayedGames from './0 - utils/filterPlayersByTotalPlayedGames';
import formatGameType from './0 - utils/formatGameType';
import generateBasicFolders from './0 - utils/generateBasicFolders';
import logger, { logsFolderPath } from './0 - utils/logger';
import { prepareNamesList } from './0 - utils/namesHelper/prepareNamesList';
import {
  commitParsingStatus,
  readRunReplayListPreparedAt,
} from './0 - utils/parsingStatus';
import { tempResultsPath } from './0 - utils/paths';
import { getRuntimeConfig } from './0 - utils/runtimeConfig';
import getReplays from './1 - replays/getReplays';
import parseReplays from './1 - replays/parseReplays';
import { WorkerPool } from './1 - replays/workers/workerPool';
import calculateGlobalStatistics from './3 - statistics/global';
import getStatsByRotations from './3 - statistics/rotations';
import generateOutput from './4 - output';

const getReplaysForGameType = async (gameType: GameType): Promise<Replay[]> => {
  let replays = await getReplays(gameType);

  if (gameType === 'sm') {
    replays = replays.filter(
      (replay) => dayjsUTC(replay.date).isAfter('2023-01-01', 'month'),
    );
  }

  return replays;
};

const countStatistics = (
  parsedReplays: PlayersGameResult[],
  gameType: GameType,
): Statistics => {
  const global = calculateGlobalStatistics(parsedReplays);
  const byRotations = gameType === 'sg' ? getStatsByRotations(parsedReplays) : null;

  logger.info(`- ${formatGameType(gameType)} statistics collected.`);

  return {
    global: filterPlayersByTotalPlayedGames({
      statistics: global,
      gamesCount: parsedReplays.length,
      type: 'not show',
    }),
    squad: [],
    squadFull: [],
    byRotations,
  };
};

const startParsingReplays = async () => {
  generateBasicFolders();
  fs.emptyDirSync(tempResultsPath);
  prepareNamesList();
  const runUpdateTime = readRunReplayListPreparedAt();

  const workerPool = new WorkerPool({
    workerCount: getRuntimeConfig().workerCount,
    workerScriptPath: path.join(__dirname, '1 - replays/workers/parseReplayWorker.js'),
    workerData: { logsFolderPath },
  });

  logger.info('Started parsing replays.');

  try {
    const replaysByGameTypeEntries = await Promise.all(
      gameTypes.map(async (gameType) => [
        gameType,
        await getReplaysForGameType(gameType),
      ] as const),
    );

    const replaysByGameType = Object.fromEntries(
      replaysByGameTypeEntries,
    ) as Record<GameType, Replay[]>;

    const totalReplays = gameTypes.reduce(
      (sum, gameType) => sum + replaysByGameType[gameType].length,
      0,
    );
    let processedCount = 0;
    let nextLogPercent = 5;

    const logProgress = (): void => {
      if (totalReplays === 0) return;

      const processedPercent = Math.floor((processedCount / totalReplays) * 100);

      while (processedPercent >= nextLogPercent) {
        logger.info(
          `- Processed ${nextLogPercent}% of replays (${processedCount}/${totalReplays}).`,
        );

        nextLogPercent += 5;
      }
    };

    const onProgress = (): void => {
      processedCount += 1;
      logProgress();
    };

    const [sgParsedReplays, maceParsedReplays, smParsedReplays] = await Promise.all(
      gameTypes.map((gameType) => parseReplays(
        replaysByGameType[gameType],
        gameType,
        workerPool,
        onProgress,
      )),
    );

    logger.info('All replays parsed, start collecting statistics:');

    const parsedReplays: Record<GameType, PlayersGameResult[]> = {
      sg: sgParsedReplays,
      mace: maceParsedReplays,
      sm: smParsedReplays,
    };
    const [sgStats, maceStats, smStats] = await Promise.all(
      gameTypes.map((gameType) => countStatistics(parsedReplays[gameType], gameType)),
    );

    logger.info('All statistics collected, start generating output files.');

    await generateOutput({
      sg: { ...sgStats },
      mace: { ...maceStats },
      sm: { ...smStats },
    });

    if (runUpdateTime) {
      commitParsingStatus(runUpdateTime);
    }

    logger.info('Replays parsing completed.');
  } finally {
    await workerPool.destroy();
  }
};

export default startParsingReplays;
