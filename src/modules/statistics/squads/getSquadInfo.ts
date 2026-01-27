import { round } from 'lodash';

import calculateKDRatio from '../../../shared/utils/calculateKDRatio';
import calculateScore from '../../../shared/utils/calculateScore';
import calculateVehicleKillsCoef from '../../../shared/utils/calculateVehicleKillsCoef';
import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import calculateDeaths from '../global/utils/calculateDeaths';
import { getEmptyPlayer, getEmptySquad } from './utils/funcs';
import { SquadInfo } from './utils/types';

type SquadsInfo = Record<string, SquadInfo>;

const getSquadsInfo = (replays: PlayersGameResult[]): GlobalSquadStatistics[] => {
  const squads: SquadsInfo = {};

  replays.forEach((replay) => {
    const squadsInReplay: string[] = [];

    replay.result.forEach((playerResult) => {
      const [name, prefix] = getPlayerName(playerResult.name);
      const id = getPlayerId(name, dayjsUTC(replay.date));

      if (!prefix) return;

      const isSquadAlreadyInReplay = squadsInReplay.includes(prefix);

      if (!isSquadAlreadyInReplay) squadsInReplay.push(prefix);

      if (!squads[prefix]) squads[prefix] = getEmptySquad(prefix);

      const squadPlayer = squads[prefix].players[id] || getEmptyPlayer(id, name, prefix);

      // prepare data for player statistics
      const deaths = calculateDeaths({
        deaths: squadPlayer.deaths,
        isDead: playerResult.isDead,
        isDeadByTeamkill: playerResult.isDeadByTeamkill,
      });
      const totalPlayedGames = squadPlayer.totalPlayedGames + 1;
      const kills = squadPlayer.kills + playerResult.kills;
      const killsFromVehicle = squadPlayer.killsFromVehicle + playerResult.killsFromVehicle;
      const teamkills = squadPlayer.teamkills + playerResult.teamkills;
      const killsFromVehicleCoef = calculateVehicleKillsCoef(
        kills,
        killsFromVehicle,
      );

      // add player data to squad statistics
      squads[prefix] = {
        ...squads[prefix],
        playersCount: squads[prefix].playersCount + 1,
        kills: squads[prefix].kills + playerResult.kills,
        teamkills: squads[prefix].teamkills + playerResult.teamkills,
      };

      // add player data to squad players statistics
      squads[prefix].players[id] = {
        id,
        name,
        lastSquadPrefix: prefix,
        totalPlayedGames: squadPlayer.totalPlayedGames + 1,
        deaths,
        kills,
        vehicleKills: squadPlayer.vehicleKills + playerResult.vehicleKills,
        teamkills,
        killsFromVehicle,
        killsFromVehicleCoef,
        kdRatio: calculateKDRatio(kills, teamkills, deaths),
        totalScore: calculateScore(totalPlayedGames, kills, teamkills, deaths),
      };
    });

    squadsInReplay.forEach((prefix) => { squads[prefix].gamesPlayed += 1; });
  });

  const result: GlobalSquadStatistics[] = [];

  Object.keys(squads).forEach((prefix) => {
    const squadInfo = squads[prefix];

    const players = Object.keys(squadInfo.players).map((name) => squadInfo.players[name]);

    const averageKills = squadInfo.kills / squadInfo.gamesPlayed;
    const averageTeamkills = squadInfo.teamkills / (squadInfo.kills || 1);
    const averagePlayersCount = squadInfo.playersCount / squadInfo.gamesPlayed;

    result.push({
      prefix: squadInfo.name,
      kills: squadInfo.kills,
      averageKills: round(averageKills, 2),
      teamkills: squadInfo.teamkills,
      averageTeamkills: round(averageTeamkills, 2),
      averagePlayersCount: round(averagePlayersCount, 2),
      score: round(averageKills / averagePlayersCount, 2),
      players,
    });
  });

  return result;
};

export default getSquadsInfo;
