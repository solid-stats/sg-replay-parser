import { compareDesc } from 'date-fns';
import orderBy from 'lodash/orderBy';

import pipe from '../../0 - utils/pipe';
import addPlayerGameResultToGlobalStatistics from './add';

const sortPlayerStatistics = (statistics: GlobalPlayerStatistics[]): GlobalPlayerStatistics[] => {
  const sortedStatisticsByScore = orderBy(statistics, 'totalScore', 'desc');
  const sortedStatistics = sortedStatisticsByScore.map((playerStatistics) => ({
    ...playerStatistics,
    byWeeks: playerStatistics.byWeeks.sort(
      (first, second) => compareDesc(
        new Date(first.startDate),
        new Date(second.startDate),
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
  replays: PlayersGameResult[],
): GlobalPlayerStatistics[] => {
  let globalStatistics: GlobalPlayerStatistics[] = [];

  replays.forEach((replayInfo) => (
    replayInfo.result.forEach((playerGameResult) => {
      globalStatistics = addPlayerGameResultToGlobalStatistics(
        globalStatistics,
        playerGameResult,
        replayInfo.date,
      );
    })
  ));

  const resultStatistics = pipe(
    sortPlayerStatistics,
    limitWeaponsStatisticsCount,
  )(globalStatistics);

  return resultStatistics;
};

export default calculateGlobalStatistics;
