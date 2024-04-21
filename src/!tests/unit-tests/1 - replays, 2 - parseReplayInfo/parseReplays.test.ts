import fs from 'fs-extra';

import logger from '../../../0 - utils/logger';
import parseReplays from '../../../1 - replays/parseReplays';
import * as parse from '../../../2 - parseReplayInfo';
import generatePlayerEntity from '../../utils/generators/generatePlayerEntity';
import generateReplay from '../../utils/generators/generateReplay';
import generateReplayInfo from '../../utils/generators/generateReplayInfo';
import prepareNamesWithMock from '../../utils/prepareNamesWithMock';
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
  jest.mock('../../../0 - utils/logger');
  logger.error = jest.fn();

  expect(await parseReplays([generateReplay('sg', 'test_1')], 'sg')).toMatchObject([]);
  expect(logger.error).toBeCalledTimes(1);
});

test('Errors during parsing should be handled correctly', async () => {
  jest.spyOn(parse, 'default').mockImplementationOnce(() => {
    throw new Error('some error');
  });

  jest.mock('../../../0 - utils/logger');
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
