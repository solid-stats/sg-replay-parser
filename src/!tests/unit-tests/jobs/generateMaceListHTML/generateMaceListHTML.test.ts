import fs from 'fs-extra';
import { JSDOM } from 'jsdom';

import logger from '../../../../0 - utils/logger';
import { replaysListPath } from '../../../../0 - utils/paths';
import generateMaceList from '../../../../jobs/generateMaceListHTML';

jest.mock('fs-extra', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));
jest.mock('../../../../0 - utils/logger', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));

const mockedFs = fs as unknown as {
  readFileSync: jest.Mock;
  writeFileSync: jest.Mock;
};
const mockedLogger = logger as unknown as {
  info: jest.Mock;
};

beforeEach(() => {
  mockedFs.readFileSync.mockReset();
  mockedFs.writeFileSync.mockReset();
  mockedLogger.info.mockReset();
});

test('should use replaysListPreparedAt as update date in mace_list.html', () => {
  mockedFs.readFileSync.mockImplementation((filePath: string) => {
    if (filePath !== replaysListPath) throw new Error(`Unexpected file path in test: ${filePath}`);

    const replaysList: Output = {
      replaysListPreparedAt: '2026-02-15T12:34:56.000Z',
      parsedReplays: ['/replays/1'],
      problematicReplays: [],
      replays: [
        {
          mission_name: 'mace@test_mission',
          world_name: 'Altis',
          serverId: 1,
          date: '2026-02-15T12:00:00.000Z',
          filename: 'test',
          replayLink: '/replays/1',
        },
      ],
    };

    return JSON.stringify(replaysList);
  });

  generateMaceList();

  expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);

  const html = mockedFs.writeFileSync.mock.calls[0]?.[1] as string;
  const dom = new JSDOM(html);
  const updateDateText = dom.window.document.querySelector('#update-date')?.textContent;

  expect(updateDateText).toBe('15.02.2026 12:34:56');
  expect(mockedLogger.info).toHaveBeenCalledWith('Maces list created successfully.');
});
