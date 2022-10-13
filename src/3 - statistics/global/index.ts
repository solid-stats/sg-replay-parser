import { orderBy } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import pipe from '../../0 - utils/pipe';
import addPlayerGameResultToGlobalStatistics from './add';

const sortPlayerStatistics = (statistics: GlobalPlayerStatistics[]): GlobalPlayerStatistics[] => {
  const sortedStatisticsByScore = orderBy(statistics, ['totalScore', 'totalPlayedGames', 'kills'], ['desc', 'desc', 'desc']);
  const sortedStatistics = sortedStatisticsByScore.map((playerStatistics) => ({
    ...playerStatistics,
    byWeeks: orderBy(playerStatistics.byWeeks, 'startDate', 'desc'),
  }));

  return sortedStatistics;
};

const limitWeaponsStatisticsCount = (
  statistics: GlobalPlayerStatistics[],
): GlobalPlayerStatistics[] => (
  statistics.map((playerStatistics) => ({
    ...playerStatistics,
    weapons: orderBy(playerStatistics.weapons, 'kills', 'desc').slice(0, 25),
    vehicles: orderBy(playerStatistics.vehicles, 'kills', 'desc').slice(0, 25),
  }))
);

const limitOtherPlayersStatsCount = (
  statistics: GlobalPlayerStatistics[],
): GlobalPlayerStatistics[] => (
  statistics.map((playerStatistics) => ({
    ...playerStatistics,
    killed: orderBy(playerStatistics.killed, 'count', 'desc').slice(0, 25),
    killers: orderBy(playerStatistics.killers, 'count', 'desc').slice(0, 25),
    teamkilled: orderBy(playerStatistics.teamkilled, 'count', 'desc').slice(0, 25),
    teamkillers: orderBy(playerStatistics.teamkillers, 'count', 'desc').slice(0, 25),
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
        dayjsUTC(replayInfo.date),
      );
    })
  ));

  const resultStatistics = pipe(
    sortPlayerStatistics,
    limitWeaponsStatisticsCount,
    limitOtherPlayersStatsCount,
  )(globalStatistics);

  return resultStatistics;
};

export default calculateGlobalStatistics;
