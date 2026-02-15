import fs from 'fs-extra';

import logger from '../../../../0 - utils/logger';
import { resetNamesList } from '../../../../0 - utils/namesHelper';
import request from '../../../../0 - utils/request';
import updateNameChangesCsv from '../../../../jobs/updateNameChangesCsv';

jest.mock('fs-extra', () => ({
  ensureDirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));
jest.mock('../../../../0 - utils/namesHelper', () => ({
  __esModule: true,
  resetNamesList: jest.fn(),
}));
jest.mock('../../../../0 - utils/request', () => ({
  __esModule: true,
  default: jest.fn(),
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
  ensureDirSync: jest.Mock;
  writeFileSync: jest.Mock;
};
const mockedRequest = request as jest.MockedFunction<typeof request>;
const mockedResetNamesList = resetNamesList as jest.MockedFunction<typeof resetNamesList>;
const mockedLogger = logger as unknown as {
  info: jest.Mock;
  error: jest.Mock;
};

beforeEach(() => {
  mockedFs.ensureDirSync.mockReset();
  mockedFs.writeFileSync.mockReset();
  mockedRequest.mockReset();
  mockedResetNamesList.mockReset();
  mockedLogger.info.mockReset();
  mockedLogger.error.mockReset();
});

test('should log success message when nameChanges.csv is downloaded and saved', async () => {
  mockedRequest.mockResolvedValue({
    text: jest.fn().mockResolvedValue('old,new,date,status'),
  } as never);

  await expect(updateNameChangesCsv()).resolves.toBeUndefined();

  expect(mockedFs.ensureDirSync).toHaveBeenCalledTimes(1);
  expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
  expect(mockedResetNamesList).toHaveBeenCalledTimes(1);
  expect(mockedLogger.error).not.toHaveBeenCalled();
  expect(mockedLogger.info).toHaveBeenCalledWith(expect.stringContaining('nameChanges.csv'));
});
