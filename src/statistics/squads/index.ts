import { differenceInMonths } from 'date-fns';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import omit from 'lodash/omit';
import orderBy from 'lodash/orderBy';
import round from 'lodash/round';
import sumBy from 'lodash/sumBy';

type PlayersBySquadPrefix = Record<string, GlobalPlayerStatistics[]>;

const calculateSquadStatistics = (
  globalStatistics: GlobalPlayerStatistics[],
): GlobalSquadStatistics[] => {
  const filteredStatistics = globalStatistics.filter((stats) => !isNull(stats.lastSquadPrefix));
  const playersBySquadPrefix: PlayersBySquadPrefix = groupBy(filteredStatistics, 'lastSquadPrefix');
  const filteredPlayersBySquadPrefix: PlayersBySquadPrefix = {};

  Object.keys(playersBySquadPrefix).forEach((prefix) => {
    const players = playersBySquadPrefix[prefix];
    const filteredPlayers = players.filter((player) => (
      differenceInMonths(player.lastPlayedGameDate, new Date()) > -1
    ));

    if (isEmpty(filteredPlayers) || filteredPlayers.length <= 4) return;

    filteredPlayersBySquadPrefix[prefix] = filteredPlayers;
  });

  const squadStatistics: GlobalSquadStatistics[] = Object.keys(filteredPlayersBySquadPrefix).map(
    (prefix) => {
      const players = filteredPlayersBySquadPrefix[prefix];
      const omittedPlayers: GlobalSquadStatistics['players'] = players.map((player) => (
        omit(player, ['lastSquadPrefix', 'byWeeks'])
      ));
      const kills = sumBy(players, 'kills');
      const teamkills = sumBy(players, 'teamkills');

      const score = round(sumBy(players, 'totalScore') / players.length, 2);

      return {
        prefix,
        kills,
        teamkills,
        score,
        players: omittedPlayers,
      };
    },
  );

  const sortedSquadStatistics = orderBy(squadStatistics, 'score', 'desc');

  return sortedSquadStatistics;
};

export default calculateSquadStatistics;
