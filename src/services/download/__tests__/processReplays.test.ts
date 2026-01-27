import { getDbClient } from '../../../db/client';
import { ReplayStatus } from '../../../generated/prisma/enums';
import { fetchReplayDetails } from '../fetchReplayDetails';
import {
  processReplay,
  processDiscoveredReplays,
  getDiscoveredCount,
  getDownloadedCount,
  retryFailedReplays,
} from '../processReplays';
import { saveReplayFile } from '../saveReplayFile';

// Mock dependencies
jest.mock('../../../db/client', () => ({
  getDbClient: jest.fn(),
}));
jest.mock('../fetchReplayDetails', () => ({
  fetchReplayDetails: jest.fn(),
}));
jest.mock('../saveReplayFile', () => ({
  saveReplayFile: jest.fn(),
}));
jest.mock('../../../shared/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

const mockGetDbClient = getDbClient as jest.MockedFunction<typeof getDbClient>;
const mockFetchReplayDetails = fetchReplayDetails as jest.MockedFunction<typeof fetchReplayDetails>;
const mockSaveReplayFile = saveReplayFile as jest.MockedFunction<typeof saveReplayFile>;

describe('processReplays', () => {
  let mockReplayUpdate: jest.Mock;
  let mockReplayFindMany: jest.Mock;
  let mockReplayCount: jest.Mock;
  let mockReplayUpdateMany: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReplayUpdate = jest.fn();
    mockReplayFindMany = jest.fn();
    mockReplayCount = jest.fn();
    mockReplayUpdateMany = jest.fn();

    mockGetDbClient.mockReturnValue({
      replay: {
        update: mockReplayUpdate,
        findMany: mockReplayFindMany,
        count: mockReplayCount,
        updateMany: mockReplayUpdateMany,
      },
    } as any);
  });

  describe('processReplay', () => {
    it('should process replay successfully', async () => {
      mockFetchReplayDetails.mockResolvedValue({
        filename: '2024_01_15__20_30_00_ocap',
        replayLink: '/replays/123',
      });
      mockSaveReplayFile.mockResolvedValue({
        success: true,
        filename: '2024_01_15__20_30_00_ocap',
        filePath: '/path/to/file.json',
      });
      mockReplayUpdate.mockResolvedValue({});

      const result = await processReplay('uuid-123', '/replays/123');

      expect(result.success).toBe(true);
      expect(result.filename).toBe('2024_01_15__20_30_00_ocap');
      expect(mockReplayUpdate).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: {
          filename: '2024_01_15__20_30_00_ocap',
          status: ReplayStatus.DOWNLOADED,
        },
      });
    });

    it('should fail when fetchReplayDetails returns null', async () => {
      mockFetchReplayDetails.mockResolvedValue(null);
      mockReplayUpdate.mockResolvedValue({});

      const result = await processReplay('uuid-123', '/replays/123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch replay details');
      expect(mockReplayUpdate).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: { status: ReplayStatus.ERROR },
      });
    });

    it('should fail when saveReplayFile fails', async () => {
      mockFetchReplayDetails.mockResolvedValue({
        filename: '2024_01_15__20_30_00_ocap',
        replayLink: '/replays/123',
      });
      mockSaveReplayFile.mockResolvedValue({
        success: false,
        filename: '2024_01_15__20_30_00_ocap',
        filePath: '/path/to/file.json',
        error: 'Download failed',
      });
      mockReplayUpdate.mockResolvedValue({});

      const result = await processReplay('uuid-123', '/replays/123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Download failed');
      expect(result.filename).toBe('2024_01_15__20_30_00_ocap');
    });

    it('should handle unexpected errors', async () => {
      mockFetchReplayDetails.mockRejectedValue(new Error('Network crash'));
      mockReplayUpdate.mockResolvedValue({});

      const result = await processReplay('uuid-123', '/replays/123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network crash');
    });
  });

  describe('processDiscoveredReplays', () => {
    it('should process all discovered replays', async () => {
      mockReplayFindMany.mockResolvedValue([
        { id: 'uuid-1', replayLink: '/replays/1' },
        { id: 'uuid-2', replayLink: '/replays/2' },
      ]);
      mockFetchReplayDetails.mockResolvedValue({
        filename: 'replay_file',
        replayLink: '/replays/1',
      });
      mockSaveReplayFile.mockResolvedValue({
        success: true,
        filename: 'replay_file',
        filePath: '/path/file.json',
      });
      mockReplayUpdate.mockResolvedValue({});

      const result = await processDiscoveredReplays();

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should return early when no replays to process', async () => {
      mockReplayFindMany.mockResolvedValue([]);

      const result = await processDiscoveredReplays();

      expect(result.processed).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should respect limit option', async () => {
      mockReplayFindMany.mockResolvedValue([
        { id: 'uuid-1', replayLink: '/replays/1' },
      ]);
      mockFetchReplayDetails.mockResolvedValue({
        filename: 'file',
        replayLink: '/replays/1',
      });
      mockSaveReplayFile.mockResolvedValue({
        success: true,
        filename: 'file',
        filePath: '/path/file.json',
      });
      mockReplayUpdate.mockResolvedValue({});

      await processDiscoveredReplays({ limit: 5 });

      expect(mockReplayFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        }),
      );
    });

    it('should count failures correctly', async () => {
      mockReplayFindMany.mockResolvedValue([
        { id: 'uuid-1', replayLink: '/replays/1' },
        { id: 'uuid-2', replayLink: '/replays/2' },
      ]);
      mockFetchReplayDetails
        .mockResolvedValueOnce({
          filename: 'file1',
          replayLink: '/replays/1',
        })
        .mockResolvedValueOnce(null); // Second fails
      mockSaveReplayFile.mockResolvedValue({
        success: true,
        filename: 'file1',
        filePath: '/path/file.json',
      });
      mockReplayUpdate.mockResolvedValue({});

      const result = await processDiscoveredReplays();

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('getDiscoveredCount', () => {
    it('should return count of discovered replays', async () => {
      mockReplayCount.mockResolvedValue(42);

      const count = await getDiscoveredCount();

      expect(count).toBe(42);
      expect(mockReplayCount).toHaveBeenCalledWith({
        where: { status: ReplayStatus.DISCOVERED },
      });
    });
  });

  describe('getDownloadedCount', () => {
    it('should return count of downloaded replays', async () => {
      mockReplayCount.mockResolvedValue(100);

      const count = await getDownloadedCount();

      expect(count).toBe(100);
      expect(mockReplayCount).toHaveBeenCalledWith({
        where: { status: ReplayStatus.DOWNLOADED },
      });
    });
  });

  describe('retryFailedReplays', () => {
    it('should reset error replays to discovered', async () => {
      mockReplayUpdateMany.mockResolvedValue({ count: 5 });

      const count = await retryFailedReplays();

      expect(count).toBe(5);
      expect(mockReplayUpdateMany).toHaveBeenCalledWith({
        where: { status: ReplayStatus.ERROR },
        data: { status: ReplayStatus.DISCOVERED },
      });
    });

    it('should return 0 when no failed replays', async () => {
      mockReplayUpdateMany.mockResolvedValue({ count: 0 });

      const count = await retryFailedReplays();

      expect(count).toBe(0);
    });
  });
});
