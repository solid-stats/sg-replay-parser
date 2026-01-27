import { globalStatsFileName } from './consts';

test('globalStatsFileName constant', () => {
  expect(globalStatsFileName).toBe('global_statistics.json');
});
