import { Dayjs } from 'dayjs';
import {
  groupBy, isEmpty, isNull, omit, orderBy, sumBy,
} from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getSquadsInfo from './getSquadInfo';
import { DayjsInterval, PlayersBySquadPrefix } from './types';
import { isInInterval } from './utils';

const calculateSquadStatistics = (
  globalStatistics: GlobalPlayerStatistics[],
  replays: PlayersGameResult[],
  // not used in calculations for global statistics
  rotationLastDate: Dayjs | null,
): GlobalSquadStatistics[] => {
  if (!replays.length) return [];

  const filteredStatistics = globalStatistics.filter((stats) => !isNull(stats.lastSquadPrefix));
  const playersBySquadPrefix: PlayersBySquadPrefix = groupBy(filteredStatistics, 'lastSquadPrefix');
  const filteredPlayersBySquadPrefix: PlayersBySquadPrefix = {};

  let currentDate = dayjsUTC();
  let rotationEndDate = rotationLastDate;
  const lastReplayDate = dayjsUTC(replays[replays.length - 1].date);
  const isLastReplayOnThisDay = lastReplayDate.isoWeek() === currentDate.isoWeek()
    && lastReplayDate.weekday() === currentDate.weekday();

  if (!isLastReplayOnThisDay) {
    currentDate = currentDate.startOf('day');
    rotationEndDate = rotationEndDate?.startOf('day') || null;
  }

  const endDate = rotationEndDate || currentDate;

  const last4WeeksInterval: DayjsInterval = [
    endDate.subtract(4, 'weeks'),
    endDate,
  ];

  Object.keys(playersBySquadPrefix).forEach((prefix) => {
    const players = playersBySquadPrefix[prefix];
    const filteredPlayers = players.filter((player) => (
      isInInterval(player.lastPlayedGameDate, last4WeeksInterval)
    ));

    if (isEmpty(filteredPlayers) || filteredPlayers.length < 4) return;

    filteredPlayersBySquadPrefix[prefix] = filteredPlayers;
  });

  const averageSquadsInfo = getSquadsInfo(
    filteredPlayersBySquadPrefix,
    last4WeeksInterval,
    replays,
  );
  const squadStatistics: GlobalSquadStatistics[] = Object.keys(filteredPlayersBySquadPrefix).map(
    (prefix) => {
      const players = filteredPlayersBySquadPrefix[prefix];
      const {
        playersCount: averagePlayersCount,
        kills: averageKills,
        teamkills: averageTeamkills,
        score,
      } = averageSquadsInfo[prefix];

      const kills = sumBy(players, 'kills');
      const teamkills = sumBy(players, 'teamkills');

      return {
        prefix,
        averagePlayersCount,
        kills,
        averageKills,
        teamkills,
        averageTeamkills,
        score,
        players: players.map((stats) => omit(stats, [
          'byWeeks',
          'weapons',
          'vehicles',
          'lastPlayedGameDate',
          'isShow',
          'killers',
          'killed',
          'teamkillers',
          'teamkilled',
        ])),
      };
    },
  );

  const sortedSquadStatistics = orderBy(squadStatistics, ['score', 'averagePlayersCount', 'averageKills'], ['desc', 'desc', 'desc']);

  return sortedSquadStatistics;
};

export default calculateSquadStatistics;
