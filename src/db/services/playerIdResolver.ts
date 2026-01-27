import { getDbClient } from '../client';

/**
 * Resolves a player ID from the database based on player name and game date.
 *
 * Logic:
 * 1. Search for existing PlayerName where name matches (case-insensitive) and
 *    gameDate is within validFrom-validTo range
 * 2. If found, return the associated playerId
 * 3. If not found, create a new Player and PlayerName record
 *
 * @param name - The player name to look up
 * @param gameDate - The date of the game (used to find correct name in history)
 * @returns The player ID (existing or newly created)
 */
export const resolvePlayerId = async (name: string, gameDate: Date): Promise<string> => {
  const db = getDbClient();

  // Search for existing player name within the date range
  // For case-insensitive matching in SQLite, we use lowercase comparison
  const loweredName = name.toLowerCase();

  const existingPlayerName = await db.playerName.findFirst({
    where: {
      name: loweredName,
      validFrom: {
        lte: gameDate,
      },
      OR: [
        { validTo: null },
        { validTo: { gte: gameDate } },
      ],
    },
    select: {
      playerId: true,
    },
  });

  if (existingPlayerName) {
    return existingPlayerName.playerId;
  }

  // No existing player found - create new player and name record
  const newPlayer = await db.player.create({
    data: {
      names: {
        create: {
          name: name.toLowerCase(),
          validFrom: gameDate,
          validTo: null,
        },
      },
    },
    select: {
      id: true,
    },
  });

  return newPlayer.id;
};
