import calculateScore from '../../shared/utils/calculateScore';
import { getDbClient } from '../../db/client';
import { resolvePlayerId } from '../../db/services/playerIdResolver';
import type { ParsedReplayResult, ParsedPlayerResult } from './parseReplayData';

export type SaveParsedReplayResult = {
  success: boolean;
  playerResultsCount: number;
  error?: string;
};

/**
 * Calculates score for a single player result
 */
export const calculatePlayerScore = (player: ParsedPlayerResult): number => {
  const deaths = player.isDead ? 1 : 0;
  const deathsByTeamkill = player.isDeadByTeamkill ? 1 : 0;

  return calculateScore(
    1, // totalPlayedGames for this single replay
    player.kills,
    player.teamkills,
    { total: deaths, byTeamkills: deathsByTeamkill },
  );
};

/**
 * Creates a PlayerReplayResult record for a single player
 */
export const createPlayerReplayResult = async (
  replayId: string,
  player: ParsedPlayerResult,
  replayDate: Date,
): Promise<string> => {
  const db = getDbClient();

  const playerId = await resolvePlayerId(player.entityName, replayDate);
  const score = calculatePlayerScore(player);

  const result = await db.playerReplayResult.create({
    data: {
      replayId,
      playerId,
      entityName: player.entityName,
      squadPrefix: player.squadPrefix,
      kills: player.kills,
      killsFromVehicle: player.killsFromVehicle,
      vehicleKills: player.vehicleKills,
      teamkills: player.teamkills,
      deaths: player.isDead ? 1 : 0,
      deathsByTeamkills: player.isDeadByTeamkill ? 1 : 0,
      isDead: player.isDead,
      isDeadByTeamkill: player.isDeadByTeamkill,
      score,
      weapons: JSON.stringify(player.weapons),
      vehicles: JSON.stringify(player.vehicles),
      killed: JSON.stringify(player.killed),
      killers: JSON.stringify(player.killers),
      teamkilled: JSON.stringify(player.teamkilled),
      teamkillers: JSON.stringify(player.teamkillers),
    },
    select: {
      id: true,
    },
  });

  return result.id;
};

/**
 * Saves parsed replay data to the database and updates replay status to PARSED
 *
 * @param replayId - The database ID of the replay
 * @param parsedData - The parsed replay data
 * @param replayDate - The date of the replay (for player ID resolution)
 * @returns Result of the save operation
 */
export const saveParsedReplay = async (
  replayId: string,
  parsedData: ParsedReplayResult,
  replayDate: Date,
): Promise<SaveParsedReplayResult> => {
  const db = getDbClient();

  try {
    // Create all player results
    const playerResultPromises = parsedData.players.map((player) => createPlayerReplayResult(replayId, player, replayDate));

    await Promise.all(playerResultPromises);

    // Update replay status to PARSED
    await db.replay.update({
      where: { id: replayId },
      data: {
        status: 'PARSED',
        parsedAt: new Date(),
      },
    });

    return {
      success: true,
      playerResultsCount: parsedData.players.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Mark replay as ERROR
    try {
      await db.replay.update({
        where: { id: replayId },
        data: { status: 'ERROR' },
      });
    } catch {
      // Ignore update errors
    }

    return {
      success: false,
      playerResultsCount: 0,
      error: errorMessage,
    };
  }
};

/**
 * Clears existing player results for a replay (for re-parsing)
 */
export const clearPlayerResults = async (replayId: string): Promise<void> => {
  const db = getDbClient();

  await db.playerReplayResult.deleteMany({
    where: { replayId },
  });
};
