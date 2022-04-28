import getRotations from '../../utils/rotations';
import calculateGlobalStatistics from '../global';
import calculateSquadStatistics from '../squads';
import getReplaysGroupByRotation from './getReplaysGroupByRotation';

const getStatsByRotations = (allReplays: PlayersGameResultWithDate[]): StatisticsByRotation[] => {
  const replaysGroupedByRotation = getReplaysGroupByRotation(allReplays);
  const statistics: StatisticsByRotation[] = replaysGroupedByRotation.map((replays, index) => {
    const [startDate, endDate] = getRotations()[index];
    const totalGames = replays.length;
    const globalStatistics = calculateGlobalStatistics(replays, totalGames);
    const squadStatistics = calculateSquadStatistics(globalStatistics, endDate || undefined);

    return {
      totalGames,
      startDate,
      endDate,
      stats: {
        global: globalStatistics,
        squad: squadStatistics,
      },
    };
  });

  return statistics;
};

export default getStatsByRotations;
