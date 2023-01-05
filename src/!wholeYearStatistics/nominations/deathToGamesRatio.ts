import { orderBy, round, take } from 'lodash';

import filterPlayersByTotalPlayedGames from '../../0 - utils/filterPlayersByTotalPlayedGames';
import { maxRecords } from '../utils/consts';
import { printFinish, printNominationProcessStart } from '../utils/printText';

const calculateRatio = (totalPlayedGames: TotalPlayedGames, deaths: Deaths): Coefficient => {
  if (totalPlayedGames <= 0) return 0;

  return round(deaths.total / totalPlayedGames, 2);
};

const deathToGamesRatioNomination = ({
  result,
  ...other
}: YearResultsInfo): YearResultsInfo => {
  printNominationProcessStart('best/worst survivability');

  const list: NomineeList<DeathToGamesRatio> = {};

  filterPlayersByTotalPlayedGames({
    statistics: other.globalStatistics,
    gamesCount: other.replays.length,
    type: 'remove',
  })
    .forEach(({ name, totalPlayedGames, deaths }) => {
      const ratio = calculateRatio(totalPlayedGames, deaths);

      list[name] = {
        name,
        totalPlayedGames,
        deaths: deaths.total,
        ratio: `${100 - round(ratio * 100)}%`,
      };
    });

  printFinish();

  return {
    ...other,
    result: {
      ...result,
      bestDeathToGamesRatio: take(orderBy(list, ['ratio', 'totalPlayedGames'], ['asc', 'desc']), maxRecords),
      worstDeathToGamesRatio: take(orderBy(list, ['ratio', 'totalPlayedGames'], ['desc', 'desc']), maxRecords),
    },
  };
};

export default deathToGamesRatioNomination;
