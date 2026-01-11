import { keyBy, uniq } from 'lodash';

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
  mostKillsFromMedicSlot: {
    ...statistics.mostKillsFromMedicSlot,
    nominations: limitAndOrder(
      statistics.mostKillsFromMedicSlot.nominations,
      ['count', 'totalKills'],
      ['desc', 'asc'],
    ),
  },
});

const medicSlotNames = [
  'медик',
  'санитар',
  'cанитар',
  'стрелок-санитар',
  'разведчик-санитар',
  'санинструктор',
  'саниструктор',
  'санинструцтор',
  'старший санинструктор',
  'взводный санинструктор',
  'ротный санинструктор',
  'врач',
  'полевой врач',
  'полевой медик',
  'фельдшер',
  'костоправ',
  'медицинский специалист',
  'водитель-санитар',
  'боевик-лекарь',
  'combat medic',
  'medic',
  'corpsman',
  'aidman',
  'pararescueman',
  'combat lifesaver',
  'sanitäter',
  'sanitater',
  'lékař',
  'polní lékař',
  'lekarz',
  'sanitariusz',
  'médecin',
  'médical',
  'infirmier',
  'bolničar',
  'bolničarka',
  'doktor',
  'oberarzt',
  'санітар',
  'медиц',
  'medikus (санитар)',
];

const mostKillsFromMedicSlot = ({
  result,
  replayInfo,
  globalStatistics,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  const nomineesById = keyBy(result.mostKillsFromMedicSlot.nominations, 'id') as NomineeList<KillsFromSlot>;
  const slotNames = new Set(result.mostKillsFromMedicSlot.slotNames);

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

    slotNames.add(killerSlotName);

    if (!medicSlotNames.some((medicSlotName) => killerSlotName.includes(medicSlotName))) return;

    const entityName = getPlayerName(killer.name)[0];
    const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

    const currentNominee: KillsFromSlot = nomineesById[id] || {
      id, name, count: 0, totalKills: 0,
    };

    const globalPlayerStats = globalStatistics.find((stats) => stats.id === id);

    if (!globalPlayerStats) return;

    nomineesById[id] = {
      id,
      name,
      count: currentNominee.count + 1,
      totalKills: globalPlayerStats.kills,
    };
  });

  return {
    ...other,
    replayInfo,
    globalStatistics,
    result: {
      ...result,
      mostKillsFromMedicSlot: {
        nominations: Object.values(nomineesById),
        slotNames,
      },
    },
  };
};

export default mostKillsFromMedicSlot;
