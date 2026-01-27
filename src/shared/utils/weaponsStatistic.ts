export const forbiddenWeapons = ['throw', 'binoculars', 'бинокль', 'pdu', 'vector'];

export const filterWeaponStatistics = (stats: WeaponStatistic[]): WeaponStatistic[] => (
  stats.filter(
    (stat) => stat.name.length > 0 && !forbiddenWeapons.includes(stat.name.toLowerCase()),
  )
);

export const addWeaponStatistic = (
  weaponStatistics: WeaponStatistic[],
  weaponName: Weapon,
  distance: number,
) => {
  const isWeaponStatsExist = weaponStatistics.findIndex(
    (weaponStats) => weaponStats.name === weaponName,
  ) > -1;

  if (!isWeaponStatsExist) {
    const newWeaponStatistic: WeaponStatistic = {
      name: weaponName,
      kills: 1,
      maxDistance: distance,
    };

    return [...weaponStatistics, newWeaponStatistic];
  }

  return weaponStatistics.map(
    (weaponStatistic) => (
      weaponStatistic.name === weaponName
        ? {
          ...weaponStatistic,
          kills: weaponStatistic.kills + 1,
          maxDistance: Math.max(weaponStatistic.maxDistance, distance),
        }
        : weaponStatistic
    ),
  );
};

export const unionWeaponsStatistic = (
  originalStats: WeaponStatistic[],
  newStats: WeaponStatistic[],
): WeaponStatistic[] => {
  const resultStats = originalStats.slice();

  newStats.forEach((stats) => {
    const index = resultStats.findIndex((val) => val.name === stats.name);
    const currentStats = resultStats[index];

    if (currentStats) {
      resultStats[index] = {
        ...currentStats,
        kills: currentStats.kills + stats.kills,
        maxDistance: Math.max(currentStats.maxDistance, stats.maxDistance),
      };

      return;
    }

    resultStats.push(stats);
  });

  return resultStats;
};
