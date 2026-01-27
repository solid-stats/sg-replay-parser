import { orderBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import pipe from '../../../shared/utils/pipe';
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

type NamesInfo = {
  playerId: PlayerId,
  playerName: PlayerName,
  prefix: PlayerPrefix,
};

const addPrefixAndUpdateName = (
  otherPlayersList: OtherPlayer[],
  namesInfo: NamesInfo[],
) => (
  otherPlayersList.map(({ id, name, count }) => {
    const player = namesInfo.find((nameInfo) => id === nameInfo.playerId);

    const playerName = player?.playerName || name;
    const prefix = player?.prefix;

    if (prefix) return { id, name: `${prefix}${playerName}`, count };

    return { id, name: playerName, count };
  })
);

const updateNamesAndPrefix = (
  statistics: GlobalPlayerStatistics[],
): GlobalPlayerStatistics[] => {
  const namesInfo: NamesInfo[] = statistics.map(
    (stats) => ({
      playerId: stats.id,
      playerName: stats.name,
      prefix: stats.lastSquadPrefix,
    }),
  );

  return statistics.map((stats) => ({
    ...stats,
    killed: addPrefixAndUpdateName(stats.killed, namesInfo),
    killers: addPrefixAndUpdateName(stats.killers, namesInfo),
    teamkilled: addPrefixAndUpdateName(stats.teamkilled, namesInfo),
    teamkillers: addPrefixAndUpdateName(stats.teamkillers, namesInfo),
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
    updateNamesAndPrefix,
  )(globalStatistics);

  return resultStatistics;
};

export default calculateGlobalStatistics;
