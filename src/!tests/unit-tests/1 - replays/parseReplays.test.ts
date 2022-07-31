/* eslint-disable no-console */
import { disableBarsProgress } from '../../../0 - utils/progressHandler';
import parseReplays from '../../../1 - replays/parseReplays';
import * as parse from '../../../2 - parseReplayInfo';
import testData from './data/parseReplays';
import { generateReplay } from './utils';

jest.mock('console');

beforeEach(() => {
  disableBarsProgress();
  fetchMock.resetMocks();
});

test('SG replays should be parsed correctly', async () => {
  const { replays, replayInfo, result } = testData;

  replays.forEach(({ filename }) => (
    fetchMock.mockOnce(JSON.stringify(replayInfo[filename]))
  ));

  expect(await parseReplays(replays, 'sg')).toMatchObject(result);
});

test('Errors during fetching should be ignored', async () => {
  fetchMock.mockRejectOnce(new Error('invalid json response'));

  expect(await parseReplays([generateReplay('sg', 'test_1')], 'sg')).toMatchObject([]);
});

test("Errors during parsing shouldn't be ignored", async () => {
  const testErrorMessage = 'test error message';

  jest.spyOn(parse, 'default').mockImplementationOnce(() => {
    throw new Error(testErrorMessage);
  });

  console.error = jest.fn();

  fetchMock.mockOnce(JSON.stringify(testData.replayInfo.file_1));

  expect(await parseReplays([generateReplay('sg', 'test_2')], 'sg')).toMatchObject([]);
  expect(console.error).toBeCalledWith(testErrorMessage);
});
