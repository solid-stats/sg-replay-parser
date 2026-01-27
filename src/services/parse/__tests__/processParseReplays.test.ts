import { getDbClient } from '../../../db/client';
import { GameType, ReplayStatus } from '../../../generated/prisma/enums';
import * as parseReplayDataModule from '../parseReplayData';
import {
  parseReplay,
  getDownloadedReplays,
  parseDownloadedReplays,
  reparseReplay,
  getParsedCount,
  retryFailedParsing,
} from '../processParseReplays';
import * as saveParsedReplayModule from '../saveParsedReplay';

jest.mock('../../../db/client');
jest.mock('../../../shared/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const mockGetDbClient = getDbClient as jest.MockedFunction<typeof getDbClient>;

describe('processParseReplays', () => {
  const mockDb = {
    replay: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    playerReplayResult: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDbClient.mockReturnValue(mockDb as any);
  });

  describe('parseReplay', () => {
    it('should parse replay successfully', async () => {
      const mockParsedData = {
        missionName: 'Test',
        worldName: 'Altis',
        missionAuthor: 'Author',
        playersCount: 2,
        players: [
          { entityName: 'Player1', squadPrefix: null, kills: 3 },
          { entityName: 'Player2', squadPrefix: 'TAG', kills: 1 },
        ],
      };

      jest.spyOn(parseReplayDataModule, 'parseReplayData')
        .mockResolvedValue(mockParsedData as any);
      jest.spyOn(saveParsedReplayModule, 'saveParsedReplay')
        .mockResolvedValue({ success: true, playerResultsCount: 2 });

      const result = await parseReplay('replay-uuid', 'test-file', new Date('2024-01-01'));

      expect(result.success).toBe(true);
      expect(result.playerCount).toBe(2);
      expect(result.replayId).toBe('replay-uuid');
      expect(result.filename).toBe('test-file');
    });

    it('should handle parse failure', async () => {
      jest.spyOn(parseReplayDataModule, 'parseReplayData')
        .mockResolvedValue(null);
      mockDb.replay.update.mockResolvedValue({});

      const result = await parseReplay('replay-uuid', 'bad-file', new Date('2024-01-01'));

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to parse replay file');
      expect(mockDb.replay.update).toHaveBeenCalledWith({
        where: { id: 'replay-uuid' },
        data: { status: 'ERROR' },
      });
    });

    it('should handle save failure', async () => {
      jest.spyOn(parseReplayDataModule, 'parseReplayData')
        .mockResolvedValue({ players: [] } as any);
      jest.spyOn(saveParsedReplayModule, 'saveParsedReplay')
        .mockResolvedValue({ success: false, playerResultsCount: 0, error: 'Save error' });

      const result = await parseReplay('replay-uuid', 'test-file', new Date('2024-01-01'));

      expect(result.success).toBe(false);
      expect(result.error).toBe('Save error');
    });
  });

  describe('getDownloadedReplays', () => {
    it('should return downloaded replays', async () => {
      const mockReplays = [
        { id: 'uuid1', filename: 'file1', date: new Date('2024-01-01') },
        { id: 'uuid2', filename: 'file2', date: new Date('2024-01-02') },
      ];

      mockDb.replay.findMany.mockResolvedValue(mockReplays);

      const result = await getDownloadedReplays();

      expect(mockDb.replay.findMany).toHaveBeenCalledWith({
        where: { status: ReplayStatus.DOWNLOADED },
        select: { id: true, filename: true, date: true },
        orderBy: { date: 'asc' },
      });
      expect(result).toEqual(mockReplays);
    });

    it('should filter by game type', async () => {
      mockDb.replay.findMany.mockResolvedValue([]);

      await getDownloadedReplays(GameType.SG);

      expect(mockDb.replay.findMany).toHaveBeenCalledWith({
        where: { status: ReplayStatus.DOWNLOADED, gameType: GameType.SG },
        select: { id: true, filename: true, date: true },
        orderBy: { date: 'asc' },
      });
    });

    it('should apply limit', async () => {
      mockDb.replay.findMany.mockResolvedValue([]);

      await getDownloadedReplays(undefined, 10);

      expect(mockDb.replay.findMany).toHaveBeenCalledWith({
        where: { status: ReplayStatus.DOWNLOADED },
        select: { id: true, filename: true, date: true },
        orderBy: { date: 'asc' },
        take: 10,
      });
    });
  });

  describe('parseDownloadedReplays', () => {
    it('should process all downloaded replays', async () => {
      const mockReplays = [
        { id: 'uuid1', filename: 'file1', date: new Date('2024-01-01') },
        { id: 'uuid2', filename: 'file2', date: new Date('2024-01-02') },
      ];

      mockDb.replay.findMany.mockResolvedValue(mockReplays);

      jest.spyOn(parseReplayDataModule, 'parseReplayData')
        .mockResolvedValue({ players: [{ entityName: 'Player1' }] } as any);
      jest.spyOn(saveParsedReplayModule, 'saveParsedReplay')
        .mockResolvedValue({ success: true, playerResultsCount: 1 });

      const result = await parseDownloadedReplays();

      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
    });

    it('should handle mixed success/failure', async () => {
      const mockReplays = [
        { id: 'uuid1', filename: 'file1', date: new Date('2024-01-01') },
        { id: 'uuid2', filename: 'file2', date: new Date('2024-01-02') },
      ];

      mockDb.replay.findMany.mockResolvedValue(mockReplays);
      mockDb.replay.update.mockResolvedValue({});

      jest.spyOn(parseReplayDataModule, 'parseReplayData')
        .mockResolvedValueOnce({ players: [] } as any)
        .mockResolvedValueOnce(null);
      jest.spyOn(saveParsedReplayModule, 'saveParsedReplay')
        .mockResolvedValue({ success: true, playerResultsCount: 0 });

      const result = await parseDownloadedReplays();

      expect(result.total).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('reparseReplay', () => {
    it('should reparse existing replay', async () => {
      mockDb.replay.findUnique.mockResolvedValue({
        id: 'uuid',
        filename: 'file1',
        date: new Date('2024-01-01'),
      });
      mockDb.playerReplayResult.deleteMany.mockResolvedValue({ count: 5 });

      jest.spyOn(parseReplayDataModule, 'parseReplayData')
        .mockResolvedValue({ players: [] } as any);
      jest.spyOn(saveParsedReplayModule, 'saveParsedReplay')
        .mockResolvedValue({ success: true, playerResultsCount: 3 });

      const result = await reparseReplay('uuid');

      expect(mockDb.playerReplayResult.deleteMany).toHaveBeenCalledWith({
        where: { replayId: 'uuid' },
      });
      expect(result.success).toBe(true);
    });

    it('should return error for non-existent replay', async () => {
      mockDb.replay.findUnique.mockResolvedValue(null);

      const result = await reparseReplay('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Replay not found');
    });
  });

  describe('getParsedCount', () => {
    it('should return count of parsed replays', async () => {
      mockDb.replay.count.mockResolvedValue(42);

      const count = await getParsedCount();

      expect(mockDb.replay.count).toHaveBeenCalledWith({
        where: { status: ReplayStatus.PARSED },
      });
      expect(count).toBe(42);
    });

    it('should filter by game type', async () => {
      mockDb.replay.count.mockResolvedValue(10);

      await getParsedCount(GameType.MACE);

      expect(mockDb.replay.count).toHaveBeenCalledWith({
        where: { status: ReplayStatus.PARSED, gameType: GameType.MACE },
      });
    });
  });

  describe('retryFailedParsing', () => {
    it('should reset ERROR status and reprocess', async () => {
      mockDb.replay.findMany.mockResolvedValueOnce([
        { id: 'uuid1' },
        { id: 'uuid2' },
      ]);
      mockDb.replay.updateMany.mockResolvedValue({ count: 2 });
      mockDb.replay.findMany.mockResolvedValueOnce([
        { id: 'uuid1', filename: 'file1', date: new Date('2024-01-01') },
        { id: 'uuid2', filename: 'file2', date: new Date('2024-01-02') },
      ]);

      jest.spyOn(parseReplayDataModule, 'parseReplayData')
        .mockResolvedValue({ players: [] } as any);
      jest.spyOn(saveParsedReplayModule, 'saveParsedReplay')
        .mockResolvedValue({ success: true, playerResultsCount: 0 });

      const result = await retryFailedParsing();

      expect(mockDb.replay.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['uuid1', 'uuid2'] } },
        data: { status: ReplayStatus.DOWNLOADED },
      });
      expect(result.total).toBe(2);
    });

    it('should return empty result when no errors', async () => {
      mockDb.replay.findMany.mockResolvedValue([]);

      const result = await retryFailedParsing();

      expect(result.total).toBe(0);
      expect(mockDb.replay.updateMany).not.toHaveBeenCalled();
    });

    it('should respect limit parameter', async () => {
      mockDb.replay.findMany.mockResolvedValueOnce([{ id: 'uuid1' }]);
      mockDb.replay.updateMany.mockResolvedValue({ count: 1 });
      mockDb.replay.findMany.mockResolvedValueOnce([
        { id: 'uuid1', filename: 'file1', date: new Date('2024-01-01') },
      ]);

      jest.spyOn(parseReplayDataModule, 'parseReplayData')
        .mockResolvedValue({ players: [] } as any);
      jest.spyOn(saveParsedReplayModule, 'saveParsedReplay')
        .mockResolvedValue({ success: true, playerResultsCount: 0 });

      await retryFailedParsing(5);

      expect(mockDb.replay.findMany).toHaveBeenCalledWith({
        where: { status: ReplayStatus.ERROR },
        select: { id: true },
        take: 5,
      });
    });
  });
});
