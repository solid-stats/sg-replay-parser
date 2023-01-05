import fs from 'fs';

import { dayjsUTC } from '../0 - utils/dayjs';
import pipe from '../0 - utils/pipe';
import getReplays from '../1 - replays/getReplays';
import parseReplays from '../1 - replays/parseReplays';
import calculateGlobalStatistics from '../3 - statistics/global';
import { DayjsInterval } from '../3 - statistics/squads/types';
import { isInInterval } from '../3 - statistics/squads/utils';
import { statsFolder } from '../4 - output/consts';
import deathToGamesRatio from './nominations/deathToGamesRatio';
import mostPopularMission from './nominations/mostPopularMission';
import mostTeamkills from './nominations/mostTeamkills';
import mostTeamkillsInOneGame from './nominations/mostTeamkillsInOneGame';
import processRawReplays from './processRawReplays';
import { defaultResult, titles } from './utils/consts';
import { printFinish } from './utils/printText';

/*
  This statistics includes different funny and interesting nominations
  that we usually show when it's New Year's Eve
*/

const year = 2022;
const interval: DayjsInterval = [
  dayjsUTC().year(year).startOf('year'),
  dayjsUTC().year(year).endOf('year'),
];

(async () => {
  const allReplays = await getReplays('sg');
  const replays = allReplays.filter((replay) => isInInterval(replay.date, interval)).reverse();
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

  Object.keys(result).forEach((nominationName) => (
    fs.writeFileSync(
      `${statsFolder}/${titles[nominationName]}.json`,
      JSON.stringify(result[nominationName], null, '\t'),
    )
  ));
})();
