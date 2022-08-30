import { dropRight, flatten, maxBy } from 'lodash';

import { dayjsUTC } from '../../../0 - utils/dayjs';
import removeDatesFromGlobalStatistics from '../../../0 - utils/removeDatesFromGlobalStatistics';
import getRotations from '../../../0 - utils/rotations';
import getStatsByRotations from '../../../3 - statistics/rotations';
import { getReplays, globalStatistics, squadStatistics } from './data/forRotationsStatistics';

const removeDates = (rotation: StatisticsByRotation) => ({
  ...rotation,
  stats: {
    global: removeDatesFromGlobalStatistics(rotation.stats.global),
    squad: rotation.stats.squad,
  },
});

describe('Rotation statistics should return correct values', () => {
  const rotationDates = getRotations();
  const replays: PlayersGameResult[][] = rotationDates.map(([, rotationEndDate]) => (
    getReplays(rotationEndDate ? rotationEndDate.subtract(1, 'w') : dayjsUTC().subtract(1, 'w'))
  ));
  const flattenReplays = flatten(replays);
  const rotations = getStatsByRotations(flattenReplays);
  const rotationsCount = rotationDates.length;
  const statisticsToCompare = removeDates(rotations[0]).stats;

  it('Rotations count should be correct', () => {
    expect(rotations.length).toEqual(rotationsCount);
  });

  it('Every rotation should have more than 0 totalGames', () => {
    rotations.forEach((rotation) => {
      const totalGamesCount = rotation.totalGames;
      const maxPlayedGamesCount = maxBy(rotation.stats.global, 'totalPlayedGames')?.totalPlayedGames;

      expect(totalGamesCount).toBeGreaterThan(0);
      expect(totalGamesCount).toEqual(maxPlayedGamesCount);
    });
  });

  it('Statistics should be equal in each rotation', () => {
    rotations.forEach((rotation) => (
      expect(removeDates(rotation).stats).toMatchObject(statisticsToCompare)
    ));
  });

  it('Global statistics should be equal and correct in each rotation', () => {
    rotations.forEach((rotation) => (
      expect(removeDates(rotation).stats.global).toMatchObject(globalStatistics)
    ));
  });

  it('Squad statistics should be equal and correct in each rotation', () => {
    rotations.forEach((rotation) => (
      expect(removeDates(rotation).stats.squad).toMatchObject(squadStatistics)
    ));
  });

  it('No replay should be handled correctly', () => {
    const replaysWithoutLastRotation = dropRight(flattenReplays, 8);
    const rotationsWithLastWithoutInfo = getStatsByRotations(replaysWithoutLastRotation);

    expect(rotationsWithLastWithoutInfo.length).toEqual(rotationsCount);

    rotationsWithLastWithoutInfo.forEach((rotation, index) => {
      if (index === rotationsCount - 1) {
        expect(rotation.stats.global.length).toEqual(0);
        expect(rotation.stats.squad.length).toEqual(0);

        return;
      }

      expect(removeDates(rotation).stats.global).toMatchObject(globalStatistics);
      expect(removeDates(rotation).stats.squad).toMatchObject(squadStatistics);
    });
  });
});
