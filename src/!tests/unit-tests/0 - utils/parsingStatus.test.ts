import path from 'path';

import fs from 'fs-extra';

import { commitParsingStatus, readRunReplayListPreparedAt } from '../../../0 - utils/parsingStatus';
import { parsingStatusPath, replaysListPath } from '../../../0 - utils/paths';

jest.mock('fs-extra', () => ({
  readFileSync: jest.fn(),
  ensureDirSync: jest.fn(),
  writeFileSync: jest.fn(),
  moveSync: jest.fn(),
}));

const mockedFs = fs as unknown as {
  readFileSync: jest.Mock;
  ensureDirSync: jest.Mock;
  writeFileSync: jest.Mock;
  moveSync: jest.Mock;
};

describe('parsingStatus utils', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockedFs.readFileSync.mockReset();
    mockedFs.ensureDirSync.mockReset();
    mockedFs.writeFileSync.mockReset();
    mockedFs.moveSync.mockReset();
  });

  test('readRunReplayListPreparedAt returns value when present', () => {
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({ replaysListPreparedAt: '2026-02-15T12:00:00.000Z' }),
    );

    expect(readRunReplayListPreparedAt()).toBe('2026-02-15T12:00:00.000Z');
    expect(mockedFs.readFileSync).toHaveBeenCalledWith(replaysListPath, 'utf8');
  });

  test('readRunReplayListPreparedAt returns null when file missing', () => {
    mockedFs.readFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(readRunReplayListPreparedAt()).toBeNull();
  });

  test('readRunReplayListPreparedAt returns null when JSON is invalid', () => {
    mockedFs.readFileSync.mockReturnValue('{ invalid json');

    expect(readRunReplayListPreparedAt()).toBeNull();
  });

  test('readRunReplayListPreparedAt returns null when field is missing', () => {
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ anotherField: 'value' }));

    expect(readRunReplayListPreparedAt()).toBeNull();
  });

  test('commitParsingStatus writes atomic temp file then moves to final path with expected payload', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    commitParsingStatus('2026-02-15T13:00:00.000Z');

    const expectedTempPath = `${parsingStatusPath}.tmp-${process.pid}-1700000000000`;
    const expectedPayload = JSON.stringify({ updateTime: '2026-02-15T13:00:00.000Z' });

    expect(mockedFs.ensureDirSync).toHaveBeenCalledWith(path.dirname(parsingStatusPath));
    expect(mockedFs.ensureDirSync.mock.invocationCallOrder[0]).toBeLessThan(
      mockedFs.writeFileSync.mock.invocationCallOrder[0],
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(expectedTempPath, expectedPayload);
    expect(mockedFs.moveSync).toHaveBeenCalledWith(
      expectedTempPath,
      parsingStatusPath,
      { overwrite: true },
    );
    expect(mockedFs.writeFileSync.mock.invocationCallOrder[0]).toBeLessThan(
      mockedFs.moveSync.mock.invocationCallOrder[0],
    );

    nowSpy.mockRestore();
  });

  test('commitParsingStatus serializes null updateTime and preserves operation ordering', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000001);

    commitParsingStatus(null);

    const expectedTempPath = `${parsingStatusPath}.tmp-${process.pid}-1700000000001`;
    const expectedPayload = JSON.stringify({ updateTime: null });

    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(expectedTempPath, expectedPayload);
    expect(mockedFs.ensureDirSync.mock.invocationCallOrder[0]).toBeLessThan(
      mockedFs.writeFileSync.mock.invocationCallOrder[0],
    );
    expect(mockedFs.writeFileSync.mock.invocationCallOrder[0]).toBeLessThan(
      mockedFs.moveSync.mock.invocationCallOrder[0],
    );

    nowSpy.mockRestore();
  });

  test('commitParsingStatus rethrows when moveSync fails', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000002);

    mockedFs.moveSync.mockImplementation(() => {
      throw new Error('rename failed');
    });

    expect(() => {
      commitParsingStatus('2026-02-15T13:00:00.000Z');
    }).toThrow('rename failed');

    nowSpy.mockRestore();
  });
});
