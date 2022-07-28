import { Dayjs } from 'dayjs';

export type PlayersBySquadPrefix = Record<string, GlobalPlayerStatistics[]>;

export type SquadInfo = {
  playersCount: number,
  kills: number,
  teamkills: number,
  score: number,
};

export type AverageSquadsInfoByPrefix = Record<string, SquadInfo>;

export type DayjsInterval = [start: Dayjs, end: Dayjs];
