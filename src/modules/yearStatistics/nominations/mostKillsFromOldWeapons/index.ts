import { keyBy, uniq } from 'lodash';

import { dayjsUTC } from '../../../../shared/utils/dayjs';
import getPlayerName from '../../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../../shared/utils/namesHelper/getId';
import { forbiddenWeapons } from '../../../../shared/utils/weaponsStatistic';
import getEntities from '../../../parsing/getEntities';
import getPlayerNameAtEndOfTheYear from '../../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../../utils/limitAndOrder';
import oldWeapons from './oldWeapons';

export const sortMostKillsFromOldWeapons = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostKillsFromOldWeapons: {
    ...statistics.mostKillsFromOldWeapons,
    nominations: limitAndOrder(statistics.mostKillsFromOldWeapons.nominations, ['count', 'totalKills'], ['desc', 'asc']),
  },
});

const mostKillsFromOldWeapons = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const mostKillsFromOldWeaponsNomineesById = keyBy(result.mostKillsFromOldWeapons.nominations, 'id') as NomineeList<MostKillsFromOldWeapons>;
  const weaponNames = new Set(result.mostKillsFromOldWeapons.weaponNames);

  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    const killedId = event[2];
    const killed = players[killedId];

    if (!killed) return;

    const killInfo = event[3];

    if (killInfo[0] === 'null' || !killInfo[1]) return;

    const [killerId, weaponName] = killInfo;
    const loweredWeaponName = weaponName.toLowerCase();
    const killer = players[killerId];

    if (!killer || killer.id === killedId) return;

    if (vehiclesName.includes(loweredWeaponName)) return;

    if (forbiddenWeapons.includes(loweredWeaponName)) return;

    weaponNames.add(loweredWeaponName);

    if (oldWeapons.has(loweredWeaponName)) {
      const entityName = getPlayerName(killer.name)[0];
      const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
      const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

      const playerGlobalStats = other.globalStatistics.find(
        (stat) => stat.id === id,
      );

      if (!playerGlobalStats) return;

      const emptyNominee: MostKillsFromOldWeapons = {
        id,
        name,
        count: 0,
        totalKills: 0,
        weapons: {},
      };
      const oldWeaponsCurrentNominee = mostKillsFromOldWeaponsNomineesById[id] || emptyNominee;
      const currentWeaponStats = oldWeaponsCurrentNominee.weapons?.[weaponName];

      mostKillsFromOldWeaponsNomineesById[id] = {
        id,
        name,
        count: oldWeaponsCurrentNominee.count + 1,
        totalKills: playerGlobalStats.kills,
        weapons: {
          ...oldWeaponsCurrentNominee.weapons,
          [weaponName]: (currentWeaponStats ?? 0) + 1,
        },
      };
    }
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostKillsFromOldWeapons: {
        nominations: Object.values(mostKillsFromOldWeaponsNomineesById),
        weaponNames,
      },
    },
  };
};

export default mostKillsFromOldWeapons;
