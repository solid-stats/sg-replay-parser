import { isWithinInterval } from 'date-fns';
import round from 'lodash/round';
import sumBy from 'lodash/sumBy';

const getSquadsInfo = (
  playersBySquadPrefix: PlayersBySquadPrefix,
  last4WeeksInterval: Interval,
  replays: PlayersGameResult[],
): AverageSquadsInfoByPrefix => {
  const replaysForTheLast4Weeks = replays.filter((replay) => (
    isWithinInterval(replay.date, last4WeeksInterval)
  ));

  const squadsInfo: AverageSquadsInfoByPrefix = {};

  Object.keys(playersBySquadPrefix).forEach((prefix) => {
    let gamesPlayed = 0;
    let info: SquadInfo = {
      playersCount: 0,
      kills: 0,
      teamkills: 0,
      score: 0,
    };

    const players = playersBySquadPrefix[prefix].map((player) => `${player.lastSquadPrefix}${player.name}`);

    const filteredReplays = replaysForTheLast4Weeks.map(({ result: gameResults }) => (
      Object.values(gameResults).filter((playerResult) => players.includes(playerResult.name))
    ));

    filteredReplays.forEach((results) => {
      if (results.length === 0) return;

      gamesPlayed += 1;
      info = {
        playersCount: info.playersCount + results.length,
        kills: info.kills + sumBy(results, 'kills'),
        teamkills: info.teamkills + sumBy(results, 'teamkills'),
        score: 0,
      };
    });

    squadsInfo[prefix] = {
      playersCount: round(info.playersCount / gamesPlayed, 2),
      kills: round(info.kills / gamesPlayed, 2),
      teamkills: info.kills > 0 ? round(info.teamkills / info.kills, 2) : 0,
      score: round(info.kills / info.playersCount, 2),
    };
  });

  return squadsInfo;
};

export default getSquadsInfo;
