import { round } from 'lodash';

import filterPlayersByTotalPlayedGames from '../../../shared/utils/filterPlayersByTotalPlayedGames';
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
    isNewYearStats: true,
  })
    .forEach(({
      id, name, totalPlayedGames, deaths,
    }) => {
      const ratio = round(deaths.total / totalPlayedGames, 2);

      list[id] = {
        id,
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
