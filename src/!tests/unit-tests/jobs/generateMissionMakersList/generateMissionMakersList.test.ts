import fs from 'fs-extra';

import logger from '../../../../0 - utils/logger';
import generateMissionMakersList from '../../../../jobs/generateMissionMakersList';
import fetchTeamPage from '../../../../jobs/generateMissionMakersList/utils/requestTeamPage';

jest.mock('fs-extra', () => ({
  writeFileSync: jest.fn(),
}));
jest.mock('../../../../jobs/generateMissionMakersList/utils/requestTeamPage', () => jest.fn());
jest.mock('../../../../0 - utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedFs = fs as unknown as {
  writeFileSync: jest.Mock;
};
const mockedFetchTeamPage = fetchTeamPage as jest.MockedFunction<typeof fetchTeamPage>;
const mockedLogger = logger as unknown as {
  info: jest.Mock;
  error: jest.Mock;
};

beforeEach(() => {
  mockedFs.writeFileSync.mockReset();
  mockedFetchTeamPage.mockReset();
  mockedLogger.info.mockReset();
  mockedLogger.error.mockReset();
});

test('should stop generateMissionMakersList job when team page request is blocked by Cloudflare', async () => {
  const cloudflareBanError = new Error('sg.zone request was blocked by Cloudflare');

  cloudflareBanError.name = 'CloudflareBanError';

  mockedFetchTeamPage.mockRejectedValue(
    cloudflareBanError,
  );

  await expect(generateMissionMakersList()).rejects.toThrow('Cloudflare');

  expect(mockedFetchTeamPage).toHaveBeenCalledTimes(1);
  expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  expect(mockedLogger.info).not.toHaveBeenCalled();
  expect(mockedLogger.error).not.toHaveBeenCalled();
});

test('should log completion message when generateMissionMakersList job succeeds', async () => {
  mockedFetchTeamPage.mockResolvedValue(`
    <div>
      <div>
        <div class="section-header">Mission Makers</div>
        <div class="row"><div class="forum-user"><a></a><a>Alpha</a></div></div>
      </div>
      <div>
        <div class="section-header">Junior Mission Makers</div>
        <div class="row"><div class="forum-user"><a></a><a>Beta</a></div></div>
      </div>
    </div>
  `);

  await expect(generateMissionMakersList()).resolves.toBeUndefined();

  expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
  expect(mockedLogger.info).toHaveBeenCalledWith('Mission makers fetching finished.');
  expect(mockedLogger.error).not.toHaveBeenCalled();
});
