import calculateGlobalStatistics from '../../../3 - statistics/global';
import data from './data/forGlobalStatistics';

it('Global statistics calculation should return correct values', () => {
  const { globalStatistics, playersGameResult } = data;

  const resultGlobalStatistics = calculateGlobalStatistics(playersGameResult);

  expect(resultGlobalStatistics).toMatchObject(globalStatistics);
});
