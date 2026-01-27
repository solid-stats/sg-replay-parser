import { GameType } from '../../../generated/prisma/enums';
import {
  discoverAndSaveReplays,
  quickDiscovery,
  fullDiscovery,
} from '../discoverAndSave';
import { discoverNewReplayLinks } from '../discoverNewReplays';
import { saveNewReplays } from '../saveNewReplay';
import type { ReplayLink } from '../types';

// Mock dependencies
jest.mock('../discoverNewReplays', () => ({
  discoverNewReplayLinks: jest.fn(),
}));
jest.mock('../saveNewReplay', () => ({
  saveNewReplays: jest.fn(),
}));
jest.mock('../../../shared/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

const mockDiscoverNewReplayLinks = discoverNewReplayLinks as jest.MockedFunction<typeof discoverNewReplayLinks>;
const mockSaveNewReplays = saveNewReplays as jest.MockedFunction<typeof saveNewReplays>;

describe('discoverAndSave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('discoverAndSaveReplays', () => {
    it('should discover and save new replays', async () => {
      const mockReplays: ReplayLink[] = [
        { url: '/replays/1', replayId: '1', title: 'sg@mission1' },
        { url: '/replays/2', replayId: '2', title: 'mace@mission2' },
      ];

      mockDiscoverNewReplayLinks.mockResolvedValue(mockReplays);
      mockSaveNewReplays.mockResolvedValue({
        saved: 2,
        skipped: 0,
        failed: 0,
        errors: [],
      });

      const result = await discoverAndSaveReplays();

      expect(result.discovered).toBe(2);
      expect(result.saveResult.saved).toBe(2);
      expect(mockDiscoverNewReplayLinks).toHaveBeenCalled();
      expect(mockSaveNewReplays).toHaveBeenCalledWith(mockReplays, undefined);
    });

    it('should return early when no new replays found', async () => {
      mockDiscoverNewReplayLinks.mockResolvedValue([]);

      const result = await discoverAndSaveReplays();

      expect(result.discovered).toBe(0);
      expect(result.saveResult.saved).toBe(0);
      expect(mockSaveNewReplays).not.toHaveBeenCalled();
    });

    it('should pass include config to saveNewReplays', async () => {
      const mockReplays: ReplayLink[] = [
        { url: '/replays/1', replayId: '1', title: 'TestMis' },
      ];

      const includeConfig = [{ name: 'TestMis', gameType: GameType.MACE }];

      mockDiscoverNewReplayLinks.mockResolvedValue(mockReplays);
      mockSaveNewReplays.mockResolvedValue({
        saved: 1,
        skipped: 0,
        failed: 0,
        errors: [],
      });

      await discoverAndSaveReplays({ includeConfig });

      expect(mockSaveNewReplays).toHaveBeenCalledWith(mockReplays, includeConfig);
    });

    it('should pass discover options to discoverNewReplayLinks', async () => {
      mockDiscoverNewReplayLinks.mockResolvedValue([]);

      await discoverAndSaveReplays({
        maxPages: 5,
        stopAfterKnownCount: 10,
      });

      expect(mockDiscoverNewReplayLinks).toHaveBeenCalledWith({
        maxPages: 5,
        stopAfterKnownCount: 10,
      });
    });

    it('should handle partial save failures', async () => {
      const mockReplays: ReplayLink[] = [
        { url: '/replays/1', replayId: '1', title: 'sg@mission1' },
        { url: '/replays/2', replayId: '2', title: 'InvalidMission' },
        { url: '/replays/3', replayId: '3', title: 'mace@mission3' },
      ];

      mockDiscoverNewReplayLinks.mockResolvedValue(mockReplays);
      mockSaveNewReplays.mockResolvedValue({
        saved: 2,
        skipped: 0,
        failed: 1,
        errors: ['Invalid mission name: InvalidMission'],
      });

      const result = await discoverAndSaveReplays();

      expect(result.discovered).toBe(3);
      expect(result.saveResult.saved).toBe(2);
      expect(result.saveResult.failed).toBe(1);
      expect(result.saveResult.errors).toContain('Invalid mission name: InvalidMission');
    });
  });

  describe('quickDiscovery', () => {
    it('should use limited options for quick discovery', async () => {
      mockDiscoverNewReplayLinks.mockResolvedValue([]);

      await quickDiscovery();

      expect(mockDiscoverNewReplayLinks).toHaveBeenCalledWith({
        maxPages: 1,
        stopAfterKnownCount: 3,
      });
    });

    it('should pass include config', async () => {
      const mockReplays: ReplayLink[] = [
        { url: '/replays/1', replayId: '1', title: 'sg@mission1' },
      ];

      const includeConfig = [{ name: 'TestMis', gameType: GameType.SG }];

      mockDiscoverNewReplayLinks.mockResolvedValue(mockReplays);
      mockSaveNewReplays.mockResolvedValue({
        saved: 1,
        skipped: 0,
        failed: 0,
        errors: [],
      });

      await quickDiscovery(includeConfig);

      expect(mockSaveNewReplays).toHaveBeenCalledWith(mockReplays, includeConfig);
    });
  });

  describe('fullDiscovery', () => {
    it('should use expanded options for full discovery', async () => {
      mockDiscoverNewReplayLinks.mockResolvedValue([]);

      await fullDiscovery();

      expect(mockDiscoverNewReplayLinks).toHaveBeenCalledWith({
        maxPages: 100,
        stopAfterKnownCount: 30,
      });
    });

    it('should pass include config', async () => {
      const mockReplays: ReplayLink[] = [
        { url: '/replays/1', replayId: '1', title: 'mace@mission1' },
      ];

      const includeConfig = [{ name: 'Special', gameType: GameType.SM }];

      mockDiscoverNewReplayLinks.mockResolvedValue(mockReplays);
      mockSaveNewReplays.mockResolvedValue({
        saved: 1,
        skipped: 0,
        failed: 0,
        errors: [],
      });

      await fullDiscovery(includeConfig);

      expect(mockSaveNewReplays).toHaveBeenCalledWith(mockReplays, includeConfig);
    });
  });
});
