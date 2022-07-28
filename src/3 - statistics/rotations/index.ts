import { endOfWeek } from 'date-fns';

import { dateFnsOptionsWithFirstWeekDate } from '../../0 - consts';
import filterPlayersByTotalPlayedGames from '../../0 - utils/filterPlayersByTotalPlayedGames';
import getRotations from '../../0 - utils/rotations';
import dateToUTC from '../../0 - utils/utc';
import calculateGlobalStatistics from '../global';
import calculateSquadStatistics from '../squads';
import getReplaysGroupByRotation from './getReplaysGroupByRotation';

const getStatsByRotations = (allReplays: PlayersGameResult[]): StatisticsByRotation[] => {
  const replaysGroupedByRotation = getReplaysGroupByRotation(allReplays);
  const statistics: StatisticsByRotation[] = replaysGroupedByRotation.map((replays, index) => {
    const [startDate, endDate] = getRotations()[index];
    const totalGames = replays.length;

    if (totalGames === 0) {
      return {
        totalGames,
        startDate,
        endDate,
        stats: {
          global: [],
          squad: [],
        },
      };
    }

    const globalStatistics = calculateGlobalStatistics(replays);
    const squadStatistics = calculateSquadStatistics(
      globalStatistics,
      replays,
      endDate || dateToUTC(endOfWeek(new Date('2022-07-31T20:00:00.000Z'), dateFnsOptionsWithFirstWeekDate)),
    );

    return {
      totalGames,
      startDate,
      endDate,
      stats: {
        global: filterPlayersByTotalPlayedGames(globalStatistics, totalGames),
        squad: squadStatistics,
      },
    };
  });

  return statistics;
};

export default getStatsByRotations;
