import fs from 'fs';

import { Dayjs } from 'dayjs';
import { round } from 'lodash';

import { excludePlayersPath } from '../../0 - consts';
import calculateKDRatio from '../../0 - utils/calculateKDRatio';
import calculateScore from '../../0 - utils/calculateScore';
import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import mergeOtherPlayers from '../../0 - utils/mergeOtherPlayers';
import { unionWeaponsStatistic } from '../../0 - utils/weaponsStatistic';
import { defaultStatistics } from '../consts';
import { DayjsInterval } from '../squads/types';
import { isInInterval } from '../squads/utils';
import addPlayerGameResultToWeekStatistics from './addToResultsByWeek';
import calculateDeaths from './utils/calculateDeaths';

const readExcludePlayer = (): ConfigExcludePlayer[] => {
  try {
    return JSON.parse(fs.readFileSync(excludePlayersPath, 'utf8'));
  } catch {
    return [];
  }
};

const isSameNickName = (first: string, second: string) => (
  first.toLowerCase() === second.toLowerCase()
);

const addPlayerGameResultToGlobalStatistics = (
  globalStatistics: GlobalPlayerStatistics[],
  playerGameResult: PlayerGameResult,
  date: Dayjs,
): GlobalPlayerStatistics[] => {
  const currentGlobalStatistics = globalStatistics.slice();
  const [name, squadPrefix] = getPlayerName(playerGameResult.name);
  let currentStatisticsIndex = globalStatistics.findIndex(
    (playerStatistics) => (isSameNickName(playerStatistics.name, name)),
  );
  const stringDate = date.toJSON();

  const playersToExclude = readExcludePlayer();
  const foundPlayer = playersToExclude.find(
    (player) => isSameNickName(player.name, name),
  );

  if (foundPlayer) {
    const dateIntervalToExclude: DayjsInterval = [
      dayjsUTC(foundPlayer.minDate || '1970-01-01T00:00:00.000Z'),
      foundPlayer.maxDate ? dayjsUTC(foundPlayer.maxDate) : dayjsUTC(),
    ];

    if (isInInterval(stringDate, dateIntervalToExclude)) return currentGlobalStatistics;
  }

  if (currentStatisticsIndex === -1) {
    const newArrLength = currentGlobalStatistics.push({
      name,
      lastSquadPrefix: squadPrefix,
      lastPlayedGameDate: stringDate,
      ...defaultStatistics,
    });

    currentStatisticsIndex = newArrLength - 1;
  }

  const playerStatistics = currentGlobalStatistics[currentStatisticsIndex];
  const statisticsByWeek = addPlayerGameResultToWeekStatistics(
    playerStatistics.byWeeks,
    playerGameResult,
    date,
  );

  const totalPlayedGames = playerStatistics.totalPlayedGames + 1;
  const kills = playerStatistics.kills + playerGameResult.kills;
  const killsFromVehicle = playerStatistics.killsFromVehicle + playerGameResult.killsFromVehicle;

  const vehicleKills = playerStatistics.vehicleKills + playerGameResult.vehicleKills;
  const teamkills = playerStatistics.teamkills + playerGameResult.teamkills;

  const currentDeaths: Deaths = {
    total: playerStatistics.deaths.total,
    byTeamkills: playerStatistics.deaths.byTeamkills,
  };

  const deaths = calculateDeaths({
    deaths: currentDeaths,
    isDead: playerGameResult.isDead,
    isDeadByTeamkill: playerGameResult.isDeadByTeamkill,
  });

  currentGlobalStatistics[currentStatisticsIndex] = {
    ...playerStatistics,
    name,
    lastSquadPrefix: squadPrefix,
    lastPlayedGameDate: stringDate,
    totalPlayedGames,
    kills,
    killsFromVehicle,
    vehicleKills,
    teamkills,
    deaths,
    kdRatio: calculateKDRatio(kills, teamkills, deaths),
    killsFromVehicleCoef: kills ? round(killsFromVehicle / kills, 2) : 0,
    totalScore: calculateScore(totalPlayedGames, kills, teamkills, deaths),
    weapons: unionWeaponsStatistic(playerStatistics.weapons, playerGameResult.weapons),
    vehicles: unionWeaponsStatistic(playerStatistics.vehicles, playerGameResult.vehicles),
    byWeeks: statisticsByWeek,
    killed: mergeOtherPlayers(playerStatistics.killed, playerGameResult.killed),
    killers: mergeOtherPlayers(playerStatistics.killers, playerGameResult.killers),
    teamkilled: mergeOtherPlayers(playerStatistics.teamkilled, playerGameResult.teamkilled),
    teamkillers: mergeOtherPlayers(playerStatistics.teamkillers, playerGameResult.teamkillers),
  };

  return currentGlobalStatistics;
};

export default addPlayerGameResultToGlobalStatistics;
