import request from '../../../shared/utils/request';
import {
  parseReplayFilename,
  fetchReplayDetails,
  fetchMultipleReplayDetails,
} from '../fetchReplayDetails';

// Mock dependencies
jest.mock('../../../shared/utils/request', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../../shared/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

const mockRequest = request as jest.MockedFunction<typeof request>;

describe('fetchReplayDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseReplayFilename', () => {
    it('should extract filename from input#filename element', () => {
      const html = `
        <html>
          <body>
            <input id="filename" value="2024_01_15__20_30_00_ocap">
          </body>
        </html>
      `;

      const result = parseReplayFilename(html);

      expect(result).toBe('2024_01_15__20_30_00_ocap');
    });

    it('should extract filename from body data-ocap attribute', () => {
      const html = `
        <html>
          <body data-ocap="2024_01_15__21_45_00_ocap">
          </body>
        </html>
      `;

      const result = parseReplayFilename(html);

      expect(result).toBe('2024_01_15__21_45_00_ocap');
    });

    it('should prefer input#filename over data-ocap', () => {
      const html = `
        <html>
          <body data-ocap="from-data-attr">
            <input id="filename" value="from-input">
          </body>
        </html>
      `;

      const result = parseReplayFilename(html);

      expect(result).toBe('from-input');
    });

    it('should return null when no filename found', () => {
      const html = `
        <html>
          <body>
            <div>No filename here</div>
          </body>
        </html>
      `;

      const result = parseReplayFilename(html);

      expect(result).toBeNull();
    });

    it('should return null for empty input value', () => {
      const html = `
        <html>
          <body>
            <input id="filename" value="">
          </body>
        </html>
      `;

      const result = parseReplayFilename(html);

      expect(result).toBeNull();
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<html><body>Malformed';

      const result = parseReplayFilename(html);

      expect(result).toBeNull();
    });
  });

  describe('fetchReplayDetails', () => {
    it('should fetch and parse replay details successfully', async () => {
      const mockHtml = `
        <html>
          <body>
            <input id="filename" value="2024_01_15__20_30_00_ocap">
          </body>
        </html>
      `;

      mockRequest.mockResolvedValue({
        text: jest.fn().mockResolvedValue(mockHtml),
      } as any);

      const result = await fetchReplayDetails('/replays/1657308763');

      expect(result).toEqual({
        filename: '2024_01_15__20_30_00_ocap',
        replayLink: '/replays/1657308763',
      });
      expect(mockRequest).toHaveBeenCalledWith('https://sg.zone/replays/1657308763');
    });

    it('should handle full URL', async () => {
      const mockHtml = `
        <html>
          <body data-ocap="replay_file">
          </body>
        </html>
      `;

      mockRequest.mockResolvedValue({
        text: jest.fn().mockResolvedValue(mockHtml),
      } as any);

      const result = await fetchReplayDetails('https://sg.zone/replays/123');

      expect(result).toEqual({
        filename: 'replay_file',
        replayLink: 'https://sg.zone/replays/123',
      });
      expect(mockRequest).toHaveBeenCalledWith('https://sg.zone/replays/123');
    });

    it('should return null when filename not found', async () => {
      const mockHtml = `
        <html>
          <body>
            <div>No filename</div>
          </body>
        </html>
      `;

      mockRequest.mockResolvedValue({
        text: jest.fn().mockResolvedValue(mockHtml),
      } as any);

      const result = await fetchReplayDetails('/replays/123');

      expect(result).toBeNull();
    });

    it('should return null when response is null', async () => {
      mockRequest.mockResolvedValue(null);

      const result = await fetchReplayDetails('/replays/123');

      expect(result).toBeNull();
    });

    it('should retry on failure and succeed', async () => {
      const mockHtml = `
        <html>
          <body>
            <input id="filename" value="success_file">
          </body>
        </html>
      `;

      mockRequest
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue(mockHtml),
        } as any);

      const result = await fetchReplayDetails('/replays/123');

      expect(result).toEqual({
        filename: 'success_file',
        replayLink: '/replays/123',
      });
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('should return null after max retries', async () => {
      mockRequest.mockRejectedValue(new Error('Persistent error'));

      const result = await fetchReplayDetails('/replays/123');

      expect(result).toBeNull();
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });
  });

  describe('fetchMultipleReplayDetails', () => {
    it('should fetch details for multiple replays', async () => {
      mockRequest.mockImplementation(async (url: string) => {
        if (url.includes('/replays/1')) {
          return {
            text: jest.fn().mockResolvedValue('<body><input id="filename" value="file1"></body>'),
          } as any;
        }

        if (url.includes('/replays/2')) {
          return {
            text: jest.fn().mockResolvedValue('<body><input id="filename" value="file2"></body>'),
          } as any;
        }

        return null;
      });

      const result = await fetchMultipleReplayDetails(['/replays/1', '/replays/2']);

      expect(result).toHaveLength(2);
      expect(result[0].filename).toBe('file1');
      expect(result[1].filename).toBe('file2');
    });

    it('should filter out failed fetches', async () => {
      mockRequest.mockImplementation(async (url: string) => {
        if (url.includes('/replays/1')) {
          return {
            text: jest.fn().mockResolvedValue('<body><input id="filename" value="file1"></body>'),
          } as any;
        }

        if (url.includes('/replays/2')) {
          // No filename in HTML - will return null
          return {
            text: jest.fn().mockResolvedValue('<body><div>No filename</div></body>'),
          } as any;
        }

        if (url.includes('/replays/3')) {
          return {
            text: jest.fn().mockResolvedValue('<body><input id="filename" value="file3"></body>'),
          } as any;
        }

        return null;
      });

      const result = await fetchMultipleReplayDetails(['/replays/1', '/replays/2', '/replays/3']);

      expect(result).toHaveLength(2);
      expect(result[0].filename).toBe('file1');
      expect(result[1].filename).toBe('file3');
    });

    it('should handle empty array', async () => {
      const result = await fetchMultipleReplayDetails([]);

      expect(result).toHaveLength(0);
    });
  });
});
