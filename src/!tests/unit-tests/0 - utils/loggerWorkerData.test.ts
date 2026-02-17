import path from 'path';

const logsPath = path.join(require('os').homedir(), 'sg_stats', 'logs');

const importLogsFolderPath = async (
  workerData: unknown,
): Promise<string> => {
  let logsFolderPathValue: string = '';

  jest.isolateModules(() => {
    jest.doMock('worker_threads', () => ({ workerData }));

    // eslint-disable-next-line global-require
    const { logsFolderPath } = require('../../../0 - utils/logger') as { logsFolderPath: string };

    logsFolderPathValue = logsFolderPath;
  });

  return logsFolderPathValue;
};

describe('logger logsFolderPath in worker context', () => {
  test('should use logsFolderPath from workerData when valid', async () => {
    const expectedPath = '/home/user/sg_stats/logs/17.02.2026 13:00';

    const result = await importLogsFolderPath({ logsFolderPath: expectedPath });

    expect(result).toBe(expectedPath);
  });

  test('should not contain current timestamp when workerData has logsFolderPath', async () => {
    const mainThreadPath = '/home/user/sg_stats/logs/01.01.2020 00:00';

    const result = await importLogsFolderPath({ logsFolderPath: mainThreadPath });

    expect(result).toBe(mainThreadPath);
    expect(result).not.toContain(new Date().getFullYear().toString());
  });

  test('should generate new path when workerData is null', async () => {
    const result = await importLogsFolderPath(null);

    expect(result).not.toBe('');
    expect(result.startsWith(logsPath)).toBe(true);
  });

  test('should generate new path when workerData is undefined', async () => {
    const result = await importLogsFolderPath(undefined);

    expect(result).not.toBe('');
    expect(result.startsWith(logsPath)).toBe(true);
  });

  test('should generate new path when workerData has invalid shape', async () => {
    const result = await importLogsFolderPath({ wrongField: 123 });

    expect(result).not.toBe('');
    expect(result.startsWith(logsPath)).toBe(true);
  });

  test('should generate new path when workerData has non-string logsFolderPath', async () => {
    const result = await importLogsFolderPath({ logsFolderPath: 42 });

    expect(result).not.toBe('');
    expect(result.startsWith(logsPath)).toBe(true);
  });

  test('should use exact workerData path without appending timestamp', async () => {
    const exactPath = '/custom/logs/fixed-folder';

    const result = await importLogsFolderPath({ logsFolderPath: exactPath });

    expect(result).toBe(exactPath);
  });
});
