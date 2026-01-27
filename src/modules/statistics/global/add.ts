import path from 'path';

import { Dayjs } from 'dayjs';
import fs from 'fs-extra';
import { round } from 'lodash';

import calculateKDRatio from '../../../shared/utils/calculateKDRatio';
import calculateScore from '../../../shared/utils/calculateScore';
import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { isInInterval } from '../../../shared/utils/isInInterval';
import mergeOtherPlayers from '../../../shared/utils/mergeOtherPlayers';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import { configPath } from '../../../shared/utils/paths';
import { unionWeaponsStatistic } from '../../../shared/utils/weaponsStatistic';
import { defaultStatistics } from '../consts';
import addPlayerGameResultToWeekStatistics from './addToResultsByWeek';
import calculateDeaths from './utils/calculateDeaths';

const readExcludePlayer = (): ConfigExcludePlayer[] => {
  try {
    return JSON.parse(fs.readFileSync(path.join(configPath, 'excludePlayers.json'), 'utf8'));
  } catch {
    return [];
  }
};

const addPlayerGameResultToGlobalStatistics = (
  globalStatistics: GlobalPlayerStatistics[],
  playerGameResult: PlayerGameResult,
  date: Dayjs,
): GlobalPlayerStatistics[] => {
  const currentGlobalStatistics = globalStatistics.slice();

  const [name, squadPrefix] = getPlayerName(playerGameResult.name);
  const id = getPlayerId(name, date);
  const stringDate = date.toJSON();

  let currentStatisticsIndex = globalStatistics.findIndex(
    (playerStatistics) => playerStatistics.id === id,
  );

  const playersToExclude = readExcludePlayer();
  const foundPlayer = playersToExclude.find(
    (player) => player.name.toLowerCase() === name.toLowerCase(),
  );

  if (foundPlayer) {
    if (isInInterval(
      date,
      dayjsUTC(foundPlayer.minDate || '1970-01-01T00:00:00.000Z'),
      foundPlayer.maxDate ? dayjsUTC(foundPlayer.maxDate) : dayjsUTC(),
    )) return currentGlobalStatistics;
  }

  if (currentStatisticsIndex === -1) {
    const newArrLength = currentGlobalStatistics.push({
      id,
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
