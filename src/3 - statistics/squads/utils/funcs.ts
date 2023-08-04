import { dayjsUTC } from '../../../0 - utils/dayjs';
import { DayjsInterval, SquadInfo } from './types';

export const isInInterval = (date: string, interval: DayjsInterval): boolean => (
  dayjsUTC(date).isBetween(interval[0], interval[1], 'ms', '[]')
);

export const getEmptySquad = (prefix: NonNullable<PlayerPrefix>): SquadInfo => ({
  name: prefix,
  gamesPlayed: 0,
  playersCount: 0,
  kills: 0,
  teamkills: 0,
  players: {},
});

export const getEmptyPlayer = (
  name: PlayerName,
  prefix: PlayerPrefix,
): SimplifiedGlobalPlayerStatistics => ({
  name,
  lastSquadPrefix: prefix,
  totalPlayedGames: 0,
  kills: 0,
  killsFromVehicle: 0,
  killsFromVehicleCoef: 0,
  vehicleKills: 0,
  teamkills: 0,
  deaths: { total: 0, byTeamkills: 0 },
  kdRatio: 0,
  totalScore: 0,
});
