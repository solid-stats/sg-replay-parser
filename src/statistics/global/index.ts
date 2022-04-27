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

const getGlobalStatistics = (replays: PlayersListWithDate[]): GlobalPlayerStatistics[] => {
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
  const filteredStatistics = sortedStatisticsByScore.filter(
    (statistics) => statistics.totalPlayedGames > 20,
  );

  return filteredStatistics;
};

export default getGlobalStatistics;
