import path from 'path';

import fs from 'fs-extra';

import { dayjsUTC } from '../../shared/utils/dayjs';
import getPlayerName from '../../shared/utils/getPlayerName';
import { rawReplaysPath } from '../../shared/utils/paths';
import parseReplayInfo from '../../modules/parsing';

export type ParsedPlayerResult = {
  entityName: string;
  squadPrefix: string | null;
  kills: number;
  killsFromVehicle: number;
  vehicleKills: number;
  teamkills: number;
  isDead: boolean;
  isDeadByTeamkill: boolean;
  weapons: WeaponStatistic[];
  vehicles: WeaponStatistic[];
  killed: OtherPlayer[];
  killers: OtherPlayer[];
  teamkilled: OtherPlayer[];
  teamkillers: OtherPlayer[];
};

export type ParsedReplayResult = {
  missionName: string;
  worldName: string;
  missionAuthor: string;
  playersCount: number;
  players: ParsedPlayerResult[];
};

/**
 * Reads a raw replay JSON file from disk
 */
export const readReplayFile = async (filename: string): Promise<ReplayInfo | null> => {
  const filePath = path.join(rawReplaysPath, `${filename}.json`);

  try {
    if (!await fs.pathExists(filePath)) {
      return null;
    }

    const replay = await fs.readJson(filePath) as ReplayInfo;

    return replay;
  } catch {
    return null;
  }
};

/**
 * Extracts squad prefix from player name (e.g., "[WOG] Player" -> "WOG")
 */
export const extractSquadPrefix = (name: string): string | null => {
  const match = name.match(/^\[([^\]]+)\]/);

  return match ? match[1] : null;
};

/**
 * Converts PlayerInfo to ParsedPlayerResult
 */
export const convertPlayerInfo = (player: PlayerInfo): ParsedPlayerResult => {
  const [name] = getPlayerName(player.name);
  const squadPrefix = extractSquadPrefix(player.name);

  return {
    entityName: name,
    squadPrefix,
    kills: player.kills,
    killsFromVehicle: player.killsFromVehicle,
    vehicleKills: player.vehicleKills,
    teamkills: player.teamkills,
    isDead: player.isDead,
    isDeadByTeamkill: player.isDeadByTeamkill,
    weapons: player.weapons,
    vehicles: player.vehicles,
    killed: player.killed,
    killers: player.killers,
    teamkilled: player.teamkilled,
    teamkillers: player.teamkillers,
  };
};

/**
 * Parses a raw replay file and extracts player results
 *
 * @param filename - The replay filename (without .json extension)
 * @param date - The date of the replay
 * @returns Parsed replay data or null if file doesn't exist or parsing fails
 */
export const parseReplayData = async (
  filename: string,
  date: Date,
): Promise<ParsedReplayResult | null> => {
  const replayInfo = await readReplayFile(filename);

  if (!replayInfo) {
    return null;
  }

  try {
    const dateString = dayjsUTC(date.toISOString()).format('YYYY-MM-DD');
    const playersList = parseReplayInfo(replayInfo, dateString);
    const playersArray = Object.values(playersList);

    return {
      missionName: replayInfo.missionName,
      worldName: replayInfo.worldName,
      missionAuthor: replayInfo.missionAuthor,
      playersCount: playersArray.length,
      players: playersArray.map(convertPlayerInfo),
    };
  } catch {
    return null;
  }
};
