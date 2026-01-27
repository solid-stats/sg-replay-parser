/**
 * Types for statistics calculation service
 */

import { GameType } from '../../generated/prisma/enums';

export type PlayerResultFromDB = {
  id: string;
  replayId: string;
  playerId: string;
  entityName: string;
  squadPrefix: string | null;
  kills: number;
  killsFromVehicle: number;
  vehicleKills: number;
  teamkills: number;
  deaths: number;
  deathsByTeamkills: number;
  isDead: boolean;
  isDeadByTeamkill: boolean;
  score: number;
  weapons: string;
  vehicles: string;
  killed: string;
  killers: string;
  teamkilled: string;
  teamkillers: string;
  replay: {
    date: Date;
    gameType: GameType;
    missionName: string;
  };
};

export type AggregatedPlayerStats = {
  playerId: string;
  name: string;
  lastSquadPrefix: string | null;
  totalPlayedGames: number;
  kills: number;
  killsFromVehicle: number;
  vehicleKills: number;
  teamkills: number;
  deathsTotal: number;
  deathsByTeamkills: number;
  kdRatio: number;
  killsFromVehicleCoef: number;
  totalScore: number;
  lastPlayedGameDate: Date;
  isShow: boolean;
  byWeeks: WeekStats[];
  weapons: WeaponStatistic[];
  vehicles: WeaponStatistic[];
  killed: OtherPlayer[];
  killers: OtherPlayer[];
  teamkilled: OtherPlayer[];
  teamkillers: OtherPlayer[];
};

export type WeekStats = {
  week: string; // "2024-35"
  startDate: Date;
  endDate: Date;
  totalPlayedGames: number;
  kills: number;
  killsFromVehicle: number;
  vehicleKills: number;
  teamkills: number;
  deathsTotal: number;
  deathsByTeamkills: number;
  kdRatio: number;
  killsFromVehicleCoef: number;
  score: number;
};

export type CalculateStatsOptions = {
  gameType: GameType;
  rotationId?: string;
};
