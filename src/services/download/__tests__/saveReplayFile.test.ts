import path from 'path';

import fs from 'fs-extra';

import {
  getReplayFilePath,
  replayFileExists,
  saveReplayFile,
  saveMultipleReplayFiles,
} from '../saveReplayFile';

// Mock dependencies
jest.mock('../../../shared/utils/request', () => jest.fn());
jest.mock('../../../shared/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));
jest.mock('fs-extra', () => ({
  accessSync: jest.fn(),
  ensureDirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));
jest.mock('../../../shared/utils/paths', () => ({
  rawReplaysPath: '/mock/raw_replays',
}));

const mockRequest = require('../../../shared/utils/request') as jest.MockedFunction<typeof import('../../../shared/utils/request').default>;

const mockFs = fs as jest.Mocked<typeof fs>;

describe('saveReplayFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getReplayFilePath', () => {
    it('should return correct path with .json extension', () => {
      const result = getReplayFilePath('2024_01_15__20_30_00_ocap');

      expect(result).toBe(path.join('/mock/raw_replays', '2024_01_15__20_30_00_ocap.json'));
    });
  });

  describe('replayFileExists', () => {
    it('should return true when file exists', () => {
      mockFs.accessSync.mockImplementation(() => undefined);

      const result = replayFileExists('existing_file');

      expect(result).toBe(true);
    });

    it('should return false when file does not exist', () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = replayFileExists('non_existing_file');

      expect(result).toBe(false);
    });
  });

  describe('saveReplayFile', () => {
    it('should download and save replay file successfully', async () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      mockRequest.mockResolvedValue({
        text: jest.fn().mockResolvedValue('{"replay": "data"}'),
      } as any);

      const result = await saveReplayFile('2024_01_15__20_30_00_ocap');

      expect(result.success).toBe(true);
      expect(result.filename).toBe('2024_01_15__20_30_00_ocap');
      expect(result.alreadyExists).toBeUndefined();
      expect(mockFs.ensureDirSync).toHaveBeenCalledWith('/mock/raw_replays');
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('2024_01_15__20_30_00_ocap.json'),
        '{"replay": "data"}',
      );
      expect(mockRequest).toHaveBeenCalledWith(
        'https://sg.zone/data/2024_01_15__20_30_00_ocap.json',
      );
    });

    it('should skip download when file already exists', async () => {
      mockFs.accessSync.mockImplementation(() => undefined);

      const result = await saveReplayFile('existing_file', true);

      expect(result.success).toBe(true);
      expect(result.alreadyExists).toBe(true);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should download even if file exists when skipIfExists is false', async () => {
      mockFs.accessSync.mockImplementation(() => undefined);
      mockRequest.mockResolvedValue({
        text: jest.fn().mockResolvedValue('{"new": "data"}'),
      } as any);

      const result = await saveReplayFile('existing_file', false);

      expect(result.success).toBe(true);
      expect(result.alreadyExists).toBeUndefined();
      expect(mockRequest).toHaveBeenCalled();
    });

    it('should return error when download fails', async () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      mockRequest.mockResolvedValue(null);

      const result = await saveReplayFile('failing_file');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should retry on network failure and succeed', async () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      mockRequest
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('{"data": "success"}'),
        } as any);

      const result = await saveReplayFile('retry_file');

      expect(result.success).toBe(true);
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      mockRequest.mockRejectedValue(new Error('Persistent error'));

      const result = await saveReplayFile('persistent_fail');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Persistent error');
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });
  });

  describe('saveMultipleReplayFiles', () => {
    it('should save multiple files and return counts', async () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      mockRequest
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('{"data": 1}'),
        } as any)
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('{"data": 2}'),
        } as any);

      const result = await saveMultipleReplayFiles(['file1', 'file2']);

      expect(result.saved).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should count skipped (existing) files', async () => {
      mockFs.accessSync
        .mockImplementationOnce(() => undefined) // First exists
        .mockImplementationOnce(() => {
          throw new Error('Not found');
        }); // Second doesn't
      mockRequest.mockResolvedValue({
        text: jest.fn().mockResolvedValue('{"data": "new"}'),
      } as any);

      const result = await saveMultipleReplayFiles(['existing', 'new_file']);

      expect(result.saved).toBe(1);
      expect(result.skipped).toBe(1);
    });

    it('should count failed downloads', async () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      mockRequest
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('{"data": 1}'),
        } as any)
        .mockResolvedValue(null); // Second fails

      const result = await saveMultipleReplayFiles(['success', 'fail']);

      expect(result.saved).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should handle empty array', async () => {
      const result = await saveMultipleReplayFiles([]);

      expect(result.saved).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.failed).toBe(0);
    });
  });
});
