import fs from 'fs-extra';

import parseReplays from './parseReplays';
import * as parse from '../parsing';
import logger from '../../shared/utils/logger';
import generatePlayerEntity from '../../shared/testing/generators/generatePlayerEntity';
import generateReplay from '../../shared/testing/generators/generateReplay';
import generateReplayInfo from '../../shared/testing/generators/generateReplayInfo';
import prepareNamesWithMock from '../../shared/testing/prepareNamesWithMock';
import testData from './data/parseReplays';

const mockReadJSONSync = () => {
  const { replays, replayInfo } = testData;

  replays.forEach(({ filename }) => {
    jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => replayInfo[filename]);
  });
};

beforeAll(() => { prepareNamesWithMock(); });

test('SG replays should be parsed correctly', async () => {
  const { replays, result } = testData;

  mockReadJSONSync();

  expect(await parseReplays(replays, 'sg')).toMatchObject(result);
});

test('Errors during fetching should be handled correctly', async () => {
  jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => {
    throw new Error('some error');
  });
  jest.mock('../../shared/utils/logger');
  logger.error = jest.fn();

  expect(await parseReplays([generateReplay('sg', 'test_1')], 'sg')).toMatchObject([]);
  expect(logger.error).toBeCalledTimes(1);
});

test('Errors during parsing should be handled correctly', async () => {
  jest.spyOn(parse, 'default').mockImplementationOnce(() => {
    throw new Error('some error');
  });

  jest.mock('../../shared/utils/logger');
  logger.error = jest.fn();

  jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => testData.replayInfo.file_1);

  expect(await parseReplays([generateReplay('sg', 'test_2')], 'sg')).toMatchObject([]);
  expect(logger.error).toBeCalledTimes(1);
});

const getReplayInfoForMace = (playersCount: number): ReplayInfo => {
  const entities: ReplayInfo['entities'] = [];

  for (let index = 0; index < playersCount; index += 1) {
    entities.push(generatePlayerEntity({
      id: index,
      side: 'EAST',
    }));
  }

  return generateReplayInfo([], entities);
};

test('Mace replays with less than 10 players should be skipped', async () => {
  const replays: Replay[] = [generateReplay('mace', 'mace_1')];
  const replayInfo = getReplayInfoForMace(5);

  jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => replayInfo);

  expect(await parseReplays(replays, 'mace')).toHaveLength(0);
});

test("Mace replays with 10 or more players shouldn't be skipped", async () => {
  const replays: Replay[] = [generateReplay('mace', 'mace_2')];
  const replayInfo = getReplayInfoForMace(20);

  jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => replayInfo);

  expect(await parseReplays(replays, 'mace')).toHaveLength(1);
});
