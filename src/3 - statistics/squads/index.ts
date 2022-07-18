import { differenceInMonths } from 'date-fns';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import orderBy from 'lodash/orderBy';
import sumBy from 'lodash/sumBy';

import calculateSquadScore from '../../0 - utils/calculateSquadScore';

type PlayersBySquadPrefix = Record<string, GlobalPlayerStatistics[]>;

const calculateSquadStatistics = (
  globalStatistics: GlobalPlayerStatistics[],
  // not used in calculations for global statistics
  rotationEndDate?: Date,
): GlobalSquadStatistics[] => {
  const filteredStatistics = globalStatistics.filter((stats) => !isNull(stats.lastSquadPrefix));
  const playersBySquadPrefix: PlayersBySquadPrefix = groupBy(filteredStatistics, 'lastSquadPrefix');
  const filteredPlayersBySquadPrefix: PlayersBySquadPrefix = {};

  Object.keys(playersBySquadPrefix).forEach((prefix) => {
    const players = playersBySquadPrefix[prefix];
    const filteredPlayers = players.filter((player) => (
      differenceInMonths(player.lastPlayedGameDate, rotationEndDate || new Date()) > -1
    ));

    if (isEmpty(filteredPlayers) || filteredPlayers.length <= 4) return;

    filteredPlayersBySquadPrefix[prefix] = filteredPlayers;
  });

  const squadStatistics: GlobalSquadStatistics[] = Object.keys(filteredPlayersBySquadPrefix).map(
    (prefix) => {
      const playerStatistics = filteredPlayersBySquadPrefix[prefix];
      const kills = sumBy(playerStatistics, 'kills');
      const teamkills = sumBy(playerStatistics, 'teamkills');

      const score = calculateSquadScore(playerStatistics);

      return {
        prefix,
        kills,
        teamkills,
        score,
        players: playerStatistics.map((stats) => stats.playerName),
      };
    },
  );

  const sortedSquadStatistics = orderBy(squadStatistics, 'score', 'desc');

  return sortedSquadStatistics;
};

export default calculateSquadStatistics;
