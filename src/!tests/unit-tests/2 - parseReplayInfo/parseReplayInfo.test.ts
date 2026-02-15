import { orderBy } from 'lodash';

import parseReplayInfo from '../../../2 - parseReplayInfo';
import prepareNamesWithMock from '../../utils/prepareNamesWithMock';
import testData from '../1 - replays, 2 - parseReplayInfo/data/parseReplays';

beforeAll(() => { prepareNamesWithMock(); });

const sortedReplays = orderBy(testData.replays, 'date', 'asc');

test.each(
  sortedReplays.map((replay, index) => ({
    filename: replay.filename,
    date: replay.date,
    replayInfo: testData.replayInfo[replay.filename],
    expectedResult: testData.result[index].result,
  })),
)('parseReplayInfo should correctly parse $filename', ({ date, replayInfo, expectedResult }) => {
  const parsedPlayers = parseReplayInfo(replayInfo, date);
  const result = Object.values(parsedPlayers);

  expect(result).toMatchObject(expectedResult);
});
