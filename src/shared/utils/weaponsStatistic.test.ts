import { addWeaponStatistic, filterWeaponStatistics, unionWeaponsStatistic } from './weaponsStatistic';
import getDefaultTestDescription from '../testing/getDefaultTestDescription';

const originalWeaponStatistics: WeaponStatistic[] = [{
  name: 'M4A1',
  kills: 2,
  maxDistance: 132,
}, {
  name: 'm2010',
  kills: 1,
  maxDistance: 1026,
}];

describe(getDefaultTestDescription('weaponsStatistic functions'), () => {
  it(getDefaultTestDescription('addWeaponStatistic'), () => {
    expect(addWeaponStatistic(originalWeaponStatistics, 'm2010', 1027)).toMatchObject([
      originalWeaponStatistics[0],
      {
        ...originalWeaponStatistics[1],
        kills: 2,
        maxDistance: 1027,
      },
    ]);

    expect(addWeaponStatistic(originalWeaponStatistics, 'BTR-80A', 500)).toMatchObject([
      ...originalWeaponStatistics,
      {
        name: 'BTR-80A',
        kills: 1,
        maxDistance: 500,
      },
    ]);
  });

  it(getDefaultTestDescription('filterWeaponStatistics'), () => {
    const testData = [
      ...originalWeaponStatistics,
      {
        name: 'throw',
        kills: 2,
        maxDistance: 500,
      },
      {
        name: 'binoculars',
        kills: 2,
        maxDistance: 500,
      },
      {
        name: 'бинокль',
        kills: 2,
        maxDistance: 500,
      },
      {
        name: '',
        kills: 2,
        maxDistance: 500,
      },
    ];

    expect(filterWeaponStatistics(testData)).toMatchObject(originalWeaponStatistics);
  });

  it(getDefaultTestDescription('unionWeaponsStatistic'), () => {
    const newWeaponStatistics: WeaponStatistic[] = [{
      name: 'M4A1',
      kills: 3,
      maxDistance: 100,
    }, {
      name: 'm2010',
      kills: 6,
      maxDistance: 1567,
    }, {
      name: 'BTR-80A',
      kills: 2,
      maxDistance: 122,
    }];

    const result: WeaponStatistic[] = [{
      name: 'M4A1',
      kills: 5,
      maxDistance: 132,
    }, {
      name: 'm2010',
      kills: 7,
      maxDistance: 1567,
    }, {
      name: 'BTR-80A',
      kills: 2,
      maxDistance: 122,
    }];

    expect(
      unionWeaponsStatistic(originalWeaponStatistics, newWeaponStatistics),
    ).toMatchObject(result);
  });
});
