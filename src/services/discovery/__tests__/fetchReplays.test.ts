import {
  extractReplayId,
  parseDateFromId,
  parseReplaysPage,
  fetchReplaysPage,
} from '../fetchReplays';

// Mock the request module
jest.mock('../../../shared/utils/request', () => jest.fn());
jest.mock('../../../shared/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

const mockRequest = require('../../../shared/utils/request') as jest.MockedFunction<typeof import('../../../shared/utils/request').default>;

describe('fetchReplays', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractReplayId', () => {
    it('should extract replay ID from valid URL', () => {
      expect(extractReplayId('/replays/1657308763')).toBe('1657308763');
    });

    it('should extract replay ID from full URL', () => {
      expect(extractReplayId('https://sg.zone/replays/1657308763')).toBe('1657308763');
    });

    it('should return null for invalid URL', () => {
      expect(extractReplayId('/invalid/path')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(extractReplayId('')).toBeNull();
    });

    it('should return null for URL without numeric ID', () => {
      expect(extractReplayId('/replays/abc')).toBeNull();
    });
  });

  describe('parseDateFromId', () => {
    it('should parse Unix timestamp to Date', () => {
      const timestamp = '1657308763';
      const result = parseDateFromId(timestamp);

      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(1657308763000);
    });

    it('should return undefined for invalid timestamp', () => {
      expect(parseDateFromId('invalid')).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(parseDateFromId('')).toBeUndefined();
    });
  });

  describe('parseReplaysPage', () => {
    it('should parse replay links correctly from HTML', () => {
      const html = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td><a href="/replays/1657308763">SG@MissionName1</a></td>
                  <td>Altis</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td><a href="/replays/1657308800">Mace@MissionName2</a></td>
                  <td>Tanoa</td>
                  <td>2</td>
                </tr>
              </tbody>
            </table>
            <div class="pagination">
              <span class="pagination-item"><a>1</a></span>
              <span class="pagination-item"><a>2</a></span>
              <span class="pagination-item"><a>3</a></span>
              <span class="pagination-item"><a>»</a></span>
            </div>
          </body>
        </html>
      `;

      const result = parseReplaysPage(html, 1);

      expect(result.replays).toHaveLength(2);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(3);

      expect(result.replays[0]).toEqual({
        url: '/replays/1657308763',
        replayId: '1657308763',
        title: 'SG@MissionName1',
        date: new Date(1657308763000),
        worldName: 'Altis',
        serverId: 1,
      });

      expect(result.replays[1]).toEqual({
        url: '/replays/1657308800',
        replayId: '1657308800',
        title: 'Mace@MissionName2',
        date: new Date(1657308800000),
        worldName: 'Tanoa',
        serverId: 2,
      });
    });

    it('should handle pagination on different page numbers', () => {
      const html = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td><a href="/replays/1657308763">Test Mission</a></td>
                </tr>
              </tbody>
            </table>
            <div class="pagination">
              <span class="pagination-item"><a>1</a></span>
              <span class="pagination-item"><a>5</a></span>
              <span class="pagination-item"><a>»</a></span>
            </div>
          </body>
        </html>
      `;

      const result = parseReplaysPage(html, 3);

      expect(result.currentPage).toBe(3);
      expect(result.totalPages).toBe(5);
    });

    it('should handle HTML with no replays', () => {
      const html = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const result = parseReplaysPage(html, 1);

      expect(result.replays).toHaveLength(0);
      expect(result.totalPages).toBe(1);
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<html><body>Invalid content</body></html>';

      const result = parseReplaysPage(html, 1);

      expect(result.replays).toHaveLength(0);
      expect(result.totalPages).toBe(1);
    });

    it('should skip rows without links', () => {
      const html = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td>No link here</td>
                </tr>
                <tr>
                  <td><a href="/replays/1657308763">Valid Mission</a></td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const result = parseReplaysPage(html, 1);

      expect(result.replays).toHaveLength(1);
      expect(result.replays[0].replayId).toBe('1657308763');
    });

    it('should skip rows with invalid replay URLs', () => {
      const html = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td><a href="/other/path">Invalid Link</a></td>
                </tr>
                <tr>
                  <td><a href="/replays/1657308763">Valid Mission</a></td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const result = parseReplaysPage(html, 1);

      expect(result.replays).toHaveLength(1);
    });

    it('should handle missing pagination', () => {
      const html = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td><a href="/replays/1657308763">Mission</a></td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const result = parseReplaysPage(html, 1);

      expect(result.totalPages).toBe(1);
    });

    it('should handle empty mission title', () => {
      const html = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td><a href="/replays/1657308763"></a></td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const result = parseReplaysPage(html, 1);

      expect(result.replays).toHaveLength(1);
      expect(result.replays[0].title).toBeUndefined();
    });

    it('should handle missing worldName and serverId cells', () => {
      const html = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td><a href="/replays/1657308763">Mission</a></td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const result = parseReplaysPage(html, 1);

      expect(result.replays).toHaveLength(1);
      expect(result.replays[0].worldName).toBeUndefined();
      expect(result.replays[0].serverId).toBeUndefined();
    });

    it('should handle invalid serverId gracefully', () => {
      const html = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td><a href="/replays/1657308763">Mission</a></td>
                  <td>Altis</td>
                  <td>not-a-number</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const result = parseReplaysPage(html, 1);

      expect(result.replays).toHaveLength(1);
      expect(result.replays[0].worldName).toBe('Altis');
      expect(result.replays[0].serverId).toBeUndefined();
    });

    it('should extract worldName with whitespace trimmed', () => {
      const html = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td><a href="/replays/1657308763">Mission</a></td>
                  <td>  Green Sea  </td>
                  <td>1</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const result = parseReplaysPage(html, 1);

      expect(result.replays).toHaveLength(1);
      expect(result.replays[0].worldName).toBe('Green Sea');
      expect(result.replays[0].serverId).toBe(1);
    });
  });

  describe('fetchReplaysPage', () => {
    it('should fetch and parse a page successfully', async () => {
      const mockHtml = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td><a href="/replays/1657308763">SG@Mission</a></td>
                </tr>
              </tbody>
            </table>
            <div class="pagination">
              <span class="pagination-item"><a>1</a></span>
              <span class="pagination-item"><a>2</a></span>
              <span class="pagination-item"><a>»</a></span>
            </div>
          </body>
        </html>
      `;

      mockRequest.mockResolvedValue({
        text: jest.fn().mockResolvedValue(mockHtml),
      } as any);

      const result = await fetchReplaysPage(1);

      expect(result.replays).toHaveLength(1);
      expect(result.replays[0].replayId).toBe('1657308763');
      expect(result.totalPages).toBe(2);
      expect(mockRequest).toHaveBeenCalledWith('https://sg.zone/replays?p=1');
    });

    it('should handle network errors with retries', async () => {
      const mockHtml = `
        <html>
          <body>
            <table class="common-table">
              <tbody>
                <tr>
                  <td><a href="/replays/1657308763">Mission</a></td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      // First two calls fail, third succeeds
      mockRequest
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue(mockHtml),
        } as any);

      const result = await fetchReplaysPage(1);

      expect(result.replays).toHaveLength(1);
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      mockRequest.mockRejectedValue(new Error('Persistent network error'));

      await expect(fetchReplaysPage(1)).rejects.toThrow('Persistent network error');
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should throw error when response is null', async () => {
      mockRequest.mockResolvedValue(null);

      await expect(fetchReplaysPage(1)).rejects.toThrow('Failed to fetch replays page 1: no response');
    });

    it('should handle different page numbers in URL', async () => {
      const mockHtml = '<html><body><table class="common-table"><tbody></tbody></table></body></html>';

      mockRequest.mockResolvedValue({
        text: jest.fn().mockResolvedValue(mockHtml),
      } as any);

      await fetchReplaysPage(5);

      expect(mockRequest).toHaveBeenCalledWith('https://sg.zone/replays?p=5');
    });
  });
});
