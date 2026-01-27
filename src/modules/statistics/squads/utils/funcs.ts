import { SquadInfo } from './types';

export const getEmptySquad = (prefix: NonNullable<PlayerPrefix>): SquadInfo => ({
  name: prefix,
  gamesPlayed: 0,
  playersCount: 0,
  kills: 0,
  teamkills: 0,
  players: {},
});

export const getEmptyPlayer = (
  id: PlayerId,
  name: PlayerName,
  prefix: PlayerPrefix,
): SimplifiedGlobalPlayerStatistics => ({
  id,
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
