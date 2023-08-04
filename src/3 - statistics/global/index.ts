import { orderBy } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import pipe from '../../0 - utils/pipe';
import { playerStatsSort } from '../consts';
import addPlayerGameResultToGlobalStatistics from './add';

const sortPlayerStatistics = (statistics: GlobalPlayerStatistics[]): GlobalPlayerStatistics[] => {
  const sortedStatisticsByScore = orderBy(statistics, ...playerStatsSort);
  const sortedStatistics = sortedStatisticsByScore.map((playerStatistics) => ({
    ...playerStatistics,
    byWeeks: orderBy(playerStatistics.byWeeks, 'startDate', 'desc'),
  }));

  return sortedStatistics;
};

const sortAndLimitWeaponsStatisticsCount = (
  statistics: GlobalPlayerStatistics[],
): GlobalPlayerStatistics[] => (
  statistics.map((playerStatistics) => ({
    ...playerStatistics,
    weapons: orderBy(playerStatistics.weapons, 'kills', 'desc').slice(0, 25),
    vehicles: orderBy(playerStatistics.vehicles, 'kills', 'desc').slice(0, 25),
  }))
);

const sortAndLimitOtherPlayersStatsCount = (
  statistics: GlobalPlayerStatistics[],
): GlobalPlayerStatistics[] => (
  statistics.map((playerStatistics) => ({
    ...playerStatistics,
    killed: orderBy(playerStatistics.killed, 'count', 'desc').slice(0, 10),
    killers: orderBy(playerStatistics.killers, 'count', 'desc').slice(0, 10),
    teamkilled: orderBy(playerStatistics.teamkilled, 'count', 'desc').slice(0, 10),
    teamkillers: orderBy(playerStatistics.teamkillers, 'count', 'desc').slice(0, 10),
  }))
);

type NamesWithPrefix = Array<[PlayerName, PlayerPrefix]>;

const addPrefix = (playersList: OtherPlayer[], namesWithPrefix: NamesWithPrefix) => (
  playersList.map(({ name, count }) => {
    const player = namesWithPrefix.find(([playerName]) => name === playerName);

    if (player && player[1]) return { name: `${player[1]}${name}`, count };

    return { name, count };
  })
);

const addPrefixToNames = (
  statistics: GlobalPlayerStatistics[],
): GlobalPlayerStatistics[] => {
  const namesWithPrefix: NamesWithPrefix = statistics.map(
    (stats) => [stats.name, stats.lastSquadPrefix],
  );

  return statistics.map((stats) => ({
    ...stats,
    killed: addPrefix(stats.killed, namesWithPrefix),
    killers: addPrefix(stats.killers, namesWithPrefix),
    teamkilled: addPrefix(stats.teamkilled, namesWithPrefix),
    teamkillers: addPrefix(stats.teamkillers, namesWithPrefix),
  }));
};

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
    sortAndLimitWeaponsStatisticsCount,
    sortAndLimitOtherPlayersStatsCount,
    addPrefixToNames,
  )(globalStatistics);

  return resultStatistics;
};

export default calculateGlobalStatistics;
