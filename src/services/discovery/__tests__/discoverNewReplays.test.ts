import { getDbClient } from '../../../db/client';
import {
  discoverNewReplays,
  getKnownReplayIds,
  filterNewReplays,
} from '../discoverNewReplays';
import { fetchReplaysPage } from '../fetchReplays';
import type { ReplayLink } from '../types';

// Mock dependencies
jest.mock('../fetchReplays');
jest.mock('../../../db/client', () => ({
  getDbClient: jest.fn(),
}));
jest.mock('../../../shared/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

const mockFetchReplaysPage = fetchReplaysPage as jest.MockedFunction<typeof fetchReplaysPage>;
const mockGetDbClient = getDbClient as jest.MockedFunction<typeof getDbClient>;

describe('discoverNewReplays', () => {
  let mockReplayFindMany: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReplayFindMany = jest.fn();
    mockGetDbClient.mockReturnValue({
      replay: {
        findMany: mockReplayFindMany,
      },
    } as any);
  });

  describe('getKnownReplayIds', () => {
    it('should return set of known replay IDs from database', async () => {
      mockReplayFindMany.mockResolvedValue([
        { replayLink: '/replays/1657308763' },
        { replayLink: '/replays/1657308800' },
        { replayLink: '/replays/1657308900' },
      ]);

      const result = await getKnownReplayIds();

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(3);
      expect(result.has('1657308763')).toBe(true);
      expect(result.has('1657308800')).toBe(true);
      expect(result.has('1657308900')).toBe(true);
    });

    it('should return empty set when database is empty', async () => {
      mockReplayFindMany.mockResolvedValue([]);

      const result = await getKnownReplayIds();

      expect(result.size).toBe(0);
    });

    it('should skip entries with invalid replayLink format', async () => {
      mockReplayFindMany.mockResolvedValue([
        { replayLink: '/replays/1657308763' },
        { replayLink: '/invalid/path' },
        { replayLink: '' },
      ]);

      const result = await getKnownReplayIds();

      expect(result.size).toBe(1);
      expect(result.has('1657308763')).toBe(true);
    });
  });

  describe('filterNewReplays', () => {
    it('should filter out known replays', () => {
      const replays: ReplayLink[] = [
        { url: '/replays/1', replayId: '1' },
        { url: '/replays/2', replayId: '2' },
        { url: '/replays/3', replayId: '3' },
      ];
      const knownIds = new Set(['1', '3']);

      const result = filterNewReplays(replays, knownIds);

      expect(result).toHaveLength(1);
      expect(result[0].replayId).toBe('2');
    });

    it('should return all replays when none are known', () => {
      const replays: ReplayLink[] = [
        { url: '/replays/1', replayId: '1' },
        { url: '/replays/2', replayId: '2' },
      ];
      const knownIds = new Set<string>();

      const result = filterNewReplays(replays, knownIds);

      expect(result).toHaveLength(2);
    });

    it('should return empty array when all replays are known', () => {
      const replays: ReplayLink[] = [
        { url: '/replays/1', replayId: '1' },
        { url: '/replays/2', replayId: '2' },
      ];
      const knownIds = new Set(['1', '2']);

      const result = filterNewReplays(replays, knownIds);

      expect(result).toHaveLength(0);
    });
  });

  describe('discoverNewReplays', () => {
    it('should return only new replays not in database', async () => {
      // Database has replays 3, 4, 5
      mockReplayFindMany.mockResolvedValue([
        { replayLink: '/replays/3' },
        { replayLink: '/replays/4' },
        { replayLink: '/replays/5' },
      ]);

      // Page has replays 1, 2, 3 (1, 2 are new)
      mockFetchReplaysPage.mockResolvedValue({
        replays: [
          { url: '/replays/1', replayId: '1', title: 'New1' },
          { url: '/replays/2', replayId: '2', title: 'New2' },
          { url: '/replays/3', replayId: '3', title: 'Known1' },
        ],
        totalPages: 1,
        currentPage: 1,
      });

      const result = await discoverNewReplays({ stopAfterKnownCount: 10 });

      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).not.toContain('3');
    });

    it('should stop when finding consecutive known replays', async () => {
      mockReplayFindMany.mockResolvedValue([
        { replayLink: '/replays/3' },
        { replayLink: '/replays/4' },
        { replayLink: '/replays/5' },
        { replayLink: '/replays/6' },
        { replayLink: '/replays/7' },
      ]);

      // Page 1: mix of new and known
      mockFetchReplaysPage
        .mockResolvedValueOnce({
          replays: [
            { url: '/replays/1', replayId: '1' },
            { url: '/replays/2', replayId: '2' },
            { url: '/replays/3', replayId: '3' }, // known
            { url: '/replays/4', replayId: '4' }, // known
            { url: '/replays/5', replayId: '5' }, // known
          ],
          totalPages: 3,
          currentPage: 1,
        });

      const result = await discoverNewReplays({ stopAfterKnownCount: 3 });

      expect(result).toEqual(['1', '2']);
      // Should only call fetchReplaysPage once because we found 3 consecutive known replays
      expect(mockFetchReplaysPage).toHaveBeenCalledTimes(1);
    });

    it('should handle empty database (all replays are new)', async () => {
      mockReplayFindMany.mockResolvedValue([]);

      mockFetchReplaysPage.mockResolvedValue({
        replays: [
          { url: '/replays/1', replayId: '1' },
          { url: '/replays/2', replayId: '2' },
          { url: '/replays/3', replayId: '3' },
        ],
        totalPages: 1,
        currentPage: 1,
      });

      const result = await discoverNewReplays();

      expect(result).toHaveLength(3);
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
    });

    it('should fetch multiple pages when needed', async () => {
      mockReplayFindMany.mockResolvedValue([
        { replayLink: '/replays/10' },
      ]);

      mockFetchReplaysPage
        .mockResolvedValueOnce({
          replays: [
            { url: '/replays/1', replayId: '1' },
            { url: '/replays/2', replayId: '2' },
          ],
          totalPages: 2,
          currentPage: 1,
        })
        .mockResolvedValueOnce({
          replays: [
            { url: '/replays/3', replayId: '3' },
            { url: '/replays/4', replayId: '4' },
          ],
          totalPages: 2,
          currentPage: 2,
        });

      const result = await discoverNewReplays({ stopAfterKnownCount: 10 });

      expect(result).toHaveLength(4);
      expect(mockFetchReplaysPage).toHaveBeenCalledTimes(2);
    });

    it('should respect maxPages option', async () => {
      mockReplayFindMany.mockResolvedValue([]);

      mockFetchReplaysPage
        .mockResolvedValueOnce({
          replays: [{ url: '/replays/1', replayId: '1' }],
          totalPages: 10,
          currentPage: 1,
        })
        .mockResolvedValueOnce({
          replays: [{ url: '/replays/2', replayId: '2' }],
          totalPages: 10,
          currentPage: 2,
        });

      await discoverNewReplays({ maxPages: 2, stopAfterKnownCount: 100 });

      expect(mockFetchReplaysPage).toHaveBeenCalledTimes(2);
    });

    it('should reset consecutive counter when finding new replay', async () => {
      mockReplayFindMany.mockResolvedValue([
        { replayLink: '/replays/2' },
        { replayLink: '/replays/4' },
      ]);

      mockFetchReplaysPage.mockResolvedValue({
        replays: [
          { url: '/replays/1', replayId: '1' }, // new
          { url: '/replays/2', replayId: '2' }, // known
          { url: '/replays/3', replayId: '3' }, // new - resets counter
          { url: '/replays/4', replayId: '4' }, // known
          { url: '/replays/5', replayId: '5' }, // new - resets counter
        ],
        totalPages: 1,
        currentPage: 1,
      });

      const result = await discoverNewReplays({ stopAfterKnownCount: 2 });

      expect(result).toContain('1');
      expect(result).toContain('3');
      expect(result).toContain('5');
    });

    it('should handle page with no replays', async () => {
      mockReplayFindMany.mockResolvedValue([]);

      mockFetchReplaysPage.mockResolvedValue({
        replays: [],
        totalPages: 1,
        currentPage: 1,
      });

      const result = await discoverNewReplays();

      expect(result).toHaveLength(0);
    });

    it('should stop on page 2 when finding consecutive known replays', async () => {
      mockReplayFindMany.mockResolvedValue([
        { replayLink: '/replays/5' },
        { replayLink: '/replays/6' },
        { replayLink: '/replays/7' },
      ]);

      mockFetchReplaysPage
        .mockResolvedValueOnce({
          replays: [
            { url: '/replays/1', replayId: '1' },
            { url: '/replays/2', replayId: '2' },
          ],
          totalPages: 3,
          currentPage: 1,
        })
        .mockResolvedValueOnce({
          replays: [
            { url: '/replays/5', replayId: '5' }, // known
            { url: '/replays/6', replayId: '6' }, // known
            { url: '/replays/7', replayId: '7' }, // known
          ],
          totalPages: 3,
          currentPage: 2,
        });

      const result = await discoverNewReplays({ stopAfterKnownCount: 3 });

      expect(result).toEqual(['1', '2']);
      expect(mockFetchReplaysPage).toHaveBeenCalledTimes(2);
    });
  });
});
