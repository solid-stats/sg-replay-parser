import {
  groupBy, keyBy, round, uniq,
} from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import { forbiddenWeapons } from '../../0 - utils/weaponsStatistic';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostKillsFromCommanderSlot = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostKillsFromCommanderSlot: limitAndOrder(
    statistics.mostKillsFromCommanderSlot,
    ['count', 'slotFrequency', 'totalSlotCount'],
    ['desc', 'desc', 'desc'],
  ),
});

const mostKillsFromCommanderSlot = ({
  result,
  replayInfo,
  globalStatistics,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesById = keyBy(result.mostKillsFromCommanderSlot, 'id') as NomineeList<KillsFromSlot>;
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  const groupedBySide = groupBy(
    replayInfo.entities.filter((entity) => entity.type === 'unit'),
    'side',
  ) as Record<EntitySide, PlayerEntity[]>;
  const groupedBySideAndGroup = Object.values(groupedBySide)
    .map((side) => groupBy(side, 'group')) as Array<Record<PlayerEntity['group'], PlayerEntity[]>>;

  const isSideCommander = (entityId: EntityId) => {
    let funcResult = false;

    groupedBySideAndGroup.forEach((entitiesByGroup) => {
      if (funcResult) return;

      const sideCommander = Object.values(entitiesByGroup)[0][0];

      if (sideCommander.id === entityId && players[sideCommander.id]) funcResult = true;
    });

    return funcResult;
  };

  const isTeamLeader = (entityId: EntityId) => {
    let funcResult = false;

    groupedBySideAndGroup.forEach((entitiesByGroup) => {
      const groups = Object.values(entitiesByGroup);
      const teamleaders = groups
        .map((group) => group[0].id)
        .filter((teamleader) => players[teamleader]);

      if (teamleaders.includes(entityId)) funcResult = true;
    });

    return funcResult;
  };

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    // eslint-disable-next-line array-element-newline
    const [, , killedId, killInfo] = event;

    if (killInfo[0] === 'null' || !killInfo[1]) return;

    const [killerId, weaponName] = killInfo;
    const killer = players[killerId];
    const killerEntity = replayInfo.entities[killerId];

    if (
      vehiclesName.includes(weaponName.toLowerCase())
      || !killer
      || killerEntity.type === 'vehicle'
      || vehicles[killedId]
      || forbiddenWeapons.includes(weaponName.toLowerCase())
    ) return;

    if (!isSideCommander(killerId) && !isTeamLeader(killerId)) return;

    const entityName = getPlayerName(killer.name)[0];
    const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

    const currentNominee: KillsFromSlot = nomineesById[id] || {
      id, name, count: 0, totalSlotCount: 0, slotFrequency: 0,
    };

    const totalSlotCount = currentNominee.totalSlotCount + 1;

    const globalStat = globalStatistics.find((stats) => stats.id === id);

    if (globalStat) {
      nomineesById[id] = {
        id,
        name,
        count: currentNominee.count + 1,
        totalSlotCount,
        slotFrequency: round(totalSlotCount / globalStat.totalPlayedGames, 2),
      };
    }
  });

  return {
    ...other,
    replayInfo,
    globalStatistics,
    result: {
      ...result,
      mostKillsFromCommanderSlot: Object.values(nomineesById),
    },
  };
};

export default mostKillsFromCommanderSlot;
