import path from 'path';

import fs from 'fs-extra';

import showCliHelp from '../0 - utils/cliHelp';
import { dayjsUTC } from '../0 - utils/dayjs';
import generateBasicFolders from '../0 - utils/generateBasicFolders';
import { isInInterval } from '../0 - utils/isInInterval';
import logger, { logsFolderPath } from '../0 - utils/logger';
import { prepareNamesList } from '../0 - utils/namesHelper/prepareNamesList';
import { yearResultsPath } from '../0 - utils/paths';
import pipe from '../0 - utils/pipe';
import getReplays from '../1 - replays/getReplays';
import parseReplays from '../1 - replays/parseReplays';
import { WorkerPool } from '../1 - replays/workers/workerPool';
import calculateGlobalStatistics from '../3 - statistics/global';
import deathToGamesRatio from './nominations/deathToGamesRatio';
import mostDeathsFromTeamkills from './nominations/mostDeathsFromTeamkills';
import mostPopularMission from './nominations/mostPopularMission';
import mostTeamkills from './nominations/mostTeamkills';
import mostTeamkillsInOneGame from './nominations/mostTeamkillsInOneGame';
import printOutput from './output';
import processRawReplays from './processRawReplays';
import { defaultResult, year } from './utils/consts';
import getPlayerNameAtEndOfTheYear from './utils/getPlayerNameAtEndOfTheYear';
import { printFinish } from './utils/printText';

/*
  This statistics includes different funny and interesting nominations
  that we usually show when it's New Year's Eve
*/

if (showCliHelp('parse-new-year', 'Run the yearly SG statistics pipeline.')) {
  process.exit(0);
}

(async () => {
  generateBasicFolders();
  prepareNamesList();

  const allReplays = await getReplays('sg');
  const replays = allReplays.filter((replay) => isInInterval(
    dayjsUTC(replay.date),
    dayjsUTC().year(year).startOf('year'),
    dayjsUTC().year(year).endOf('year'),
  )).reverse();
  const workerPool = new WorkerPool({
    workerCount: 1,
    workerScriptPath: path.join(__dirname, '../1 - replays/workers/parseReplayWorker.js'),
    workerData: { logsFolderPath },
  });

  logger.info(`Replays count: ${replays.length}`);

  let parsedReplays: PlayersGameResult[] = [];

  try {
    parsedReplays = await parseReplays(replays, 'sg', workerPool);
  } finally {
    await workerPool.destroy();
  }

  printFinish();

  logger.info('Started calculating global statistics.');

  const globalStatistics = calculateGlobalStatistics(parsedReplays).map((stats) => ({
    ...stats,
    name: getPlayerNameAtEndOfTheYear(stats.id) ?? stats.name,
  }));

  printFinish();

  const info: YearResultsInfo = {
    replays,
    parsedReplays,
    globalStatistics,
    result: defaultResult,
  };

  let result = defaultResult;

  result = pipe(
    deathToGamesRatio,
    mostTeamkillsInOneGame,
    mostTeamkills,
    mostPopularMission,
    mostDeathsFromTeamkills,
  )(info).result;

  result = await processRawReplays(result, replays, globalStatistics);

  fs.emptyDirSync(yearResultsPath);

  printOutput(result);
})();
