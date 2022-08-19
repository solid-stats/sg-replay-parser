import filterPlayersByTotalPlayedGames from '../../../0 - utils/filterPlayersByTotalPlayedGames';
import generateGlobalStatistics from '../../utils/generators/generateGlobalStatistics';

const statistics: GlobalPlayerStatistics[] = [
  generateGlobalStatistics('[FNX]Afgan0r', 22),
  generateGlobalStatistics('[FNX]Flashback', 10),
  generateGlobalStatistics('[FNX]LOXDOR', 5),
  generateGlobalStatistics('[FNX]Puma', 4),
  generateGlobalStatistics('dedInside', 3),
];

test('filterPlayersByTotalPlayedGames should filter correct', () => {
  expect(filterPlayersByTotalPlayedGames(statistics)).toHaveLength(1);
  expect(filterPlayersByTotalPlayedGames(statistics, 20)).toHaveLength(4);
});
