import fs from 'fs';

import { dayjsUTC } from '../0 - utils/dayjs';
import { isInInterval } from '../0 - utils/isInInterval';
import pipe from '../0 - utils/pipe';
import getReplays from '../1 - replays/getReplays';
import parseReplays from '../1 - replays/parseReplays';
import calculateGlobalStatistics from '../3 - statistics/global';
import { statsFolder } from '../4 - output/consts';
import deathToGamesRatio from './nominations/deathToGamesRatio';
import mostPopularMission from './nominations/mostPopularMission';
import mostTeamkills from './nominations/mostTeamkills';
import mostTeamkillsInOneGame from './nominations/mostTeamkillsInOneGame';
import printOutput from './output';
import processRawReplays from './processRawReplays';
import { defaultResult } from './utils/consts';
import { printFinish } from './utils/printText';

/*
  This statistics includes different funny and interesting nominations
  that we usually show when it's New Year's Eve
*/

const year = 2022;

(async () => {
  const allReplays = await getReplays('sg');
  const replays = allReplays.filter((replay) => isInInterval(
    dayjsUTC(replay.date),
    dayjsUTC().year(year).startOf('year'),
    dayjsUTC().year(year).endOf('year'),
  )).reverse();
  const parsedReplays = await parseReplays(replays, 'sg');

  printFinish();

  // eslint-disable-next-line no-console
  console.log('Started calculating global statistics.');

  const globalStatistics = calculateGlobalStatistics(parsedReplays);

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
  )(info).result;

  result = await processRawReplays(result, replays);

  fs.mkdirSync(statsFolder);

  printOutput(result);
})();
