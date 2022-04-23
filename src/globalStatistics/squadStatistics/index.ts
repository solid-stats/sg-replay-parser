import { differenceInMonths } from 'date-fns';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import orderBy from 'lodash/orderBy';
import round from 'lodash/round';
import sumBy from 'lodash/sumBy';

type PlayersBySquadPrefix = Record<string, GlobalPlayerStatistics[]>;

const calculateMedian = (numbers: number[]): number => {
  numbers.sort((first, second) => first - second);

  const half = Math.floor(numbers.length / 2);

  if (numbers.length % 2) return numbers[half];

  return (numbers[half - 1] + numbers[half]) / 2.0;
};

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

    if (isEmpty(filteredPlayers) || players.length <= 4) return;

    filteredPlayersBySquadPrefix[prefix] = filteredPlayers;
  });

  const squadStatistics: GlobalSquadStatistics[] = Object.keys(filteredPlayersBySquadPrefix).map(
    (prefix) => {
      const players = filteredPlayersBySquadPrefix[prefix];
      const kills = sumBy(players, 'kills');
      const teamkills = sumBy(players, 'teamkills');

      const scores = players.map((player) => player.totalScore);
      const score = round(calculateMedian(scores), 2);

      return {
        prefix,
        kills,
        teamkills,
        score,
        players: players.map((player) => player.playerName),
      };
    },
  );

  const sortedSquadStatistics = orderBy(squadStatistics, 'score', 'desc');

  return sortedSquadStatistics;
};

export default calculateSquadStatistics;
