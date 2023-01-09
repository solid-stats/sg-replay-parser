import filterPlayersByTotalPlayedGames from '../../0 - utils/filterPlayersByTotalPlayedGames';
import getRotations from '../../0 - utils/rotations';
import calculateGlobalStatistics from '../global';
import calculateSquadStatistics from '../squads';
import getReplaysGroupByRotation from './getReplaysGroupByRotation';

const getStatsByRotations = (allReplays: PlayersGameResult[]): StatisticsByRotation[] => {
  const replaysGroupedByRotation = getReplaysGroupByRotation(allReplays);
  const statistics: StatisticsByRotation[] = replaysGroupedByRotation.map((replays, index) => {
    const [rotationStartDate, rotationEndDate] = getRotations()[index];
    const totalGames = replays.length;

    const startDate = rotationStartDate.toJSON();
    const endDate = rotationEndDate && rotationEndDate.toJSON();

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
      rotationEndDate,
    );

    return {
      totalGames,
      startDate,
      endDate,
      stats: {
        global: filterPlayersByTotalPlayedGames({
          statistics: globalStatistics,
          gamesCount: totalGames,
          type: 'not show',
        }),
        squad: squadStatistics,
      },
    };
  });

  return statistics;
};

export default getStatsByRotations;
