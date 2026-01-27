import { getDbClient } from '../../../db/client';
import { GameType, ReplayStatus } from '../../../generated/prisma/enums';
import {
  parseGameType,
  getNormalizedMissionName,
  saveNewReplay,
  saveNewReplays,
} from '../saveNewReplay';
import type { IncludeReplayConfig } from '../saveNewReplay';
import type { ReplayLink } from '../types';

// Mock dependencies
jest.mock('../../../db/client', () => ({
  getDbClient: jest.fn(),
}));
jest.mock('../../../shared/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

const mockGetDbClient = getDbClient as jest.MockedFunction<typeof getDbClient>;

describe('saveNewReplay', () => {
  let mockReplayFindFirst: jest.Mock;
  let mockReplayCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReplayFindFirst = jest.fn();
    mockReplayCreate = jest.fn();

    mockGetDbClient.mockReturnValue({
      replay: {
        findFirst: mockReplayFindFirst,
        create: mockReplayCreate,
      },
    } as any);
  });

  describe('parseGameType', () => {
    it('should parse SG game type', () => {
      expect(parseGameType('sg@222_mission_name')).toBe(GameType.SG);
      expect(parseGameType('SG@123_test')).toBe(GameType.SG);
    });

    it('should parse MACE game type', () => {
      expect(parseGameType('mace@10_mission')).toBe(GameType.MACE);
      expect(parseGameType('MACE@5_test')).toBe(GameType.MACE);
    });

    it('should parse SM game type', () => {
      expect(parseGameType('sm@50_mission')).toBe(GameType.SM);
      expect(parseGameType('SM@100_test')).toBe(GameType.SM);
    });

    it('should return null for invalid prefix', () => {
      expect(parseGameType('invalid@mission')).toBeNull();
      expect(parseGameType('mission_without_prefix')).toBeNull();
      expect(parseGameType('')).toBeNull();
    });
  });

  describe('getNormalizedMissionName', () => {
    it('should return mission name and game type for standard format', () => {
      const result = getNormalizedMissionName('sg@222_stormtroopers_v15');

      expect(result).toEqual({
        missionName: 'sg@222_stormtroopers_v15',
        gameType: GameType.SG,
      });
    });

    it('should return null for SGS missions', () => {
      expect(getNormalizedMissionName('sgs@test_mission')).toBeNull();
      expect(getNormalizedMissionName('SGS@internal')).toBeNull();
    });

    it('should return null for missions without valid prefix', () => {
      expect(getNormalizedMissionName('TestMis')).toBeNull();
      expect(getNormalizedMissionName('random_name')).toBeNull();
    });

    it('should use include config for non-standard missions', () => {
      const includeConfig: IncludeReplayConfig[] = [
        { name: 'TestMis', gameType: GameType.MACE },
        { name: 'CustomMission', gameType: GameType.SG },
      ];

      const result = getNormalizedMissionName('TestMis', includeConfig);

      expect(result).toEqual({
        missionName: 'mace@test_mis',
        gameType: GameType.MACE,
      });
    });

    it('should match include config case-insensitively', () => {
      const includeConfig: IncludeReplayConfig[] = [
        { name: 'TestMis', gameType: GameType.MACE },
      ];

      const result = getNormalizedMissionName('TESTMIS', includeConfig);

      expect(result).toEqual({
        missionName: 'mace@testmis',
        gameType: GameType.MACE,
      });
    });

    it('should return null if not in include config and no prefix', () => {
      const includeConfig: IncludeReplayConfig[] = [
        { name: 'OtherMission', gameType: GameType.SG },
      ];

      expect(getNormalizedMissionName('TestMis', includeConfig)).toBeNull();
    });
  });

  describe('saveNewReplay', () => {
    it('should save a new replay successfully', async () => {
      mockReplayFindFirst.mockResolvedValue(null);
      mockReplayCreate.mockResolvedValue({ id: 'new-uuid-123' });

      const replayLink: ReplayLink = {
        url: '/replays/1657308763',
        replayId: '1657308763',
        title: 'sg@222_stormtroopers_v15',
        date: new Date('2022-07-08T12:00:00Z'),
      };

      const result = await saveNewReplay(replayLink);

      expect(result.success).toBe(true);
      expect(result.replayId).toBe('new-uuid-123');
      expect(result.alreadyExists).toBeUndefined();

      expect(mockReplayCreate).toHaveBeenCalledWith({
        data: {
          replayLink: '/replays/1657308763',
          missionName: 'sg@222_stormtroopers_v15',
          gameType: GameType.SG,
          date: new Date('2022-07-08T12:00:00Z'),
          filename: '1657308763',
          status: ReplayStatus.DISCOVERED,
        },
        select: {
          id: true,
        },
      });
    });

    it('should return existing replay ID if already exists', async () => {
      mockReplayFindFirst.mockResolvedValue({ id: 'existing-uuid-456' });

      const replayLink: ReplayLink = {
        url: '/replays/1657308763',
        replayId: '1657308763',
        title: 'sg@222_stormtroopers_v15',
      };

      const result = await saveNewReplay(replayLink);

      expect(result.success).toBe(true);
      expect(result.replayId).toBe('existing-uuid-456');
      expect(result.alreadyExists).toBe(true);
      expect(mockReplayCreate).not.toHaveBeenCalled();
    });

    it('should fail for invalid mission name', async () => {
      mockReplayFindFirst.mockResolvedValue(null);

      const replayLink: ReplayLink = {
        url: '/replays/1657308763',
        replayId: '1657308763',
        title: 'TestMis',
      };

      const result = await saveNewReplay(replayLink);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid mission name: TestMis');
      expect(mockReplayCreate).not.toHaveBeenCalled();
    });

    it('should save non-standard mission with include config', async () => {
      mockReplayFindFirst.mockResolvedValue(null);
      mockReplayCreate.mockResolvedValue({ id: 'new-uuid-789' });

      const replayLink: ReplayLink = {
        url: '/replays/1657308763',
        replayId: '1657308763',
        title: 'TestMis',
        date: new Date('2022-07-08T12:00:00Z'),
      };

      const includeConfig: IncludeReplayConfig[] = [
        { name: 'TestMis', gameType: GameType.MACE },
      ];

      const result = await saveNewReplay(replayLink, includeConfig);

      expect(result.success).toBe(true);
      expect(result.replayId).toBe('new-uuid-789');

      expect(mockReplayCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          missionName: 'mace@test_mis',
          gameType: GameType.MACE,
        }),
        select: {
          id: true,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      mockReplayFindFirst.mockResolvedValue(null);
      mockReplayCreate.mockRejectedValue(new Error('Database connection failed'));

      const replayLink: ReplayLink = {
        url: '/replays/1657308763',
        replayId: '1657308763',
        title: 'sg@222_mission',
      };

      const result = await saveNewReplay(replayLink);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('should use current date if date not provided', async () => {
      mockReplayFindFirst.mockResolvedValue(null);
      mockReplayCreate.mockResolvedValue({ id: 'new-uuid' });

      const replayLink: ReplayLink = {
        url: '/replays/1657308763',
        replayId: '1657308763',
        title: 'sg@222_mission',
        // date not provided
      };

      const before = new Date();

      await saveNewReplay(replayLink);

      const after = new Date();

      expect(mockReplayCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          date: expect.any(Date),
        }),
        select: {
          id: true,
        },
      });

      const calledDate = mockReplayCreate.mock.calls[0][0].data.date;

      expect(calledDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(calledDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should fail for empty title', async () => {
      mockReplayFindFirst.mockResolvedValue(null);

      const replayLink: ReplayLink = {
        url: '/replays/1657308763',
        replayId: '1657308763',
        title: '',
      };

      const result = await saveNewReplay(replayLink);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid mission name: ');
    });
  });

  describe('saveNewReplays', () => {
    it('should save multiple replays and return counts', async () => {
      mockReplayFindFirst.mockResolvedValue(null);
      mockReplayCreate
        .mockResolvedValueOnce({ id: 'uuid-1' })
        .mockResolvedValueOnce({ id: 'uuid-2' });

      const replayLinks: ReplayLink[] = [
        {
          url: '/replays/1',
          replayId: '1',
          title: 'sg@mission1',
          date: new Date(),
        },
        {
          url: '/replays/2',
          replayId: '2',
          title: 'mace@mission2',
          date: new Date(),
        },
      ];

      const result = await saveNewReplays(replayLinks);

      expect(result.saved).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should count skipped (already existing) replays', async () => {
      mockReplayFindFirst
        .mockResolvedValueOnce({ id: 'existing-1' }) // First exists
        .mockResolvedValueOnce(null); // Second doesn't exist
      mockReplayCreate.mockResolvedValue({ id: 'uuid-new' });

      const replayLinks: ReplayLink[] = [
        {
          url: '/replays/1',
          replayId: '1',
          title: 'sg@mission1',
          date: new Date(),
        },
        {
          url: '/replays/2',
          replayId: '2',
          title: 'mace@mission2',
          date: new Date(),
        },
      ];

      const result = await saveNewReplays(replayLinks);

      expect(result.saved).toBe(1);
      expect(result.skipped).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should count failed replays and collect errors', async () => {
      mockReplayFindFirst.mockResolvedValue(null);
      mockReplayCreate
        .mockResolvedValueOnce({ id: 'uuid-1' })
        .mockRejectedValueOnce(new Error('DB error'));

      const replayLinks: ReplayLink[] = [
        {
          url: '/replays/1',
          replayId: '1',
          title: 'sg@mission1',
          date: new Date(),
        },
        {
          url: '/replays/2',
          replayId: '2',
          title: 'mace@mission2',
          date: new Date(),
        },
      ];

      const result = await saveNewReplays(replayLinks);

      expect(result.saved).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toContain('DB error');
    });

    it('should handle mixed success, skip, and fail cases', async () => {
      // First: valid, new
      // Second: invalid mission name (fail)
      // Third: already exists (skip)
      mockReplayFindFirst
        .mockResolvedValueOnce(null) // First: doesn't exist
        .mockResolvedValueOnce(null) // Second: doesn't exist (but will fail validation)
        .mockResolvedValueOnce({ id: 'existing' }); // Third: exists

      mockReplayCreate.mockResolvedValue({ id: 'new-uuid' });

      const replayLinks: ReplayLink[] = [
        {
          url: '/replays/1',
          replayId: '1',
          title: 'sg@mission1',
          date: new Date(),
        },
        {
          url: '/replays/2',
          replayId: '2',
          title: 'InvalidMission', // No valid prefix
          date: new Date(),
        },
        {
          url: '/replays/3',
          replayId: '3',
          title: 'mace@mission3',
          date: new Date(),
        },
      ];

      const result = await saveNewReplays(replayLinks);

      expect(result.saved).toBe(1);
      expect(result.skipped).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('should handle empty array', async () => {
      const result = await saveNewReplays([]);

      expect(result.saved).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });
});
