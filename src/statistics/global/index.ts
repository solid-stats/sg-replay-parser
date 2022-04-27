import { compareDesc } from 'date-fns';
import orderBy from 'lodash/orderBy';

import addPlayerGameResultToGlobalStatistics from './add';

const sortPlayerStatistics = (statistics: GlobalPlayerStatistics[]): GlobalPlayerStatistics[] => {
  const sortedStatisticsByScore = orderBy(statistics, 'totalScore', 'desc');
  const sortedStatistics = sortedStatisticsByScore.map((playerStatistics) => ({
    ...playerStatistics,
    byWeeks: playerStatistics.byWeeks.sort(
      (first, second) => compareDesc(first.date, second.date),
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
    Object.values(replayInfo.result).forEach((playerGameResult) => {
      globalStatistics = addPlayerGameResultToGlobalStatistics(
        globalStatistics,
        playerGameResult,
        replayInfo.date,
      );
    });
  });

  const sortedStatisticsByScore = sortPlayerStatistics(globalStatistics);
  const minGamesCount = gamesCount
    ? (20 * gamesCount) / 100 // 20%
    : 20;
  const filteredStatistics = sortedStatisticsByScore.filter(
    (statistics) => statistics.totalPlayedGames > minGamesCount,
  );

  return filteredStatistics;
};

export default calculateGlobalStatistics;
