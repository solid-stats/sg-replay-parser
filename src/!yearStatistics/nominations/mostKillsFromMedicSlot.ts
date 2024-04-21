import { keyBy, round, uniq } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import { forbiddenWeapons } from '../../0 - utils/weaponsStatistic';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostKillsFromMedicSlot = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostKillsFromMedicSlot: limitAndOrder(
    statistics.mostKillsFromMedicSlot,
    ['count', 'slotFrequency', 'totalSlotCount'],
    ['desc', 'desc', 'desc'],
  ),
});

const medicSlotNames = ['медик', 'санитар', 'санинструктор', 'врач', 'костоправ', 'medic', 'corpsman', 'life saver', 'lékař'];

const mostKillsFromMedicSlot = ({
  result,
  replayInfo,
  globalStatistics,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesById = keyBy(result.mostKillsFromMedicSlot, 'id') as NomineeList<KillsFromSlot>;
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

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

    const killerSlotName = killerEntity.description.toLowerCase();

    if (!medicSlotNames.some((medicSlotName) => killerSlotName.includes(medicSlotName))) return;

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
      mostKillsFromMedicSlot: Object.values(nomineesById),
    },
  };
};

export default mostKillsFromMedicSlot;
