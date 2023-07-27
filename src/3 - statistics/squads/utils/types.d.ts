import { Dayjs } from 'dayjs';

export type SquadInfo = {
  name: string,
  gamesPlayed: number,
  playersCount: number,
  kills: number,
  teamkills: number,
  players: Record<PlayerName, SimplifiedGlobalPlayerStatistics>,
};

export type DayjsInterval = [start: Dayjs, end: Dayjs];
