import {
  differenceInWeeks,
  endOfWeek, Interval, isWithinInterval, startOfDay, sub,
} from 'date-fns';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import orderBy from 'lodash/orderBy';
import sumBy from 'lodash/sumBy';

import { dateFnsOptionsWithFirstWeekDate } from '../../0 - consts';
import filterPlayersByTotalPlayedGames from '../../0 - utils/filterPlayersByTotalPlayedGames';
import dateToUTC from '../../0 - utils/utc';
import getSquadsInfo from './getSquadInfo';

const calculateSquadStatistics = (
  globalStatistics: GlobalPlayerStatistics[],
  replays: PlayersGameResult[],
  // not used in calculations for global statistics
  rotationEndDate?: Date,
): GlobalSquadStatistics[] => {
  if (replays.length === 0) return [];

  const filteredStatistics = globalStatistics.filter((stats) => !isNull(stats.lastSquadPrefix));
  const playersBySquadPrefix: PlayersBySquadPrefix = groupBy(filteredStatistics, 'lastSquadPrefix');
  const filteredPlayersBySquadPrefix: PlayersBySquadPrefix = {};

  const endDate = rotationEndDate || dateToUTC(
    endOfWeek(new Date(), dateFnsOptionsWithFirstWeekDate),
  );

  const isNoGamesThisWeek = differenceInWeeks(endDate, replays[replays.length - 1].date) >= 1;
  const last4WeeksInterval: Interval = {
    start: dateToUTC(
      startOfDay(
        sub(endDate, { weeks: isNoGamesThisWeek ? 5 : 4 }),
      ),
    ),
    end: endDate,
  };

  Object.keys(playersBySquadPrefix).forEach((prefix) => {
    const players = playersBySquadPrefix[prefix];
    const filteredPlayers = players.filter((player) => (
      isWithinInterval(player.lastPlayedGameDate, last4WeeksInterval)
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

      const players = filterPlayersByTotalPlayedGames(playerStatistics, replays.length);

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
