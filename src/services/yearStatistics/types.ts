/**
 * Types for Year Statistics Service
 * Nominations and yearly aggregations
 */

import type { Replay, PlayerReplayResult, Player } from '../../generated/prisma/client';

/**
 * Winner of a nomination
 */
export interface NominationWinner {
  playerId: string;
  playerName: string;
  value: number;
  details?: string; // e.g., "M4A1: 150 kills" or "Altis: 45 games"
}

/**
 * Result of a single nomination calculation
 */
export interface NominationResult {
  nominationId: string;
  title: string;
  description?: string;
  winners: NominationWinner[];
}

/**
 * Aggregated player stats for a year (from DB)
 */
export interface PlayerYearStats {
  playerId: string;
  playerName: string;
  totalKills: number;
  totalDeaths: number;
  totalGames: number;
  teamkills: number;
  deathsByTeamkills: number;
  score: number;
}

/**
 * Replay with player results for year processing
 */
export interface YearReplay {
  id: string;
  replayId: string;
  date: Date;
  missionName: string;
  worldName: string;
  filePath: string | null;
  playerResults: Array<{
    playerId: string;
    playerName: string;
    kills: number;
    deaths: number;
    teamkills: number;
    deathsByTeamkills: number;
  }>;
}

/**
 * Context passed to nomination calculators
 */
export interface YearContext {
  year: number;
  replays: YearReplay[];
  playerStats: Map<string, PlayerYearStats>;
}

/**
 * Nomination calculator function signature
 */
export type NominationCalculator = (context: YearContext) => Promise<NominationResult>;

/**
 * Detailed replay data from raw JSON (for advanced nominations)
 */
export interface DetailedReplayData {
  entities: EntityInfo[];
  events: GameEvent[];
}

export interface EntityInfo {
  id: number;
  name: string;
  side: string;
  group: string;
  isPlayer: boolean;
  startPos: [number, number, number];
}

export interface GameEvent {
  time: number;
  type: string;
  data: unknown;
}

/**
 * Kill event with weapon info
 */
export interface KillEvent {
  killerId: number;
  killedId: number;
  weapon: string;
  distance: number;
  killerPos: [number, number, number];
  killedPos: [number, number, number];
}

/**
 * Position tracking for movement nominations
 */
export interface PositionEvent {
  entityId: number;
  time: number;
  pos: [number, number, number];
}

/**
 * All nominations grouped by type
 */
export interface AllNominations {
  basic: NominationResult[];
  advanced: NominationResult[];
}

/**
 * Output format for year statistics
 */
export interface YearStatisticsOutput {
  year: number;
  generatedAt: Date;
  totalReplays: number;
  totalPlayers: number;
  nominations: AllNominations;
}
