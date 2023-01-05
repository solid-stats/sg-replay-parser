import { round } from 'lodash';

import filterPlayersByTotalPlayedGames from '../../0 - utils/filterPlayersByTotalPlayedGames';
import limitAndOrder from '../utils/limitAndOrder';
import { printFinish, printNominationProcessStart } from '../utils/printText';

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
      const ratio = round(deaths.total / totalPlayedGames, 2);

      list[name] = {
        name,
        totalPlayedGames,
        deaths: deaths.total,
        ratio: round(100 - ratio * 100),
      };
    });

  printFinish();

  return {
    ...other,
    result: {
      ...result,
      bestDeathToGamesRatio: limitAndOrder(list, ['ratio', 'totalPlayedGames'], ['desc', 'desc']),
      worstDeathToGamesRatio: limitAndOrder(list, ['ratio', 'totalPlayedGames'], ['asc', 'desc']),
    },
  };
};

export default deathToGamesRatioNomination;
