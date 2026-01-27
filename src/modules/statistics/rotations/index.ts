import filterPlayersByTotalPlayedGames from '../../../shared/utils/filterPlayersByTotalPlayedGames';
import getRotations from '../../../shared/utils/rotations';
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
          squadFull: [],
        },
      };
    }

    const globalStatistics = calculateGlobalStatistics(replays);
    const squadStatistics = calculateSquadStatistics(
      replays,
      rotationStartDate,
      rotationEndDate,
      true,
    );
    const squadFullRotationStatistics = calculateSquadStatistics(
      replays,
      rotationStartDate,
      rotationEndDate,
      false,
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
        squadFull: squadFullRotationStatistics,
      },
    };
  });

  return statistics;
};

export default getStatsByRotations;
