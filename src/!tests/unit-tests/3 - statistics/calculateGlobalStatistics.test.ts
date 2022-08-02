import calculateGlobalStatistics from '../../../3 - statistics/global';
import globalStatisticsTestData from './data/globalStatistics';

test('123asdadqawdq', () => {
  expect(
    calculateGlobalStatistics(globalStatisticsTestData.input),
  ).toMatchObject(globalStatisticsTestData.output);
});
