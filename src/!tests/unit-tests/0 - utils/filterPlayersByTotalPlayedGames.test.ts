import { dayjsUTCISO } from '../../../0 - utils/dayjs';
import filterPlayersByTotalPlayedGames from '../../../0 - utils/filterPlayersByTotalPlayedGames';
import generateGlobalStatistics from '../../utils/generators/generateGlobalStatistics';

const date = dayjsUTCISO();

const statistics: GlobalPlayerStatistics[] = [
  generateGlobalStatistics('[FNX]Afgan0r', 22, date),
  generateGlobalStatistics('[FNX]Flashback', 20, date),
  generateGlobalStatistics('[FNX]LOXDOR', 19, date),
  generateGlobalStatistics('[FNX]Puma', 3, date),
  generateGlobalStatistics('dedInside', 2, date),
];

test('filterPlayersByTotalPlayedGames should filter correct', () => {
  const result = filterPlayersByTotalPlayedGames({ statistics, gamesCount: 500 });
  const resultWithoutRemove = filterPlayersByTotalPlayedGames({ statistics, gamesCount: 500, type: 'not show' });

  expect(statistics).toHaveLength(5);
  expect(result).toHaveLength(2);

  expect(resultWithoutRemove.length).toEqual(statistics.length);
  expect(resultWithoutRemove).toMatchObject([
    generateGlobalStatistics('[FNX]Afgan0r', 22, date, true),
    generateGlobalStatistics('[FNX]Flashback', 20, date, true),
    generateGlobalStatistics('[FNX]LOXDOR', 19, date, false),
    generateGlobalStatistics('[FNX]Puma', 3, date, false),
    generateGlobalStatistics('dedInside', 2, date, false),
  ]);
});

test('filterPlayersByTotalPlayedGames with gamesCount should filter correct', () => {
  const result = filterPlayersByTotalPlayedGames({ statistics, gamesCount: 20 });
  const resultWithoutRemove = filterPlayersByTotalPlayedGames({ statistics, gamesCount: 20, type: 'not show' });

  expect(statistics).toHaveLength(5);
  expect(result).toHaveLength(4);

  expect(resultWithoutRemove.length).toEqual(statistics.length);
  expect(resultWithoutRemove).toMatchObject([
    generateGlobalStatistics('[FNX]Afgan0r', 22, date, true),
    generateGlobalStatistics('[FNX]Flashback', 20, date, true),
    generateGlobalStatistics('[FNX]LOXDOR', 19, date, true),
    generateGlobalStatistics('[FNX]Puma', 3, date, true),
    generateGlobalStatistics('dedInside', 2, date, false),
  ]);
});
