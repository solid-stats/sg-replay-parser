import { Dayjs } from 'dayjs';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import orderBy from 'lodash/orderBy';
import sumBy from 'lodash/sumBy';

import { dayjsUTC } from '../../0 - utils/dayjs';
import filterPlayersByTotalPlayedGames from '../../0 - utils/filterPlayersByTotalPlayedGames';
import getSquadsInfo from './getSquadInfo';
import { DayjsInterval, PlayersBySquadPrefix } from './types';
import { isInInterval } from './utils';

const calculateSquadStatistics = (
  globalStatistics: GlobalPlayerStatistics[],
  replays: PlayersGameResult[],
  // not used in calculations for global statistics
  rotationEndDate?: Dayjs,
): GlobalSquadStatistics[] => {
  if (!replays.length) return [];

  const filteredStatistics = globalStatistics.filter((stats) => !isNull(stats.lastSquadPrefix));
  const playersBySquadPrefix: PlayersBySquadPrefix = groupBy(filteredStatistics, 'lastSquadPrefix');
  const filteredPlayersBySquadPrefix: PlayersBySquadPrefix = {};

  let currentDate = dayjsUTC();
  const lastReplayDate = dayjsUTC(replays[replays.length - 1].date);
  const isLastReplayOnThisDay = lastReplayDate.isoWeek() === currentDate.isoWeek()
    && lastReplayDate.weekday() === currentDate.weekday();

  if (!isLastReplayOnThisDay) currentDate = currentDate.startOf('day');

  const endDate = rotationEndDate || currentDate;

  const last4WeeksInterval: DayjsInterval = [
    endDate.subtract(4, 'weeks'),
    endDate,
  ];

  // console.log(endDate.toISOString(), endDate.subtract(4, 'weeks').toISOString(), lastReplayDate.toISOString());

  Object.keys(playersBySquadPrefix).forEach((prefix) => {
    const players = playersBySquadPrefix[prefix];
    const filteredPlayers = players.filter((player) => (
      isInInterval(player.lastPlayedGameDate, last4WeeksInterval)
    ));

    if (isEmpty(filteredPlayers) || filteredPlayers.length < 5) return;

    filteredPlayersBySquadPrefix[prefix] = filteredPlayers;
  });

  const averageSquadsInfo = getSquadsInfo(
    filteredPlayersBySquadPrefix,
    last4WeeksInterval,
    replays,
  );
  const squadStatistics: GlobalSquadStatistics[] = Object.keys(filteredPlayersBySquadPrefix).map(
    (prefix) => {
      const playerStatistics = filteredPlayersBySquadPrefix[prefix];
      const {
        playersCount: averagePlayersCount,
        kills: averageKills,
        teamkills: averageTeamkills,
        score,
      } = averageSquadsInfo[prefix];

      const kills = sumBy(playerStatistics, 'kills');
      const teamkills = sumBy(playerStatistics, 'teamkills');

      const players = filterPlayersByTotalPlayedGames(
        playerStatistics,
        rotationEndDate && replays.length,
      );

      return {
        prefix,
        averagePlayersCount,
        kills,
        averageKills,
        teamkills,
        averageTeamkills,
        score,
        players: players.map((stats) => stats.name),
      };
    },
  );

  const sortedSquadStatistics = orderBy(squadStatistics, 'score', 'desc');

  return sortedSquadStatistics;
};

export default calculateSquadStatistics;
