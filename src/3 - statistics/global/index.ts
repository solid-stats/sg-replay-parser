import { compareDesc } from 'date-fns';
import orderBy from 'lodash/orderBy';

import getWeekStartByWeekNumber from '../../0 - utils/getWeekStartByWeekNumber';
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

const calculateGlobalStatistics = (
  replays: PlayersGameResultWithDate[],
  // user only in statistics by rotations
  // to reduce the number of games needed to be in the statistics
  gamesCount?: number,
): GlobalPlayerStatistics[] => {
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

  const sortedStatisticsByScore = sortPlayerStatistics(globalStatistics);
  const minGamesCount = gamesCount
    ? (15 * gamesCount) / 100 // 15%
    : 20;
  const filteredStatistics = sortedStatisticsByScore.filter(
    (statistics) => statistics.totalPlayedGames > minGamesCount,
  );

  return filteredStatistics;
};

export default calculateGlobalStatistics;
