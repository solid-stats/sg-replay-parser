import { compareDesc } from 'date-fns';
import orderBy from 'lodash/orderBy';

import getWeekStartByWeekNumber from '../../0 - utils/getWeekStartByWeekNumber';
import pipe from '../../0 - utils/pipe';
import addPlayerGameResultToGlobalStatistics from './add';
import { combineGameResults } from './utils';

const sortPlayerStatistics = (statistics: GlobalPlayerStatistics[]): GlobalPlayerStatistics[] => {
  const sortedStatisticsByScore = orderBy(statistics, 'totalScore', 'desc');
  const sortedStatistics = sortedStatisticsByScore.map((playerStatistics) => ({
    ...playerStatistics,
    byWeeks: playerStatistics.byWeeks.sort(
      (first, second) => compareDesc(
        getWeekStartByWeekNumber(first.week),
        getWeekStartByWeekNumber(second.week),
      ),
    ),
  }));

  return sortedStatistics;
};

const limitWeaponsStatisticsCount = (
  statistics: GlobalPlayerStatistics[],
): GlobalPlayerStatistics[] => (
  statistics.map((playerStatistics) => ({
    ...playerStatistics,
    weapons: orderBy(playerStatistics.weapons, 'kills', 'desc').slice(0, 25),
  }))
);

const calculateGlobalStatistics = (
  replays: PlayersGameResultWithDate[],
  // user only in statistics by rotations
  // to reduce the number of games needed to be in the statistics
  gamesCount?: number,
): GlobalPlayerStatistics[] => {
  const filterPlayersByTotalPlayedGames = (statistics: GlobalPlayerStatistics[]) => {
    const minGamesCount = gamesCount
      ? (15 * gamesCount) / 100 // 15%
      : 20;

    return statistics.filter(
      (stats) => stats.totalPlayedGames > minGamesCount,
    );
  };

  let globalStatistics: GlobalPlayerStatistics[] = [];

  replays.forEach((replayInfo) => {
    const playerGameResults = combineGameResults(Object.values(replayInfo.result));

    playerGameResults.forEach((playerGameResult) => {
      globalStatistics = addPlayerGameResultToGlobalStatistics(
        globalStatistics,
        playerGameResult,
        replayInfo.date,
      );
    });
  });

  const resultStatistics = pipe(
    sortPlayerStatistics,
    filterPlayersByTotalPlayedGames,
    limitWeaponsStatisticsCount,
  )(globalStatistics);

  return resultStatistics;
};

export default calculateGlobalStatistics;
