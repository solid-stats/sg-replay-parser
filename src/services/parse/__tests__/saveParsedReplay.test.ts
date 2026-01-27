import { getDbClient } from '../../../db/client';
import { resolvePlayerId } from '../../../db/services/playerIdResolver';
import calculateScore from '../../../shared/utils/calculateScore';
import type { ParsedPlayerResult, ParsedReplayResult } from '../parseReplayData';
import {
  calculatePlayerScore,
  createPlayerReplayResult,
  saveParsedReplay,
  clearPlayerResults,
} from '../saveParsedReplay';

jest.mock('../../../db/client');
jest.mock('../../../db/services/playerIdResolver');
jest.mock('../../../shared/utils/calculateScore');

const mockGetDbClient = getDbClient as jest.MockedFunction<typeof getDbClient>;
const mockResolvePlayerId = resolvePlayerId as jest.MockedFunction<typeof resolvePlayerId>;
const mockCalculateScore = calculateScore as jest.MockedFunction<typeof calculateScore>;

describe('saveParsedReplay', () => {
  const mockDb = {
    playerReplayResult: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    replay: {
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDbClient.mockReturnValue(mockDb as any);
  });

  describe('calculatePlayerScore', () => {
    it('should calculate score for alive player', () => {
      mockCalculateScore.mockReturnValue(5);

      const player: ParsedPlayerResult = {
        entityName: 'Player1',
        squadPrefix: null,
        kills: 5,
        killsFromVehicle: 0,
        vehicleKills: 0,
        teamkills: 0,
        isDead: false,
        isDeadByTeamkill: false,
        weapons: [],
        vehicles: [],
        killed: [],
        killers: [],
        teamkilled: [],
        teamkillers: [],
      };

      const score = calculatePlayerScore(player);

      expect(mockCalculateScore).toHaveBeenCalledWith(
        1,
        5,
        0,
        { total: 0, byTeamkills: 0 },
      );
      expect(score).toBe(5);
    });

    it('should calculate score for dead player', () => {
      mockCalculateScore.mockReturnValue(3);

      const player: ParsedPlayerResult = {
        entityName: 'Player1',
        squadPrefix: null,
        kills: 3,
        killsFromVehicle: 0,
        vehicleKills: 0,
        teamkills: 0,
        isDead: true,
        isDeadByTeamkill: false,
        weapons: [],
        vehicles: [],
        killed: [],
        killers: [],
        teamkilled: [],
        teamkillers: [],
      };

      calculatePlayerScore(player);

      expect(mockCalculateScore).toHaveBeenCalledWith(
        1,
        3,
        0,
        { total: 1, byTeamkills: 0 },
      );
    });

    it('should calculate score for teamkill death', () => {
      mockCalculateScore.mockReturnValue(-1);

      const player: ParsedPlayerResult = {
        entityName: 'Player1',
        squadPrefix: null,
        kills: 0,
        killsFromVehicle: 0,
        vehicleKills: 0,
        teamkills: 1,
        isDead: true,
        isDeadByTeamkill: true,
        weapons: [],
        vehicles: [],
        killed: [],
        killers: [],
        teamkilled: [],
        teamkillers: [],
      };

      calculatePlayerScore(player);

      expect(mockCalculateScore).toHaveBeenCalledWith(
        1,
        0,
        1,
        { total: 1, byTeamkills: 1 },
      );
    });
  });

  describe('createPlayerReplayResult', () => {
    it('should create player replay result record', async () => {
      mockResolvePlayerId.mockResolvedValue('player-uuid');
      mockCalculateScore.mockReturnValue(4.5);
      mockDb.playerReplayResult.create.mockResolvedValue({ id: 'result-uuid' });

      const player: ParsedPlayerResult = {
        entityName: 'Player1',
        squadPrefix: 'WOG',
        kills: 5,
        killsFromVehicle: 1,
        vehicleKills: 2,
        teamkills: 0,
        isDead: true,
        isDeadByTeamkill: false,
        weapons: [{ name: 'Rifle', kills: 3, maxDistance: 100 }],
        vehicles: [{ name: 'Tank', kills: 2, maxDistance: 500 }],
        killed: [{ id: 'p1', name: 'Enemy', count: 1 }],
        killers: [{ id: 'p2', name: 'Killer', count: 1 }],
        teamkilled: [],
        teamkillers: [],
      };

      const replayDate = new Date('2024-01-01');
      const resultId = await createPlayerReplayResult('replay-uuid', player, replayDate);

      expect(mockResolvePlayerId).toHaveBeenCalledWith('Player1', replayDate);
      expect(mockDb.playerReplayResult.create).toHaveBeenCalledWith({
        data: {
          replayId: 'replay-uuid',
          playerId: 'player-uuid',
          entityName: 'Player1',
          squadPrefix: 'WOG',
          kills: 5,
          killsFromVehicle: 1,
          vehicleKills: 2,
          teamkills: 0,
          deaths: 1,
          deathsByTeamkills: 0,
          isDead: true,
          isDeadByTeamkill: false,
          score: 4.5,
          weapons: JSON.stringify([{ name: 'Rifle', kills: 3, maxDistance: 100 }]),
          vehicles: JSON.stringify([{ name: 'Tank', kills: 2, maxDistance: 500 }]),
          killed: JSON.stringify([{ id: 'p1', name: 'Enemy', count: 1 }]),
          killers: JSON.stringify([{ id: 'p2', name: 'Killer', count: 1 }]),
          teamkilled: JSON.stringify([]),
          teamkillers: JSON.stringify([]),
        },
        select: { id: true },
      });
      expect(resultId).toBe('result-uuid');
    });
  });

  describe('saveParsedReplay', () => {
    it('should save all player results and update status to PARSED', async () => {
      mockResolvePlayerId.mockResolvedValue('player-uuid');
      mockCalculateScore.mockReturnValue(3);
      mockDb.playerReplayResult.create.mockResolvedValue({ id: 'result-uuid' });
      mockDb.replay.update.mockResolvedValue({});

      const parsedData: ParsedReplayResult = {
        missionName: 'Test Mission',
        worldName: 'Altis',
        missionAuthor: 'Author',
        playersCount: 2,
        players: [
          {
            entityName: 'Player1',
            squadPrefix: null,
            kills: 3,
            killsFromVehicle: 0,
            vehicleKills: 0,
            teamkills: 0,
            isDead: false,
            isDeadByTeamkill: false,
            weapons: [],
            vehicles: [],
            killed: [],
            killers: [],
            teamkilled: [],
            teamkillers: [],
          },
          {
            entityName: 'Player2',
            squadPrefix: 'TAG',
            kills: 2,
            killsFromVehicle: 0,
            vehicleKills: 0,
            teamkills: 0,
            isDead: true,
            isDeadByTeamkill: false,
            weapons: [],
            vehicles: [],
            killed: [],
            killers: [],
            teamkilled: [],
            teamkillers: [],
          },
        ],
      };

      const result = await saveParsedReplay('replay-uuid', parsedData, new Date('2024-01-01'));

      expect(result.success).toBe(true);
      expect(result.playerResultsCount).toBe(2);
      expect(mockDb.playerReplayResult.create).toHaveBeenCalledTimes(2);
      expect(mockDb.replay.update).toHaveBeenCalledWith({
        where: { id: 'replay-uuid' },
        data: {
          status: 'PARSED',
          parsedAt: expect.any(Date),
        },
      });
    });

    it('should return error and set ERROR status on failure', async () => {
      mockResolvePlayerId.mockRejectedValue(new Error('Database error'));
      mockDb.replay.update.mockResolvedValue({});

      const parsedData: ParsedReplayResult = {
        missionName: 'Test',
        worldName: 'Altis',
        missionAuthor: 'Author',
        playersCount: 1,
        players: [
          {
            entityName: 'Player1',
            squadPrefix: null,
            kills: 0,
            killsFromVehicle: 0,
            vehicleKills: 0,
            teamkills: 0,
            isDead: false,
            isDeadByTeamkill: false,
            weapons: [],
            vehicles: [],
            killed: [],
            killers: [],
            teamkilled: [],
            teamkillers: [],
          },
        ],
      };

      const result = await saveParsedReplay('replay-uuid', parsedData, new Date('2024-01-01'));

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(mockDb.replay.update).toHaveBeenCalledWith({
        where: { id: 'replay-uuid' },
        data: { status: 'ERROR' },
      });
    });
  });

  describe('clearPlayerResults', () => {
    it('should delete all player results for a replay', async () => {
      mockDb.playerReplayResult.deleteMany.mockResolvedValue({ count: 5 });

      await clearPlayerResults('replay-uuid');

      expect(mockDb.playerReplayResult.deleteMany).toHaveBeenCalledWith({
        where: { replayId: 'replay-uuid' },
      });
    });
  });
});
