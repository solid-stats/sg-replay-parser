import fetchMockJest from 'fetch-mock-jest';
import fetch from 'node-fetch';

import { disableBarsProgress } from '../../../0 - utils/progressHandler';
import parseReplays from '../../../1 - replays/parseReplays';
import testData from './data/parseReplays';

jest.mock('node-fetch', () => fetchMockJest.sandbox());

const fetchMock = fetch as typeof fetchMockJest;

beforeEach(() => {
  disableBarsProgress();
});

test('SG replays should be parsed correctly', async () => {
  const { replays, replayInfo, result } = testData;

  replays.forEach(({ filename }) => (
    fetchMock.getOnce(`https://solidgames.ru/data/${filename}.json`, replayInfo[filename])
  ));

  expect(await parseReplays(replays, 'sg')).toMatchObject(result);
});
