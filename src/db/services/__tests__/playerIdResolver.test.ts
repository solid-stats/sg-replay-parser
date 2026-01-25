import { resolvePlayerId } from '../playerIdResolver';
import { getDbClient } from '../../client';

// Mock the database client
jest.mock('../../client', () => ({
  getDbClient: jest.fn(),
}));

const mockGetDbClient = getDbClient as jest.MockedFunction<typeof getDbClient>;

describe('resolvePlayerId', () => {
  let mockPlayerNameFindFirst: jest.Mock;
  let mockPlayerCreate: jest.Mock;
  let mockPlayerFindMany: jest.Mock;

  beforeEach(() => {
    mockPlayerNameFindFirst = jest.fn();
    mockPlayerCreate = jest.fn();
    mockPlayerFindMany = jest.fn();

    mockGetDbClient.mockReturnValue({
      playerName: {
        findFirst: mockPlayerNameFindFirst,
      },
      player: {
        create: mockPlayerCreate,
        findMany: mockPlayerFindMany,
      },
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('returns existing player ID for known name within date range', () => {
    it('should return existing player ID when name matches exactly', async () => {
      const existingPlayerId = 'existing-player-id-123';
      const gameDate = new Date('2024-06-15');

      mockPlayerNameFindFirst.mockResolvedValue({ playerId: existingPlayerId });

      const result = await resolvePlayerId('testplayer', gameDate);

      expect(result).toBe(existingPlayerId);
      expect(mockPlayerNameFindFirst).toHaveBeenCalledWith({
        where: {
          name: 'testplayer',
          validFrom: { lte: gameDate },
          OR: [{ validTo: null }, { validTo: { gte: gameDate } }],
        },
        select: { playerId: true },
      });
      expect(mockPlayerCreate).not.toHaveBeenCalled();
    });

    it('should return existing player ID when date is exactly on validFrom', async () => {
      const existingPlayerId = 'boundary-player-id';
      const validFrom = new Date('2024-01-01');

      mockPlayerNameFindFirst.mockResolvedValue({ playerId: existingPlayerId });

      const result = await resolvePlayerId('exactdate', validFrom);

      expect(result).toBe(existingPlayerId);
    });

    it('should return existing player ID when date is exactly on validTo', async () => {
      const existingPlayerId = 'validto-player-id';
      const validTo = new Date('2024-12-31');

      mockPlayerNameFindFirst.mockResolvedValue({ playerId: existingPlayerId });

      const result = await resolvePlayerId('boundarytest', validTo);

      expect(result).toBe(existingPlayerId);
    });
  });

  describe('creates new player for unknown name', () => {
    it('should create new player when name does not exist', async () => {
      const newPlayerId = 'new-player-id-456';
      const gameDate = new Date('2024-06-15');

      mockPlayerNameFindFirst.mockResolvedValue(null);
      mockPlayerCreate.mockResolvedValue({ id: newPlayerId });

      const result = await resolvePlayerId('newplayer', gameDate);

      expect(result).toBe(newPlayerId);
      expect(mockPlayerCreate).toHaveBeenCalledWith({
        data: {
          names: {
            create: {
              name: 'newplayer',
              validFrom: gameDate,
              validTo: null,
            },
          },
        },
        select: { id: true },
      });
    });

    it('should store new player name in lowercase', async () => {
      const newPlayerId = 'lowercase-player-id';
      const gameDate = new Date('2024-06-15');

      mockPlayerNameFindFirst.mockResolvedValue(null);
      mockPlayerCreate.mockResolvedValue({ id: newPlayerId });

      await resolvePlayerId('NewPlayerMixedCase', gameDate);

      expect(mockPlayerCreate).toHaveBeenCalledWith({
        data: {
          names: {
            create: {
              name: 'newplayermixedcase',
              validFrom: gameDate,
              validTo: null,
            },
          },
        },
        select: { id: true },
      });
    });
  });

  describe('handles case-insensitive name matching', () => {
    it('should search with lowercase name regardless of input case', async () => {
      const existingPlayerId = 'case-insensitive-player-id';
      const gameDate = new Date('2024-06-15');

      mockPlayerNameFindFirst.mockResolvedValue({ playerId: existingPlayerId });

      // Test with UPPERCASE input
      const result = await resolvePlayerId('MIXEDCASE', gameDate);

      expect(result).toBe(existingPlayerId);
      // Verify the query used lowercase
      expect(mockPlayerNameFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: 'mixedcase',
          }),
        }),
      );
    });

    it('should search with lowercase for mixed case input', async () => {
      const existingPlayerId = 'mixed-case-player-id';
      const gameDate = new Date('2024-06-15');

      mockPlayerNameFindFirst.mockResolvedValue({ playerId: existingPlayerId });

      await resolvePlayerId('MixedCaseName', gameDate);

      expect(mockPlayerNameFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: 'mixedcasename',
          }),
        }),
      );
    });
  });

  describe('respects date ranges (name change history)', () => {
    it('should query with correct date conditions', async () => {
      const gameDate = new Date('2024-06-15');

      mockPlayerNameFindFirst.mockResolvedValue(null);
      mockPlayerCreate.mockResolvedValue({ id: 'new-id' });

      await resolvePlayerId('testname', gameDate);

      expect(mockPlayerNameFindFirst).toHaveBeenCalledWith({
        where: {
          name: 'testname',
          validFrom: { lte: gameDate },
          OR: [{ validTo: null }, { validTo: { gte: gameDate } }],
        },
        select: { playerId: true },
      });
    });

    it('should not find player when no matching date range exists', async () => {
      const gameDate = new Date('2024-01-15');
      const newPlayerId = 'new-player-for-past-date';

      // Simulate no matching player name found (date out of range)
      mockPlayerNameFindFirst.mockResolvedValue(null);
      mockPlayerCreate.mockResolvedValue({ id: newPlayerId });

      const result = await resolvePlayerId('futurestart', gameDate);

      expect(result).toBe(newPlayerId);
      expect(mockPlayerCreate).toHaveBeenCalled();
    });

    it('should find correct player based on date range', async () => {
      const oldPlayerId = 'old-name-player';
      const newPlayerId = 'new-name-player';

      // First call - query for old name period
      mockPlayerNameFindFirst.mockResolvedValueOnce({ playerId: oldPlayerId });

      const resultOld = await resolvePlayerId('oldname', new Date('2024-03-15'));
      expect(resultOld).toBe(oldPlayerId);

      // Second call - query for new name period  
      mockPlayerNameFindFirst.mockResolvedValueOnce({ playerId: newPlayerId });

      const resultNew = await resolvePlayerId('newname', new Date('2024-09-15'));
      expect(resultNew).toBe(newPlayerId);
    });

    it('should create new player when old name is used after name change period', async () => {
      const newCreatedPlayerId = 'newly-created-id';

      // No existing player found for old name at new date
      mockPlayerNameFindFirst.mockResolvedValue(null);
      mockPlayerCreate.mockResolvedValue({ id: newCreatedPlayerId });

      const result = await resolvePlayerId('oldname', new Date('2024-09-15'));

      expect(result).toBe(newCreatedPlayerId);
      expect(mockPlayerCreate).toHaveBeenCalled();
    });
  });

  describe('returns correct player when same name used by different players at different times', () => {
    it('should return correct player based on date range', async () => {
      const player1Id = 'player-1-id';
      const player2Id = 'player-2-id';

      // Query for player 1's period
      mockPlayerNameFindFirst.mockResolvedValueOnce({ playerId: player1Id });
      const resultForPlayer1 = await resolvePlayerId('reusedname', new Date('2024-03-15'));
      expect(resultForPlayer1).toBe(player1Id);

      // Query for player 2's period
      mockPlayerNameFindFirst.mockResolvedValueOnce({ playerId: player2Id });
      const resultForPlayer2 = await resolvePlayerId('reusedname', new Date('2024-09-15'));
      expect(resultForPlayer2).toBe(player2Id);
    });

    it('should handle multiple players with same name at different historical periods', async () => {
      const player1Id = 'historical-player-1';
      const player2Id = 'historical-player-2';
      const player3Id = 'historical-player-3';

      mockPlayerNameFindFirst
        .mockResolvedValueOnce({ playerId: player1Id })
        .mockResolvedValueOnce({ playerId: player2Id })
        .mockResolvedValueOnce({ playerId: player3Id });

      expect(await resolvePlayerId('commonname', new Date('2022-06-15'))).toBe(player1Id);
      expect(await resolvePlayerId('commonname', new Date('2023-06-15'))).toBe(player2Id);
      expect(await resolvePlayerId('commonname', new Date('2024-06-15'))).toBe(player3Id);
    });
  });
});
